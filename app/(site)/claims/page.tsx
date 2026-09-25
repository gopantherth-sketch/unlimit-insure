import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, CircleAlert, FileText, Phone, TriangleAlert } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { PageHero } from "@/components/ui/PageHero";
import { claimsCopy } from "@/content/claims";

export const metadata: Metadata = {
  title: "ขั้นตอนเมื่อเกิดเหตุกับรถ",
  description: claimsCopy.intro.slice(0, 150),
  alternates: { canonical: "/claims" },
};

export default function ClaimsPage() {
  return (
    <div className="bg-canvas pb-16">
      <PageHero id="claims-title" narrow eyebrow="Claim help" title={claimsCopy.title} body={claimsCopy.intro}>
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-warning-50 p-4 text-sm text-warning-700">
          <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          ฉบับร่าง อยู่ระหว่างตรวจสอบ ขั้นตอนจริงเป็นไปตามเงื่อนไขกรมธรรม์และบริษัทประกันของคุณ
        </p>
      </PageHero>
      <div className="container-page max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card flex gap-3 rounded-xl2 p-5">
            <CircleAlert aria-hidden className="h-7 w-7 shrink-0 text-danger-600" strokeWidth={1.5} />
            <p className="text-[15px] leading-relaxed text-navy-700">{claimsCopy.emergencyNote}</p>
          </div>
          <div className="card flex gap-3 rounded-xl2 p-5">
            <Phone aria-hidden className="h-7 w-7 shrink-0 text-brand-600" strokeWidth={1.5} />
            <p className="text-[15px] leading-relaxed text-navy-700">{claimsCopy.whoToCall}</p>
          </div>
        </div>

        <nav aria-label="เลือกเหตุการณ์" className="mt-8 flex flex-wrap gap-2">
          {claimsCopy.guides.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="inline-flex min-h-[44px] items-center rounded-full border border-navy-100 bg-white px-4 text-sm font-medium text-navy-700 shadow-card hover:border-brand-300 hover:text-brand-700">
              {g.title}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-5">
          {claimsCopy.guides.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`h-${g.id}`} className="card scroll-mt-24 rounded-xl2 p-5 sm:p-7">
              <h2 id={`h-${g.id}`} className="text-[22px] font-bold text-navy-900">{g.title}</h2>
              <p className="mt-1 text-navy-500">{g.summary}</p>
              <ol className="mt-5 space-y-4">
                {g.steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="tabular inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{i + 1}</span>
                    <div>
                      <p className="font-semibold text-navy-900">{s.title}</p>
                      <p className="mt-0.5 leading-relaxed text-navy-600">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-wash p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-800">
                    <FileText aria-hidden className="h-4 w-4 text-brand-600" /> เอกสารที่ควรเตรียม
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-700">
                    {g.documents.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl bg-danger-50 p-4">
                  <p className="text-sm font-semibold text-danger-600">สิ่งที่ไม่ควรทำ</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-navy-700">
                    {g.dontDo.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section aria-labelledby="claims-faq" className="mt-10">
          <h2 id="claims-faq" className="h-section">คำถามเรื่องเคลม</h2>
          <div className="mt-4 space-y-3">
            {claimsCopy.faq.map((f) => (
              <details key={f.question} className="group card overflow-hidden rounded-2xl">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-navy-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-navy-600">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-xl2 border border-brand-100 bg-gradient-to-r from-brand-50 to-wash p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="font-display text-lg font-semibold text-navy-900">อยากรู้ว่าแผนไหนคุ้มครองเหตุการณ์แบบนี้ ลองเปรียบเทียบกับรถของคุณ</p>
          <Link href="/quote" className={buttonClass("primary", "md", "shrink-0 rounded-xl px-6")}>เพิ่มรถของคุณ</Link>
        </div>
      </div>
    </div>
  );
}
