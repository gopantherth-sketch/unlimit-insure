"use client";

import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      ref.current?.select();
    }
  };
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="private-link" className="sr-only">
        ลิงก์ส่วนตัว
      </label>
      <input id="private-link" ref={ref} readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="field-input flex-1 font-mono text-xs" />
      <button type="button" onClick={copy} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700">
        {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
        {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
      </button>
    </div>
  );
}
