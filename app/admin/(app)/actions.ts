"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { addLeadNote, leadStatuses, updateLeadStatus } from "@/lib/db/leads";
import { markVersionVerified, setVersionStatus } from "@/lib/db/products-admin";
import { insurers as insurersTable, type LeadStatus, type VersionStatus } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server/admin-auth";
import { applyImport, type ImportSummary } from "@/lib/db/import";
import { MAX_ROWS_PER_SHEET, validateWorkbook, type ImportIssue, type RawRow, type RawWorkbook } from "@/lib/import/validate";

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

// ---- Product data import ----


export interface ImportPreview {
  counts: { insurers: number; brands: number; models: number; versions: number };
  versions: { row: number; productId: string; productName: string; effectiveFrom: string; effectiveUntil: string; insuranceType: string }[];
  errors: ImportIssue[];
  warnings: ImportIssue[];
}

function sanitizeWorkbook(input: unknown): RawWorkbook {
  const out: RawWorkbook = {};
  if (!input || typeof input !== "object") return out;
  for (const name of ["insurers", "vehicles", "products"] as const) {
    const rows = (input as Record<string, unknown>)[name];
    if (!Array.isArray(rows)) continue;
    out[name] = rows.slice(0, MAX_ROWS_PER_SHEET + 1).map((r) => {
      const row: RawRow = {};
      if (r && typeof r === "object") {
        for (const [k, v] of Object.entries(r as Record<string, unknown>)) {
          if (k.length > 64) continue;
          row[k] = typeof v === "string" ? v.slice(0, 2000) : typeof v === "number" || typeof v === "boolean" ? v : null;
        }
      }
      return row;
    });
  }
  return out;
}

async function planFor(input: unknown) {
  const db = await getDb();
  const existing = await db.select({ id: insurersTable.id }).from(insurersTable);
  return { db, plan: validateWorkbook(sanitizeWorkbook(input), { existingInsurerIds: existing.map((i) => i.id) }) };
}

export async function previewImport(input: unknown): Promise<ImportPreview> {
  await requireAdmin();
  const { plan } = await planFor(input);
  return {
    counts: { insurers: plan.insurers.length, brands: plan.brands.length, models: plan.models.length, versions: plan.versions.length },
    versions: plan.versions.map((v) => ({
      row: v.row,
      productId: v.productId,
      productName: v.productName,
      effectiveFrom: v.effectiveFrom,
      effectiveUntil: v.effectiveUntil,
      insuranceType: v.insuranceType,
    })),
    errors: plan.errors.slice(0, 500),
    warnings: plan.warnings.slice(0, 500),
  };
}

export async function commitImport(input: unknown): Promise<{ ok: true; summary: ImportSummary } | { ok: false; errors: number }> {
  await requireAdmin();
  const { db, plan } = await planFor(input);
  if (plan.errors.length > 0) return { ok: false, errors: plan.errors.length };
  const summary = await applyImport(db, plan);
  revalidatePath("/admin/products");
  return { ok: true, summary };
}
