import { Check } from "lucide-react";
import { cx } from "@/lib/cx";

export const journeySteps = ["รถของคุณ", "การใช้งาน", "สิ่งที่สำคัญ", "แพ็กเกจ", "เปรียบเทียบ"] as const;

export function JourneySteps({ current }: { current: number }) {
  const total = journeySteps.length;
  return (
    <nav aria-label="ขั้นตอน" className="mx-auto w-full max-w-3xl">
      {/* Mobile: compact "step n of 5" line + progress bar; the list below carries the semantics. */}
      <div aria-hidden className="mb-3 flex items-baseline justify-between gap-3 sm:hidden">
        <span className="font-display text-[15px] font-semibold text-navy-900">{journeySteps[current]}</span>
        <span className="tabular text-xs font-medium text-navy-400">
          ขั้นที่ {current + 1} จาก {total}
        </span>
      </div>
      <ol className="flex items-center">
        {journeySteps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={label}
              className={cx("flex items-center", i < total - 1 && "flex-1")}
              aria-current={active ? "step" : undefined}
            >
              <span className="flex shrink-0 items-center gap-2">
                <span
                  className={cx(
                    "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors sm:h-8 sm:w-8 sm:text-[13px]",
                    done && "bg-brand-600 text-white",
                    active && "bg-brand-600 text-white ring-4 ring-brand-100",
                    !done && !active && "border border-navy-200 bg-white text-navy-400",
                  )}
                >
                  {done ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cx(
                    "hidden whitespace-nowrap text-sm md:inline",
                    active ? "font-semibold text-navy-900" : done ? "font-medium text-navy-600" : "text-navy-400",
                  )}
                >
                  {label}
                </span>
                <span className="sr-only md:hidden">{label}</span>
              </span>
              {i < total - 1 && (
                <span aria-hidden className={cx("mx-2 h-0.5 min-w-3 flex-1 rounded-full sm:mx-3", done ? "bg-brand-600" : "bg-navy-100")} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
