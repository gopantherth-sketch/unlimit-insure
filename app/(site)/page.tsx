import type { Metadata } from "next";
import { pageSeo } from "@/content/seo";
import { AdvisorCTA } from "@/components/home/AdvisorCTA";
import { AfterPurchase } from "@/components/home/AfterPurchase";
import { ContentRow, type TypeTable } from "@/components/home/ContentRow";
import { CoverageSimulator } from "@/components/home/CoverageSimulatorDemo";
import { FaqSection } from "@/components/home/FaqSection";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LifestyleBanner } from "@/components/home/LifestyleBanner";
import { Promises } from "@/components/home/Promises";
import { SmartCompareDemo } from "@/components/home/SmartCompareDemo";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhyUnlimit } from "@/components/home/WhyUnlimit";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeCopy } from "@/content/home";
import { insuranceTypeLabel } from "@/lib/coverageFields";
import { getDemo } from "@/lib/demo";
import { SHOW_AFTER_PURCHASE, SHOW_PRICES } from "@/lib/features";
import { withJourney } from "@/lib/params";
import { generateQuotes } from "@/lib/quote";
import { getCatalog } from "@/lib/server/catalog";
import type { Catalog, Coverage, Quote } from "@/lib/types";
import { defaultVehicle, resolveVehicle, vehicleLabel } from "@/lib/vehicle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${pageSeo["/"]!.title} | Unlimit Insure` },
  description: pageSeo["/"]!.description,
  alternates: { canonical: "/" },
};

// Compact type table rows. Every cell comes from sample product coverage in the engine, never
// from copy (same representative plans as the Insurance Lab type matrix).
const typeRows: { label: string; covered: (c: Coverage) => boolean }[] = [
  { label: "ความเสียหายต่อตัวรถ (มีคู่กรณี)", covered: (c) => c.collisionWithCounterparty },
  { label: "ชนแบบไม่มีคู่กรณี", covered: (c) => c.collisionNoCounterparty },
  { label: "รถหาย / ไฟไหม้", covered: (c) => c.fireTheft },
  { label: "น้ำท่วม", covered: (c) => c.flood },
  { label: "ความรับผิดต่อบุคคลภายนอก", covered: (c) => c.thirdPartyBodilyPerPerson > 0 },
  { label: "อุบัติเหตุส่วนบุคคล", covered: (c) => c.personalAccidentPerPerson > 0 },
  { label: "ค่ารักษาพยาบาล", covered: (c) => c.medicalPerPerson > 0 },
];
const typeTablePlans = ["a-type1-dealer", "a-type2plus", "b-type3plus"];

function buildTypeTable(catalog: Catalog): TypeTable | null {
  const vehicle = resolveVehicle(catalog, defaultVehicle);
  if (!vehicle) return null;
  const all = generateQuotes(catalog, vehicle);
  const reps = typeTablePlans.map((id) => all.find((q) => q.productId === id)).filter((q): q is Quote => q !== undefined);
  if (reps.length < 2) return null;
  return {
    columns: reps.map((q) => insuranceTypeLabel[q.coverage.insuranceType]),
    rows: typeRows.map((r) => ({ label: r.label, covered: reps.map((q) => r.covered(q.coverage)) })),
    caption: `ตัวอย่างจากแผนตัวอย่างสำหรับ ${vehicleLabel(vehicle)} ความคุ้มครองจริงเป็นไปตามเงื่อนไขของแต่ละกรมธรรม์`,
    href: withJourney("/compare", { vehicle, plans: reps.map((q) => q.productId) }),
  };
}

export default async function HomePage() {
  const catalog = await getCatalog();
  const demo = getDemo(catalog);
  const labels = demo?.quotes.map((_, i) => `แผน ${String.fromCharCode(65 + i)}`) ?? [];
  const typeTable = buildTypeTable(catalog);

  return (
    <>
      <Hero catalog={{ brands: catalog.brands, models: catalog.models }} />
      <FeatureStrip />
      <TrustStrip />
      <WhyUnlimit />
      <HowItWorks />
      {/* The compare demo explains price differences, so it waits for real prices. */}
      {SHOW_PRICES && demo && demo.quotes.length > 1 && <SmartCompareDemo vehicle={demo.vehicle} quotes={demo.quotes} />}
      {demo && demo.quotes.length > 0 && (
        <section aria-labelledby="sim-title" className="bg-white pb-16 sm:pb-20">
          <div className="container-page">
            <SectionHeading id="sim-title" eyebrow="Real-life coverage" title={homeCopy.scenarioTitle} body={homeCopy.scenarioBody} />
            <CoverageSimulator quotes={demo.quotes} labels={labels} />
          </div>
        </section>
      )}
      <LifestyleBanner />
      <ContentRow table={typeTable} />
      <Promises />
      {/* My Garage and renewal reminders need customer accounts (back office parked). */}
      {SHOW_AFTER_PURCHASE && <AfterPurchase />}
      <FaqSection />
      <AdvisorCTA />
    </>
  );
}
