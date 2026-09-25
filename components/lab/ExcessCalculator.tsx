"use client";

import { useId, useState } from "react";
import { formatBaht } from "@/lib/format";
import { cx } from "@/lib/cx";

const excessOptions = [0, 1_000, 2_000, 3_000, 5_000];

export function ExcessCalculator() {
  const id = useId();
  const [damage, setDamage] = useState(15_000);
  const [excess, setExcess] = useState(2_000);
  const [claims, setClaims] = useState(1);

  const youPayEach = Math.min(excess, damage);
  const youPay = youPayEach * claims;
  const insurerPays = Math.max(0, damage - excess) * claims;
  const share = damage > 0 ? (youPayEach / damage) * 100 : 0;

  return (
    <div className="card p-5 sm:p-7">
      <h2 className="text-xl font-bold">ลองคำนวณค่าเสียหายส่วนแรก</h2>
      <p className="mt-1 text-sm text-navy-500">ตัวเลขตัวอย่าง เพื่อให้เห็นภาพว่าใครจ่ายเท่าไร</p>

      <div className="mt-6 space-y-6">
        <div>
          <label htmlFor={`${id}-damage`} className="field-label flex justify-between">
            <span>ค่าซ่อมต่อครั้ง</span>
            <span className="tabular font-semibold text-navy-900">{formatBaht(damage)}</span>
          </label>
          <input id={`${id}-damage`} type="range" min={1_000} max={60_000} step={1_000} value={damage} onChange={(e) => setDamage(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
        <fieldset>
          <legend className="field-label">ค่าเสียหายส่วนแรกของแผน</legend>
          <div className="flex flex-wrap gap-2">
            {excessOptions.map((x) => (
              <label key={x} className={cx("cursor-pointer rounded-full border px-4 py-2 text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500", excess === x ? "border-brand-600 bg-brand-600 text-white" : "border-navy-200 text-navy-700")}>
                <input type="radio" name={`${id}-excess`} className="sr-only" checked={excess === x} onChange={() => setExcess(x)} />
                {x === 0 ? "ไม่มี" : formatBaht(x)}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor={`${id}-claims`} className="field-label flex justify-between">
            <span>จำนวนครั้งที่เคลมในปี</span>
            <span className="tabular font-semibold text-navy-900">{claims} ครั้ง</span>
          </label>
          <input id={`${id}-claims`} type="range" min={1} max={4} step={1} value={claims} onChange={(e) => setClaims(Number(e.target.value))} className="w-full accent-brand-600" />
        </div>
      </div>

      <div className="mt-7" aria-live="polite">
        <div className="flex h-4 overflow-hidden rounded-full bg-brand-100" aria-hidden>
          <div className="bg-warning-600 transition-all" style={{ width: `${share}%` }} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-warning-50 p-4">
            <dt className="text-sm text-warning-700">คุณจ่ายเอง</dt>
            <dd className="tabular mt-1 text-2xl font-bold text-warning-700">{formatBaht(youPay)}</dd>
          </div>
          <div className="rounded-2xl bg-brand-50 p-4">
            <dt className="text-sm text-brand-700">บริษัทประกันจ่าย</dt>
            <dd className="tabular mt-1 text-2xl font-bold text-brand-700">{formatBaht(insurerPays)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
