import Link from "next/link";
import { ArrowRight, FileSearch, HeartHandshake, UserRoundCheck } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { homeCopy } from "@/content/home";

const icons = [FileSearch, UserRoundCheck, HeartHandshake];

export function WhyUnlimit() {
  return (
    <section id="why" aria-labelledby="why-title" className="scroll-mt-24 bg-wash py-14 sm:py-16">
      <div className="container-page grid gap-8 lg:grid-cols-[0.95fr_2.2fr] lg:items-center lg:gap-10">
        <div>
          <h2 id="why-title" className="text-[34px] font-bold leading-[1.15] text-navy-900 sm:text-[42px]">
            ทำไมต้อง
            <br />
            <span className="text-brand-600">Unlimit Insure</span>
          </h2>
          <p className="mt-3 max-w-[22em] text-[17px] leading-relaxed text-navy-600">{homeCopy.whyBody}</p>
          <Link href="#how" className={buttonClass("primary", "md", "mt-6 rounded-xl px-6")}>
            ดูเพิ่มเติม
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {homeCopy.whyPoints.map((p, i) => {
            const Icon = icons[i] ?? FileSearch;
            return (
              <li key={p.title} className="rounded-2xl border border-white bg-white p-6 shadow-card sm:p-7">
                <Icon aria-hidden className="h-10 w-10 text-brand-600" strokeWidth={1.5} />
                <h3 className="mt-5 text-xl font-bold text-navy-900">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-navy-500">{p.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
