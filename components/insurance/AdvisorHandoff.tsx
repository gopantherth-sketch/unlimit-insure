"use client";

import { CircleCheck, Loader2, LockKeyhole } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { readJourney } from "@/lib/journey";
import { track } from "@/lib/analytics/track";
import { validateLead, type ContactChannel, type LeadContext, type LeadErrors } from "@/lib/leads";
import { priorityLabel, usageLabel } from "@/lib/priorities";
import { cx } from "@/lib/cx";

interface Props {
  context: Omit<LeadContext, "viewedPlanIds" | "comparedPlanIds">;
  vehicleText: string | null;
  planNames: Record<string, string>;
}

export function AdvisorHandoff({ context, vehicleText, planNames }: Props) {
  const id = useId();
  const planName = (pid: string) => planNames[pid] ?? pid;
  const [memory, setMemory] = useState({ viewedPlanIds: [] as string[], comparedPlanIds: [] as string[] });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [channel, setChannel] = useState<ContactChannel>("phone");
  const [question, setQuestion] = useState("");
  const [consentContact, setConsentContact] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "failed" | "limited">("idle");
  const [reference, setReference] = useState("");

  useEffect(() => {
    setMemory(readJourney());
    track("advisor_viewed");
  }, []);

  const fullContext: LeadContext = { ...context, ...memory };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateLead({ name, phone, lineId, preferredChannel: channel, question, consentContact });
    setErrors(v);
    if (Object.keys(v).length > 0) {
      document.getElementById(`${id}-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          lineId: lineId.trim() || undefined,
          preferredChannel: channel,
          question: question.trim() || undefined,
          consentContact: true,
          consentMarketing,
          context: fullContext,
        }),
      });
      const data = (await res.json()) as { ok: boolean; reference?: string; errors?: LeadErrors; error?: string };
      if (res.status === 429) {
        setStatus("limited");
        return;
      }
      if (!res.ok || !data.ok) {
        if (data.errors) setErrors(data.errors);
        setStatus("failed");
        return;
      }
      setReference(data.reference ?? "");
      setStatus("done");
    } catch {
      setStatus("failed");
    }
  };

  const summary: { label: string; value: string }[] = [
    { label: "รถ", value: vehicleText ?? "ยังไม่ได้เลือก" },
    ...(context.usage ? [{ label: "การใช้งาน", value: usageLabel(context.usage) }] : []),
    { label: "สิ่งที่สำคัญ", value: context.priorities.length ? context.priorities.map(priorityLabel).join(", ") : "ยังไม่ได้เลือก" },
    ...(context.selectedPlanIds.length ? [{ label: "แผนที่สนใจ", value: context.selectedPlanIds.map(planName).join(", ") }] : []),
    ...(memory.comparedPlanIds.length ? [{ label: "เปรียบเทียบแล้ว", value: memory.comparedPlanIds.map(planName).join(", ") }] : []),
    ...(memory.viewedPlanIds.length ? [{ label: "ดูมาแล้ว", value: `${memory.viewedPlanIds.length} แผน` }] : []),
  ];

  if (status === "done") {
    return (
      <div className="card p-8 text-center" role="status">
        <CircleCheck aria-hidden className="mx-auto h-12 w-12 text-success-600" />
        <h2 className="mt-4 text-2xl font-bold">ได้รับคำขอแล้ว</h2>
        <p className="mt-2 text-navy-600">เลขอ้างอิง {reference}</p>
        <p className="mx-auto mt-4 max-w-md text-navy-600">ที่ปรึกษาจะติดต่อกลับตามช่องทางที่คุณเลือก</p>
      </div>
    );
  }

  const fieldError = (key: keyof LeadErrors) =>
    errors[key] ? (
      <p id={`${id}-${key}-err`} className="mt-1.5 text-sm text-danger-600">
        {errors[key]}
      </p>
    ) : null;
  const describedBy = (key: keyof LeadErrors) => (errors[key] ? `${id}-${key}-err` : undefined);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
      <section aria-labelledby={`${id}-ctx`} className="card p-6">
        <h2 id={`${id}-ctx`} className="text-lg font-bold">
          ข้อมูลที่ที่ปรึกษาจะเห็น
        </h2>
        <p className="mt-1 text-sm text-navy-500">คุณไม่ต้องเล่าซ้ำ ที่ปรึกษาจะเริ่มจากตรงนี้</p>
        <dl className="mt-5 space-y-3 text-[15px]">
          {summary.map((s) => (
            <div key={s.label}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-navy-400">{s.label}</dt>
              <dd className="mt-0.5 font-medium text-navy-800">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <form onSubmit={submit} noValidate className="card p-6 sm:p-8" aria-labelledby={`${id}-form`}>
        <h2 id={`${id}-form`} className="text-lg font-bold">
          ให้ที่ปรึกษาติดต่อกลับ
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-name`} className="field-label">
              ชื่อที่ให้เรียก
            </label>
            <input id={`${id}-name`} className="field-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby={describedBy("name")} />
            {fieldError("name")}
          </div>
          <div>
            <label htmlFor={`${id}-phone`} className="field-label">
              เบอร์โทรศัพท์
            </label>
            <input id={`${id}-phone`} className="field-input tabular" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="08x xxx xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} aria-describedby={describedBy("phone")} />
            {fieldError("phone")}
          </div>
          <div>
            <label htmlFor={`${id}-lineId`} className="field-label">
              LINE ID <span className="font-normal text-navy-400">(ถ้ามี)</span>
            </label>
            <input id={`${id}-lineId`} className="field-input" value={lineId} onChange={(e) => setLineId(e.target.value)} aria-invalid={!!errors.lineId} aria-describedby={describedBy("lineId")} />
            {fieldError("lineId")}
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="field-label">สะดวกให้ติดต่อทาง</legend>
            <div className="flex gap-2">
              {(["phone", "line"] as const).map((c) => (
                <label
                  key={c}
                  className={cx(
                    "inline-flex cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
                    channel === c ? "border-brand-600 bg-brand-50 text-brand-700" : "border-navy-200 text-navy-700",
                  )}
                >
                  <input type="radio" name="channel" className="sr-only" checked={channel === c} onChange={() => setChannel(c)} />
                  {c === "phone" ? "โทรศัพท์" : "LINE"}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="sm:col-span-2">
            <label htmlFor={`${id}-question`} className="field-label">
              อยากถามอะไร <span className="font-normal text-navy-400">(ถ้ามี)</span>
            </label>
            <textarea
              id={`${id}-question`}
              rows={3}
              className="field-input h-auto py-3"
              placeholder="เช่น ถ้าชนไม่มีคู่กรณีต้องจ่ายไหม?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              aria-invalid={!!errors.question}
              aria-describedby={describedBy("question")}
            />
            {fieldError("question")}
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <label className="flex items-start gap-2.5 text-navy-700">
            <input id={`${id}-consentContact`} type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" checked={consentContact} onChange={(e) => setConsentContact(e.target.checked)} aria-invalid={!!errors.consentContact} aria-describedby={describedBy("consentContact")} />
            <span>ยินยอมให้ Unlimit Insure ใช้ข้อมูลนี้เพื่อติดต่อกลับเรื่องประกันรถที่ขอคำปรึกษา (จำเป็น)</span>
          </label>
          {fieldError("consentContact")}
          <label className="flex items-start gap-2.5 text-navy-700">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" checked={consentMarketing} onChange={(e) => setConsentMarketing(e.target.checked)} />
            <span>ยินยอมรับข่าวสารและข้อเสนอ (ไม่บังคับ)</span>
          </label>
        </div>

        {status === "limited" && (
          <p role="alert" className="mt-4 text-sm font-medium text-danger-600">
            ส่งคำขอหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่
          </p>
        )}
        {status === "failed" && (
          <p role="alert" className="mt-4 text-sm font-medium text-danger-600">
            ส่งไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </p>
        )}

        <button type="submit" disabled={status === "sending"} className={buttonClass("primary", "lg", "mt-6 w-full")}>
          {status === "sending" && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          ขอให้ที่ปรึกษาติดต่อกลับ
        </button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-navy-400">
          <LockKeyhole aria-hidden className="h-3.5 w-3.5" />
          เราขอข้อมูลเท่าที่จำเป็น และใช้ตามที่คุณยินยอมเท่านั้น
        </p>
      </form>
    </div>
  );
}
