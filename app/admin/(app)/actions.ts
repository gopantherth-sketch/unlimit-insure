"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { addLeadNote, leadStatuses, updateLeadStatus } from "@/lib/db/leads";
import { markVersionVerified, setVersionStatus } from "@/lib/db/products-admin";
import type { LeadStatus, VersionStatus } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server/admin-auth";

export async function changeLeadStatus(formData: FormData) {
  const who = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!id || !leadStatuses.includes(status)) return;
  await updateLeadStatus(await getDb(), id, status, who);
  revalidatePath(`/admin/leads/${id}`);
}

export async function addNote(formData: FormData) {
  const who = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  if (!id || !note) return;
  await addLeadNote(await getDb(), id, note, who);
  revalidatePath(`/admin/leads/${id}`);
}

export async function verifyVersion(formData: FormData) {
  const who = await requireAdmin();
  const versionId = String(formData.get("versionId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const documentName = String(formData.get("documentName") ?? "").trim().slice(0, 200);
  const pageRaw = Number(formData.get("page"));
  if (!versionId || !documentName) return;
  await markVersionVerified(await getDb(), {
    versionId,
    documentName,
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : null,
    verifiedBy: who,
  });
  revalidatePath(`/admin/products/${productId}`);
}

const versionStatuses: VersionStatus[] = ["draft", "published", "retired"];

export async function changeVersionStatus(formData: FormData) {
  await requireAdmin();
  const versionId = String(formData.get("versionId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  const status = String(formData.get("status") ?? "") as VersionStatus;
  if (!versionId || !versionStatuses.includes(status)) return;
  const result = await setVersionStatus(await getDb(), versionId, status);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  if (result !== "ok") redirect(`/admin/products/${encodeURIComponent(productId)}?error=${result}`);
}
