import { formatBaht } from "@/lib/format";
import { insuranceTypeLabel } from "@/lib/coverageFields";
import type { MatchResult, PriorityId, PriorityResult, Quote, RankedQuote, ResolvedVehicle } from "@/lib/types";

// Transparent matching (PROJECT_MASTER.md §11): each priority is a yes/no rule with a stated reason.
// No weighted or AI score — the user sees "ตรง X จาก Y ข้อ" and why.

/** A premium counts as "ประหยัด" when within this margin of the cheapest plan of the same insurance type. */
export const LOW_PREMIUM_MARGIN = 0.15;
/** "ทุนประกันสูง" when sum insured is at least this share of the estimated vehicle value. */
export const HIGH_COVERAGE_RATIO = 0.95;

export interface MatchContext {
  vehicle: ResolvedVehicle;
  cheapestByType: Map<string, number>;
}

export function buildMatchContext(quotes: Quote[], vehicle: ResolvedVehicle): MatchContext {
  const cheapestByType = new Map<string, number>();
  for (const q of quotes) {
    const t = q.coverage.insuranceType;
    const current = cheapestByType.get(t);
    if (current === undefined || q.premium < current) cheapestByType.set(t, q.premium);
  }
  return { vehicle, cheapestByType };
}

function evaluate(priority: PriorityId, q: Quote, ctx: MatchContext): PriorityResult {
  const c = q.coverage;
  switch (priority) {
    case "dealer":
      return { priority, met: c.repairType === "dealer", reason: c.repairType === "dealer" ? "ซ่อมศูนย์" : "ซ่อมอู่ ไม่ใช่ซ่อมศูนย์" };
    case "lowPremium": {
      const cheapest = ctx.cheapestByType.get(c.insuranceType) ?? q.premium;
      const limit = Math.round(cheapest * (1 + LOW_PREMIUM_MARGIN));
      const met = q.premium <= limit;
      const typeLabel = insuranceTypeLabel[c.insuranceType];
      return {
        priority,
        met,
        reason: met
          ? `เบี้ยไม่เกิน ${Math.round(LOW_PREMIUM_MARGIN * 100)}% จาก${typeLabel}ที่ถูกที่สุดสำหรับรถคันนี้`
          : `เบี้ยสูงกว่า${typeLabel}ที่ถูกที่สุด ${formatBaht(q.premium - cheapest)}`,
      };
    }
    case "noExcess":
      return { priority, met: c.excess === 0, reason: c.excess === 0 ? "ไม่มีค่าเสียหายส่วนแรก" : `มีค่าเสียหายส่วนแรก ${formatBaht(c.excess)}` };
    case "flood":
      return { priority, met: c.flood, reason: c.flood ? "คุ้มครองน้ำท่วม" : "ไม่คุ้มครองน้ำท่วม" };
    case "replacementCar":
      return {
        priority,
        met: c.replacementCarDays > 0,
        reason: c.replacementCarDays > 0 ? `มีรถใช้ระหว่างซ่อมสูงสุด ${c.replacementCarDays} วัน` : "ไม่มีรถใช้ระหว่างซ่อม",
      };
    case "highCoverage": {
      const threshold = ctx.vehicle.estimatedValue * HIGH_COVERAGE_RATIO;
      const met = q.sumInsured >= threshold;
      return {
        priority,
        met,
        reason: met
          ? `ทุนประกัน ${formatBaht(q.sumInsured)} ใกล้เคียงมูลค่ารถโดยประมาณ`
          : `ทุนประกัน ${formatBaht(q.sumInsured)} ต่ำกว่ามูลค่ารถโดยประมาณ ${formatBaht(ctx.vehicle.estimatedValue)}`,
      };
    }
    case "roadside":
      return { priority, met: c.roadsideAssistance, reason: c.roadsideAssistance ? "มีบริการช่วยเหลือฉุกเฉิน" : "ไม่มีบริการช่วยเหลือฉุกเฉิน" };
    case "evBattery":
      return { priority, met: c.evBattery, reason: c.evBattery ? "คุ้มครองแบตเตอรี่ EV" : "ไม่ระบุความคุ้มครองแบตเตอรี่ EV" };
  }
}

export function matchQuote(q: Quote, priorities: PriorityId[], ctx: MatchContext): MatchResult {
  const results = priorities.map((p) => evaluate(p, q, ctx));
  return { matched: results.filter((r) => r.met).length, total: results.length, results };
}

/** Recommended order: most priorities met first, then lower premium. Commission never affects order. */
export function rankQuotes(quotes: Quote[], priorities: PriorityId[], vehicle: ResolvedVehicle): RankedQuote[] {
  const ctx = buildMatchContext(quotes, vehicle);
  return quotes
    .map((q) => ({ ...q, match: matchQuote(q, priorities, ctx) }))
    .sort((a, b) => b.match.matched - a.match.matched || a.premium - b.premium);
}
