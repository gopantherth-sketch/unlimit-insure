import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { homeCopy } from "@/content/home";

/** Lifestyle band. The left panel is reserved for licensed lifestyle photography. */
export function LifestyleBanner() {
  return (
    <section aria-label="Unlimit Insure" className="relative overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white">
      <div aria-hidden className="absolute -left-24 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full border-[48px] border-white/10" />
      <div aria-hidden className="absolute -right-10 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="container-page relative grid gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100">More than insurance</p>
        <div>
          <Quote aria-hidden className="h-8 w-8 text-brand-200" />
          <p className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">{homeCopy.lifestyleQuote}</p>
          <Link href="/quote" className={buttonClass("white", "md", "mt-7")}>
            หาประกันที่ใช่สำหรับคุณ
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
