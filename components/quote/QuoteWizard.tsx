"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  BriefcaseBusiness,
  Building2,
  Car,
  CarFront,
  Check,
  CircleAlert,
  Droplet,
  HandCoins,
  KeyRound,
  LifeBuoy,
  LockKeyhole,
  Pencil,
  PiggyBank,
  Route,
  ShieldPlus,
  Sun,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ExplainButton } from "@/components/insurance/ExplainButton";
import { VehicleSelector, draftToSelection, emptyDraft, type VehicleDraft } from "@/components/insurance/VehicleSelector";
import { JourneySteps } from "@/components/quote/JourneySteps";
import { buttonClass } from "@/components/ui/button";
import { track } from "@/lib/analytics/track";
import { formatBaht } from "@/lib/format";
import { parsePriorities, parseUsage, parseVehicle, toRaw, withJourney } from "@/lib/params";
import { priorityDefinitions, usageDefinitions } from "@/lib/priorities";
import type { PriorityId, UsageId, VehicleCatalog } from "@/lib/types";
import { isElectric, resolveVehicle, vehicleLabel } from "@/lib/vehicle";
import { cx } from "@/lib/cx";

type Step = "car" | "use" | "needs";
const stepIndex: Record<Step, number> = { car: 0, use: 1, needs: 2 };
const stepEyebrow: Record<Step, string> = { car: "Step 1 · My Car", use: "Step 2 · How you drive", needs: "Step 3 · What matters" };

