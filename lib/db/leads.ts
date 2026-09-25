import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { adminUsers, consents, leadActivities, leads, type LeadContextJson, type LeadStatus } from "@/lib/db/schema";

// Consent wording is versioned: the exact text shown is stored with each consent row.
export const CONSENT_WORDING = {
  version: "2026-09-25",
  contact: "ยินยอมให้ Unlimit Insure ใช้ข้อมูลนี้เพื่อติดต่อกลับเรื่องประกันรถที่ขอคำปรึกษา",
  marketing: "ยินยอมรับข่าวสารและข้อเสนอ",
} as const;

export const leadStatuses: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];

/** Who did something to a lead. `userId` is null for the break-glass env owner. */
export interface Actor {
  name: string;
  userId: string | null;
}

export interface NewLead {
  name: string;
  phone: string;
  lineId?: string;
  preferredChannel: "phone" | "line";
  question?: string;
  consentMarketing: boolean;
  context: LeadContextJson;
}

function makeReference(): string {
  const rand = crypto.getRandomValues(new Uint32Array(1))[0]!.toString(36).toUpperCase().padStart(4, "0").slice(-4);
  return `UI-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

/** Store a lead with its consent log and first activity. Contact consent is required by the caller's validation. */
export async function createLead(db: Database, input: NewLead): Promise<{ id: string; reference: string }> {
  const id = crypto.randomUUID();
  const reference = makeReference();
  await db.insert(leads).values({
    id,
    reference,
    name: input.name,
    phone: input.phone,
    lineId: input.lineId ?? null,
    preferredChannel: input.preferredChannel,
    question: input.question ?? null,
    context: input.context,
  });
  await db.insert(consents).values([
    { id: crypto.randomUUID(), leadId: id, purpose: "contact", granted: true, wording: CONSENT_WORDING.contact, wordingVersion: CONSENT_WORDING.version },
    {
      id: crypto.randomUUID(),
      leadId: id,
      purpose: "marketing",
      granted: input.consentMarketing,
      wording: CONSENT_WORDING.marketing,
      wordingVersion: CONSENT_WORDING.version,
    },
  ]);
  await db.insert(leadActivities).values({ id: crypto.randomUUID(), leadId: id, type: "created", actor: "customer", actorUserId: null });
  return { id, reference };
}

export async function listLeads(
  db: Database,
  opts: { status?: LeadStatus; assignedTo?: string | "unassigned"; limit?: number } = {},
) {
  const conds = [
    opts.status ? eq(leads.status, opts.status) : undefined,
    opts.assignedTo === "unassigned" ? isNull(leads.assignedTo) : opts.assignedTo ? eq(leads.assignedTo, opts.assignedTo) : undefined,
  ].filter((c) => c !== undefined);
  const q = db.select().from(leads);
  return (conds.length ? q.where(and(...conds)) : q).orderBy(desc(leads.createdAt)).limit(opts.limit ?? 200);
}

export async function countLeadsByStatus(db: Database): Promise<Record<LeadStatus, number>> {
  const rows = await db.select({ status: leads.status, n: sql<number>`count(*)` }).from(leads).groupBy(leads.status);
  const out = Object.fromEntries(leadStatuses.map((s) => [s, 0])) as Record<LeadStatus, number>;
  for (const r of rows) out[r.status] = Number(r.n);
  return out;
}

export async function getLead(db: Database, id: string) {
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) return null;
  const [consentRows, activityRows] = await Promise.all([
    db.select().from(consents).where(eq(consents.leadId, id)).orderBy(desc(consents.createdAt)),
    db.select().from(leadActivities).where(eq(leadActivities.leadId, id)).orderBy(desc(leadActivities.createdAt)),
  ]);
  return { lead, consents: consentRows, activities: activityRows };
}

export async function updateLeadStatus(db: Database, id: string, status: LeadStatus, actor: Actor): Promise<boolean> {
  const [current] = await db.select({ status: leads.status }).from(leads).where(eq(leads.id, id)).limit(1);
  if (!current) return false;
  if (current.status === status) return true;
  await db.update(leads).set({ status, updatedAt: new Date().toISOString() }).where(eq(leads.id, id));
  await db.insert(leadActivities).values({
    id: crypto.randomUUID(),
    leadId: id,
    type: "status_changed",
    note: `${current.status} → ${status}`,
    actor: actor.name,
    actorUserId: actor.userId,
  });
  return true;
}

export async function addLeadNote(db: Database, id: string, note: string, actor: Actor): Promise<void> {
  await db.insert(leadActivities).values({ id: crypto.randomUUID(), leadId: id, type: "note", note, actor: actor.name, actorUserId: actor.userId });
  await db.update(leads).set({ updatedAt: new Date().toISOString() }).where(eq(leads.id, id));
}

export type AssignResult = "ok" | "unchanged" | "lead_not_found" | "user_not_found";

/** Assign a lead to an active admin user, or unassign with null. Logged as an activity. */
export async function assignLead(db: Database, id: string, userId: string | null, actor: Actor): Promise<AssignResult> {
  const [lead] = await db.select({ assignedTo: leads.assignedTo }).from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) return "lead_not_found";
  if ((lead.assignedTo ?? null) === userId) return "unchanged";
  let label = "ไม่มีผู้รับผิดชอบ";
  if (userId) {
    const [u] = await db.select({ name: adminUsers.name, active: adminUsers.active }).from(adminUsers).where(eq(adminUsers.id, userId)).limit(1);
    if (!u || !u.active) return "user_not_found";
    label = u.name;
  }
  await db.update(leads).set({ assignedTo: userId, updatedAt: new Date().toISOString() }).where(eq(leads.id, id));
  await db.insert(leadActivities).values({ id: crypto.randomUUID(), leadId: id, type: "assigned", note: label, actor: actor.name, actorUserId: actor.userId });
  return "ok";
}
