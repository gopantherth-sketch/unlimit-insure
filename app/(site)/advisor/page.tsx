import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { Suspense } from "react";
import { AdvisorContact } from "@/components/insurance/AdvisorContact";
import { LineChatPreview } from "@/components/brand/LineChatPreview";
import { homeCopy } from "@/content/home";
import { AdvisorFromUrl } from "@/components/insurance/AdvisorFromUrl";
import { advisorCarKey, type AdvisorCars } from "@/lib/advisor-params";
import { getPublicCatalog } from "@/lib/server/catalog";

// Prebuilt (CLEAR row 42): the plain page is a real landing page ("free consultation") and is indexed.
// The journey params (car, plan picks, sub-model, source page) are read in the browser by AdvisorFromUrl.
// URLs with params carry one visitor's choices, so worker.ts sends X-Robots-Tag: noindex for them
// (canonical stays /advisor).
export const metadata: Metadata = seo("/advisor");

export default async function AdvisorPage() {
  const catalog = await getPublicCatalog();
  const brandName = new Map(catalog.brands.map((b) => [b.id, b.name]));
  const cars: AdvisorCars = {};
  for (const m of catalog.models) {
    const brand = brandName.get(m.brandId);
    if (brand) cars[advisorCarKey(m.brandId, m.id)] = { name: `${brand} ${m.name}`, ev: m.powertrain === "EV", yearFrom: m.yearFrom, yearTo: m.yearTo };
  }
  const planNames = Object.fromEntries(catalog.products.map((p) => [p.id, p.name]));

  return (
    <div className="bg-canvas pb-16">
      <section aria-labelledby="advisor-title" className="relative overflow-hidden bg-gradient-to-b from-wash to-canvas">
        <div className="container-page relative grid items-end gap-6 pt-8 sm:pt-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="pb-8 lg:pb-14">
            <p className="eyebrow">Advisor</p>
            <h1 id="advisor-title" className="mt-3 text-[32px] font-bold leading-tight text-navy-900 sm:text-[44px]">
              คุยกับที่ปรึกษา<span className="text-brand-600">ฟรี</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-navy-600 sm:text-lg">
              ที่ปรึกษาช่วยหาราคาจริง อธิบายความคุ้มครอง และตอบคำถามทาง LINE หรือโทรศัพท์
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
              {homeCopy.advisorPoints.map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-medium text-navy-700 shadow-card">
                  <CircleCheck aria-hidden className="h-4 w-4 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          {/* Stands in for the advisor photo until the owner supplies one. */}
          <LineChatPreview className="mx-auto hidden w-full max-w-[320px] rotate-[1.5deg] self-center pb-8 lg:block" />
        </div>
      </section>
      <div className="container-page mt-6 sm:mt-8">
        <Suspense fallback={<AdvisorContact context={{ vehicle: null, priorities: [], selectedPlanIds: [] }} car={null} fromText={null} planNames={planNames} quiet />}>
          <AdvisorFromUrl cars={cars} planNames={planNames} />
        </Suspense>
      </div>
    </div>
  );
}
