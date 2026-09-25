import type { Metadata } from "next";
import Link from "next/link";
import { modelPages } from "@/content/models";
import { getCatalog } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "ประกันรถยนต์ตามรุ่นรถ",
  description: "เลือกรุ่นรถของคุณเพื่อดูสิ่งที่ควรพิจารณาและเปรียบเทียบแพ็กเกจประกันรถยนต์สำหรับรถรุ่นนั้น",
  alternates: { canonical: "/insurance" },
};

export default async function InsuranceIndexPage() {
  const catalog = await getCatalog();
  const withCopy = new Set(modelPages.map((m) => m.modelId));
  return (
    <div className="bg-canvas pb-16">
      <div className="container-page py-10 sm:py-14">
        <h1 className="text-3xl font-bold sm:text-4xl">ประกันรถยนต์ตามรุ่นรถ</h1>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.brands.map((b) => {
            const models = catalog.models.filter((m) => m.brandId === b.id && withCopy.has(m.id));
            if (models.length === 0) return null;
            return (
              <section key={b.id} className="card p-5">
                <h2 className="text-lg font-bold">{b.name} <span className="text-sm font-normal text-navy-400">{b.nameTh}</span></h2>
                <ul className="mt-3 space-y-1.5">
                  {models.map((m) => (
                    <li key={m.id}>
                      <Link href={`/insurance/${b.id}/${m.id}`} className="font-medium text-brand-700 hover:underline">
                        ประกันรถ {b.name} {m.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
