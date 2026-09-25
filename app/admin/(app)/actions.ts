"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminRoles } from "@/lib/admin/validate";
import {
  createAdminUser,
  resetAdminPassword,
  setAdminUserActive,
  updateAdminUser,
  type UserError,
} from "@/lib/db/admin-users";
import { getDb } from "@/lib/db/client";
import { applyImport, type ImportSummary } from "@/lib/db/import";
import { addLeadNote, assignLead, leadStatuses, updateLeadStatus } from "@/lib/db/leads";
import { markVersionVerified, setVersionStatus } from "@/lib/db/products-admin";
import { insurers as insurersTable, type AdminRole, type LeadStatus, type VersionStatus } from "@/lib/db/schema";
import { MAX_ROWS_PER_SHEET, validateWorkbook, type ImportIssue, type RawRow, type RawWorkbook } from "@/lib/import/validate";
import { actorOf, guardContext, requireAdmin, requireOwner } from "@/lib/server/admin-auth";

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);

// ---- Leads (any active admin) ----

export async function changeLeadStatus(formData: FormData) {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const status = str(formData, "status", 20) as LeadStatus;
  if (!id || !leadStatuses.includes(status)) return;
  await updateLeadStatus(await getDb(), id, status, actorOf(who));
  revalidatePath(`/admin/leads/${id}`);
}

export async function addNote(formData: FormData) {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const note = str(formData, "note");
  if (!id || !note) return;
  await addLeadNote(await getDb(), id, note, actorOf(who));
  revalidatePath(`/admin/leads/${id}`);
}

export async function changeAssignee(formData: FormData) {
  const who = await requireAdmin();
  const id = str(formData, "id", 64);
  const userId = str(formData, "assignee", 64) || null;
  if (!id) return;
  const result = await assignLead(await getDb(), id, userId, actorOf(who));
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  if (result === "user_not_found") redirect(`/admin/leads/${encodeURIComponent(id)}?error=assignee`);
}

// ---- Product sources (owner only: publishing is a compliance decision) ----

export async function verifyVersion(formData: FormData) {
  const who = await requireOwner();
  const versionId = str(formData, "versionId", 200);
  const productId = str(formData, "productId", 200);
  const documentName = str(formData, "documentName", 200);
  const pageRaw = Number(formData.get("page"));
  if (!versionId || !documentName) return;
  await markVersionVerified(await getDb(), {
    versionId,
    documentName,
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : null,
    verifiedBy: who.name,
  });
  revalidatePath(`/admin/products/${productId}`);
}

const versionStatuses: VersionStatus[] = ["draft", "published", "retired"];

export async function changeVersionStatus(formData: FormData) {
  await requireOwner();
  const versionId = str(formData, "versionId", 200);
  const productId = str(formData, "productId", 200);
  const status = str(formData, "status", 20) as VersionStatus;
  if (!versionId || !versionStatuses.includes(status)) return;
  const result = await setVersionStatus(await getDb(), versionId, status);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  if (result !== "ok") redirect(`/admin/products/${encodeURIComponent(productId)}?error=${result}`);
}

// ---- Admin users (owner only) ----

const userErrorParam = (e: UserError) => encodeURIComponent(e);

export async function createUserAction(formData: FormData) {
  const who = await requireOwner();
  const role = str(formData, "role", 10) as AdminRole;
  if (!adminRoles.includes(role)) redirect("/admin/users?error=invalid_role");
  const result = await createAdminUser(
    await getDb(),
    {
      name: str(formData, "name", 80),
      username: str(formData, "username", 32),
      password: String(formData.get("password") ?? ""),
      role,
      mustChangePassword: formData.get("mustChange") === "on",
      createdBy: who.name,
    },
    await guardContext(who),
  );
  revalidatePath("/admin/users");
  if (!result.ok) redirect(`/admin/users?error=${userErrorParam(result.error)}`);
  redirect(`/admin/users/${result.value.id}?ok=created`);
}

export async function updateUserAction(formData: FormData) {
  const who = await requireOwner();
  const id = str(formData, "id", 64);
  const role = str(formData, "role", 10) as AdminRole;
  if (!id || !adminRoles.includes(role)) return;
  const result = await updateAdminUser(await getDb(), id, { name: str(formData, "name", 80), role }, await guardContext(who));
  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
  redirect(`/admin/users/${id}?${result.ok ? "ok=updated" : `error=${userErrorParam(result.error)}`}`);
}

export async function setUserActiveAction(formData: FormData) {
  const who = await requireOwner();
  const id = str(formData, "id", 64);
  const active = str(formData, "active", 5) === "true";
  if (!id) return;
  const result = await setAdminUserActive(await getDb(), id, active, await guardContext(who));
  revalidatePath(`/admin/users/${id}`);
  revalidatePath("/admin/users");
  redirect(`/admin/users/${id}?${result.ok ? `ok=${active ? "enabled" : "disabled"}` : `error=${userErrorParam(result.error)}`}`);
}

export async function resetPasswordAction(formData: FormData) {
  await requireOwner();
  const id = str(formData, "id", 64);
  if (!id) return;
  const result = await resetAdminPassword(await getDb(), id, String(formData.get("password") ?? ""));
  revalidatePath(`/admin/users/${id}`);
  redirect(`/admin/users/${id}?${result.ok ? "ok=reset" : `error=${userErrorParam(result.error)}`}`);
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
  await requireAdmin(); // staff may import: rows land as drafts; only owners verify and publish
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
