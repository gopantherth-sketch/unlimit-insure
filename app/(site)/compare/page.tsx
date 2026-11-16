import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { seo } from "@/lib/seo";
import { parseQuoteInput, withJourney, type RawParams } from "@/lib/params";

export const metadata: Metadata = seo("/compare", { noindex: true });

export default async function ComparePage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const input = parseQuoteInput(await searchParams);
  redirect(input ? withJourney("/advisor", input) : "/advisor");
}
