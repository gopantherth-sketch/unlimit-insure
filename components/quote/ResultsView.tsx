"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, GitCompareArrows, Pencil, Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { InsuranceCard } from "@/components/insurance/InsuranceCard";
import { MatchList } from "@/components/insurance/MatchSummary";
import { JourneySteps } from "@/components/quote/JourneySteps";
import { buttonClass } from "@/components/ui/button";
import { insuranceTypeLabel } from "@/lib/coverageFields";
import { formatBaht } from "@/lib/format";
import { rememberCompared, rememberViewed } from "@/lib/journey";
import { track } from "@/lib/analytics/track";
import { withJourney } from "@/lib/params";
import { priorityLabel, usageLabel } from "@/lib/priorities";
import type { PriorityId, RankedQuote, ResolvedVehicle, UsageId } from "@/lib/types";
import { isElectric, vehicleLabel } from "@/lib/vehicle";
import { cx } from "@/lib/cx";

type FilterId = "dealer" | "garage" | "noExcess" | "flood" | "type1" | "ev";
type SortId = "recommended" | "premium" | "sumInsured";

const filterDefs: { id: FilterId; label: string; test: (q: RankedQuote) => boolean; evOnly?: boolean }[] = [
  { id: "type1", label: "ชั้น 1", test: (q) => q.coverage.insuranceType === "type1" },
  { id: "dealer", label: "ซ่อมศูนย์", test: (q) => q.coverage.repairType === "dealer" },
  { id: "garage", label: "ซ่อมอู่", test: (q) => q.coverage.repairType === "garage" },
  { id: "noExcess", label: "ไม่มีค่าเสียหายส่วนแรก", test: (q) => q.coverage.excess === 0 },
  { id: "flood", label: "คุ้มครองน้ำท่วม", test: (q) => q.coverage.flood },
  { id: "ev", label: "EV", test: (q) => q.coverage.evBattery, evOnly: true },
];

const sorters: Record<SortId, { label: string; fn: (a: RankedQuote, b: RankedQuote) => number }> = {
  recommended: { label: "ตรงกับที่ต้องการมากที่สุด", fn: (a, b) => b.match.matched - a.match.matched || a.premium - b.premium },
  premium: { label: "เบี้ยต่ำไปสูง", fn: (a, b) => a.premium - b.premium },
  sumInsured: { label: "ทุนประกันสูงไปต่ำ", fn: (a, b) => b.sumInsured - a.sumInsured || a.premium - b.premium },
};

const MAX_COMPARE = 3;
const INITIAL_VISIBLE = 6;

interface Props {
  vehicle: ResolvedVehicle;
  usage?: UsageId;
  priorities: PriorityId[];
  quotes: RankedQuote[];
}

