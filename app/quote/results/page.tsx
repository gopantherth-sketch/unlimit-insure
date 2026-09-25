import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResultsView } from "@/components/quote/ResultsView";
import { rankQuotes } from "@/lib/match";
import { parseQuoteInput, type RawParams } from "@/lib/params";
import { generateQuotes } from "@/lib/quote";
import { resolveVehicle } from "@/lib/vehicle";

export const metadata: Metadata = { title: "แพ็กเกจสำหรับรถของคุณ" };

export default async function ResultsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const input = parseQuoteInput(await searchParams);
  const vehicle = input ? resolveVehicle(input.vehicle) : null;
  if (!input || !vehicle) redirect("/quote");

  const quotes = rankQuotes(generateQuotes(vehicle), input.priorities, vehicle);
  return <ResultsView vehicle={vehicle} usage={input.usage} priorities={input.priorities} quotes={quotes} />;
}
