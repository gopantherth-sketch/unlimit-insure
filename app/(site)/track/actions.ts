"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_DOCUMENTS_PER_APPLICATION, MAX_UPLOAD_BYTES, safeFileName, sniffType } from "@/lib/applications/files";
import { customerUploadKinds, type DocumentKind } from "@/lib/applications/status";
import { REFERENCE_RE } from "@/lib/applications/tokens";
import { recordEvent } from "@/lib/db/analytics";
import {
  addDocument,
  countDocuments,
  customerActor,
  getApplicationByReference,
  moveApplication,
  phoneLast4Matches,
  verifyApplicationToken,
} from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { normalizePhone } from "@/lib/leads";
import { documentKey, getDocsBucket } from "@/lib/server/storage";
import { notifyStaff } from "@/lib/server/notify";
import { purchaseEnabled } from "@/lib/server/features";
import { customerApplication, grantAccess, throttled } from "@/lib/server/track-auth";

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);

/** Private link + last 4 phone digits → access cookie. */
export async function confirmPhone(formData: FormData) {
  const reference = str(formData, "reference", 20).toUpperCase();
  const token = str(formData, "token", 100);
  const last4 = str(formData, "last4", 4);
  if (!REFERENCE_RE.test(reference)) redirect("/garage");
  const back = `/track/${reference}?t=${encodeURIComponent(token)}`;
  if (await throttled("track-phone", 8)) redirect(`${back}&error=throttled`);
  const app = await getApplicationByReference(await getDb(), reference);
  if (!app || !(await verifyApplicationToken(app, token))) redirect(`/track/${reference}?error=link`);
  if (!phoneLast4Matches(app, last4)) redirect(`${back}&error=phone`);
  await grantAccess(app);
  redirect(`/track/${reference}`);
}

export interface LookupState {
  error?: "not_found" | "throttled" | "invalid";
  /** Echoed back so the form keeps what the customer typed (React resets forms after an action). */
  reference?: string;
  phone?: string;
}

/** Reference + full phone number → access cookie (for customers who lost the link). */
export async function lookupApplication(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const reference = str(formData, "reference", 20).toUpperCase().replace(/\s/g, "");
  const rawPhone = str(formData, "phone", 20);
  const phone = normalizePhone(rawPhone);
  const echo = { reference, phone: rawPhone };
  if (!REFERENCE_RE.test(reference) || !/^0\d{8,9}$/.test(phone)) return { error: "invalid", ...echo };
  if (await throttled("track-lookup", 5)) return { error: "throttled", ...echo };
  const app = await getApplicationByReference(await getDb(), reference);
  if (!app || app.phone !== phone) return { error: "not_found", ...echo };
  await grantAccess(app);
  redirect(`/track/${reference}`);
}

export interface UploadState {
  ok?: boolean;
  error?: "no_access" | "not_now" | "kind" | "empty" | "too_large" | "type" | "too_many";
}

export async function uploadDocument(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const reference = str(formData, "reference", 20);
  const app = await customerApplication(reference);
  if (!app) return { error: "no_access" };
  if (!(await purchaseEnabled())) return { error: "not_now" };
  const kind = str(formData, "kind", 30) as DocumentKind;
  if (!customerUploadKinds.includes(kind)) return { error: "kind" };
  const docPhase = ["documents_pending", "needs_info", "submitted"].includes(app.status);
  const paymentPhase = app.status === "awaiting_payment";
  if (kind === "payment_slip" ? !paymentPhase : !docPhase) return { error: "not_now" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "too_large" };
  const db = await getDb();
  if ((await countDocuments(db, app.id)) >= MAX_DOCUMENTS_PER_APPLICATION) return { error: "too_many" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffType(bytes.subarray(0, 16));
  if (!type) return { error: "type" };

  const id = crypto.randomUUID();
  const key = documentKey(app.id, id);
  await (await getDocsBucket()).put(key, bytes, { httpMetadata: { contentType: type } });
  await addDocument(
    db,
    { id, applicationId: app.id, kind, r2Key: key, fileName: safeFileName(file.name, type), contentType: type, sizeBytes: bytes.byteLength, uploadedBy: "customer" },
    customerActor,
  );
  revalidatePath(`/track/${app.reference}`);
  return { ok: true };
}

export async function sendForReview(formData: FormData) {
  const reference = str(formData, "reference", 20);
  const app = await customerApplication(reference);
  if (!app) redirect(`/track/${reference}`);
  const r = await moveApplication(await getDb(), app.id, "submitted", "customer", customerActor);
  if (r.ok) {
    await recordEvent(await getDb(), "documents_submitted").catch(() => {});
    await notifyStaff({ kind: "documents", reference: app.reference, path: `/admin/applications/${app.id}` }).catch(() => {});
  }
  redirect(`/track/${app.reference}${r.ok ? "?ok=submitted" : `?error=${r.error}`}`);
}

export async function notifyPayment(formData: FormData) {
  const reference = str(formData, "reference", 20);
  const app = await customerApplication(reference);
  if (!app) redirect(`/track/${reference}`);
  const r = await moveApplication(await getDb(), app.id, "payment_submitted", "customer", customerActor);
  if (r.ok) {
    await recordEvent(await getDb(), "payment_submitted").catch(() => {});
    await notifyStaff({ kind: "payment", reference: app.reference, path: `/admin/applications/${app.id}` }).catch(() => {});
  }
  redirect(`/track/${app.reference}${r.ok ? "?ok=paid" : `?error=${r.error}`}`);
}
