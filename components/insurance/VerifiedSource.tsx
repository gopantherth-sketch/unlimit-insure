import { BadgeCheck, FlaskConical, Hourglass } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { ProductVersion } from "@/lib/types";
import { cx } from "@/lib/cx";

interface Props {
  version: Pick<ProductVersion, "source" | "effectiveFrom" | "effectiveUntil" | "version">;
  variant?: "inline" | "panel";
}

export function VerifiedSource({ version, variant = "inline" }: Props) {
  const { source } = version;
  const meta = {
    mock: { icon: FlaskConical, label: "ข้อมูลตัวอย่าง", tone: "bg-warning-50 text-warning-700" },
    pending: { icon: Hourglass, label: "รอตรวจสอบ", tone: "bg-navy-50 text-navy-600" },
    verified: { icon: BadgeCheck, label: "ตรวจสอบแล้ว", tone: "bg-success-50 text-success-700" },
  }[source.status];
  const Icon = meta.icon;

  if (variant === "inline") {
    return (
      <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", meta.tone)}>
        <Icon aria-hidden className="h-3.5 w-3.5" />
        {meta.label}
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-navy-100 bg-canvas p-4 text-sm">
      <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", meta.tone)}>
        <Icon aria-hidden className="h-3.5 w-3.5" />
        {meta.label}
      </span>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-navy-600">
        <dt className="text-navy-400">แหล่งข้อมูล</dt>
        <dd>
          {source.documentName}
          {source.page !== undefined && ` หน้า ${source.page}`}
        </dd>
        <dt className="text-navy-400">มีผล</dt>
        <dd>
          {formatDate(version.effectiveFrom)} – {formatDate(version.effectiveUntil)}
        </dd>
        <dt className="text-navy-400">เวอร์ชัน</dt>
        <dd>{version.version}</dd>
        {source.verifiedAt && (
          <>
            <dt className="text-navy-400">ตรวจสอบเมื่อ</dt>
            <dd>{formatDate(source.verifiedAt)}</dd>
          </>
        )}
      </dl>
      {source.note && <p className="mt-3 text-xs leading-relaxed text-navy-400">{source.note}</p>}
    </div>
  );
}
