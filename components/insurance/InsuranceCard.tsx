import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ExplainButton } from "@/components/insurance/ExplainButton";
import { InsurerMark } from "@/components/insurance/InsurerMark";
import { MatchBadge, MatchList } from "@/components/insurance/MatchSummary";
import { PriceOnRequest } from "@/components/insurance/PriceOnRequest";
import { VerifiedSource } from "@/components/insurance/VerifiedSource";
import { contact } from "@/content/contact";
import { SHOW_PRICES } from "@/lib/features";
import { buttonClass } from "@/components/ui/button";
import { CoverMark } from "@/components/ui/CoverMark";
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
      className={cx(
        "card flex h-full flex-col rounded-xl2 p-5 transition-shadow hover:shadow-float sm:p-6",
        highlight ? "border-brand-600 ring-1 ring-brand-600" : "border-navy-100",
      )}
    >
      {highlight && (
        <p className="absolute -top-3 left-5 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-lift sm:left-6">
          <Sparkles aria-hidden className="h-3.5 w-3.5" />
          {highlight}
        </p>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <InsurerMark insurer={quote.insurer} />
          <div className="min-w-0">
            <p className="truncate text-[13px] text-navy-500">{quote.insurer.name}</p>
            <h3 id={`plan-${quote.id}`} className="text-lg font-bold leading-snug text-navy-900">
              {quote.product.name}
            </h3>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
          {insuranceTypeLabel[quote.coverage.insuranceType]}
        </span>
      </div>

      {SHOW_PRICES ? (
        <div className="mt-5 rounded-2xl bg-wash px-4 py-3.5">
          <p className="text-xs font-medium text-navy-500">เบี้ยโดยประมาณ</p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span className="tabular font-display text-[32px] font-bold leading-none text-navy-900">{formatNumber(quote.premium)}</span>
            <span className="text-sm text-navy-500">บาท / ปี</span>
          </p>
          <p className="mt-1.5 text-xs leading-snug text-navy-400">ราคาจริงขึ้นอยู่กับการพิจารณาของบริษัทประกัน</p>
        </div>
      ) : (
        <PriceOnRequest
          placement="results"
          compact
          message={contact.messages.plan(`${quote.product.name} (${quote.insurer.name})`)}
          className="mt-5"
        />
      )}

      <dl className="mt-4 divide-y divide-navy-100 text-[15px]">
        {CARD_FIELDS.map((key) => {
          const f = fieldByKey(key);
          if (!f) return null;
          const v = f.value(quote);
          return (
            <div key={key} className="flex min-h-[44px] items-center justify-between gap-3 py-1.5">
              <dt className="flex items-center gap-0.5 text-navy-500">
                {f.label}
                {f.glossaryKey && <ExplainButton term={f.glossaryKey} />}
              </dt>
              <dd className="tabular flex items-center gap-1.5 text-right font-semibold text-navy-800">
                {typeof v === "boolean" && (
                  <span aria-hidden>
                    <CoverMark covered={v} />
                  </span>
                )}
                {f.display(quote)}
              </dd>
            </div>
          );
        })}
      </dl>

      {match && match.total > 0 && (
        <div className="mt-3 space-y-2.5 rounded-2xl border border-navy-100 p-3.5">
          <MatchBadge match={match} />
          <MatchList match={match} compact />
        </div>
      )}

      <div className="mt-3">
        <VerifiedSource version={quote.version} />
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <Link href={selectHref} className={buttonClass("primary", "md", "rounded-xl px-3")}>
          เลือกแพ็กเกจ
        </Link>
        <Link href={detailHref} className={buttonClass("secondary", "md", "rounded-xl px-3")}>
          ดูรายละเอียด
        </Link>
        {compareControl && <div className="col-span-2 [&>*]:w-full">{compareControl}</div>}
      </div>
    </article>
  );
}
