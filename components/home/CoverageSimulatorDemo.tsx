"use client";

import { CarFront, CircleCheck, CircleX, Flame, KeyRound, Waves, Zap, Car } from "lucide-react";
import { useState } from "react";
import { scenarioCopy } from "@/content/scenarios";
import type { ScenarioId } from "@/content/types";
import { formatBaht } from "@/lib/format";
import { scenarioRules, simulate } from "@/lib/scenarios";
import type { Quote } from "@/lib/types";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";

const icons: Record<ScenarioId, typeof Car> = {
  collision: Car,
  noCounterparty: CarFront,
  flood: Waves,
  fire: Flame,
  theft: KeyRound,
  evBattery: Zap,
};

interface Props {
  quotes: Quote[];
  labels: string[];
  showEv?: boolean;
}

export function CoverageSimulator({ quotes, labels, showEv = false }: Props) {
  const scenarios = scenarioRules.filter((r) => showEv || !r.evOnly);
  const [active, setActive] = useState<ScenarioId>("noCounterparty");
  const copy = scenarioCopy[active];

  return (
    <div className="card p-5 sm:p-6">
      <fieldset>
        <legend className="text-sm font-semibold text-navy-700">เลือกเหตุการณ์</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {scenarios.map((s) => {
            const Icon = icons[s.id];
            const on = s.id === active;
            return (
              <label
                key={s.id}
                className={cx(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
                  on ? "border-brand-600 bg-brand-600 text-white" : "border-navy-200 bg-white text-navy-700 hover:border-brand-300",
                )}
              >
                <input type="radio" name="scenario" value={s.id} checked={on} onChange={() => {
                    setActive(s.id);
                    track("simulator_used", s.id);
                  }} className="sr-only" />
                <Icon aria-hidden className="h-4 w-4" />
                {scenarioCopy[s.id].label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <p className="mt-5 rounded-2xl bg-canvas p-4 text-[15px] leading-relaxed text-navy-700">{copy.situation}</p>

      <ul className="mt-4 grid gap-3 md:grid-cols-3" aria-live="polite">
        {quotes.map((q, i) => {
          const o = simulate(active, q);
          return (
            <li key={q.id} className={cx("rounded-2xl border p-4", o.covered ? "border-success-600/20 bg-success-50" : "border-navy-100 bg-white")}>
              <p className="text-xs font-semibold text-brand-600">{labels[i]}</p>
              <p className="text-sm font-bold text-navy-900">{q.product.name}</p>
              <p className={cx("mt-3 flex items-center gap-1.5 font-semibold", o.covered ? "text-success-700" : "text-navy-500")}>
                {o.covered ? <CircleCheck aria-hidden className="h-5 w-5" /> : <CircleX aria-hidden className="h-5 w-5" />}
                {o.covered ? "อยู่ในความคุ้มครอง" : "ไม่อยู่ในความคุ้มครอง"}
              </p>
              {o.covered && (
                <dl className="mt-2 space-y-0.5 text-sm text-navy-600">
                  <div className="flex justify-between gap-2">
                    <dt>วงเงินสูงสุด</dt>
                    <dd className="tabular font-semibold">{formatBaht(o.maxAmount)}</dd>
                  </div>
                  {o.excess > 0 && (
                    <div className="flex justify-between gap-2">
                      <dt>อาจมีค่าเสียหายส่วนแรก</dt>
                      <dd className="tabular font-semibold">{formatBaht(o.excess)}</dd>
                    </div>
                  )}
                </dl>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-navy-500">
        {quotes.some((q) => simulate(active, q).covered) ? copy.coveredText : copy.notCoveredText}
      </p>
      <p className="mt-2 text-xs text-navy-400">ต้นแบบ: ผลลัพธ์คำนวณจากข้อมูลแผนตัวอย่าง ยังไม่ใช่เงื่อนไขกรมธรรม์จริง</p>
    </div>
  );
}
