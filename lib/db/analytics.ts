import { and, gte, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { eventCounts } from "@/lib/db/schema";

export const bangkokDay = (d = new Date()) => new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);

export async function recordEvent(db: Database, name: string, dim = "", now = new Date()): Promise<void> {
  await db
    .insert(eventCounts)
    .values({ day: bangkokDay(now), name, dim, count: 1 })
    .onConflictDoUpdate({ target: [eventCounts.day, eventCounts.name, eventCounts.dim], set: { count: sql`${eventCounts.count} + 1` } });
}

/** Totals per event and per event × dim since `days` ago (Bangkok days). */
export async function eventTotals(db: Database, days = 30, now = new Date()) {
  const since = bangkokDay(new Date(now.getTime() - (days - 1) * 86_400_000));
  const rows = await db
    .select({ name: eventCounts.name, dim: eventCounts.dim, n: sql<number>`sum(${eventCounts.count})` })
    .from(eventCounts)
    .where(and(gte(eventCounts.day, since)))
    .groupBy(eventCounts.name, eventCounts.dim);
  const byName: Record<string, number> = {};
  const byDim: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const n = Number(r.n);
    byName[r.name] = (byName[r.name] ?? 0) + n;
    if (r.dim) (byDim[r.name] ??= {})[r.dim] = n;
  }
  return { since, byName, byDim };
}
