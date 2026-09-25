import Link from "next/link";
import { ExplainButton } from "@/components/insurance/ExplainButton";
import { InsurerMark } from "@/components/insurance/InsurerMark";
import { MatchBadge, MatchList } from "@/components/insurance/MatchSummary";
import { VerifiedSource } from "@/components/insurance/VerifiedSource";
import { buttonClass } from "@/components/ui/button";
import { fieldByKey, insuranceTypeLabel } from "@/lib/coverageFields";
import { formatNumber } from "@/lib/format";
import type { Quote, RankedQuote } from "@/lib/types";
import { cx } from "@/lib/cx";

const CARD_FIELDS = ["sumInsured", "repairType", "flood", "excess"] as const;

interface Props {
  quote: Quote | RankedQuote;
  detailHref: string;
  selectHref: string;
  /** Rendered in the action row, e.g. a compare toggle. */
  compareControl?: React.ReactNode;
  highlight?: string;
}

export function InsuranceCard({ quote, detailHref, selectHref, compareControl, highlight }: Props) {
  const match = "match" in quote ? quote.match : undefined;
  return (
    <article
      aria-labelledby={`plan-${quote.id}`}
      className={cx("card flex flex-col p-5 sm:p-6", highlight && "ring-2 ring-brand-500")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <InsurerMark insurer={quote.insurer} />
          <div>
            <p className="text-sm text-navy-500">{quote.insurer.name}</p>
            <h3 id={`plan-${quote.id}`} className="text-lg font-bold leading-snug">
              {quote.product.name}
            </h3>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-700">
          {insuranceTypeLabel[quote.coverage.insuranceType]}
        </span>
      </div>

      {highlight && <p className="mt-3 text-sm font-semibold text-brand-700">{highlight}</p>}

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="tabular text-3xl font-bold text-navy-900">{formatNumber(quote.premium)}</span>
        <span className="text-sm text-navy-500">บาท / ปี</span>
      </div>
      <p className="mt-0.5 text-xs text-navy-400">เบี้ยโดยประมาณ ราคาจริงขึ้นอยู่กับการพิจารณาของบริษัทประกัน</p>

      <dl className="mt-5 divide-y divide-navy-100 border-y border-navy-100 text-[15px]">
        {CARD_FIELDS.map((key) => {
          const f = fieldByKey(key);
          if (!f) return null;
          return (
            <div key={key} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="flex items-center gap-0.5 text-navy-500">
                {f.label}
                {f.glossaryKey && <ExplainButton term={f.glossaryKey} />}
              </dt>
              <dd className="tabular text-right font-semibold text-navy-800">{f.display(quote)}</dd>
            </div>
          );
        })}
      </dl>

      {match && match.total > 0 && (
        <div className="mt-4 space-y-3">
          <MatchBadge match={match} />
          <MatchList match={match} compact />
        </div>
      )}

      <div className="mt-4">
        <VerifiedSource version={quote.version} />
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <Link href={selectHref} className={buttonClass("primary", "md", "px-3")}>
          เลือกแพ็กเกจ
        </Link>
        <Link href={detailHref} className={buttonClass("secondary", "md", "px-3")}>
          รายละเอียด
        </Link>
        {compareControl && <div className="col-span-2 [&>*]:w-full">{compareControl}</div>}
      </div>
    </article>
  );
}
