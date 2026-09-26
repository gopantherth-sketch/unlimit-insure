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
    <div className={cx("rounded-2xl bg-wash px-4 py-3.5", className)}>
      <p className="text-xs font-medium text-navy-500">เบี้ยประกัน</p>
      <p className="mt-0.5 font-display text-lg font-bold text-navy-900">สอบถามราคาจริง</p>
      {!compact && <p className="mt-1 text-xs leading-snug text-navy-500">{contact.labels.askPriceNote}</p>}
      <LineButton placement={placement} message={message} label={contact.labels.askPrice} size="sm" className="mt-3 w-full" />
    </div>
  );
}
