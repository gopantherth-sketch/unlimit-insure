"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { CarFront, Loader2, ShieldCheck, TriangleAlert, UserRound, type LucideIcon } from "lucide-react";
import { submitApplication, type BuyState } from "@/app/(site)/buy/actions";
import { buttonClass } from "@/components/ui/button";
import { purchaseCopy as c } from "@/content/purchase";
import type { BuyField } from "@/lib/applications/validate";
import { provinces } from "@/lib/data/provinces";
import { cx } from "@/lib/cx";

interface Props {
  productId: string;
  vehicle: { brandId: string; modelId: string; year: number };
  startMin: string;
  startMax: string;
  advisorHref: string;
}

const initial: BuyState = { errors: {}, values: {} };

function SectionTitle({ id, n, icon: Icon, children }: { id: string; n: number; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-3 text-lg font-bold">
      <span aria-hidden className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-wider text-brand-600">ส่วนที่ {n} จาก 3</span>
        {children}
      </span>
    </h2>
  );
}

function Field({ id, label, hint, error, children }: { id: BuyField; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-sm text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-navy-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function BuyForm({ productId, vehicle, startMin, startMax, advisorHref }: Props) {
  const [state, action, pending] = useActionState(submitApplication, initial);
  const v = state.values;
  const err = (k: BuyField) => state.errors[k];
  const described = (k: BuyField) => (err(k) ? `${k}-err` : `${k}-hint`);
  // Tell commercial users straight away instead of after a submit.
  const [commercial, setCommercial] = useState(v.commercialUse === "yes");
  useEffect(() => setCommercial(v.commercialUse === "yes"), [v.commercialUse]);

  return (
    <form action={action} noValidate className="space-y-6">
      {/* Wrapped in [hidden] so space-y doesn't push the first card down. */}
      <div hidden>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="brand" value={vehicle.brandId} />
        <input type="hidden" name="model" value={vehicle.modelId} />
        <input type="hidden" name="year" value={vehicle.year} />
      </div>

      {state.errors.form && (
        <p role="alert" className="flex items-start gap-2 rounded-2xl bg-danger-50 p-4 text-sm font-medium text-danger-600">
          <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {state.errors.form === "rate_limited"
            ? "ส่งใบสมัครหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่"
            : "แผนนี้ไม่พร้อมให้สมัครสำหรับรถคันนี้แล้ว กรุณากลับไปเลือกแผนอีกครั้ง"}
        </p>
      )}

      <section aria-labelledby="sec-customer" className="card space-y-4 p-5 sm:p-7">
        <SectionTitle id="sec-customer" n={1} icon={UserRound}>{c.sections.customer}</SectionTitle>
        <Field id="customerName" error={err("customerName")} label="ชื่อ-นามสกุล" hint={c.fieldHints.name}>
          <input id="customerName" name="customerName" defaultValue={v.customerName} autoComplete="name" required className="field-input" aria-invalid={!!err("customerName")} aria-describedby={described("customerName")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="phone" error={err("phone")} label="เบอร์โทรศัพท์" hint={c.fieldHints.phone}>
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" defaultValue={v.phone} required className="field-input tabular" aria-invalid={!!err("phone")} aria-describedby={described("phone")} />
          </Field>
          <Field id="email" error={err("email")} label="อีเมล (ไม่บังคับ)" hint={c.fieldHints.email}>
            <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} className="field-input" aria-invalid={!!err("email")} aria-describedby={described("email")} />
          </Field>
        </div>
        <Field id="address" error={err("address")} label="ที่อยู่" hint={c.fieldHints.address}>
          <textarea id="address" name="address" rows={3} autoComplete="street-address" defaultValue={v.address} required className="field-input h-auto py-3" aria-invalid={!!err("address")} aria-describedby={described("address")} />
        </Field>
      </section>

      <section aria-labelledby="sec-vehicle" className="card space-y-4 p-5 sm:p-7">
        <SectionTitle id="sec-vehicle" n={2} icon={CarFront}>{c.sections.vehicle}</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="plateNumber" error={err("plateNumber")} label="เลขทะเบียนรถ" hint={c.fieldHints.plate}>
            <input id="plateNumber" name="plateNumber" defaultValue={v.plateNumber} required className="field-input" aria-invalid={!!err("plateNumber")} aria-describedby={described("plateNumber")} />
          </Field>
          <Field id="province" error={err("province")} label="จังหวัด" hint={c.fieldHints.province}>
            <select id="province" name="province" defaultValue={v.province ?? ""} required className="field-select" aria-invalid={!!err("province")} aria-describedby={described("province")}>
              <option value="">เลือกจังหวัด</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field id="coverageStart" error={err("coverageStart")} label="วันเริ่มคุ้มครองที่ต้องการ" hint={c.fieldHints.startDate}>
          <input id="coverageStart" name="coverageStart" type="date" min={startMin} max={startMax} defaultValue={v.coverageStart ?? startMin} required className="field-input tabular sm:max-w-xs" aria-invalid={!!err("coverageStart")} aria-describedby={described("coverageStart")} />
        </Field>
        <fieldset aria-describedby="commercialUse-hint">
          <legend className="field-label">รถคันนี้ใช้เชิงพาณิชย์หรือไม่</legend>
          <p id="commercialUse-hint" className="mb-2 text-xs text-navy-400">{c.fieldHints.commercialUse}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "no", label: "ไม่ใช่ ใช้ส่วนตัว" },
              { value: "yes", label: "ใช่ ใช้เชิงพาณิชย์" },
            ].map((o) => (
              <label key={o.value} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-sm font-medium has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500">
                <input type="radio" name="commercialUse" value={o.value} defaultChecked={v.commercialUse === o.value} onChange={() => setCommercial(o.value === "yes")} className="h-4 w-4 accent-brand-600" />
                {o.label}
              </label>
            ))}
          </div>
          {commercial || err("commercialUse") === "commercial" ? (
            <p role="alert" className="mt-3 rounded-2xl bg-warning-50 p-4 text-sm text-warning-700">
              {c.commercialUseBlocked}{" "}
              <Link href={advisorHref} className="font-semibold underline">
                คุยกับที่ปรึกษา
              </Link>
            </p>
          ) : err("commercialUse") ? (
            <p className="mt-1.5 text-sm text-danger-600">{err("commercialUse")}</p>
          ) : null}
        </fieldset>
      </section>

      <section aria-labelledby="sec-consent" className="card space-y-4 p-5 sm:p-7">
        <SectionTitle id="sec-consent" n={3} icon={ShieldCheck}>{c.sections.consent}</SectionTitle>
        <ul className="list-disc space-y-1.5 rounded-2xl bg-canvas p-4 pl-8 text-sm leading-relaxed text-navy-700">
          {c.disclosures.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {(
          [
            ["consentData", c.consents.dataProcessing],
            ["consentInsurer", c.consents.shareWithInsurer],
            ["consentTruthful", c.consents.truthful],
          ] as const
        ).map(([k, text]) => (
          <div key={k}>
            <label className={cx("flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-navy-700 rounded-xl border p-3 transition-colors hover:border-brand-200 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50/60", err(k) ? "border-danger-500" : "border-navy-100")}>
              <input id={k} name={k} type="checkbox" defaultChecked={!!v[k]} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" aria-invalid={!!err(k)} aria-describedby={err(k) ? `${k}-err` : undefined} />
              <span>{text}</span>
            </label>
            {err(k) && (
              <p id={`${k}-err`} className="mt-1 pl-3 text-sm text-danger-600">
                {err(k)}
              </p>
            )}
          </div>
        ))}
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-navy-700 rounded-xl border border-navy-100 p-3 transition-colors hover:border-brand-200 has-[:checked]:border-brand-300 has-[:checked]:bg-brand-50/60">
          <input name="consentMarketing" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" />
          <span>{c.consents.marketing}</span>
        </label>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={advisorHref} className={buttonClass("ghost", "md")}>
          อยากคุยกับที่ปรึกษาก่อน
        </Link>
        <button type="submit" disabled={pending || commercial} className={buttonClass("primary", "lg", "w-full sm:w-auto sm:min-w-64")}>
          {pending && <Loader2 aria-hidden className="h-5 w-5 animate-spin" />}
          {c.submitLabel}
        </button>
      </div>
    </form>
  );
}
