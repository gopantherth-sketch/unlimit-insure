import Link from "next/link";
import { ArrowRight, CircleCheck, Headset } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { homeCopy } from "@/content/home";

export function AdvisorCTA() {
  return (
    <section aria-labelledby="advisor-title" className="py-16 sm:py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-xl2 bg-gradient-to-br from-brand-50 via-white to-brand-100 p-7 sm:p-10 lg:p-12">
          <Headset aria-hidden className="absolute -bottom-6 -right-6 h-48 w-48 text-brand-100" strokeWidth={1} />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 id="advisor-title" className="text-2xl font-bold leading-snug sm:text-3xl">
                {homeCopy.advisorTitle}
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-navy-600">{homeCopy.advisorBody}</p>
              <Link href="/advisor" className={buttonClass("primary", "lg", "mt-7")}>
                ปรึกษาผู้เชี่ยวชาญฟรี
                <ArrowRight aria-hidden className="h-5 w-5" />
              </Link>
            </div>
            <ul className="space-y-3">
              {homeCopy.advisorPoints.map((p) => (
                <li key={p} className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-3 text-[15px] font-medium text-navy-800 shadow-card">
                  <CircleCheck aria-hidden className="h-5 w-5 shrink-0 text-brand-600" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
