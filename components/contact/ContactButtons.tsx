"use client";

import { MessageCircle, Phone } from "lucide-react";
import { contact } from "@/content/contact";
import type { ContactPlacement } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import { lineAddUrl, lineMessageUrl, telHref } from "@/lib/contact";
import { cx } from "@/lib/cx";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base sm:h-14 sm:px-7",
};

const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors";

/** LINE green button. With `message`, opens a chat with that text prefilled; otherwise the add-friend screen. */
export function LineButton({
  placement,
  message,
  label = contact.labels.line,
  size = "md",
  className,
}: {
  placement: ContactPlacement;
  message?: string;
  label?: string;
  size?: Size;
  className?: string;
}) {
  return (
    <a
      href={message ? lineMessageUrl(message) : lineAddUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("contact_line", placement)}
      className={cx(base, sizes[size], "bg-[#06803b] text-white shadow-lift hover:bg-[#03702f] active:bg-[#026b2c]", className)}
    >
      <MessageCircle aria-hidden className="h-5 w-5" />
      {label}
      <span className="sr-only"> (เปิดแอป LINE)</span>
    </a>
  );
}

/** Phone button; `showNumber` prints the number as the label. */
export function CallButton({
  placement,
  showNumber = false,
  size = "md",
  variant = "outline",
  className,
}: {
  placement: ContactPlacement;
  showNumber?: boolean;
  size?: Size;
  variant?: "outline" | "solid" | "onDark";
  className?: string;
}) {
  return (
    <a
      href={telHref}
      onClick={() => track("contact_call", placement)}
      className={cx(
        base,
        sizes[size],
        variant === "solid"
          ? "bg-brand-600 text-white shadow-lift hover:bg-brand-700"
          : variant === "onDark"
            ? "border border-white/40 text-white hover:border-white/70 hover:bg-white/10"
            : "border border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-brand-50",
        className,
      )}
    >
      <Phone aria-hidden className="h-5 w-5" />
      {showNumber ? <span className="tabular">{contact.phoneDisplay}</span> : contact.labels.call}
      {!showNumber && <span className="sr-only"> {contact.phoneDisplay}</span>}
    </a>
  );
}
