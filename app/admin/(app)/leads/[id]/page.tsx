import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { addNote, changeLeadStatus } from "@/app/admin/(app)/actions";
import { formatDateTime, leadStatusLabel, leadStatusTone } from "@/components/admin/labels";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import { getLead, leadStatuses } from "@/lib/db/leads";
import { priorityLabel, usageLabel } from "@/lib/priorities";
import { getCatalog } from "@/lib/server/catalog";
import type { PriorityId, UsageId } from "@/lib/types";
import { resolveVehicle, vehicleLabel } from "@/lib/vehicle";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "รายละเอียดลีด" };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, catalog] = await Promise.all([getLead(await getDb(), id), getCatalog()]);
  if (!data) notFound();
  const { lead, consents, activities } = data;
  const ctx = lead.context;
  const vehicle = ctx.vehicle ? resolveVehicle(catalog, ctx.vehicle) : null;
  const plan = (pid: string) => catalog.products.find((p) => p.id === pid)?.name ?? pid;
  const planList = (ids: string[]) => (ids.length ? ids.map(plan).join(", ") : "—");

  const rows: [string, string][] = [
    ["รถ", vehicle ? vehicleLabel(vehicle) : ctx.vehicle ? `${ctx.vehicle.modelId} ${ctx.vehicle.year}` : "—"],
    ["การใช้งาน", ctx.usage ? usageLabel(ctx.usage as UsageId) : "—"],
    ["สิ่งที่สำคัญ", ctx.priorities.length ? ctx.priorities.map((p) => priorityLabel(p as PriorityId)).join(", ") : "—"],
    ["แผนที่เลือก", planList(ctx.selectedPlanIds)],
    ["เปรียบเทียบแล้ว", planList(ctx.comparedPlanIds)],
    ["ดูมาแล้ว", `${ctx.viewedPlanIds.length} แผน`],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        <ArrowLeft aria-hidden className="h-4 w-4" /> ลีดทั้งหมด
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{lead.name}</h1>
        <span className={cx("rounded-full px-3 py-1 text-xs font-semibold", leadStatusTone[lead.status])}>{leadStatusLabel[lead.status]}</span>
        <span className="font-mono text-xs text-navy-400">{lead.reference}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-bold">ติดต่อ</h2>
            <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-navy-500">โทรศัพท์</dt>
              <dd className="font-mono">{lead.phone}</dd>
              <dt className="text-navy-500">LINE</dt>
              <dd>{lead.lineId ?? "—"}</dd>
              <dt className="text-navy-500">สะดวกทาง</dt>
              <dd>{lead.preferredChannel === "line" ? "LINE" : "โทรศัพท์"}</dd>
              <dt className="text-navy-500">คำถาม</dt>
              <dd className="whitespace-pre-wrap">{lead.question ?? "—"}</dd>
            </dl>
          </section>
          <section className="card p-5">
            <h2 className="font-bold">เส้นทางของลูกค้า</h2>
            <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-navy-500">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="card p-5">
            <h2 className="font-bold">ความยินยอม</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {consents.map((c) => (
                <li key={c.id} className="flex flex-wrap items-start justify-between gap-2">
                  <span>
                    <span className={cx("mr-2 rounded-full px-2 py-0.5 text-xs font-semibold", c.granted ? "bg-success-50 text-success-700" : "bg-navy-100 text-navy-600")}>
                      {c.granted ? "ยินยอม" : "ไม่ยินยอม"}
                    </span>
                    {c.purpose === "contact" ? "ติดต่อกลับ" : "การตลาด"} — <span className="text-navy-500">{c.wording}</span>
                  </span>
                  <span className="text-xs text-navy-400">
                    v{c.wordingVersion} · {formatDateTime(c.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <form action={changeLeadStatus} className="card space-y-3 p-5">
            <input type="hidden" name="id" value={lead.id} />
            <label htmlFor="status" className="field-label">เปลี่ยนสถานะ</label>
            <select id="status" name="status" defaultValue={lead.status} className="field-select">
              {leadStatuses.map((s) => (
                <option key={s} value={s}>{leadStatusLabel[s]}</option>
              ))}
            </select>
            <button type="submit" className={buttonClass("primary", "sm")}>บันทึกสถานะ</button>
          </form>
          <form action={addNote} className="card space-y-3 p-5">
            <input type="hidden" name="id" value={lead.id} />
            <label htmlFor="note" className="field-label">เพิ่มบันทึก</label>
            <textarea id="note" name="note" rows={3} required maxLength={2000} className="field-input h-auto py-2" />
            <button type="submit" className={buttonClass("secondary", "sm")}>เพิ่มบันทึก</button>
          </form>
          <section className="card p-5">
            <h2 className="font-bold">กิจกรรม</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {activities.map((a) => (
                <li key={a.id} className="border-l-2 border-navy-100 pl-3">
                  <p className="font-medium">{a.type === "created" ? "รับลีด" : a.type === "status_changed" ? `สถานะ: ${a.note}` : a.note}</p>
                  <p className="text-xs text-navy-400">
                    {a.actor} · {formatDateTime(a.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
