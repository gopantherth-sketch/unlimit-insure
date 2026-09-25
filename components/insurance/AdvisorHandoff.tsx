"use client";

import { CircleCheck, ClipboardList, Loader2, LockKeyhole, MessageCircle, Phone } from "lucide-react";
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
      <div className="card mx-auto max-w-2xl rounded-xl2 border-white p-8 text-center shadow-float sm:p-12" role="status">
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
          <CircleCheck aria-hidden className="h-9 w-9 text-success-600" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 text-[26px] font-bold text-navy-900">ได้รับคำขอแล้ว</h2>
        <p className="mt-3 inline-flex rounded-full bg-wash px-4 py-1.5 text-sm text-navy-600">
          เลขอ้างอิง <span className="tabular ml-1 font-semibold text-navy-900">{reference}</span>
        </p>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-navy-600">ที่ปรึกษาจะติดต่อกลับตามช่องทางที่คุณเลือก ไม่ต้องเตรียมอะไรเพิ่ม</p>
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
    <div className="grid gap-6 lg:grid-cols-[1fr_1.35fr] lg:items-start lg:gap-8">
      <section aria-labelledby={`${id}-ctx`} className="rounded-xl2 border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-6 shadow-card sm:p-7">
        <span aria-hidden className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card">
          <ClipboardList className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <h2 id={`${id}-ctx`} className="mt-4 text-xl font-bold text-navy-900">
          ข้อมูลที่ที่ปรึกษาจะเห็น
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

      <form onSubmit={submit} noValidate className="card rounded-xl2 border-white p-6 shadow-float sm:p-8" aria-labelledby={`${id}-form`}>
        <h2 id={`${id}-form`} className="text-xl font-bold text-navy-900">
          ให้ที่ปรึกษาติดต่อกลับ
        </h2>
        <p className="mt-1 text-sm text-navy-500">จำเป็นแค่ชื่อ เบอร์โทร และความยินยอม ช่องอื่นไม่บังคับ</p>
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
                    "inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
                    channel === c ? "border-brand-600 bg-brand-50 text-brand-700" : "border-navy-200 bg-white text-navy-700 hover:border-brand-300",
                  )}
                >
                  <input type="radio" name="channel" className="sr-only" checked={channel === c} onChange={() => setChannel(c)} />
                  {c === "phone" ? <Phone aria-hidden className="h-4 w-4" /> : <MessageCircle aria-hidden className="h-4 w-4" />}
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

        <div className="mt-6 space-y-3 rounded-2xl bg-wash p-4 text-sm">
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
          <p role="alert" className="mt-4 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
            ส่งคำขอหลายครั้งติดกัน รอสักครู่แล้วลองใหม่
          </p>
        )}
        {status === "failed" && (
          <p role="alert" className="mt-4 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
            ส่งไม่สำเร็จ ลองอีกครั้ง หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
          </p>
        )}

        <button type="submit" disabled={status === "sending"} className={buttonClass("primary", "lg", "mt-6 w-full rounded-xl")}>
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
