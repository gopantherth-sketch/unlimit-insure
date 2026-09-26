"use client";

import { Loader2, Search } from "lucide-react";
import { useActionState } from "react";
import { lookupApplication, type LookupState } from "@/app/(site)/track/actions";

const messages: Record<NonNullable<LookupState["error"]>, string> = {
  invalid: "ตรวจเลขอ้างอิง (APP-XXXXXXXXXX) และเบอร์โทร 10 หลักอีกครั้ง",
  not_found: "ไม่พบใบสมัครที่ตรงกับเลขอ้างอิงและเบอร์โทรนี้",
  throttled: "ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่",
};

export function LookupForm() {
  const [state, action, pending] = useActionState(lookupApplication, {} as LookupState);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor="lookup-ref" className="field-label">
          เลขอ้างอิงใบสมัคร
        </label>
        <input id="lookup-ref" name="reference" defaultValue={state.reference} required autoComplete="off" placeholder="APP-XXXXXXXXXX" className="field-input uppercase" maxLength={20} />
      </div>
      <div>
        <label htmlFor="lookup-phone" className="field-label">
          เบอร์โทรที่ใช้สมัคร
        </label>
        <input id="lookup-phone" name="phone" defaultValue={state.phone} required type="tel" inputMode="tel" autoComplete="tel" placeholder="08X-XXX-XXXX" className="field-input" maxLength={20} />
      </div>
      <button type="submit" disabled={pending} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Search aria-hidden className="h-4 w-4" />}
        ค้นหาใบสมัคร
      </button>
      <p role="alert" aria-live="polite" className="text-sm text-danger-600 sm:col-span-3 empty:hidden">
        {state.error ? messages[state.error] : ""}
      </p>
    </form>
  );
}
