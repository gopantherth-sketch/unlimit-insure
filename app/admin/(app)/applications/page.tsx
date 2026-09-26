import type { Metadata } from "next";
import Link from "next/link";
import { applicationStatusLabel, applicationStatusTone, formatDateTime, staffActionStatuses } from "@/components/admin/labels";
import { applicationStatuses, type ApplicationStatus } from "@/lib/applications/status";
import { listAdminUsers } from "@/lib/db/admin-users";
import { countApplicationsByStatus, listApplications } from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { requireAdmin } from "@/lib/server/admin-auth";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "ใบสมัคร" };

const baht = new Intl.NumberFormat("th-TH");

export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string; view?: string }> }) {
  await requireAdmin();
  const { status: raw, view } = await searchParams;
  const status = applicationStatuses.find((s) => s === raw);
  const todo = !status && view === "todo";
  const statuses: ApplicationStatus[] | undefined = status ? [status] : todo ? staffActionStatuses : undefined;
  const db = await getDb();
  const [apps, counts, users] = await Promise.all([listApplications(db, { statuses }), countApplicationsByStatus(db), listAdminUsers(db)]);
  const userName = (id: string | null) => (id ? (users.find((u) => u.id === id)?.name ?? "—") : "—");
  const todoCount = staffActionStatuses.reduce((n, s) => n + (counts[s] ?? 0), 0);
  const pill = (active: boolean) => cx("rounded-full border px-3 py-1 font-medium", active ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 bg-white");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ใบสมัคร</h1>
      <nav aria-label="กรองตามสถานะ" className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/applications" aria-current={!status && !todo ? "page" : undefined} className={pill(!status && !todo)}>
          ทั้งหมด
        </Link>
        <Link href="/admin/applications?view=todo" aria-current={todo ? "page" : undefined} className={pill(todo)}>
          รอทีมดำเนินการ <span className="tabular font-bold">{todoCount}</span>
        </Link>
        {applicationStatuses.map((s) => (
          <Link key={s} href={`/admin/applications?status=${s}`} aria-current={status === s ? "page" : undefined} className={pill(status === s)}>
            {applicationStatusLabel[s]} <span className="tabular">{counts[s] ?? 0}</span>
          </Link>
        ))}
      </nav>
      <div tabIndex={0} role="region" aria-label="ตาราง" className="card overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-canvas text-left text-navy-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">อ้างอิง</th>
              <th scope="col" className="px-4 py-3 font-medium">ลูกค้า</th>
              <th scope="col" className="px-4 py-3 font-medium">ทะเบียน</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">เบี้ย (บาท)</th>
              <th scope="col" className="px-4 py-3 font-medium">ผู้รับผิดชอบ</th>
              <th scope="col" className="px-4 py-3 font-medium">สถานะ</th>
              <th scope="col" className="px-4 py-3 font-medium">อัปเดต</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {apps.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-navy-500">ไม่มีใบสมัครตามตัวกรองนี้</td>
              </tr>
            )}
            {apps.map((a) => (
              <tr key={a.id} className="hover:bg-canvas">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link href={`/admin/applications/${a.id}`} className="font-semibold text-brand-700 hover:underline">{a.reference}</Link>
                </td>
                <td className="px-4 py-3 font-medium">{a.customerName}</td>
                <td className="px-4 py-3 text-navy-600">{a.plateNumber} {a.province}</td>
                <td className="tabular px-4 py-3 text-right">{baht.format(a.finalPremium ?? a.estimatedPremium)}</td>
                <td className="px-4 py-3 text-navy-600">{userName(a.assignedTo)}</td>
                <td className="px-4 py-3">
                  <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", applicationStatusTone[a.status])}>{applicationStatusLabel[a.status]}</span>
                </td>
                <td className="px-4 py-3 text-navy-500">{formatDateTime(a.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
