import Image from "next/image";
import { contact } from "@/content/contact";
import { cx } from "@/lib/cx";

/**
 * Decorative preview of a LINE chat with Unlimit Insure. It stands in for the advisor photo until the
 * owner supplies one (photo-briefs.md §3). It shows only our own prefilled message and a typing
 * indicator: no person, no invented replies, no customer messages. Always aria-hidden.
 */
export function LineChatPreview({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cx("pointer-events-none select-none", className)}>
      <div className="overflow-hidden rounded-[28px] border border-navy-100 bg-white shadow-float">
        <div className="flex items-center gap-3 bg-line-600 px-4 py-3 text-white">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
            <Image src="/brand/unlimit-mark.webp" alt="" width={30} height={30} unoptimized />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">Unlimit Insure</span>
            <span className="block truncate text-xs text-white">{contact.lineId}</span>
          </span>
        </div>
        <div className="space-y-3 bg-[#EDF1F7] px-4 pb-5 pt-4">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#C8F2D5] px-3.5 py-2.5 text-sm leading-relaxed text-navy-900 shadow-sm">
              {contact.messages.general}
            </p>
          </div>
          <div className="flex items-end gap-2">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
              <Image src="/brand/unlimit-mark.webp" alt="" width={22} height={22} unoptimized />
            </span>
            <span className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy-300" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy-300 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-navy-300 [animation-delay:300ms]" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
