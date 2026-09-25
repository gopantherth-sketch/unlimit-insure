import { Clock, ShieldCheck, UserRoundCheck } from "lucide-react";
import { HeroVisual } from "@/components/home/HeroVisual";
import { QuickQuote } from "@/components/home/QuickQuote";
import { homeCopy } from "@/content/home";
import type { VehicleCatalog } from "@/lib/types";

const trustIcons = [ShieldCheck, Clock, UserRoundCheck];

export function Hero({ catalog }: { catalog: VehicleCatalog }) {
  const points = homeCopy.heroTrustPoints.slice(0, 3);
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-gradient-to-b from-white via-white to-canvas">
      <div aria-hidden className="absolute -right-40 -top-40 h-[520px] w-[720px] rounded-full bg-brand-50 blur-3xl" />
      <div className="container-page relative grid items-center gap-10 pb-10 pt-10 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-16 lg:pt-16">
        <div>
          <p className="eyebrow">{homeCopy.eyebrow}</p>
          <h1 id="hero-title" className="mt-4 text-[34px] font-bold leading-[1.2] tracking-tight text-navy-900 sm:text-5xl lg:text-[56px]">
            {homeCopy.heroTitleLine1}
            <br />
            <span className="text-brand-600">{homeCopy.heroTitleLine2}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-500">{homeCopy.heroSubtitle}</p>
          <ul className="mt-7 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
            {points.map((p, i) => {
              const Icon = trustIcons[i] ?? ShieldCheck;
              return (
                <li key={p} className="flex items-center gap-2.5 text-sm font-medium text-navy-700">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Icon aria-hidden className="h-[18px] w-[18px]" />
                  </span>
                  {p}
                </li>
              );
            })}
          </ul>
        </div>
        <HeroVisual />
      </div>
      <div className="container-page relative pb-12 sm:pb-16">
        <QuickQuote ctaLabel={homeCopy.heroCta} catalog={catalog} />
      </div>
    </section>
  );
}
