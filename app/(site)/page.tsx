import type { Metadata } from "next";
import { pageSeo } from "@/content/seo";
import { AdvisorCTA } from "@/components/home/AdvisorCTA";
import { AfterPurchase } from "@/components/home/AfterPurchase";
import { CoverageSimulator } from "@/components/home/CoverageSimulatorDemo";
import { FaqSection } from "@/components/home/FaqSection";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { InsuranceLabSection } from "@/components/home/InsuranceLabSection";
import { LifestyleBanner } from "@/components/home/LifestyleBanner";
import { SmartCompareDemo } from "@/components/home/SmartCompareDemo";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhyUnlimit } from "@/components/home/WhyUnlimit";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeCopy } from "@/content/home";
import { getDemo } from "@/lib/demo";
import { getCatalog } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

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
      <TrustStrip insurers={catalog.insurers} />
      <HowItWorks />
      <WhyUnlimit />
      {demo && demo.quotes.length > 1 && <SmartCompareDemo vehicle={demo.vehicle} quotes={demo.quotes} />}
      {demo && demo.quotes.length > 0 && (
        <section aria-labelledby="sim-title" className="bg-canvas py-16 sm:py-20">
          <div className="container-page">
            <SectionHeading id="sim-title" eyebrow="Real-life coverage" title={homeCopy.scenarioTitle} body={homeCopy.scenarioBody} />
            <CoverageSimulator quotes={demo.quotes} labels={labels} />
          </div>
        </section>
      )}
      <LifestyleBanner />
      <InsuranceLabSection />
      <AfterPurchase />
      <FaqSection />
      <AdvisorCTA />
    </>
  );
}
