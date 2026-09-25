import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoverMark } from "@/components/ui/CoverMark";
import { buttonClass } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeCopy } from "@/content/home";
import { summarizeDifference } from "@/lib/compare";
import { fieldByKey } from "@/lib/coverageFields";
import { formatBaht, formatBahtShort, formatNumber } from "@/lib/format";
import { withJourney } from "@/lib/params";
import type { RankedQuote, ResolvedVehicle } from "@/lib/types";
import { vehicleLabel } from "@/lib/vehicle";
import { demoPriorities } from "@/lib/demo";

const rows = ["sumInsured", "repairType", "flood", "excess"] as const;
const planLabel = (i: number) => `แผน ${String.fromCharCode(65 + i)}`;

export function SmartCompareDemo({ vehicle, quotes }: { vehicle: ResolvedVehicle; quotes: RankedQuote[] }) {
  const [a, b] = quotes;
  const diff = a && b ? summarizeDifference(a, b) : null;
  const compareHref = withJourney("/compare", { vehicle, priorities: demoPriorities, plans: quotes.map((q) => q.productId) });

  return (
    <section id="smart-compare" aria-labelledby="compare-demo-title" className="scroll-mt-24 bg-white py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading id="compare-demo-title" eyebrow="Smart Compare" title="ต่างกันตรงไหน?" body={homeCopy.compareDemoBody} />
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
            <table className="w-full min-w-[520px] text-[15px]">
              <caption className="px-5 pt-5 text-left text-sm text-navy-500 sm:px-6">
                ตัวอย่างสำหรับ {vehicleLabel(vehicle)} — ข้อมูลตัวอย่าง
              </caption>
              <thead>
                <tr className="border-b border-navy-100">
                  <th scope="col" className="px-5 py-4 text-left text-sm font-medium text-navy-400 sm:px-6">
                    <span className="sr-only">รายการ</span>
                  </th>
                  {quotes.map((q, i) => (
                    <th key={q.id} scope="col" className="px-4 py-4 text-left font-sans">
                      <span className="block text-xs font-semibold text-brand-600">{planLabel(i)}</span>
                      <span className="text-sm font-bold text-navy-900">{q.product.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-navy-100">
                  <th scope="row" className="px-5 py-3 text-left font-medium text-navy-500 sm:px-6">เบี้ย / ปี</th>
                  {quotes.map((q) => (
                    <td key={q.id} className="tabular px-4 py-3 font-bold">{formatNumber(q.premium)}</td>
                  ))}
                </tr>
                {rows.map((key) => {
                  const f = fieldByKey(key);
                  if (!f) return null;
                  return (
                    <tr key={key} className="border-b border-navy-100">
                      <th scope="row" className="px-5 py-3 text-left font-medium text-navy-500 sm:px-6">{f.label}</th>
                      {quotes.map((q) => {
                        const v = f.value(q);
                        return (
                          <td key={q.id} className="tabular px-4 py-3 text-navy-800">
                            {typeof v === "boolean" ? (
                              <CoverMark covered={v} />
                            ) : key === "sumInsured" ? (
                              formatBahtShort(q.sumInsured)
                            ) : (
                              f.display(q)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr>
                  <th scope="row" className="px-5 py-3 text-left font-medium text-navy-500 sm:px-6">ตรงกับที่ต้องการ</th>
                  {quotes.map((q) => (
                    <td key={q.id} className="tabular px-4 py-3 font-semibold text-brand-700">
                      {q.match.matched}/{q.match.total}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {diff && (
            <div className="flex flex-col rounded-2xl bg-gradient-to-br from-brand-50 to-wash p-6 sm:p-7">
              <p className="text-sm font-semibold text-brand-700">{homeCopy.compareDemoTitle}</p>
              <p className="mt-3 font-display text-2xl font-bold leading-snug text-navy-900">
                {planLabel(1)} {diff.premiumDelta < 0 ? "ถูกกว่า" : "แพงกว่า"} {planLabel(0)} {formatBaht(Math.abs(diff.premiumDelta))}
              </p>
              {diff.tradeoffs.length > 0 && (
                <>
                  <p className="mt-5 text-sm font-semibold text-navy-600">แต่ต้องแลกกับ</p>
                  <ul className="mb-6 mt-2 space-y-2">
                    {diff.tradeoffs.map((t) => (
                      <li key={t} className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-[15px] text-navy-800 shadow-[0_1px_2px_rgba(11,19,48,0.05)]">
                        <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Link href={compareHref} className={buttonClass("primary", "md", "mt-2 self-start lg:mt-auto")}>
                ดูตารางเปรียบเทียบแบบละเอียด
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
