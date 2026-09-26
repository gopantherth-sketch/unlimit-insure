"use client";

import { Loader2, Upload } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { staffUploadAction, type StaffUploadState } from "@/app/admin/(app)/applications/actions";

const messages: Record<NonNullable<StaffUploadState["error"]>, string> = {
  not_found: "ไม่พบใบสมัคร",
  not_now: "ใบสมัครนี้ปิดแล้ว อัปโหลดไม่ได้",
  empty: "เลือกไฟล์ก่อน",
  too_large: "ไฟล์ใหญ่เกิน 10 MB",
  type: "รองรับเฉพาะ JPG, PNG, WEBP, HEIC หรือ PDF",
  too_many: "เอกสารครบจำนวนสูงสุดแล้ว",
  kind: "ประเภทเอกสารไม่ถูกต้อง",
};

export function StaffUploadForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(staffUploadAction, {} as StaffUploadState);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);
  return (
    <form ref={form} action={action} className="card space-y-3 p-5">
      <h2 className="font-bold">อัปโหลดเอกสาร</h2>
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="staff-kind" className="field-label">ประเภท</label>
        <select id="staff-kind" name="kind" defaultValue="policy" className="field-select">
          <option value="policy">กรมธรรม์ (ลูกค้าเห็น)</option>
          <option value="other">เอกสารอื่น</option>
        </select>
      </div>
      <div>
        <label htmlFor="staff-file" className="field-label">ไฟล์</label>
        <input id="staff-file" name="file" type="file" required accept="image/jpeg,image/png,image/webp,image/heic,application/pdf,.heic" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-700" />
      </div>
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Upload aria-hidden className="h-4 w-4" />}
        อัปโหลด
      </button>
      <p role="status" aria-live="polite" className={state.error ? "text-sm text-danger-600" : "text-sm text-success-700"}>
        {state.error ? messages[state.error] : state.ok ? "อัปโหลดแล้ว" : ""}
      </p>
    </form>
  );
}
