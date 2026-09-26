"use client";

import { ClipboardList, MessageCircle } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { CallButton, LineButton } from "@/components/contact/ContactButtons";
import { contact } from "@/content/contact";
import { track } from "@/lib/analytics/track";
import { readJourney } from "@/lib/journey";
import type { LeadContext } from "@/lib/leads";
import { priorityLabel, usageLabel } from "@/lib/priorities";

interface Props {
  context: Omit<LeadContext, "viewedPlanIds" | "comparedPlanIds">;
  vehicleText: string | null;
  planNames: Record<string, string>;
}

/**
 * Advisor page while the back office is parked: no form, no stored lead. The customer's car and plans
 * go into a prefilled LINE message they can edit and send themselves. (The lead form is kept in
 * AdvisorHandoff.tsx for when the back office returns.)
 */
export function AdvisorContact({ context, vehicleText, planNames }: Props) {
  const id = useId();
  const planName = (pid: string) => planNames[pid] ?? pid;
  const [compared, setCompared] = useState<string[]>([]);

  useEffect(() => {
    setCompared(readJourney().comparedPlanIds);
    track("advisor_viewed");
  }, []);

  const plans = context.selectedPlanIds.length ? context.selectedPlanIds : compared;
  const message = contact.messages.plans(plans.map(planName), vehicleText);

  const summary: { label: string; value: string }[] = [
    ...(vehicleText ? [{ label: "รถ", value: vehicleText }] : []),
    ...(context.usage ? [{ label: "การใช้งาน", value: usageLabel(context.usage) }] : []),
    ...(context.priorities.length ? [{ label: "สิ่งที่สำคัญ", value: context.priorities.map(priorityLabel).join(", ") }] : []),
    ...(plans.length ? [{ label: "แผนที่สนใจ", value: plans.map(planName).join(", ") }] : []),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-8">
      <section aria-labelledby={`${id}-contact`} className="card rounded-xl2 border-white p-6 shadow-float sm:p-8">
        <span aria-hidden className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#06C755]/10 text-[#06C755]">
          <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <h2 id={`${id}-contact`} className="mt-4 text-xl font-bold text-navy-900">
          คุยกับที่ปรึกษาทาง LINE หรือโทร
        </h2>
        <p className="mt-1 text-[15px] leading-relaxed text-navy-600">
          ทักมาทาง LINE <span className="font-semibold text-navy-800">{contact.lineId}</span> หรือโทร{" "}
          <span className="tabular font-semibold text-navy-800">{contact.phoneDisplay}</span> เพื่อขอราคาจริงและคำแนะนำ ไม่มีค่าใช้จ่าย
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <LineButton placement="advisor" message={message} label="ส่งข้อมูลทาง LINE" size="lg" className="w-full" />
          <CallButton placement="advisor" showNumber size="lg" className="w-full" />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-navy-400">
          ปุ่ม LINE จะเปิดแชตพร้อมข้อความที่เตรียมไว้ให้ คุณแก้ไขได้ก่อนกดส่ง เราไม่ได้เก็บข้อมูลจากหน้านี้
        </p>
      </section>

      {summary.length > 0 && (
        <section aria-labelledby={`${id}-ctx`} className="rounded-xl2 border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-6 shadow-card sm:p-7">
          <span aria-hidden className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card">
            <ClipboardList className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <h2 id={`${id}-ctx`} className="mt-4 text-xl font-bold text-navy-900">
            ข้อมูลที่จะส่งไปกับข้อความ
          </h2>
          <p className="mt-1 text-sm text-navy-500">คุณไม่ต้องเล่าซ้ำ ที่ปรึกษาจะเริ่มจากตรงนี้</p>
          <dl className="mt-5 divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white px-4 text-[15px]">
            {summary.map((s) => (
              <div key={s.label} className="py-3">
                <dt className="text-xs font-medium text-navy-400">{s.label}</dt>
                <dd className="mt-0.5 font-medium text-navy-800">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
