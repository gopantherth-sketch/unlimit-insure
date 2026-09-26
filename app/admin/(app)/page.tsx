import Link from "next/link";
import { leadStatusLabel, leadStatusTone, formatDateTime, staffActionStatuses } from "@/components/admin/labels";
import { countApplicationsByStatus } from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { countLeadsByStatus, leadStatuses, listLeads } from "@/lib/db/leads";
import { listProductsWithVersions } from "@/lib/db/products-admin";
import { cx } from "@/lib/cx";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ denied?: string; ok?: string }> }) {
  const { denied, ok } = await searchParams;
  const db = await getDb();
  const [counts, recent, products, appCounts] = await Promise.all([countLeadsByStatus(db), listLeads(db, { limit: 8 }), listProductsWithVersions(db), countApplicationsByStatus(db)]);
  const versions = products.flatMap((p) => p.versions);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const tiles = [
    { label: "ลีดทั้งหมด", value: total, href: "/admin/leads" },
    { label: "ลีดใหม่รอติดต่อ", value: counts.new, href: "/admin/leads?status=new" },
    { label: "ใบสมัครรอทีมดำเนินการ", value: staffActionStatuses.reduce((n, s) => n + (appCounts[s] ?? 0), 0), href: "/admin/applications?view=todo" },
    { label: "แพ็กเกจที่เผยแพร่", value: products.filter((p) => p.versions.some((v) => v.status === "published")).length, href: "/admin/products" },
    { label: "เวอร์ชันที่ยังไม่ได้ตรวจสอบแหล่งข้อมูล", value: versions.filter((v) => v.sourceStatus !== "verified").length, href: "/admin/products" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">ภาพรวม</h1>
      {denied === "owner" && (
        <p role="alert" className="rounded-xl bg-warning-50 p-3 text-sm font-medium text-warning-700">หน้านั้นสำหรับเจ้าของเท่านั้น</p>
      )}
      {ok === "password" && (
        <p role="status" className="rounded-xl bg-success-50 p-3 text-sm font-medium text-success-700">เปลี่ยนรหัสผ่านแล้ว</p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="card block p-5 hover:shadow-lift">
              <p className="text-sm text-navy-500">{t.label}</p>
              <p className="tabular mt-1 text-3xl font-bold">{t.value}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="card p-5">
        <h2 className="text-lg font-bold">ลีดตามสถานะ</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {leadStatuses.map((s) => (
            <li key={s}>
              <Link href={`/admin/leads?status=${s}`} className={cx("inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium", leadStatusTone[s])}>
                {leadStatusLabel[s]} <span className="tabular font-bold">{counts[s]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="card overflow-hidden">
        <h2 className="px-5 pt-5 text-lg font-bold">ลีดล่าสุด</h2>
        {recent.length === 0 ? (
          <p className="p-5 text-navy-500">ยังไม่มีลีด</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy-100">
            {recent.map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-canvas">
                  <span className="font-medium">{l.name}</span>
                  <span className="flex items-center gap-3 text-sm text-navy-500">
                    <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", leadStatusTone[l.status])}>{leadStatusLabel[l.status]}</span>
                    {formatDateTime(l.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
