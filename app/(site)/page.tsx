import type { Metadata } from "next";
import { pageSeo } from "@/content/seo";
import { AdvisorCTA } from "@/components/home/AdvisorCTA";
import { AfterPurchase } from "@/components/home/AfterPurchase";
import { ContentRow } from "@/components/home/ContentRow";
import { CoverageSimulator } from "@/components/home/CoverageSimulatorDemo";
import { FaqSection } from "@/components/home/FaqSection";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { Hero } from "@/components/home/Hero";
import { LifestyleBanner } from "@/components/home/LifestyleBanner";
import { Promises } from "@/components/home/Promises";
import { SmartCompareDemo } from "@/components/home/SmartCompareDemo";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhyUnlimit } from "@/components/home/WhyUnlimit";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeCopy } from "@/content/home";
import { getDemo } from "@/lib/demo";
import { LineQuoteBand } from "@/components/home/LineQuoteBand";
import { SHOW_AFTER_PURCHASE, SHOW_PARTNER_LOGOS, SHOW_PRICES } from "@/lib/features";
import { getCatalog } from "@/lib/server/catalog";

// Prebuilt while CATALOG_FROM_CODE is on (lib/features.ts).

export const metadata: Metadata = {
  title: { absolute: `${pageSeo["/"]!.title} | Unlimit Insure` },
  description: pageSeo["/"]!.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const catalog = await getCatalog();
  const demo = getDemo(catalog);
  const labels = demo?.quotes.map((_, i) => `แผน ${String.fromCharCode(65 + i)}`) ?? [];

  return (
    <>
      <Hero catalog={{ brands: catalog.brands, models: catalog.models }} />
      <FeatureStrip />
      {/* Partner logos wait for licensed logos (D4); until then the LINE quote band takes the slot. */}
      {SHOW_PARTNER_LOGOS ? <TrustStrip /> : <LineQuoteBand />}
      <WhyUnlimit />
      {/* The compare demo explains price differences, so it waits for real prices. */}
      {SHOW_PRICES && demo && demo.quotes.length > 1 && <SmartCompareDemo vehicle={demo.vehicle} quotes={demo.quotes} />}
      {demo && demo.quotes.length > 0 && (
        <section aria-labelledby="sim-title" className="bg-white pb-16 pt-14 sm:pb-20 sm:pt-16">
          <div className="container-page">
            <SectionHeading id="sim-title" eyebrow="Real-life coverage" title={homeCopy.scenarioTitle} body={homeCopy.scenarioBody} />
            <CoverageSimulator quotes={demo.quotes} labels={labels} />
          </div>
        </section>
      )}
      <LifestyleBanner />
      {/* Articles only: the type table repeated the simulator on sample data (W8 review). */}
      <ContentRow />
      <Promises />
      {/* My Garage and renewal reminders need customer accounts (back office parked). */}
      {SHOW_AFTER_PURCHASE && <AfterPurchase />}
      <FaqSection />
      <AdvisorCTA />
    </>
  );
}
