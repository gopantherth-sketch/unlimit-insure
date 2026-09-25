import { Check } from "lucide-react";
import { cx } from "@/lib/cx";

export const journeySteps = ["รถของคุณ", "การใช้งาน", "สิ่งที่สำคัญ", "แพ็กเกจ", "เปรียบเทียบ"] as const;

export function JourneySteps({ current }: { current: number }) {
  return (
    <nav aria-label="ขั้นตอน">
      <ol className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium sm:gap-2 sm:text-sm">
        {journeySteps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cx(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
                  done && "bg-brand-600 text-white",
                  active && "bg-brand-600 text-white ring-4 ring-brand-100",
                  !done && !active && "bg-navy-100 text-navy-500",
                )}
              >
                {done ? <Check aria-hidden className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={cx(active ? "text-navy-900" : "text-navy-400", !active && "hidden sm:inline")}>{label}</span>
              {i < journeySteps.length - 1 && <span aria-hidden className="h-px w-4 bg-navy-200 sm:w-8" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
