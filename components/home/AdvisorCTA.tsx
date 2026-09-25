import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Photo, ScriptAccent } from "@/components/brand/Photo";
import { buttonClass } from "@/components/ui/button";
import { homeCopy } from "@/content/home";

/** Advisor panel with cut-out advisor photo overlapping the top edge (mockup §10). */
export function AdvisorCTA() {
  return (
    <section aria-labelledby="advisor-title" className="bg-white pb-16 pt-24 sm:pb-20 lg:pt-28">
      <div className="container-page">
        <div className="relative rounded-[24px] bg-gradient-to-r from-brand-50 via-[#EAF0FD] to-brand-100/70">
          <div className="relative grid gap-6 px-6 pt-8 sm:px-10 xl:min-h-[268px] xl:grid-cols-[1.2fr_0.8fr_1fr] xl:items-center xl:py-10 xl:pl-12 xl:pr-0">
            <div>
              <h2 id="advisor-title" className="text-[24px] font-bold leading-[1.4] text-navy-900 sm:text-[28px]">
                {homeCopy.advisorTitle}
                <br />
                {homeCopy.advisorSubtitle}
              </h2>
              <Link href="/advisor" className={buttonClass("primary", "lg", "mt-6 px-8")}>
                ปรึกษาฟรี
                <ArrowRight aria-hidden className="h-5 w-5" />
              </Link>
            </div>
            <ul className="space-y-3">
              {homeCopy.advisorPoints.map((p) => (
                <li key={p} className="flex w-fit items-center gap-2.5 rounded-full bg-white px-4 py-2.5 text-[15px] text-navy-800 shadow-[0_2px_8px_-2px_rgba(11,19,48,0.08)]">
                  <CircleCheck aria-hidden className="h-5 w-5 shrink-0 fill-brand-600 text-white" />
                  {p}
                </li>
              ))}
            </ul>
            {/* Advisor cut-out: in flow on small screens, overlapping the panel's top edge on xl. */}
            <div className="relative flex min-w-0 items-end justify-start sm:justify-center xl:static">
              <div className="relative h-[250px] w-[200px] shrink-0 sm:h-[300px] sm:w-[240px] xl:absolute xl:bottom-0 xl:right-[170px] xl:h-[360px] xl:w-[288px]">
                <Photo slot="advisor" sizes="(min-width: 1280px) 288px, 240px" className="object-contain object-bottom" />
              </div>
              <ScriptAccent
                lines={["We're", "Here for You"]}
                className="absolute right-0 top-8 -rotate-[10deg] text-[30px] sm:right-4 sm:text-[40px] xl:right-6 xl:top-[26%] xl:text-[44px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
