"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/** Native <dialog>: focus trap, Esc to close and inert background come from the browser. */
export function Dialog({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-card bg-white p-0 text-navy-900 shadow-lift backdrop:bg-navy-900/40"
    >
      <div className="flex items-start justify-between gap-4 border-b border-navy-100 px-5 py-4 sm:px-6">
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="-mr-2 -mt-1 rounded-full p-2 text-navy-400 hover:bg-navy-50 hover:text-navy-700"
          aria-label="ปิด"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[70dvh] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
    </dialog>
  );
}
