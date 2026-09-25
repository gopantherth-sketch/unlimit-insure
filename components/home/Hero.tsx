import { Clock, ShieldCheck, UserRoundCheck } from "lucide-react";
import { Photo, ScriptAccent } from "@/components/brand/Photo";
import { QuickQuote } from "@/components/home/QuickQuote";
import { homeCopy } from "@/content/home";
import type { VehicleCatalog } from "@/lib/types";

const trustIcons = [ShieldCheck, Clock, UserRoundCheck];

/** Photo panel: large sky arc on the right that bleeds to the page edge (mockup §2). */
function HeroPhoto() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-bl-[48px] sm:rounded-bl-[64px] lg:rounded-bl-none lg:rounded-tl-[62%_100%] lg:[mask-image:linear-gradient(to_bottom,#000_72%,transparent_100%)]">
      <Photo slot="hero" priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-[60%_70%]" />
      {/* Fade the photo into the page on its left and bottom edges (desktop). */}
      <div aria-hidden className="absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-white/70 to-transparent lg:block" />
    </div>
  );
}

export function Hero({ catalog }: { catalog: VehicleCatalog }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-white lg:-mt-[88px] lg:pt-[88px]">
      {/* Mobile / tablet: photo on top. */}
      <div className="relative mt-2 h-[240px] sm:h-[340px] lg:hidden">
        <HeroPhoto />
        <ScriptAccent lines={["Drive", "With Confidence"]} className="absolute left-5 top-6 -rotate-[8deg] text-[34px] sm:left-10 sm:text-5xl" />
      </div>

      {/* Desktop: photo bleeds to the right edge and the top of the page. */}
      <div className="absolute right-0 top-0 hidden h-[700px] w-[58%] max-w-[980px] lg:block">
        <HeroPhoto />
        <ScriptAccent lines={["Drive", "With Confidence"]} className="absolute left-[16%] top-[150px] -rotate-[10deg] text-[64px] xl:text-[72px]" />
      </div>

      <div className="container-page relative">
        <div className="max-w-[560px] pb-8 pt-7 sm:pt-10 lg:min-h-[500px] lg:pb-14 lg:pt-16 xl:max-w-[600px]">
          <p className="eyebrow text-[11px] sm:text-xs">{homeCopy.eyebrow}</p>
          <h1
            id="hero-title"
            className="mt-4 text-[38px] font-bold leading-[1.18] tracking-[-0.01em] text-navy-900 sm:text-[52px] lg:text-[58px] xl:text-[62px]"
          >
            {homeCopy.heroTitleLine1}
            <br />
            <span className="text-brand-600">{homeCopy.heroTitleLine2}</span>
          </h1>
          <p className="mt-4 max-w-[30ch] text-lg leading-relaxed text-navy-600 sm:text-[21px]">{homeCopy.heroSubtitle}</p>
          <ul className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-3 min-[420px]:gap-3 sm:gap-6">
            {homeCopy.heroTrustPoints.map((p, i) => {
              const Icon = trustIcons[i] ?? ShieldCheck;
              return (
                <li key={p.line1} className="flex items-center gap-3 text-[13px] leading-snug text-navy-600 sm:text-sm">
                  <Icon aria-hidden className="h-9 w-9 shrink-0 text-brand-600" strokeWidth={1.5} />
                  <span>
                    {p.line1}
                    <br />
                    {p.line2}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="container-page relative pb-10 sm:pb-12">
        <QuickQuote ctaLabel={homeCopy.heroCta} catalog={catalog} />
      </div>
    </section>
  );
}
