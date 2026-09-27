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
          <Link href="#line-quote" className={buttonClass("primary", "md", "mt-6 rounded-xl px-6")}>
            ดูเพิ่มเติม
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {homeCopy.whyPoints.map((p, i) => {
            const Icon = icons[i] ?? FileSearch;
            return (
              // Phones: icon beside the text to keep the stack short; from sm: icon on top.
              <li key={p.title} className="flex gap-4 rounded-2xl border border-white bg-white p-5 shadow-card sm:block sm:p-7">
                <Icon aria-hidden className="h-9 w-9 shrink-0 text-brand-600 sm:h-10 sm:w-10" strokeWidth={1.5} />
                <div>
                  <h3 className="text-lg font-bold text-navy-900 sm:mt-5 sm:text-xl">{p.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-navy-600 sm:mt-2">{p.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
