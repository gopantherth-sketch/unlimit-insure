"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpDown, CarFront, Check, ChevronDown, GitCompareArrows, Pencil, Plus, SearchX, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { InsuranceCard } from "@/components/insurance/InsuranceCard";
import { InsurerMark } from "@/components/insurance/InsurerMark";
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
  recommended: { label: "ตรงกับที่คุณต้องการ", fn: (a, b) => b.match.matched - a.match.matched || a.premium - b.premium },
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
      <div className="bg-gradient-to-b from-wash to-canvas">
        <div className="container-page pb-2 pt-6 sm:pt-10">
          <JourneySteps current={3} />

          <header className="mt-6 flex flex-col gap-5 sm:mt-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <span aria-hidden className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card sm:inline-flex">
                <CarFront className="h-7 w-7" strokeWidth={1.5} />
              </span>
              <div>
                <p className="eyebrow">My Car</p>
                <h1 className="mt-2 text-[26px] font-bold leading-tight text-navy-900 sm:text-[34px]">แพ็กเกจสำหรับ {vehicleLabel(vehicle)}</h1>
                <p className="mt-2 text-[15px] text-navy-500 sm:text-base">
                  มูลค่ารถโดยประมาณ <span className="tabular font-semibold text-navy-700">{formatBaht(vehicle.estimatedValue)}</span>
                  {usage && <> · {usageLabel(usage)}</>} · พบ {quotes.length} แพ็กเกจที่รับรถคันนี้
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={withJourney("/quote", { ...journey, step: "car" })} className={buttonClass("secondary", "md", "rounded-xl px-4 text-sm")}>
                <Pencil aria-hidden className="h-3.5 w-3.5" />
                เปลี่ยนรถ
              </Link>
              <Link href={withJourney("/quote", { ...journey, step: "needs" })} className={buttonClass("secondary", "md", "rounded-xl px-4 text-sm")}>
                <Pencil aria-hidden className="h-3.5 w-3.5" />
                แก้สิ่งที่สำคัญ
              </Link>
            </div>
          </header>

          {hasPriorities && (
            <ul aria-label="สิ่งที่คุณต้องการ" className="mt-5 flex flex-wrap gap-2">
              {priorities.map((p) => (
                <li key={p} className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white px-3.5 py-1.5 text-sm font-medium text-navy-700 shadow-card">
                  <Check aria-hidden className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.5} />
                  {priorityLabel(p)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="container-page pb-8 sm:pb-10">
        {quotes.length === 0 ? (
          <div className="card mt-8 rounded-xl2 p-8 text-center sm:p-12">
            <span aria-hidden className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <SearchX className="h-7 w-7" strokeWidth={1.5} />
            </span>
            <p className="mt-4 font-display text-xl font-semibold text-navy-900">ยังไม่มีแพ็กเกจตัวอย่างที่รับรถคันนี้</p>
            <p className="mt-2 text-navy-500">ที่ปรึกษาช่วยหาแพ็กเกจที่เหมาะกับรถของคุณได้ ไม่มีค่าใช้จ่าย</p>
            <Link href={withJourney("/advisor", journey)} className={buttonClass("primary", "md", "mt-6 rounded-xl px-6")}>
              ปรึกษาผู้เชี่ยวชาญ
            </Link>
          </div>
        ) : (
          <>
            {top && hasPriorities && (
              <section
                aria-labelledby="why-top"
                className="mt-6 grid gap-6 rounded-xl2 border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-5 shadow-card sm:mt-8 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10"
              >
                <div className="flex flex-col">
                  <p className="inline-flex items-center gap-1.5 self-start rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles aria-hidden className="h-3.5 w-3.5" />
                    แนะนำสำหรับคุณ
                  </p>
                  <h2 id="why-top" className="mt-4 text-[22px] font-bold leading-snug text-navy-900 sm:text-2xl">
                    ทำไมเราจึงแนะนำ {top.product.name}?
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-navy-600">
                    ตรงกับสิ่งที่คุณต้องการ {top.match.matched} จาก {top.match.total} ข้อ มากที่สุดในผลลัพธ์นี้
                    ถ้าหลายแผนตรงเท่ากัน เราเลือกแผนที่เบี้ยต่ำกว่า ลำดับนี้ไม่ขึ้นกับค่าตอบแทนที่เราได้รับ
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <InsurerMark insurer={top.insurer} />
                    <div>
                      <p className="tabular font-display text-[28px] font-bold leading-none text-navy-900">
                        {formatBaht(top.premium)} <span className="font-sans text-sm font-normal text-navy-500">/ ปี</span>
                      </p>
                      <p className="mt-1 text-sm text-navy-500">
                        {top.insurer.name} · {insuranceTypeLabel[top.coverage.insuranceType]}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-5">
                  <p className="mb-3 text-sm font-semibold text-navy-800">เทียบกับสิ่งที่คุณเลือก</p>
                  <MatchList match={top.match} />
                </div>
              </section>
            )}

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <fieldset className="min-w-0">
                <legend className="sr-only">กรองแพ็กเกจ</legend>
                <div className="flex flex-wrap items-center gap-2">
                  <span aria-hidden className="mr-1 hidden items-center gap-1.5 text-sm font-medium text-navy-500 sm:inline-flex">
                    <SlidersHorizontal className="h-4 w-4" />
                    กรอง
                  </span>
                  {filterDefs
                    .filter((f) => ev || !f.evOnly)
                    .map((f) => {
                      const on = filters.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className={cx(
                            "inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
                            on ? "border-brand-600 bg-brand-600 text-white shadow-lift" : "border-navy-100 bg-white text-navy-700 shadow-card hover:border-brand-300",
                          )}
                        >
                          <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleFilter(f.id)} />
                          {on && <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />}
                          {f.label}
                        </label>
                      );
                    })}
                </div>
              </fieldset>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="inline-flex shrink-0 items-center gap-1.5 text-sm text-navy-500">
                  <ArrowUpDown aria-hidden className="h-4 w-4" />
                  เรียงตาม
                </label>
                <div className="relative min-w-0 flex-1 lg:flex-none">
                  <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortId)} className="field-select h-11 w-full text-sm lg:w-auto">
                    {(Object.keys(sorters) as SortId[]).map((id) => (
                      <option key={id} value={id}>
                        {sorters[id].label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                </div>
              </div>
            </div>

            <h2 className="sr-only">แพ็กเกจทั้งหมด</h2>
            <p className="mt-4 text-sm text-navy-400" aria-live="polite">
              แสดง {shown.length} จาก {visible.length} แพ็กเกจ
            </p>

            {visible.length === 0 ? (
              <div className="card mt-4 rounded-xl2 p-8 text-center">
                <p className="font-display text-lg font-semibold text-navy-900">ไม่มีแพ็กเกจที่ตรงกับตัวกรองทั้งหมด</p>
                <p className="mt-1 text-navy-500">ลองเอาตัวกรองบางข้อออก</p>
                <button type="button" onClick={() => setFilters([])} className={buttonClass("secondary", "md", "mt-5 rounded-xl")}>
                  ล้างตัวกรอง
                </button>
              </div>
            ) : (
              <ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {shown.map((q) => {
                  const selected = compare.includes(q.productId);
                  const full = compare.length >= MAX_COMPARE && !selected;
                  return (
                    <li key={q.id}>
                      <InsuranceCard
                        quote={q}
                        highlight={q.id === top?.id && hasPriorities ? "แนะนำสำหรับคุณ" : undefined}
                        detailHref={withJourney(`/plans/${q.productId}`, journey)}
                        selectHref={withJourney(`/buy/${q.productId}`, journey)}
                        compareControl={
                          <button
                            type="button"
                            aria-pressed={selected}
                            disabled={full}
                            onClick={() => toggleCompare(q.productId)}
                            title={full ? `เปรียบเทียบได้สูงสุด ${MAX_COMPARE} แพ็กเกจ` : undefined}
                            className={buttonClass(
                              "ghost",
                              "md",
                              cx("w-full rounded-xl border", selected ? "border-brand-600 bg-brand-50 text-brand-700" : "border-dashed border-brand-200"),
                            )}
                          >
                            {selected ? <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} /> : <Plus aria-hidden className="h-4 w-4" />}
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
              <div className="mt-8 text-center">
                <button type="button" onClick={() => setShowAll(true)} className={buttonClass("secondary", "md", "rounded-xl px-6")}>
                  ดูเพิ่มอีก {visible.length - INITIAL_VISIBLE} แพ็กเกจ
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {compare.length > 0 && (
        <div role="region" aria-label="แพ็กเกจที่เลือกเปรียบเทียบ" className="fixed inset-x-0 bottom-0 z-30 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] sm:px-4 sm:pb-4">
          <div className="mx-auto flex max-w-page items-center justify-between gap-3 rounded-2xl border border-navy-100 bg-white/95 px-4 py-3 shadow-float backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 sm:inline-flex">
                <GitCompareArrows className="h-5 w-5" />
              </span>
              <p className="text-sm text-navy-600">
                <span className="font-semibold text-navy-900">เลือกแล้ว {compare.length}</span> / {MAX_COMPARE} แพ็กเกจ
                {compare.length < 2 && <span className="block text-xs text-navy-400 sm:inline sm:text-sm"> เลือกอีกอย่างน้อย 1 แพ็กเกจ</span>}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button type="button" onClick={() => setCompare([])} className={buttonClass("ghost", "md", "rounded-xl px-3")}>
                ล้าง
              </button>
              <button type="button" onClick={goCompare} disabled={compare.length < 2} className={buttonClass("primary", "md", "rounded-xl px-4 sm:px-6")}>
                <GitCompareArrows aria-hidden className="hidden h-4 w-4 sm:block" />
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
