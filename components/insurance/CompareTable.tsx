"use client";

import { useMemo, useState } from "react";
import { ExplainButton } from "@/components/insurance/ExplainButton";
import { InsurerMark } from "@/components/insurance/InsurerMark";
import { MatchBadge } from "@/components/insurance/MatchSummary";
import { bestQuoteIdsByField, differingFieldKeys } from "@/lib/compare";
import { fieldGroupLabel, visibleFields, type FieldGroup } from "@/lib/coverageFields";
import { formatNumber } from "@/lib/format";
import type { Quote, RankedQuote } from "@/lib/types";
import { cx } from "@/lib/cx";

interface Props {
  quotes: (Quote | RankedQuote)[];
  /** Short labels such as "แผน A", aligned with quotes. */
  labels: string[];
}

const groups: FieldGroup[] = ["core", "ownDamage", "thirdParty", "people", "services"];

export function CompareTable({ quotes, labels }: Props) {
  const [onlyDiff, setOnlyDiff] = useState(false);
  const fields = useMemo(() => visibleFields(quotes), [quotes]);
  const differing = useMemo(() => differingFieldKeys(quotes, fields), [quotes, fields]);
  const best = useMemo(() => bestQuoteIdsByField(quotes, fields), [quotes, fields]);
  const minPremium = Math.min(...quotes.map((q) => q.premium));
  const hasMatch = quotes.some((q) => "match" in q && q.match.total > 0);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-4 py-3 sm:px-6">
        <p className="text-sm text-navy-500">
          ต่างกัน <span className="font-semibold text-navy-800">{differing.size}</span> จาก {fields.length} รายการ
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-navy-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-navy-300 text-brand-600 accent-brand-600"
            checked={onlyDiff}
            onChange={(e) => setOnlyDiff(e.target.checked)}
          />
          แสดงเฉพาะที่ต่างกัน
        </label>
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[15px]">
          <caption className="sr-only">ตารางเปรียบเทียบความคุ้มครอง</caption>
          <thead>
            <tr className="bg-canvas">
              <th scope="col" className="sticky left-0 z-10 w-[34%] bg-canvas px-4 py-4 text-left text-sm font-semibold text-navy-500 sm:px-6">
                รายการ
              </th>
              {quotes.map((q, i) => (
                <th key={q.id} scope="col" className="px-4 py-4 text-left align-top">
                  <div className="flex items-center gap-2.5">
                    <InsurerMark insurer={q.insurer} size="sm" />
                    <div>
                      <p className="text-xs font-semibold text-brand-600">{labels[i]}</p>
                      <p className="text-sm font-bold leading-snug text-navy-900">{q.product.name}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-navy-100">
              <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-medium text-navy-600 sm:px-6">
                <span className="inline-flex items-center gap-0.5">
                  เบี้ยประกัน / ปี
                  <ExplainButton term="premium" />
                </span>
              </th>
              {quotes.map((q) => (
                <td key={q.id} className={cx("tabular px-4 py-3 text-lg font-bold", q.premium === minPremium ? "text-success-700" : "text-navy-900")}>
                  {formatNumber(q.premium)}
                </td>
              ))}
            </tr>
            {groups.map((g) => {
              const rows = fields.filter((f) => f.group === g && (!onlyDiff || differing.has(f.key)));
              if (rows.length === 0) return null;
              return (
                <GroupRows key={g} title={fieldGroupLabel[g]} span={quotes.length + 1}>
                  {rows.map((f) => {
                    const bestIds = best.get(f.key);
                    const isDiff = differing.has(f.key);
                    return (
                      <tr key={f.key} className="border-t border-navy-100">
                        <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-medium text-navy-600 sm:px-6">
                          <span className="inline-flex items-center gap-0.5">
                            {isDiff && <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />}
                            {f.label}
                            {f.glossaryKey && <ExplainButton term={f.glossaryKey} />}
                            {isDiff && <span className="sr-only">(ต่างกัน)</span>}
                          </span>
                        </th>
                        {quotes.map((q) => {
                          const isBest = bestIds?.has(q.id) ?? false;
                          return (
                            <td key={q.id} className={cx("tabular px-4 py-3", isBest ? "font-semibold text-success-700" : "text-navy-800")}>
                              {f.display(q)}
                              {isBest && <span className="sr-only"> (ดีที่สุดในรายการนี้)</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </GroupRows>
              );
            })}
            {hasMatch && (
              <tr className="border-t border-navy-100 bg-canvas">
                <th scope="row" className="sticky left-0 z-10 bg-canvas px-4 py-3 text-left font-medium text-navy-600 sm:px-6">
                  ตรงกับสิ่งที่คุณต้องการ
                </th>
                {quotes.map((q) => (
                  <td key={q.id} className="px-4 py-3">
                    {"match" in q ? <MatchBadge match={q.match} /> : "—"}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({ title, span, children }: { title: string; span: number; children: React.ReactNode }) {
  return (
    <>
      <tr className="border-t border-navy-100 bg-brand-50/50">
        <th scope="colgroup" colSpan={span} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-brand-700 sm:px-6">
          {title}
        </th>
      </tr>
      {children}
    </>
  );
}
