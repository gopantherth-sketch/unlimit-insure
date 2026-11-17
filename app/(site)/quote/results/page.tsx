import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResultsView } from "@/components/quote/ResultsView";
import { rankQuotes } from "@/lib/match";
import { parseQuoteInput, withJourney, type RawParams } from "@/lib/params";
import { generateQuotes } from "@/lib/quote";
import { getPublicCatalog } from "@/lib/server/catalog";
import { purchaseEnabled } from "@/lib/server/features";
import { resolveVehicle } from "@/lib/vehicle";

export const metadata: Metadata = seo("/quote/results", { noindex: true });

export default async function ResultsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const input = parseQuoteInput(await searchParams);
  const catalog = await getPublicCatalog();
  if (catalog.products.length === 0) redirect(withJourney("/advisor", input ? { vehicle: input.vehicle, usage: input.usage, priorities: input.priorities } : {}));
  const vehicle = input ? resolveVehicle(catalog, input.vehicle) : null;
  if (!input || !vehicle) redirect("/quote");

  const quotes = rankQuotes(generateQuotes(catalog, vehicle), input.priorities, vehicle);
  return <ResultsView vehicle={vehicle} usage={input.usage} priorities={input.priorities} quotes={quotes} buyEnabled={await purchaseEnabled()} />;
}
