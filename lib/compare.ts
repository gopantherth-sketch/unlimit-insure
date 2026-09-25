import { coverageFields, type CoverageField } from "@/lib/coverageFields";
import type { Quote } from "@/lib/types";

export interface DifferenceSummary {
  base: Quote;
  other: Quote;
  /** other.premium − base.premium */
  premiumDelta: number;
  /** What `other` gives up relative to `base`. */
  tradeoffs: string[];
  /** What `other` adds relative to `base`. */
  gains: string[];
}

export function summarizeDifference(base: Quote, other: Quote, fields: CoverageField[] = coverageFields): DifferenceSummary {
  const tradeoffs: string[] = [];
  const gains: string[] = [];
  for (const f of fields) {
    if (!f.compare) continue;
    const diff = f.compare(other, base);
    if (diff < 0 && f.worse) tradeoffs.push(f.worse(other, base));
    else if (diff > 0 && f.better) gains.push(f.better(other, base));
  }
  return { base, other, premiumDelta: other.premium - base.premium, tradeoffs, gains };
}

/** Field keys whose displayed value differs across the given quotes. */
export function differingFieldKeys(quotes: Quote[], fields: CoverageField[] = coverageFields): Set<string> {
  const keys = new Set<string>();
  for (const f of fields) {
    const values = new Set(quotes.map((q) => String(f.value(q))));
    if (values.size > 1) keys.add(f.key);
  }
  return keys;
}

/** For each field, which quotes hold the best value (ties included). Empty when all equal or neutral. */
export function bestQuoteIdsByField(quotes: Quote[], fields: CoverageField[] = coverageFields): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const f of fields) {
    const cmp = f.compare;
    if (!cmp || quotes.length < 2) continue;
    let best: Quote[] = [];
    for (const q of quotes) {
      const top = best[0];
      if (!top) best = [q];
      else {
        const d = cmp(q, top);
        if (d > 0) best = [q];
        else if (d === 0) best.push(q);
      }
    }
    if (best.length < quotes.length) out.set(f.key, new Set(best.map((q) => q.id)));
  }
  return out;
}
