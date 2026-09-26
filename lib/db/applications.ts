import { and, desc, eq, inArray, sql } from "drizzle-orm";
import {
  canMove,
  requiredCustomerDocuments,
  terminalStatuses,
  type ApplicationStatus,
  type DocumentKind,
} from "@/lib/applications/status";
import { hashToken, newReference, newToken, tokenMatches } from "@/lib/applications/tokens";
import type { Database } from "@/lib/db/client";
import type { Actor } from "@/lib/db/leads";
import { applicationDocuments, applicationEvents, applications, quoteSnapshots } from "@/lib/db/schema";
import type { Quote, ResolvedVehicle } from "@/lib/types";

export type ApplicationRow = typeof applications.$inferSelect;
export type ApplicationDocumentRow = typeof applicationDocuments.$inferSelect;
export type ApplicationEventRow = typeof applicationEvents.$inferSelect;

const nowIso = () => new Date().toISOString();
const CUSTOMER: Actor = { name: "customer", userId: null };

export interface NewApplication {
  quote: Quote;
  vehicle: ResolvedVehicle;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  plateNumber: string;
  province: string;
  coverageStart: string;
  consentMarketing: boolean;
}

/** Freezes the quote, creates the application and returns the one-time plain token for the private link. */
export async function createApplication(db: Database, input: NewApplication): Promise<{ id: string; reference: string; token: string }> {
  const snapshotId = crypto.randomUUID();
  const q = input.quote;
  await db.insert(quoteSnapshots).values({
    id: snapshotId,
    productVersionId: q.productVersionId,
    vehicle: { brandId: input.vehicle.brandId, modelId: input.vehicle.modelId, year: input.vehicle.year },
    premium: q.premium,
    sumInsured: q.sumInsured,
    coverage: structuredClone(q.coverage),
    benefits: [...q.version.benefits],
    source: {
      ...q.version.source,
      productId: q.productId,
      productName: q.product.name,
      insurerId: q.insurer.id,
      insurerName: q.insurer.name,
      claimsHotline: q.insurer.claimsHotline ?? null,
      estimatedValue: input.vehicle.estimatedValue,
      vehicleLabel: `${input.vehicle.brand.name} ${input.vehicle.model.name} ${input.vehicle.year}`,
    },
    capturedBy: "system",
  });

  const id = crypto.randomUUID();
  const token = newToken();
  let reference = newReference();
  for (let i = 0; i < 3; i++) {
    const [clash] = await db.select({ id: applications.id }).from(applications).where(eq(applications.reference, reference)).limit(1);
    if (!clash) break;
    reference = newReference();
  }
  await db.insert(applications).values({
    id,
    reference,
    quoteSnapshotId: snapshotId,
    productId: q.productId,
    productVersionId: q.productVersionId,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    address: input.address,
    plateNumber: input.plateNumber,
    province: input.province,
    coverageStart: input.coverageStart,
    estimatedPremium: q.premium,
    tokenHash: await hashToken(token),
    consentMarketing: input.consentMarketing,
  });
  await event(db, id, { type: "created", toStatus: "documents_pending", visibleToCustomer: true }, CUSTOMER);
  return { id, reference, token };
}

async function event(
  db: Database,
  applicationId: string,
  e: Pick<typeof applicationEvents.$inferInsert, "type" | "fromStatus" | "toStatus" | "note" | "visibleToCustomer">,
  actor: Actor,
) {
  await db.insert(applicationEvents).values({ id: crypto.randomUUID(), applicationId, ...e, actor: actor.name, actorUserId: actor.userId });
}

export async function getApplicationByReference(db: Database, reference: string): Promise<ApplicationRow | null> {
  const [a] = await db.select().from(applications).where(eq(applications.reference, reference)).limit(1);
  return a ?? null;
}

export async function getApplication(db: Database, id: string): Promise<ApplicationRow | null> {
  const [a] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return a ?? null;
}

export async function verifyApplicationToken(app: ApplicationRow, token: string): Promise<boolean> {
  return tokenMatches(token, app.tokenHash);
}

