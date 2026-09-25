import type { Metadata } from "next";
import Link from "next/link";
import { sourceStatusLabel, sourceStatusTone, versionStatusLabel } from "@/components/admin/labels";
import { insuranceTypeLabel } from "@/lib/coverageFields";
import { getDb } from "@/lib/db/client";
import { listProductsWithVersions } from "@/lib/db/products-admin";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "แพ็กเกจ" };

export default async function ProductsPage() {
  const products = await listProductsWithVersions(await getDb());
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">แพ็กเกจ</h1>
        <p className="text-sm text-navy-500">เผยแพร่ได้เฉพาะเวอร์ชันที่ตรวจสอบแหล่งข้อมูลแล้ว</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-canvas text-left text-navy-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">แพ็กเกจ</th>
              <th scope="col" className="px-4 py-3 font-medium">บริษัท</th>
              <th scope="col" className="px-4 py-3 font-medium">ประเภท</th>
              <th scope="col" className="px-4 py-3 font-medium">เวอร์ชัน</th>
              <th scope="col" className="px-4 py-3 font-medium">แหล่งข้อมูลล่าสุด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {products.map((p) => {
              const latest = p.versions[p.versions.length - 1];
              return (
                <tr key={p.id} className="hover:bg-canvas">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-semibold text-brand-700 hover:underline">{p.name}</Link>
                    <p className="font-mono text-xs text-navy-400">{p.id}</p>
                  </td>
                  <td className="px-4 py-3">{p.insurer?.name ?? p.insurerId}</td>
                  <td className="px-4 py-3">{insuranceTypeLabel[p.insuranceType]}</td>
                  <td className="px-4 py-3">
                    {p.versions.map((v) => `v${v.version} ${versionStatusLabel[v.status]}`).join(" · ")}
                  </td>
                  <td className="px-4 py-3">
                    {latest && <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", sourceStatusTone[latest.sourceStatus])}>{sourceStatusLabel[latest.sourceStatus]}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
