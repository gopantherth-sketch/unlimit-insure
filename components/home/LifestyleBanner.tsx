import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/brand/Photo";
import { buttonClass } from "@/components/ui/button";
import { homeCopy } from "@/content/home";

/** Full-bleed lifestyle band: photo left fading into a pale-blue quote panel (mockup §7). */
export function LifestyleBanner() {
  return (
    <section aria-labelledby="lifestyle-quote" className="relative overflow-hidden bg-wash">
      <div className="grid lg:min-h-[440px] lg:grid-cols-[1.05fr_1fr]">
        <div className="relative h-[260px] sm:h-[360px] lg:h-auto">
          <Photo slot="lifestyle" sizes="(min-width: 1024px) 52vw, 100vw" className="object-[40%_40%]" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-wash to-transparent lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-2/5 lg:bg-gradient-to-l" />
        </div>
        <div className="flex items-center">
          <div className="w-full px-5 pb-12 pt-4 sm:px-10 lg:max-w-[600px] lg:px-12 lg:py-16">
            {/* Our own statement, not a testimonial: no quotation marks. */}
            <span aria-hidden className="block h-1 w-12 rounded-full bg-brand-600" />
            <p id="lifestyle-quote" className="mt-5 font-display text-[24px] font-semibold leading-[1.5] text-navy-900 sm:text-[30px]">
              {homeCopy.lifestyleQuote}
            </p>
            <Link href="/quote" className={buttonClass("primary", "lg", "mt-8")}>
              {homeCopy.lifestyleCta}
              <ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
