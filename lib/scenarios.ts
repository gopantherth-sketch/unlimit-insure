import type { ScenarioId } from "@/content/types";
import type { Coverage, Quote } from "@/lib/types";

// Coverage simulator rules (PROJECT_MASTER.md §14). Deterministic, derived only from structured
// product coverage — never generated. Real launch requires rules verified against policy wording.

export interface ScenarioRule {
  id: ScenarioId;
  covered: (c: Coverage) => boolean;
  /** Whether the plan's excess may apply in this scenario. */
  excessMayApply: boolean;
  evOnly?: boolean;
}

export const scenarioRules: ScenarioRule[] = [
  { id: "collision", covered: (c) => c.collisionWithCounterparty, excessMayApply: true },
  { id: "noCounterparty", covered: (c) => c.collisionNoCounterparty, excessMayApply: true },
  { id: "flood", covered: (c) => c.flood, excessMayApply: false },
  { id: "fire", covered: (c) => c.fireTheft, excessMayApply: false },
  { id: "theft", covered: (c) => c.fireTheft, excessMayApply: false },
  { id: "evBattery", covered: (c) => c.evBattery, excessMayApply: true, evOnly: true },
];

export interface ScenarioOutcome {
  scenario: ScenarioId;
  covered: boolean;
  /** Maximum own-damage payout, bounded by sum insured. */
  maxAmount: number;
  excess: number;
}

export function simulate(scenario: ScenarioId, quote: Quote): ScenarioOutcome {
  const rule = scenarioRules.find((r) => r.id === scenario);
  const covered = rule ? rule.covered(quote.coverage) : false;
  return {
    scenario,
    covered,
    maxAmount: covered ? quote.sumInsured : 0,
    excess: covered && rule?.excessMayApply ? quote.coverage.excess : 0,
  };
}
