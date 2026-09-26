"use client";

import { Loader2, Upload } from "lucide-react";
import { useActionState, useRef } from "react";
import { uploadDocument, type UploadState } from "@/app/(site)/track/actions";
import { purchaseCopy as c } from "@/content/purchase";
import type { DocumentKind } from "@/lib/applications/status";

const messages: Record<NonNullable<UploadState["error"]>, string> = {
  no_access: "หมดเวลาการเข้าถึง กรุณาเปิดลิงก์ส่วนตัวอีกครั้ง",
  not_now: "ตอนนี้ยังอัปโหลดเอกสารประเภทนี้ไม่ได้",
  kind: "เลือกประเภทเอกสาร",
  empty: "เลือกไฟล์ก่อน",
  too_large: "ไฟล์ใหญ่เกิน 10 MB",
  type: "รองรับเฉพาะ JPG, PNG, WEBP, HEIC หรือ PDF",
  too_many: "อัปโหลดครบจำนวนสูงสุดแล้ว ติดต่อที่ปรึกษาหากต้องส่งเพิ่ม",
};

export function UploadForm({ reference, kinds, fixedKind }: { reference: string; kinds: DocumentKind[]; fixedKind?: DocumentKind }) {
  const [state, action, pending] = useActionState(uploadDocument, {} as UploadState);
  const form = useRef<HTMLFormElement>(null);
  const id = fixedKind ?? "doc";
  return (
    <form ref={form} action={action} className="space-y-3 rounded-2xl border border-dashed border-navy-200 bg-white p-4">
      <input type="hidden" name="reference" value={reference} />
      <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
        {fixedKind ? (
          <input type="hidden" name="kind" value={fixedKind} />
        ) : (
          <div>
            <label htmlFor={`${id}-kind`} className="field-label">
              ประเภทเอกสาร
            </label>
            <select id={`${id}-kind`} name="kind" className="field-select" defaultValue={kinds[0]}>
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {c.documents[k].label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor={`${id}-file`} className="field-label">
            {fixedKind ? c.documents[fixedKind].label : "ไฟล์"}
          </label>
          <input
            id={`${id}-file`}
            name="file"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.heic"
            className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700"
          />
        </div>
      </div>
      <p className="text-xs text-navy-400">{c.uploadRules}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Upload aria-hidden className="h-4 w-4" />}
          อัปโหลด
        </button>
        <p aria-live="polite" className="text-sm">
          {state.ok && <span className="text-success-700">อัปโหลดแล้ว</span>}
          {state.error && <span className="text-danger-600">{messages[state.error]}</span>}
        </p>
      </div>
    </form>
  );
}