export function phoneLast4Matches(app: ApplicationRow, last4: string): boolean {
  return /^\d{4}$/.test(last4) && app.phone.slice(-4) === last4;
}

/** New private link; the old one stops working. */
export async function resetApplicationToken(db: Database, id: string, actor: Actor): Promise<string> {
  const token = newToken();
  await db.update(applications).set({ tokenHash: await hashToken(token), updatedAt: nowIso() }).where(eq(applications.id, id));
  await event(db, id, { type: "link_reset", visibleToCustomer: false }, actor);
  return token;
}

export async function getApplicationDetail(db: Database, id: string) {
  const app = await getApplication(db, id);
  if (!app) return null;
  const [[snapshot], documents, events] = await Promise.all([
    db.select().from(quoteSnapshots).where(eq(quoteSnapshots.id, app.quoteSnapshotId)).limit(1),
    db.select().from(applicationDocuments).where(eq(applicationDocuments.applicationId, id)).orderBy(desc(applicationDocuments.createdAt)),
    db.select().from(applicationEvents).where(eq(applicationEvents.applicationId, id)).orderBy(desc(applicationEvents.createdAt)),
  ]);
  if (!snapshot) return null;
  return { app, snapshot, documents, events };
}

export async function listApplications(db: Database, opts: { statuses?: ApplicationStatus[]; limit?: number } = {}) {
  const q = db.select().from(applications);
  return (opts.statuses?.length ? q.where(inArray(applications.status, opts.statuses)) : q).orderBy(desc(applications.updatedAt)).limit(opts.limit ?? 200);
}

export async function countApplicationsByStatus(db: Database): Promise<Partial<Record<ApplicationStatus, number>>> {
  const rows = await db.select({ status: applications.status, n: sql<number>`count(*)` }).from(applications).groupBy(applications.status);
  return Object.fromEntries(rows.map((r) => [r.status, Number(r.n)]));
}

// ---- Documents ----

export async function countDocuments(db: Database, applicationId: string): Promise<number> {
  const [r] = await db.select({ n: sql<number>`count(*)` }).from(applicationDocuments).where(eq(applicationDocuments.applicationId, applicationId));
  return Number(r?.n ?? 0);
}

export async function addDocument(
  db: Database,
  doc: Omit<typeof applicationDocuments.$inferInsert, "createdAt">,
  actor: Actor,
): Promise<void> {
  await db.insert(applicationDocuments).values(doc);
  await db.update(applications).set({ updatedAt: nowIso() }).where(eq(applications.id, doc.applicationId));
  await event(db, doc.applicationId, { type: "document_added", note: doc.kind, visibleToCustomer: doc.uploadedBy === "staff" && doc.kind === "policy" }, actor);
}

export async function getDocument(db: Database, id: string): Promise<ApplicationDocumentRow | null> {
  const [d] = await db.select().from(applicationDocuments).where(eq(applicationDocuments.id, id)).limit(1);
  return d ?? null;
}

export function missingRequiredDocuments(docs: Pick<ApplicationDocumentRow, "kind">[]): DocumentKind[] {
  const have = new Set(docs.map((d) => d.kind));
  return requiredCustomerDocuments.filter((k) => !have.has(k));
}

// ---- Status ----

export type MoveError = "not_found" | "not_allowed" | "missing_documents" | "missing_payment_slip" | "missing_policy" | "missing_reason";

