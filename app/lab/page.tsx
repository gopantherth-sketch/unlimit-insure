import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { labToolIcon } from "@/components/home/InsuranceLabSection";
import { labArticles } from "@/content/lab";
import { homeCopy } from "@/content/home";

export const metadata: Metadata = { title: "Insurance Lab", description: homeCopy.labBody };

export default function LabIndexPage() {
  return (
    <div className="bg-canvas pb-16">
      <div className="container-page py-10 sm:py-14">
        <p className="eyebrow">Insurance Lab</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">เข้าใจประกันด้วยการลองเอง</h1>
        <p className="mt-3 max-w-2xl text-lg text-navy-500">{homeCopy.labBody}</p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {labArticles.map((a) => {
            const Icon = labToolIcon[a.tool];
            return (
              <li key={a.slug}>
                <Link href={`/lab/${a.slug}`} className="card group flex h-full flex-col p-6 transition-shadow hover:shadow-lift">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-lg font-bold leading-snug">{a.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-navy-500">{a.summary}</p>
                  <span className="mt-auto flex items-center justify-between pt-5 text-sm">
                    <span className="text-navy-400">อ่าน {a.readMinutes} นาที</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-brand-600">
                      {a.ctaLabel}
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
