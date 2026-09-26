import type { Metadata } from "next";
import Link from "next/link";
import { CarFront, ChevronRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { modelPages } from "@/content/models";
import { getCatalog } from "@/lib/server/catalog";

// Prebuilt while CATALOG_FROM_CODE is on (lib/features.ts).
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
      <PageHero
        id="models-title"
        eyebrow="Car models"
        title="ประกันรถยนต์ตามรุ่นรถ"
        body="เลือกรุ่นรถของคุณเพื่อดูสิ่งที่ควรพิจารณา และตัวอย่างแพ็กเกจสำหรับรถรุ่นนั้น"
      />
      <div className="container-page">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.brands.map((b) => {
            const models = catalog.models.filter((m) => m.brandId === b.id && withCopy.has(m.id));
            if (models.length === 0) return null;
            return (
              <section key={b.id} className="card rounded-xl2 p-5 sm:p-6">
                <h2 className="flex items-center gap-3 text-lg font-bold text-navy-900">
                  <span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-wash text-brand-600">
                    <CarFront className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span>
                    {b.name} <span className="font-sans text-sm font-normal text-navy-400">{b.nameTh}</span>
                  </span>
                </h2>
                <ul className="mt-3 divide-y divide-navy-100">
                  {models.map((m) => (
                    <li key={m.id}>
                      <Link href={`/insurance/${b.id}/${m.id}`} className="group flex min-h-[44px] items-center justify-between gap-2 py-2 font-medium text-navy-800 hover:text-brand-700">
                        ประกันรถ {b.name} {m.name}
                        <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5" />
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
