"use client";

import { RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { CallButton, LineButton } from "@/components/contact/ContactButtons";
import { contact } from "@/content/contact";
import { isStaleBuildError, reloadForStaleBuild } from "@/lib/stale-build";

/** Friendly error page for public pages, with an automatic reload when the tab is on an old build. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (isStaleBuildError(error) && reloadForStaleBuild()) setReloading(true);
  }, [error]);

  if (reloading) {
    return (
      <div className="container-page py-24 text-center text-navy-500" role="status">
        กำลังโหลดหน้าเว็บเวอร์ชันล่าสุด…
      </div>
    );
  }

  return (
    <div className="container-page max-w-xl py-20 text-center">
      <h1 className="text-[26px] font-bold text-navy-900">หน้านี้โหลดไม่สำเร็จ</h1>
      <p className="mt-3 text-navy-600">ลองโหลดใหม่อีกครั้ง หรือทักมาทาง LINE ที่ปรึกษาช่วยได้ทันที</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            reset();
            window.location.reload();
          }}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-200 bg-white px-5 font-semibold text-brand-700 hover:bg-brand-50"
        >
          <RotateCw aria-hidden className="h-5 w-5" />
          โหลดใหม่
        </button>
        <LineButton placement="advisor" message={contact.messages.general} label={contact.labels.lineLong} />
        <CallButton placement="advisor" />
      </div>
    </div>
  );
}
