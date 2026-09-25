"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { glossary } from "@/content/glossary";
import type { GlossaryKey } from "@/content/types";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";

interface Props {
  term: GlossaryKey;
  /** Show the "อธิบายให้เข้าใจง่าย" text next to the icon. */
  withLabel?: boolean;
  className?: string;
}

export function ExplainButton({ term, withLabel = false, className }: Props) {
  const [open, setOpen] = useState(false);
  const entry = glossary[term];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          track("explain_opened", term);
        }}
        aria-haspopup="dialog"
        aria-label={withLabel ? undefined : `อธิบาย ${entry.term} ให้เข้าใจง่าย`}
        className={cx(
          "inline-flex shrink-0 items-center gap-1 rounded-full text-brand-600 transition-colors hover:text-brand-800",
          withLabel ? "px-2 py-1 text-xs font-medium hover:bg-brand-50" : "p-1 hover:bg-brand-50",
          className,
        )}
      >
        <Info aria-hidden className="h-4 w-4" />
        {withLabel && <span>อธิบายให้เข้าใจง่าย</span>}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={entry.term}>
        {entry.alias && <p className="-mt-1 mb-3 text-sm text-navy-400">{entry.alias}</p>}
        <p className="text-base font-medium leading-relaxed text-navy-800">{entry.short}</p>
        <p className="mt-3 leading-relaxed text-navy-600">{entry.explanation}</p>
        <div className="mt-5 rounded-2xl bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">ตัวอย่างสถานการณ์</p>
          <p className="mt-1.5 leading-relaxed text-navy-700">{entry.example}</p>
        </div>
        {entry.caveat && <p className="mt-4 text-sm leading-relaxed text-navy-400">{entry.caveat}</p>}
      </Dialog>
    </>
  );
}
