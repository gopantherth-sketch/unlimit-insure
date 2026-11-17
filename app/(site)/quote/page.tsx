import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { QuoteWizard } from "@/components/quote/QuoteWizard";
import { getPublicCatalog } from "@/lib/server/catalog";
import { parseTrim, parseVehicle, withJourney } from "@/lib/params";

export const metadata: Metadata = seo("/quote");
export const dynamic = "force-dynamic";

// The wizard streams in after the page shell, so the footer used to jump down when it arrived
// (CLS ~0.19 on desktop). Reserve the height of the step being opened. Measured on desktop;
// phones are taller, but there the footer is below the fold. A later step needs a valid car,
// otherwise the wizard falls back to step 1, so only reserve the tall heights when the URL has one.
const RESERVED: Record<string, string> = {
  car: "min-h-[631px]",
  use: "min-h-[900px]",
  needs: "min-h-[1090px]",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function QuotePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [catalog, sp] = await Promise.all([getPublicCatalog(), searchParams]);
  if (catalog.products.length === 0) redirect(withJourney("/advisor", { vehicle: parseVehicle(sp), trim: parseTrim(sp) }));
  const step = typeof sp.step === "string" ? sp.step : "car";
  const hasCar = typeof sp.brand === "string" && typeof sp.model === "string" && typeof sp.year === "string";
  const reserved = hasCar && step in RESERVED ? RESERVED[step] : RESERVED.car;
  return (
    <div className={`bg-gradient-to-b from-wash via-wash to-white ${reserved}`}>
      <Suspense>
        <QuoteWizard catalog={{ brands: catalog.brands, models: catalog.models }} />
      </Suspense>
    </div>
  );
}
