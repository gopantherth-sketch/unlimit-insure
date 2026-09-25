import { Check, X } from "lucide-react";
import { priorityLabel } from "@/lib/priorities";
import type { MatchResult } from "@/lib/types";
import { cx } from "@/lib/cx";

export function MatchBadge({ match }: { match: MatchResult }) {
  if (match.total === 0) return null;
  const full = match.matched === match.total;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        full ? "bg-success-50 text-success-700" : "bg-brand-50 text-brand-700",
      )}
    >
      ตรงกับสิ่งที่คุณต้องการ {match.matched} จาก {match.total} ข้อ
    </span>
  );
}

export function MatchList({ match, compact = false }: { match: MatchResult; compact?: boolean }) {
  if (match.total === 0) return null;
  return (
    <ul className={cx("space-y-1.5", compact ? "text-sm" : "text-[15px]")}>
      {match.results.map((r) => (
        <li key={r.priority} className="flex items-start gap-2">
          {r.met ? (
            <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
          ) : (
            <X aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
          )}
          <span className={r.met ? "text-navy-700" : "text-navy-400"}>
            <span className="sr-only">{r.met ? "ตรง: " : "ไม่ตรง: "}</span>
            <span className="font-medium">{priorityLabel(r.priority)}</span>
            {!compact && <span className="text-navy-400"> — {r.reason}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
