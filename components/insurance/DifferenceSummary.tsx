import { ArrowDownRight, ArrowUpRight, Minus, Plus } from "lucide-react";
import { summarizeDifference } from "@/lib/compare";
import { formatBaht } from "@/lib/format";
import type { Quote } from "@/lib/types";

interface Props {
  quotes: Quote[];
  labels: string[];
}

/** "Why is Plan B cheaper?" — every other plan explained against the first one. */
export function DifferenceSummary({ quotes, labels }: Props) {
  const [base, ...others] = quotes;
  if (!base || others.length === 0) return null;
  const baseLabel = labels[0] ?? base.product.name;

  return (
    <section aria-labelledby="diff-title" className="card p-5 sm:p-6">
      <h2 id="diff-title" className="text-xl font-bold">
        ต่างกันตรงไหน?
      </h2>
      <p className="mt-1 text-sm text-navy-500">
        เทียบกับ {baseLabel} ({base.product.name}) — สรุปจากข้อมูลความคุ้มครองของแต่ละแพ็กเกจ
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {others.map((other, i) => {
          const d = summarizeDifference(base, other);
          const label = labels[i + 1] ?? other.product.name;
          const cheaper = d.premiumDelta < 0;
          const same = d.premiumDelta === 0;
          return (
            <div key={other.id} className="rounded-2xl border border-navy-100 bg-canvas p-4 sm:p-5">
              <h3 className="flex items-start gap-2 text-base font-bold leading-snug">
                {same ? (
                  <Minus aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-navy-400" />
                ) : cheaper ? (
                  <ArrowDownRight aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success-600" />
                ) : (
                  <ArrowUpRight aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
                )}
                <span>
                  {same
                    ? `${label} เบี้ยเท่ากับ ${baseLabel}`
                    : `${label} ${cheaper ? "ถูกกว่า" : "แพงกว่า"} ${baseLabel} ${formatBaht(Math.abs(d.premiumDelta))}`}
                </span>
              </h3>
              {d.tradeoffs.length > 0 && (
                <>
                  <p className="mt-3 text-sm font-semibold text-navy-700">{cheaper ? "แต่ต้องแลกกับ" : "สิ่งที่ด้อยกว่า"}</p>
                  <ul className="mt-1.5 space-y-1 text-[15px] text-navy-700">
                    {d.tradeoffs.map((t) => (
                      <li key={t} className="flex items-start gap-2">
                        <Minus aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-warning-600" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {d.gains.length > 0 && (
                <>
                  <p className="mt-3 text-sm font-semibold text-navy-700">{cheaper || same ? "สิ่งที่ได้เพิ่ม" : "สิ่งที่ได้เพิ่มจากเบี้ยที่สูงขึ้น"}</p>
                  <ul className="mt-1.5 space-y-1 text-[15px] text-navy-700">
                    {d.gains.map((g) => (
                      <li key={g} className="flex items-start gap-2">
                        <Plus aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-success-600" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {d.tradeoffs.length === 0 && d.gains.length === 0 && (
                <p className="mt-3 text-sm text-navy-500">ความคุ้มครองหลักเหมือนกัน</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