export async function moveApplication(
  db: Database,
  id: string,
  to: ApplicationStatus,
  who: "customer" | "staff",
  actor: Actor,
  opts: { message?: string } = {},
): Promise<{ ok: true } | { ok: false; error: MoveError }> {
  const app = await getApplication(db, id);
  if (!app) return { ok: false, error: "not_found" };
  if (!canMove(app.status, to, who)) return { ok: false, error: "not_allowed" };

  const docs = await db.select({ kind: applicationDocuments.kind }).from(applicationDocuments).where(eq(applicationDocuments.applicationId, id));
  if (to === "submitted" && missingRequiredDocuments(docs).length > 0) return { ok: false, error: "missing_documents" };
  if (to === "payment_submitted" && !docs.some((d) => d.kind === "payment_slip")) return { ok: false, error: "missing_payment_slip" };
  if (to === "policy_issued" && (!app.policyNumber || !app.policyStart || !app.policyEnd || !docs.some((d) => d.kind === "policy"))) {
    return { ok: false, error: "missing_policy" };
  }
  // Customers deserve a reason when we ask for more, send back a slip, decline or cancel.
  const needsReason = who === "staff" && (["needs_info", "rejected", "cancelled"].includes(to) || (app.status === "payment_submitted" && to === "awaiting_payment"));
  if (needsReason && !opts.message?.trim()) return { ok: false, error: "missing_reason" };

  // Guard against concurrent moves: only update if still in the status we checked.
  await db.update(applications).set({ status: to, updatedAt: nowIso() }).where(and(eq(applications.id, id), eq(applications.status, app.status)));
  const after = await getApplication(db, id);
  if (after?.status !== to) return { ok: false, error: "not_allowed" };
  await event(db, id, { type: "status_changed", fromStatus: app.status, toStatus: to, note: opts.message?.trim() || null, visibleToCustomer: true }, actor);
  return { ok: true };
}

export async function addApplicationMessage(db: Database, id: string, text: string, visibleToCustomer: boolean, actor: Actor): Promise<void> {
  await event(db, id, { type: visibleToCustomer ? "message" : "note", note: text, visibleToCustomer }, actor);
  await db.update(applications).set({ updatedAt: nowIso() }).where(eq(applications.id, id));
}

/** Insurer-confirmed price. Only before payment; the customer sees old → new and the reason. */
export async function setFinalPremium(db: Database, id: string, premium: number, reason: string, actor: Actor): Promise<{ ok: boolean; error?: string }> {
  const app = await getApplication(db, id);
  if (!app) return { ok: false, error: "not_found" };
  if (!["submitted", "needs_info", "awaiting_payment"].includes(app.status)) return { ok: false, error: "not_allowed" };
  if (!Number.isInteger(premium) || premium <= 0 || premium > 10_000_000) return { ok: false, error: "invalid_premium" };
  if (!reason.trim()) return { ok: false, error: "missing_reason" };
  const old = app.finalPremium ?? app.estimatedPremium;
  await db.update(applications).set({ finalPremium: premium, finalPremiumReason: reason.trim(), updatedAt: nowIso() }).where(eq(applications.id, id));
  await event(db, id, { type: "premium_changed", note: `${old} → ${premium}: ${reason.trim()}`, visibleToCustomer: true }, actor);
  return { ok: true };
}

export async function setPolicyDetails(db: Database, id: string, d: { policyNumber: string; policyStart: string; policyEnd: string }, actor: Actor) {
  const app = await getApplication(db, id);
  if (!app || terminalStatuses.includes(app.status)) return { ok: false as const };
  if (!d.policyNumber.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(d.policyStart) || !/^\d{4}-\d{2}-\d{2}$/.test(d.policyEnd) || d.policyEnd <= d.policyStart) {
    return { ok: false as const };
  }
  await db
    .update(applications)
    .set({ policyNumber: d.policyNumber.trim(), policyStart: d.policyStart, policyEnd: d.policyEnd, updatedAt: nowIso() })
    .where(eq(applications.id, id));
  await event(db, id, { type: "note", note: `ข้อมูลกรมธรรม์: ${d.policyNumber.trim()} (${d.policyStart} – ${d.policyEnd})`, visibleToCustomer: false }, actor);
  return { ok: true as const };
}

export async function assignApplication(db: Database, id: string, userId: string | null, userName: string, actor: Actor) {
  await db.update(applications).set({ assignedTo: userId, updatedAt: nowIso() }).where(eq(applications.id, id));
  await event(db, id, { type: "assigned", note: userName, visibleToCustomer: false }, actor);
}

/** Amount the customer should pay now. */
export const amountDue = (app: Pick<ApplicationRow, "finalPremium" | "estimatedPremium">) => app.finalPremium ?? app.estimatedPremium;

export const customerActor = CUSTOMER;
