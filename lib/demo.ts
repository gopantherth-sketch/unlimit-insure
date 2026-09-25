import { rankQuotes } from "@/lib/match";
import { generateQuotes } from "@/lib/quote";
import type { Catalog, PriorityId, RankedQuote, ResolvedVehicle } from "@/lib/types";
import { defaultVehicle, resolveVehicle } from "@/lib/vehicle";

// Homepage demos run through the same engine as the real journey — no separate hard-coded plans.

export const demoPlanIds = ["a-type1-dealer", "b-type1-garage", "c-type1-complete"] as const;
export const demoPriorities: PriorityId[] = ["dealer", "flood", "noExcess", "highCoverage", "roadside", "replacementCar"];

export function getDemo(catalog: Catalog): { vehicle: ResolvedVehicle; quotes: RankedQuote[] } | null {
  const vehicle = resolveVehicle(catalog, defaultVehicle);
  if (!vehicle) return null;
  const ranked = rankQuotes(generateQuotes(catalog, vehicle), demoPriorities, vehicle);
  const quotes = demoPlanIds
    .map((id) => ranked.find((q) => q.productId === id))
    .filter((q): q is RankedQuote => q !== undefined);
  return { vehicle, quotes };
}
