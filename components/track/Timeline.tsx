import { Check } from "lucide-react";
import { purchaseCopy as c } from "@/content/purchase";
import { statusStep, timelineSteps, type ApplicationStatus } from "@/lib/applications/status";
import { cx } from "@/lib/cx";

export function Timeline({ status }: { status: ApplicationStatus }) {
  const current = statusStep[status];
  const idx = current ? timelineSteps.findIndex((s) => s.id === current) : -1;
  const done = status === "policy_issued";
  const stateOf = (i: number) => (done || i < idx ? "done" : i === idx ? "current" : "todo");
  const now = idx >= 0 ? timelineSteps[idx] : null;
  return (
    <div>
      {/* Mobile: compact progress bar + current step. The full list below is for sm and up. */}
      <div className="rounded-2xl border border-navy-100 bg-white p-4 sm:hidden">
        <div aria-hidden className="flex gap-1.5">
          {timelineSteps.map((s, i) => (
            <span key={s.id} className={cx("h-1.5 flex-1 rounded-full", stateOf(i) === "done" ? "bg-success-600" : stateOf(i) === "current" ? "bg-brand-600" : "bg-navy-100")} />
          ))}
        </div>
        {now && (
          <p className="mt-3 text-sm">
            <span className="text-navy-500">{c.tracking.stepOf.replace("{n}", String(idx + 1)).replace("{total}", String(timelineSteps.length))} · </span>
            <span className="font-semibold text-navy-900">{done ? c.tracking.stepLabel.issued : c.tracking.stepLabel[now.id]}</span>
            <span className="text-navy-500"> · {c.tracking.actorLabel[now.actor]}</span>
          </p>
        )}
      </div>
      <ol className="hidden gap-3 sm:grid sm:grid-cols-5" aria-label="ขั้นตอนการสมัคร">
        {timelineSteps.map((s, i) => {
          const state = stateOf(i);
          return (
            <li key={s.id} aria-current={state === "current" ? "step" : undefined} className={cx("relative flex flex-col gap-2 rounded-2xl border p-3", state === "current" ? "border-brand-600 bg-brand-50 shadow-card" : "border-navy-100 bg-white")}>
              <span
                aria-hidden
                className={cx(
                  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  state === "done" && "bg-success-600 text-white",
                  state === "current" && "bg-brand-600 text-white ring-4 ring-brand-100",
                  state === "todo" && "bg-navy-100 text-navy-500",
                )}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span>
                <span className={cx("block text-sm font-semibold leading-snug", state === "todo" ? "text-navy-500" : "text-navy-900")}>{c.tracking.stepLabel[s.id]}</span>
                <span className="block text-xs text-navy-500">{c.tracking.actorLabel[s.actor]}</span>
                <span className="sr-only">{state === "done" ? " (เสร็จแล้ว)" : state === "current" ? " (ขั้นตอนปัจจุบัน)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
