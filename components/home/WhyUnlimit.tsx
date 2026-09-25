import Link from "next/link";
import { ArrowRight, BookOpenCheck, GitCompareArrows, HeartHandshake } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { homeCopy } from "@/content/home";

const icons = [GitCompareArrows, BookOpenCheck, HeartHandshake];

export function WhyUnlimit() {
  return (
    <section aria-labelledby="why-title" className="bg-gradient-to-b from-canvas to-brand-50/60 py-16 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_2fr] lg:items-center">
        <div>
          <h2 id="why-title" className="text-3xl font-bold leading-tight sm:text-4xl">
            ทำไมต้อง
            <br />
            <span className="text-brand-600">Unlimit Insure</span>
          </h2>
          <p className="mt-2 text-lg font-semibold text-navy-800">{homeCopy.whyTitle}</p>
          <p className="mt-3 leading-relaxed text-navy-500">{homeCopy.whyBody}</p>
          <Link href="/quote" className={buttonClass("primary", "md", "mt-6")}>
            เริ่มเปรียบเทียบ
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {homeCopy.whyPoints.map((p, i) => {
            const Icon = icons[i] ?? GitCompareArrows;
            return (
              <li key={p.title} className="card p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-navy-500">{p.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
