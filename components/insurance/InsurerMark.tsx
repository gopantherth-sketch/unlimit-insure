import type { Insurer } from "@/lib/types";
import { cx } from "@/lib/cx";

/** Placeholder insurer mark until official logos are supplied. */
export function InsurerMark({ insurer, size = "md" }: { insurer: Insurer; size?: "sm" | "md" }) {
  const letter = insurer.shortName.slice(-1);
  return (
    <span
      aria-hidden
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-bold text-white",
        size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11 text-base",
      )}
      style={{ backgroundColor: insurer.accent }}
    >
      {letter}
    </span>
  );
}
