import Link from "next/link";
import { ArrowRight, Calculator, Scale, Waves, Wrench, Zap } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeCopy } from "@/content/home";
import { labArticles } from "@/content/lab";
import type { LabToolId } from "@/content/types";

export const labToolIcon: Record<LabToolId, typeof Scale> = {
  typeCompare: Scale,
  repairCompare: Wrench,
  excessCalculator: Calculator,
  floodCheck: Waves,
  evCoverage: Zap,
};

export function InsuranceLabSection() {
  return (
    <section aria-labelledby="lab-title" className="bg-canvas py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading id="lab-title" eyebrow="Insurance Lab" title="เข้าใจประกันด้วยการลองเอง" body={homeCopy.labBody} action={{ href: "/lab", label: "ดูทั้งหมด" }} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {labArticles.map((a) => {
            const Icon = labToolIcon[a.tool];
            return (
              <li key={a.slug}>
                <Link href={`/lab/${a.slug}`} className="card group flex h-full flex-col p-5 transition-shadow hover:shadow-lift">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold leading-snug text-navy-900">{a.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-500">{a.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
                    {a.ctaLabel}
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
