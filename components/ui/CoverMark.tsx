import { Check, X } from "lucide-react";
import { cx } from "@/lib/cx";

/** Filled green check / red cross used in comparison tables (mockup §8). */
export function CoverMark({ covered, className }: { covered: boolean; className?: string }) {
  return covered ? (
    <span role="img" aria-label="คุ้มครอง" className={cx("inline-flex h-[22px] w-[22px] items-center justify-center rounded-full bg-success-500 text-white", className)}>
      <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  ) : (
    <span role="img" aria-label="ไม่คุ้มครอง" className={cx("inline-flex h-[22px] w-[22px] items-center justify-center text-danger-500", className)}>
      <X aria-hidden className="h-[18px] w-[18px]" strokeWidth={2.5} />
    </span>
  );
}
