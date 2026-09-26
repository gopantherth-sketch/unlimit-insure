import { Check } from "lucide-react";
import { purchaseCopy as c } from "@/content/purchase";
import { statusStep, timelineSteps, type ApplicationStatus } from "@/lib/applications/status";
import { cx } from "@/lib/cx";

export function Timeline({ status }: { status: ApplicationStatus }) {
  const current = statusStep[status];
  const idx = current ? timelineSteps.findIndex((s) => s.id === current) : -1;
  const done = status === "policy_issued";
  return (
    <ol className="grid gap-3 sm:grid-cols-5" aria-label="ขั้นตอนการสมัคร">
      {timelineSteps.map((s, i) => {
        const state = done || i < idx ? "done" : i === idx ? "current" : "todo";
        return (
          <li key={s.id} aria-current={state === "current" ? "step" : undefined} className={cx("flex items-start gap-3 rounded-2xl border p-3 sm:flex-col sm:gap-2", state === "current" ? "border-brand-600 bg-brand-50" : "border-navy-100 bg-white")}>
            <span
              aria-hidden
              className={cx(
                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                state === "done" && "bg-success-600 text-white",
                state === "current" && "bg-brand-600 text-white",
                state === "todo" && "bg-navy-100 text-navy-500",
              )}
            >
              {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span>
              <span className={cx("block text-sm font-semibold", state === "todo" ? "text-navy-400" : "text-navy-900")}>{c.tracking.stepLabel[s.id]}</span>
              <span className="block text-xs text-navy-400">{c.tracking.actorLabel[s.actor]}</span>
              <span className="sr-only">{state === "done" ? " (เสร็จแล้ว)" : state === "current" ? " (ขั้นตอนปัจจุบัน)" : ""}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
