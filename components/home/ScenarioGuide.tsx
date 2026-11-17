"use client";

import { CarFront, Flame, KeyRound, Waves, Zap, Car } from "lucide-react";
import { useState } from "react";
import { CallButton, LineButton } from "@/components/contact/ContactButtons";
import { scenarioQuestions } from "@/content/scenario-guide";
import { scenarioCopy } from "@/content/scenarios";
import type { ScenarioId } from "@/content/types";
import type { ContactPlacement } from "@/lib/analytics/events";
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

const scenarios: ScenarioId[] = ["collision", "noCounterparty", "flood", "fire", "theft"];

export function ScenarioGuide({
  placement,
  showEv = false,
  vehicle,
}: {
  placement: ContactPlacement;
  showEv?: boolean;
  vehicle?: string;
}) {
  const [active, setActive] = useState<ScenarioId>("collision");
  const copy = scenarioCopy[active];
  const message = `สวัสดี อยากสอบถามความคุ้มครองกรณี${copy.label}${vehicle ? ` สำหรับ ${vehicle}` : ""}`;

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-7">
      <fieldset>
        <legend className="text-sm font-semibold text-navy-700">เลือกเหตุการณ์</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...scenarios, ...(showEv ? (["evBattery"] as const) : [])].map((id) => {
            const Icon = icons[id];
            const on = id === active;
            return (
              <label
                key={id}
                className={cx(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
                  on ? "border-brand-600 bg-brand-600 text-white" : "border-navy-200 bg-white text-navy-700 hover:border-brand-300",
                )}
              >
                <input
                  type="radio"
                  name={`scenario-${placement}`}
                  value={id}
                  checked={on}
                  onChange={() => {
                    setActive(id);
                    track("simulator_used", id);
                  }}
                  className="sr-only"
                />
                <Icon aria-hidden className="h-4 w-4" />
                {scenarioCopy[id].label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite">
        <p className="mt-5 rounded-2xl bg-wash p-4 text-[15px] leading-relaxed text-navy-700">{copy.situation}</p>
        <h3 className="mt-5 text-base font-semibold text-navy-900">สิ่งที่ต้องตรวจในกรมธรรม์</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-navy-700">
          {scenarioQuestions[active].map((question) => <li key={question}>{question}</li>)}
        </ul>
      </div>

      <p className="mt-5 text-sm text-navy-600">คำตอบขึ้นอยู่กับแผนและเงื่อนไขกรมธรรม์ที่คุณได้รับ</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <LineButton placement={placement} message={message} label="ถามเรื่องนี้ทาง LINE" />
        <CallButton placement={placement} showNumber />
      </div>
    </div>
  );
}
