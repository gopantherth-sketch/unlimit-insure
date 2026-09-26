"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_DOCUMENTS_PER_APPLICATION, MAX_UPLOAD_BYTES, safeFileName, sniffType } from "@/lib/applications/files";
import { applicationStatuses, type ApplicationStatus } from "@/lib/applications/status";
import { getAdminUser } from "@/lib/db/admin-users";
import {
  addApplicationMessage,
  addDocument,
  assignApplication,
  countDocuments,
  getApplication,
  moveApplication,
  resetApplicationToken,
  setFinalPremium,
  setPolicyDetails,
} from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { classifyPromptPayId } from "@/lib/payment/promptpay";
import { paymentSettingKeys, setSetting } from "@/lib/db/settings";
import { actorOf, requireAdmin, requireOwner } from "@/lib/server/admin-auth";
import { sendTestAlert } from "@/lib/server/notify";
import { publicOrigin } from "@/lib/server/origin";
import { documentKey, getDocsBucket } from "@/lib/server/storage";

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);
const back = (id: string, q: string) => {
  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/admin/applications");
  redirect(`/admin/applications/${encodeURIComponent(id)}?${q}`);
};

export async function moveApplicationAction(formData: FormData) {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const to = str(formData, "to", 30) as ApplicationStatus;
  if (!id || !applicationStatuses.includes(to)) return;
  const r = await moveApplication(await getDb(), id, to, "staff", actorOf(who), { message: str(formData, "message") });
  back(id, r.ok ? "ok=moved" : `error=${r.error}`);
}

export async function applicationMessageAction(formData: FormData) {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const text = str(formData, "text");
  if (!id) return;
  if (!text) back(id, "error=empty");
  await addApplicationMessage(await getDb(), id, text, formData.get("visible") === "customer", actorOf(who));
  back(id, "ok=message");
}

export async function finalPremiumAction(formData: FormData) {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const premium = Number(str(formData, "premium", 12).replace(/[,\s]/g, ""));
  if (!id) return;
  const r = await setFinalPremium(await getDb(), id, premium, str(formData, "reason", 500), actorOf(who));
  back(id, r.ok ? "ok=premium" : `error=${r.error}`);
}

export async function policyDetailsAction(formData: FormData) {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  if (!id) return;
  const r = await setPolicyDetails(
    await getDb(),
    id,
    { policyNumber: str(formData, "policyNumber", 60), policyStart: str(formData, "policyStart", 10), policyEnd: str(formData, "policyEnd", 10) },
    actorOf(who),
  );
  back(id, r.ok ? "ok=policy" : "error=invalid_policy");
}

export async function assignApplicationAction(formData: FormData) {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const userId = str(formData, "assignee", 64) || null;
  if (!id) return;
  const db = await getDb();
  let label = "ไม่มีผู้รับผิดชอบ";
  if (userId) {
    const u = await getAdminUser(db, userId);
    if (!u || !u.active) back(id, "error=assignee");
    label = u!.name;
  }
  await assignApplication(db, id, userId, label, actorOf(who));
  back(id, "ok=assigned");
}

export interface StaffUploadState {
  ok?: boolean;
  error?: "not_found" | "not_now" | "empty" | "too_large" | "type" | "too_many" | "kind";
}

/** Staff upload: the policy file, or another document on the customer's behalf. */
export async function staffUploadAction(_prev: StaffUploadState, formData: FormData): Promise<StaffUploadState> {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const kind = str(formData, "kind", 30);
  if (kind !== "policy" && kind !== "other") return { error: "kind" };
  const db = await getDb();
  const app = await getApplication(db, id);
  if (!app) return { error: "not_found" };
  if (["rejected", "cancelled"].includes(app.status)) return { error: "not_now" };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "too_large" };
  if ((await countDocuments(db, id)) >= MAX_DOCUMENTS_PER_APPLICATION) return { error: "too_many" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffType(bytes.subarray(0, 16));
  if (!type) return { error: "type" };
  const docId = crypto.randomUUID();
  const key = documentKey(id, docId);
  await (await getDocsBucket()).put(key, bytes, { httpMetadata: { contentType: type } });
  const actor = actorOf(who);
  await addDocument(
    db,
    { id: docId, applicationId: id, kind, r2Key: key, fileName: safeFileName(file.name, type), contentType: type, sizeBytes: bytes.byteLength, uploadedBy: "staff", uploadedByUserId: actor.userId },
    actor,
  );
  revalidatePath(`/admin/applications/${id}`);
  return { ok: true };
}

export interface ResetLinkState {
  url?: string;
  error?: boolean;
}

/** New private link, shown once to staff to send to the customer. The old link and every signed-in browser stop working. */
export async function resetLinkAction(_prev: ResetLinkState, formData: FormData): Promise<ResetLinkState> {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const db = await getDb();
  const app = await getApplication(db, id);
  if (!app) return { error: true };
  const token = await resetApplicationToken(db, id, actorOf(who));
  revalidatePath(`/admin/applications/${id}`);
  return { url: `${await publicOrigin()}/track/${app.reference}?t=${encodeURIComponent(token)}` };
}

// ---- Settings (owner only: where customers send money) ----

export async function savePaymentSettings(formData: FormData) {
  const who = await requireOwner();
  const promptpay = str(formData, "payment.promptpayId", 40);
  if (promptpay && !classifyPromptPayId(promptpay)) redirect("/admin/settings?error=promptpay");
  const db = await getDb();
  for (const k of paymentSettingKeys) await setSetting(db, k, str(formData, k, 200), who.name);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=saved");
}

export async function sendTestAlertAction() {
  await requireOwner();
  const results = await sendTestAlert();
  const q = results.length === 0 ? "error=no_channels" : results.every((r) => r.ok) ? "ok=test_sent" : `error=test_failed&failed=${results.filter((r) => !r.ok).map((r) => r.channel).join(",")}`;
  redirect(`/admin/settings?${q}`);
}