export function ResultsView({ vehicle, usage, priorities, quotes }: Props) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterId[]>([]);
  const [sort, setSort] = useState<SortId>("recommended");
  const [compare, setCompare] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  const selection = { brandId: vehicle.brandId, modelId: vehicle.modelId, year: vehicle.year };
  const journey = { vehicle: selection, usage, priorities };
  const ev = isElectric(vehicle);

  useEffect(() => {
    rememberViewed(quotes.map((q) => q.productId));
  }, [quotes]);

  useEffect(() => {
    track("results_viewed");
  }, []);

  const visible = useMemo(() => {
    const active = filterDefs.filter((f) => filters.includes(f.id));
    return quotes.filter((q) => active.every((f) => f.test(q))).sort(sorters[sort].fn);
  }, [quotes, filters, sort]);

  const shown = showAll ? visible : visible.slice(0, INITIAL_VISIBLE);
  const top = quotes[0];
  const hasPriorities = priorities.length > 0;

  const toggleFilter = (id: FilterId) => setFilters((cur) => (cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id]));
  const toggleCompare = (productId: string) =>
    setCompare((cur) => (cur.includes(productId) ? cur.filter((p) => p !== productId) : cur.length >= MAX_COMPARE ? cur : [...cur, productId]));

  const goCompare = () => {
    rememberCompared(compare);
    router.push(withJourney("/compare", { ...journey, plans: compare }));
  };

  return (
    <div className="bg-canvas pb-32">
      <div className="container-page py-8 sm:py-10">
        <JourneySteps current={3} />

        <header className="mt-6 flex flex-col gap-4 sm:mt-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-600">My Car</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">แพ็กเกจสำหรับ {vehicleLabel(vehicle)}</h1>
            <p className="mt-2 text-navy-500">
              มูลค่ารถโดยประมาณ <span className="tabular font-semibold text-navy-700">{formatBaht(vehicle.estimatedValue)}</span>
              {usage && <> · {usageLabel(usage)}</>} · พบ {quotes.length} แพ็กเกจที่รับรถคันนี้
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={withJourney("/quote", { ...journey, step: "car" })} className={buttonClass("secondary", "sm")}>
              <Pencil aria-hidden className="h-3.5 w-3.5" />
              เปลี่ยนรถ
            </Link>
            <Link href={withJourney("/quote", { ...journey, step: "needs" })} className={buttonClass("secondary", "sm")}>
              <Pencil aria-hidden className="h-3.5 w-3.5" />
              แก้สิ่งที่สำคัญ
            </Link>
          </div>
        </header>

        {hasPriorities && (
          <ul aria-label="สิ่งที่คุณต้องการ" className="mt-4 flex flex-wrap gap-2">
            {priorities.map((p) => (
              <li key={p} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-medium text-navy-700 shadow-card">
                <Check aria-hidden className="h-3.5 w-3.5 text-brand-600" />
                {priorityLabel(p)}
              </li>
            ))}
          </ul>
        )}

        {quotes.length === 0 ? (
          <div className="card mt-8 p-8 text-center">
            <p className="text-lg font-semibold">ยังไม่มีแพ็กเกจตัวอย่างที่รับรถคันนี้</p>
            <p className="mt-2 text-navy-500">ที่ปรึกษาช่วยหาแพ็กเกจที่เหมาะกับรถของคุณได้</p>
            <Link href={withJourney("/advisor", journey)} className={buttonClass("primary", "md", "mt-6")}>
              ปรึกษาผู้เชี่ยวชาญ
            </Link>
          </div>
        ) : (
          <>
            {top && hasPriorities && (
              <section aria-labelledby="why-top" className="card mt-8 grid gap-6 border-brand-200 p-5 sm:p-7 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles aria-hidden className="h-3.5 w-3.5" />
                    แนะนำสำหรับคุณ
                  </p>
                  <h2 id="why-top" className="mt-3 text-xl font-bold">
                    ทำไมเราจึงแนะนำ {top.product.name}?
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-navy-500">
                    ตรงกับสิ่งที่คุณต้องการ {top.match.matched} จาก {top.match.total} ข้อ มากที่สุดในผลลัพธ์นี้
                    ถ้าหลายแผนตรงเท่ากัน เราเลือกแผนที่เบี้ยต่ำกว่า ลำดับนี้ไม่ขึ้นกับค่าตอบแทนที่เราได้รับ
                  </p>
                  <p className="tabular mt-4 text-2xl font-bold">
                    {formatBaht(top.premium)} <span className="text-sm font-normal text-navy-500">/ ปี</span>
                  </p>
                  <p className="text-sm text-navy-500">
                    {top.insurer.name} · {insuranceTypeLabel[top.coverage.insuranceType]}
                  </p>
                </div>
                <MatchList match={top.match} />
              </section>
            )}

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <fieldset>
                <legend className="sr-only">กรองแพ็กเกจ</legend>
                <div className="flex flex-wrap gap-2">
                  {filterDefs
                    .filter((f) => ev || !f.evOnly)
                    .map((f) => {
                      const on = filters.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className={cx(
                            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
                            on ? "border-brand-600 bg-brand-600 text-white" : "border-navy-200 bg-white text-navy-700 hover:border-brand-300",
                          )}
                        >
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleFilter(f.id)} />
                          {on && <Check aria-hidden className="h-3.5 w-3.5" />}
                          {f.label}
                        </label>
                      );
                    })}
                </div>
              </fieldset>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="shrink-0 text-sm text-navy-500">
                  เรียงตาม
                </label>
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortId)} className="field-select h-10 w-auto text-sm">
                  {(Object.keys(sorters) as SortId[]).map((id) => (
                    <option key={id} value={id}>
                      {sorters[id].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-3 text-sm text-navy-400" aria-live="polite">
              แสดง {shown.length} จาก {visible.length} แพ็กเกจ
            </p>

            {visible.length === 0 ? (
              <div className="card mt-4 p-8 text-center text-navy-500">
                ไม่มีแพ็กเกจตรงกับตัวกรองที่เลือก
                <button type="button" onClick={() => setFilters([])} className="ml-2 font-semibold text-brand-600">
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              <ul className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {shown.map((q) => {
                  const selected = compare.includes(q.productId);
                  const full = compare.length >= MAX_COMPARE && !selected;
                  return (
                    <li key={q.id}>
                      <InsuranceCard
                        quote={q}
                        highlight={q.id === top?.id && hasPriorities ? "แนะนำสำหรับคุณ" : undefined}
                        detailHref={withJourney(`/plans/${q.productId}`, journey)}
                        selectHref={withJourney("/advisor", { ...journey, plans: [q.productId] })}
                        compareControl={
                          <button
                            type="button"
                            aria-pressed={selected}
                            disabled={full}
                            onClick={() => toggleCompare(q.productId)}
                            title={full ? `เปรียบเทียบได้สูงสุด ${MAX_COMPARE} แพ็กเกจ` : undefined}
                            className={buttonClass(selected ? "primary" : "ghost", "md", cx("w-full border border-brand-100", selected && "shadow-none"))}
                          >
                            {selected ? <Check aria-hidden className="h-4 w-4" /> : <Plus aria-hidden className="h-4 w-4" />}
                            {selected ? "เลือกเปรียบเทียบแล้ว" : "เปรียบเทียบ"}
                          </button>
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}

            {!showAll && visible.length > INITIAL_VISIBLE && (
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setShowAll(true)} className={buttonClass("secondary", "md")}>
                  ดูเพิ่มอีก {visible.length - INITIAL_VISIBLE} แพ็กเกจ
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {compare.length > 0 && (
        <div role="region" aria-label="แพ็กเกจที่เลือกเปรียบเทียบ" className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-100 bg-white/95 shadow-lift backdrop-blur">
          <div className="container-page flex items-center justify-between gap-4 py-3">
            <p className="text-sm text-navy-600">
              <span className="font-semibold text-navy-900">{compare.length}</span> / {MAX_COMPARE} แพ็กเกจ
              {compare.length < 2 && <span className="hidden sm:inline"> — เลือกอย่างน้อย 2 แพ็กเกจ</span>}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCompare([])} className={buttonClass("ghost", "sm")}>
                ล้าง
              </button>
              <button type="button" onClick={goCompare} disabled={compare.length < 2} className={buttonClass("primary", "md")}>
                <GitCompareArrows aria-hidden className="h-4 w-4" />
                เปรียบเทียบ
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
