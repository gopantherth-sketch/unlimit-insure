"use client";

import { Loader2, Paperclip, Upload } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
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
  const [fileName, setFileName] = useState("");
  // React resets the form after every action, so the chosen file is gone either way.
  useEffect(() => setFileName(""), [state]);
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
            onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? "")}
            className="peer sr-only"
          />
          <label
            htmlFor={`${id}-file`}
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm transition-colors hover:border-brand-300 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500"
          >
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 font-semibold text-brand-700">
              <Paperclip aria-hidden className="h-4 w-4" />
              เลือกไฟล์
            </span>
            <span className={cx("min-w-0 truncate", fileName ? "font-medium text-navy-900" : "text-navy-500")}>{fileName || "ยังไม่ได้เลือกไฟล์"}</span>
          </label>
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
