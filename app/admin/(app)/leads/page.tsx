import type { Metadata } from "next";
import Link from "next/link";
import { formatDateTime, leadStatusLabel, leadStatusTone } from "@/components/admin/labels";
import { getDb } from "@/lib/db/client";
import { leadStatuses, listLeads } from "@/lib/db/leads";
import type { LeadStatus } from "@/lib/db/schema";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "ลีด" };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const status = leadStatuses.find((s) => s === raw) as LeadStatus | undefined;
  const leads = await listLeads(await getDb(), { status });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ลีด</h1>
      <nav aria-label="กรองตามสถานะ" className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/leads" aria-current={!status ? "page" : undefined} className={cx("rounded-full border px-3 py-1 font-medium", !status ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 bg-white")}>
          ทั้งหมด
        </Link>
        {leadStatuses.map((s) => (
          <Link key={s} href={`/admin/leads?status=${s}`} aria-current={status === s ? "page" : undefined} className={cx("rounded-full border px-3 py-1 font-medium", status === s ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 bg-white")}>
            {leadStatusLabel[s]}
          </Link>
        ))}
      </nav>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-canvas text-left text-navy-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">อ้างอิง</th>
              <th scope="col" className="px-4 py-3 font-medium">ชื่อ</th>
              <th scope="col" className="px-4 py-3 font-medium">ติดต่อทาง</th>
              <th scope="col" className="px-4 py-3 font-medium">แผนที่สนใจ</th>
              <th scope="col" className="px-4 py-3 font-medium">สถานะ</th>
              <th scope="col" className="px-4 py-3 font-medium">รับเมื่อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-navy-500">ไม่มีลีดในสถานะนี้</td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-canvas">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/leads/${l.id}`} className="font-semibold text-brand-700 hover:underline">{l.reference}</Link>
                </td>
                <td className="px-4 py-3 font-medium">{l.name}</td>
                <td className="px-4 py-3">{l.preferredChannel === "line" ? `LINE ${l.lineId ?? ""}` : "โทรศัพท์"}</td>
                <td className="px-4 py-3 text-navy-600">{l.context.selectedPlanIds.length || "—"}</td>
                <td className="px-4 py-3">
                  <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", leadStatusTone[l.status])}>{leadStatusLabel[l.status]}</span>
                </td>
                <td className="px-4 py-3 text-navy-500">{formatDateTime(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
