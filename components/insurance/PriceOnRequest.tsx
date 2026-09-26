import { Tag } from "lucide-react";
import { LineButton } from "@/components/contact/ContactButtons";
import { contact } from "@/content/contact";
import type { ContactPlacement } from "@/lib/analytics/events";
import { cx } from "@/lib/cx";

/** Replaces a premium while prices are hidden (SHOW_PRICES = false). */
export function PriceOnRequest({
  placement,
  message,
  compact = false,
  className,
}: {
  placement: ContactPlacement;
  message: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("rounded-2xl border border-line-100 bg-gradient-to-br from-line-50 via-white to-white px-4 py-3.5", className)}>
      <div className="flex items-center gap-3">
        <span aria-hidden className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-line-600 shadow-card ring-1 ring-line-100">
          <Tag className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-navy-500">เบี้ยประกัน</p>
          <p className="font-display text-lg font-bold leading-tight text-navy-900">สอบถามราคาจริง</p>
        </div>
      </div>
      {!compact && <p className="mt-2.5 text-xs leading-relaxed text-navy-500">{contact.labels.askPriceNote}</p>}
      <LineButton placement={placement} message={message} label={contact.labels.askPrice} size="sm" className="mt-3 w-full" />
    </div>
  );
}
