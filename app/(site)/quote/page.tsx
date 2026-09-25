import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteWizard } from "@/components/quote/QuoteWizard";
import { getVehicleCatalog } from "@/lib/server/catalog";

export const metadata: Metadata = seo("/quote");
export const dynamic = "force-dynamic";

export default async function QuotePage() {
  const catalog = await getVehicleCatalog();
  return (
    <div className="bg-canvas">
      <Suspense>
        <QuoteWizard catalog={catalog} />
      </Suspense>
    </div>
  );
}