export function QuoteWizard({ catalog }: { catalog: VehicleCatalog }) {
  const router = useRouter();
  const sp = useSearchParams();
  const raw = useMemo(() => toRaw(sp), [sp]);

  const urlVehicle = parseVehicle(raw);
  const requested: Step = raw.step === "use" || raw.step === "needs" ? raw.step : "car";
  const resolvedFromUrl = urlVehicle ? resolveVehicle(catalog, urlVehicle) : null;
  // Later steps need a valid car; fall back to step 1 otherwise.
  const step: Step = resolvedFromUrl ? requested : "car";

  const [draft, setDraft] = useState<VehicleDraft>(urlVehicle ?? emptyDraft);
  const [usage, setUsage] = useState<UsageId | undefined>(parseUsage(raw));
  const [priorities, setPriorities] = useState<PriorityId[]>(parsePriorities(raw));
  const [error, setError] = useState<string | null>(null);

  // "Started" = reached the usage step with a valid car, from any entry point (hero, model page, step 1).
  const startedKey = step === "use" && resolvedFromUrl ? `${resolvedFromUrl.modelId}-${resolvedFromUrl.year}` : null;
  useEffect(() => {
    if (startedKey) track("quote_started");
  }, [startedKey]);

  // Keep local state in sync when the URL changes (browser back/forward).
  useEffect(() => {
    const v = parseVehicle(raw);
    if (v) setDraft(v);
    setUsage(parseUsage(raw));
    setPriorities(parsePriorities(raw));
    setError(null);
  }, [raw]);

  const selection = draftToSelection(draft);
  const vehicle = selection ? resolveVehicle(catalog, selection) : null;
  const ev = vehicle ? isElectric(vehicle) : false;
  const availablePriorities = priorityDefinitions.filter((p) => ev || !p.evOnly);

  const go = (next: Step, overrides: { usage?: UsageId; priorities?: PriorityId[] } = {}) => {
    router.push(
      withJourney("/quote", {
        vehicle: selection,
        usage: overrides.usage ?? usage,
        priorities: overrides.priorities ?? priorities,
        step: next,
      }),
      { scroll: true },
    );
  };

  const onCarNext = () => {
    if (!vehicle) return setError("เลือกยี่ห้อ รุ่น และปีรถให้ครบก่อน");
    go("use");
  };

  const onUseNext = () => {
    if (!usage) return setError("เลือกลักษณะการใช้รถก่อน แล้วกดถัดไป");
    track("usage_selected", usage);
    const suggested = usageDefinitions.find((u) => u.id === usage)?.suggests ?? [];
    go("needs", { priorities: priorities.length > 0 ? priorities : suggested });
  };

  const onFinish = () => {
    if (!selection) return;
    const valid = priorities.filter((p) => availablePriorities.some((a) => a.id === p));
    for (const p of valid) track("priority_selected", p);
    router.push(withJourney("/quote/results", { vehicle: selection, usage, priorities: valid }));
  };

  const togglePriority = (id: PriorityId) =>
    setPriorities((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]));

  return (
    <div className="container-page max-w-4xl pb-10 pt-6 sm:py-12">
      <JourneySteps current={stepIndex[step]} />

      <div className="card mt-6 rounded-xl2 border-white p-5 shadow-float sm:mt-8 sm:p-9">
        <p className="eyebrow text-[11px] sm:text-xs">{stepEyebrow[step]}</p>

        {step !== "car" && vehicle && (
          <MyCarChip
            label={vehicleLabel(vehicle)}
            value={formatBaht(vehicle.estimatedValue)}
            changeHref={withJourney("/quote", { vehicle: selection, usage, priorities, step: "car" })}
          />
        )}

        {step === "car" && (
          <section aria-labelledby="step-car" className="mt-3">
            <h1 id="step-car" className="text-[28px] font-bold leading-tight text-navy-900 sm:text-[34px]">
              คุณขับรถอะไร?
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-navy-500 sm:text-base">เริ่มจากรถของคุณ ยังไม่ต้องให้ชื่อหรือเบอร์โทร</p>
            <div className="mt-6 rounded-2xl bg-wash p-4 sm:p-5">
              <VehicleSelector catalog={catalog} value={draft} onChange={(d) => { setDraft(d); setError(null); }} withIcons />
            </div>
            {vehicle && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">
                <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
                  <CarFront className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-display text-[15px] font-semibold text-navy-900">{vehicleLabel(vehicle)}</p>
                  <div className="flex flex-wrap items-center gap-x-1 text-navy-500">
                    มูลค่ารถโดยประมาณ <span className="tabular font-semibold text-navy-800">{formatBaht(vehicle.estimatedValue)}</span>
                    <ExplainButton term="sumInsured" withLabel />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {step === "use" && vehicle && (
          <fieldset className="mt-5">
            <legend>
              <h1 className="font-display text-[28px] font-bold leading-tight text-navy-900 sm:text-[34px]">รถคันนี้ใช้แบบไหน?</h1>
            </legend>
            <p className="mt-2 text-[15px] leading-relaxed text-navy-500 sm:text-base">ช่วยให้เราแนะนำสิ่งที่ควรดู คำตอบนี้ไม่มีผลกับราคา</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {usageDefinitions.map((u) => (
                <OptionCard
                  key={u.id}
                  type="radio"
                  name="usage"
                  checked={usage === u.id}
                  onChange={() => { setUsage(u.id); setError(null); }}
                  label={u.label}
                  hint={u.hint}
                  icon={usageIcon[u.id]}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === "needs" && vehicle && (
          <fieldset className="mt-5">
            <legend>
              <h1 className="font-display text-[28px] font-bold leading-tight text-navy-900 sm:text-[34px]">อะไรสำคัญกับคุณ?</h1>
            </legend>
            <p className="mt-2 text-[15px] leading-relaxed text-navy-500 sm:text-base">เลือกได้หลายข้อ เราจะบอกว่าแต่ละแผนตรงกับคุณกี่ข้อ และข้อไหนบ้าง</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availablePriorities.map((p) => (
                <OptionCard
                  key={p.id}
                  type="checkbox"
                  name="priorities"
                  checked={priorities.includes(p.id)}
                  onChange={() => togglePriority(p.id)}
                  label={p.label}
                  hint={p.hint}
                  icon={priorityIcon[p.id]}
                  explain={p.glossaryKey ? <ExplainButton term={p.glossaryKey} /> : undefined}
                />
              ))}
            </div>
          </fieldset>
        )}

        {error && (
          <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
            <CircleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Sticky action bar on mobile; a plain footer row inside the card from sm up. */}
        <div className="sticky bottom-0 z-20 -mx-5 mt-6 flex items-center gap-3 border-t border-navy-100 bg-white/95 px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur sm:static sm:mx-0 sm:mt-8 sm:justify-between sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-6 sm:backdrop-blur-none">
          {step === "car" ? (
            <span className="hidden sm:block" />
          ) : (
            <button type="button" onClick={() => router.back()} className={buttonClass("ghost", "md", "h-12 w-12 shrink-0 rounded-xl border border-navy-100 px-0 sm:h-11 sm:w-auto sm:border-0 sm:px-5")}>
              <ArrowLeft aria-hidden className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">ย้อนกลับ</span>
            </button>
          )}
          {step === "car" && (
            <button type="button" onClick={onCarNext} className={buttonClass("primary", "lg", "flex-1 rounded-xl sm:flex-none sm:px-10")}>
              ถัดไป
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          )}
          {step === "use" && (
            <button type="button" onClick={onUseNext} className={buttonClass("primary", "lg", "flex-1 rounded-xl sm:flex-none sm:px-10")}>
              ถัดไป
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          )}
          {step === "needs" && (
            <button type="button" onClick={onFinish} className={buttonClass("primary", "lg", "min-w-0 flex-1 rounded-xl px-4 text-[15px] sm:flex-none sm:px-7 sm:text-base")}>
              ดูแพ็กเกจที่เหมาะกับรถคันนี้
              <ArrowRight aria-hidden className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[13px] text-navy-400">
        <LockKeyhole aria-hidden className="h-3.5 w-3.5 shrink-0" />
        ฟรี ไม่ผูกมัด ดูราคาได้โดยไม่ต้องให้เบอร์โทร
      </p>
    </div>
  );
}

/** Decorative icons for the option cards (one idea per icon, outlined, brand blue). */
const usageIcon: Record<UsageId, LucideIcon> = {
  commute: BriefcaseBusiness,
  weekend: Sun,
  upcountry: Route,
  second: Car,
  family: UsersRound,
};

const priorityIcon: Record<PriorityId, LucideIcon> = {
  dealer: Building2,
  lowPremium: PiggyBank,
  noExcess: HandCoins,
  flood: Droplet,
  replacementCar: KeyRound,
  highCoverage: ShieldPlus,
  roadside: LifeBuoy,
  evBattery: BatteryCharging,
};

function MyCarChip({ label, value, changeHref }: { label: string; value: string; changeHref: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 py-2 pl-2 pr-3 sm:inline-flex sm:pr-4">
      <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
        <CarFront className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600">My Car</span>
        <span className="block font-display text-[15px] font-semibold text-navy-900">{label}</span>
        <span className="mt-0.5 block text-xs text-navy-500">
          มูลค่ารถโดยประมาณ <span className="tabular font-medium text-navy-700">{value}</span>
        </span>
      </span>
      <Link href={changeHref} className="ml-1 inline-flex h-11 shrink-0 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-brand-600 hover:bg-white hover:text-brand-800">
        <Pencil aria-hidden className="h-3.5 w-3.5" />
        เปลี่ยนรถ
      </Link>
    </div>
  );
}

function OptionCard(props: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  hint: string;
  icon?: LucideIcon;
  explain?: React.ReactNode;
}) {
  const Icon = props.icon;
  return (
    <div
      className={cx(
        "relative flex h-full items-center gap-1 rounded-2xl border-2 bg-white pr-3 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 has-[:focus-visible]:ring-offset-2 sm:pr-0",
        props.checked ? "border-brand-600 bg-brand-50/60 shadow-lift" : "border-navy-100 shadow-card hover:border-brand-200",
      )}
    >
      <label className="flex min-h-[76px] flex-1 cursor-pointer items-center gap-4 self-stretch p-4 sm:flex-col sm:items-start sm:gap-3 sm:p-5">
        <input type={props.type} name={props.name} checked={props.checked} onChange={props.onChange} className="sr-only" />
        {Icon && (
          <span
            aria-hidden
            className={cx(
              "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
              props.checked ? "bg-brand-600 text-white" : "bg-wash text-brand-600",
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={1.6} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[17px] font-semibold leading-snug text-navy-900">{props.label}</span>
          <span className="mt-0.5 block text-sm leading-snug text-navy-500">{props.hint}</span>
        </span>
        <span
          aria-hidden
          className={cx(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center border-2 transition-colors sm:absolute sm:right-4 sm:top-4",
            props.type === "radio" ? "rounded-full" : "rounded-lg",
            props.checked ? "border-brand-600 bg-brand-600 text-white" : "border-navy-200 bg-white",
          )}
        >
          {props.checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
      </label>
      {props.explain && <span className="sm:absolute sm:right-12 sm:top-3.5">{props.explain}</span>}
    </div>
  );
}
