"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ExplainButton } from "@/components/insurance/ExplainButton";
import { VehicleSelector, draftToSelection, emptyDraft, type VehicleDraft } from "@/components/insurance/VehicleSelector";
import { JourneySteps } from "@/components/quote/JourneySteps";
import { buttonClass } from "@/components/ui/button";
import { formatBaht } from "@/lib/format";
import { parsePriorities, parseUsage, parseVehicle, toRaw, withJourney } from "@/lib/params";
import { priorityDefinitions, usageDefinitions } from "@/lib/priorities";
import type { PriorityId, UsageId } from "@/lib/types";
import { isElectric, resolveVehicle, vehicleLabel } from "@/lib/vehicle";
import { cx } from "@/lib/cx";

type Step = "car" | "use" | "needs";
const stepIndex: Record<Step, number> = { car: 0, use: 1, needs: 2 };

export function QuoteWizard() {
  const router = useRouter();
  const sp = useSearchParams();
  const raw = useMemo(() => toRaw(sp), [sp]);

  const urlVehicle = parseVehicle(raw);
  const requested: Step = raw.step === "use" || raw.step === "needs" ? raw.step : "car";
  const resolvedFromUrl = urlVehicle ? resolveVehicle(urlVehicle) : null;
  // Later steps need a valid car; fall back to step 1 otherwise.
  const step: Step = resolvedFromUrl ? requested : "car";

  const [draft, setDraft] = useState<VehicleDraft>(urlVehicle ?? emptyDraft);
  const [usage, setUsage] = useState<UsageId | undefined>(parseUsage(raw));
  const [priorities, setPriorities] = useState<PriorityId[]>(parsePriorities(raw));
  const [error, setError] = useState<string | null>(null);

  // Keep local state in sync when the URL changes (browser back/forward).
  useEffect(() => {
    const v = parseVehicle(raw);
    if (v) setDraft(v);
    setUsage(parseUsage(raw));
    setPriorities(parsePriorities(raw));
    setError(null);
  }, [raw]);

  const selection = draftToSelection(draft);
  const vehicle = selection ? resolveVehicle(selection) : null;
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
    if (!vehicle) return setError("กรุณาเลือกยี่ห้อ รุ่น และปีรถให้ครบ");
    go("use");
  };

  const onUseNext = () => {
    if (!usage) return setError("กรุณาเลือกลักษณะการใช้รถ");
    const suggested = usageDefinitions.find((u) => u.id === usage)?.suggests ?? [];
    go("needs", { priorities: priorities.length > 0 ? priorities : suggested });
  };

  const onFinish = () => {
    if (!selection) return;
    const valid = priorities.filter((p) => availablePriorities.some((a) => a.id === p));
    router.push(withJourney("/quote/results", { vehicle: selection, usage, priorities: valid }));
  };

  const togglePriority = (id: PriorityId) =>
    setPriorities((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]));

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <JourneySteps current={stepIndex[step]} />

      <div className="card mt-6 p-5 sm:mt-8 sm:p-8">
        {step === "car" && (
          <section aria-labelledby="step-car">
            <h1 id="step-car" className="text-2xl font-bold sm:text-3xl">
              คุณขับรถอะไร?
            </h1>
            <p className="mt-2 text-navy-500">เริ่มจากรถของคุณ ยังไม่ต้องให้ชื่อหรือเบอร์โทร</p>
            <VehicleSelector value={draft} onChange={(d) => { setDraft(d); setError(null); }} className="mt-6" />
            {vehicle && (
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-brand-50 px-4 py-3 text-sm">
                <span className="font-semibold text-navy-800">{vehicleLabel(vehicle)}</span>
                <span className="text-navy-500">
                  มูลค่ารถโดยประมาณ <span className="tabular font-semibold text-navy-800">{formatBaht(vehicle.estimatedValue)}</span>
                </span>
                <ExplainButton term="sumInsured" withLabel />
              </div>
            )}
          </section>
        )}

        {step === "use" && vehicle && (
          <fieldset>
            <legend className="text-2xl font-bold sm:text-3xl">รถคันนี้ใช้แบบไหน?</legend>
            <p className="mt-2 text-navy-500">
              {vehicleLabel(vehicle)} — ใช้เพื่อแนะนำสิ่งที่ควรพิจารณาเท่านั้น ไม่ได้เปลี่ยนราคา
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {usageDefinitions.map((u) => (
                <OptionCard
                  key={u.id}
                  type="radio"
                  name="usage"
                  checked={usage === u.id}
                  onChange={() => { setUsage(u.id); setError(null); }}
                  label={u.label}
                  hint={u.hint}
                />
              ))}
            </div>
          </fieldset>
        )}

        {step === "needs" && vehicle && (
          <fieldset>
            <legend className="text-2xl font-bold sm:text-3xl">อะไรสำคัญกับคุณ?</legend>
            <p className="mt-2 text-navy-500">เลือกได้หลายข้อ เราจะบอกว่าแต่ละแผนตรงกี่ข้อและข้อไหนบ้าง</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {availablePriorities.map((p) => (
                <OptionCard
                  key={p.id}
                  type="checkbox"
                  name="priorities"
                  checked={priorities.includes(p.id)}
                  onChange={() => togglePriority(p.id)}
                  label={p.label}
                  hint={p.hint}
                  explain={p.glossaryKey ? <ExplainButton term={p.glossaryKey} /> : undefined}
                />
              ))}
            </div>
          </fieldset>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-danger-600">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-navy-100 pt-6 sm:flex-row sm:justify-between">
          {step === "car" ? (
            <span />
          ) : (
            <button type="button" onClick={() => router.back()} className={buttonClass("ghost", "md")}>
              <ArrowLeft aria-hidden className="h-4 w-4" />
              ย้อนกลับ
            </button>
          )}
          {step === "car" && (
            <button type="button" onClick={onCarNext} className={buttonClass("primary", "md")}>
              ถัดไป
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          )}
          {step === "use" && (
            <button type="button" onClick={onUseNext} className={buttonClass("primary", "md")}>
              ถัดไป
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          )}
          {step === "needs" && (
            <button type="button" onClick={onFinish} className={buttonClass("primary", "md")}>
              ดูแพ็กเกจที่เหมาะกับรถคันนี้
              <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
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
  explain?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "relative flex items-start gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
        props.checked ? "border-brand-600 bg-brand-50" : "border-navy-200 bg-white hover:border-brand-300",
      )}
    >
      <label className="flex flex-1 cursor-pointer items-start gap-3">
        <input type={props.type} name={props.name} checked={props.checked} onChange={props.onChange} className="sr-only" />
        <span
          aria-hidden
          className={cx(
            "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center border-2",
            props.type === "radio" ? "rounded-full" : "rounded-md",
            props.checked ? "border-brand-600 bg-brand-600 text-white" : "border-navy-300 bg-white",
          )}
        >
          {props.checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>
        <span>
          <span className="block font-semibold text-navy-900">{props.label}</span>
          <span className="mt-0.5 block text-sm text-navy-500">{props.hint}</span>
        </span>
      </label>
      {props.explain}
    </div>
  );
}
