import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResultsView } from "@/components/quote/ResultsView";
import { rankQuotes } from "@/lib/match";
import { parseQuoteInput, type RawParams } from "@/lib/params";
import { generateQuotes } from "@/lib/quote";
import { getCatalog } from "@/lib/server/catalog";
import { resolveVehicle } from "@/lib/vehicle";

export const metadata: Metadata = seo("/quote/results", { noindex: true });

export default async function ResultsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const input = parseQuoteInput(await searchParams);
  const catalog = await getCatalog();
  const vehicle = input ? resolveVehicle(catalog, input.vehicle) : null;
  if (!input || !vehicle) redirect("/quote");

  const quotes = rankQuotes(generateQuotes(catalog, vehicle), input.priorities, vehicle);
  return <ResultsView vehicle={vehicle} usage={input.usage} priorities={input.priorities} quotes={quotes} />;
}
