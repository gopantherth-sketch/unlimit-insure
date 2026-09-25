import { and, desc, eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { consents, leadActivities, leads, type LeadContextJson, type LeadStatus } from "@/lib/db/schema";

// Consent wording is versioned: the exact text shown is stored with each consent row.
export const CONSENT_WORDING = {
  version: "2026-09-25",
  contact: "ยินยอมให้ Unlimit Insure ใช้ข้อมูลนี้เพื่อติดต่อกลับเรื่องประกันรถที่ขอคำปรึกษา",
  marketing: "ยินยอมรับข่าวสารและข้อเสนอ",
} as const;

export const leadStatuses: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];

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
  await db.insert(leadActivities).values({ id: crypto.randomUUID(), leadId: id, type: "created", actor: "customer" });
  return { id, reference };
}

export async function listLeads(db: Database, opts: { status?: LeadStatus; limit?: number } = {}) {
  const q = db.select().from(leads);
  const filtered = opts.status ? q.where(eq(leads.status, opts.status)) : q;
  return filtered.orderBy(desc(leads.createdAt)).limit(opts.limit ?? 200);
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

export async function updateLeadStatus(db: Database, id: string, status: LeadStatus, actor: string): Promise<boolean> {
  const [current] = await db.select({ status: leads.status }).from(leads).where(eq(leads.id, id)).limit(1);
  if (!current) return false;
  if (current.status === status) return true;
  await db.update(leads).set({ status, updatedAt: new Date().toISOString() }).where(and(eq(leads.id, id)));
  await db.insert(leadActivities).values({ id: crypto.randomUUID(), leadId: id, type: "status_changed", note: `${current.status} → ${status}`, actor });
  return true;
}

export async function addLeadNote(db: Database, id: string, note: string, actor: string): Promise<void> {
  await db.insert(leadActivities).values({ id: crypto.randomUUID(), leadId: id, type: "note", note, actor });
  await db.update(leads).set({ updatedAt: new Date().toISOString() }).where(eq(leads.id, id));
}
