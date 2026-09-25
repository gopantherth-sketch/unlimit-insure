import Link from "next/link";
import { ArrowRight, FileText, Headset, LifeBuoy, RefreshCw, Warehouse } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { homeCopy } from "@/content/home";

const icons = [Warehouse, LifeBuoy, RefreshCw, Headset];

export function AfterPurchase() {
  return (
    <section aria-labelledby="after-title" className="bg-wash py-16 sm:py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <SectionHeading id="after-title" eyebrow="After you buy" title={homeCopy.afterTitle} body={homeCopy.afterBody} />
          <ul className="grid gap-4 sm:grid-cols-2">
            {homeCopy.afterPoints.map((p, i) => {
              const Icon = icons[i] ?? Warehouse;
              return (
                <li key={p.title} className="flex gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
                    <Icon aria-hidden className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900">{p.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-navy-500">{p.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white bg-white p-6 shadow-float sm:p-7">
          <span className="absolute right-5 top-5 rounded-full bg-warning-50 px-2.5 py-1 text-xs font-medium text-warning-700">ตัวอย่างหน้าจอ</span>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">My Garage</p>
          <p className="mt-2 font-display text-xl font-bold">Toyota Corolla Cross</p>
          <p className="text-sm text-navy-500">กข 1234 กรุงเทพมหานคร</p>
          <dl className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-success-50 p-4">
              <dt className="text-xs text-success-700">สถานะประกัน</dt>
              <dd className="mt-1 font-bold text-success-700">คุ้มครองอยู่</dd>
            </div>
            <div className="rounded-2xl bg-brand-50 p-4">
              <dt className="text-xs text-brand-700">ต่ออายุในอีก</dt>
              <dd className="tabular mt-1 font-bold text-brand-700">142 วัน</dd>
            </div>
          </dl>
          <ul className="mt-5 grid grid-cols-2 gap-2 text-sm font-medium text-navy-700">
            {[
              { icon: FileText, label: "กรมธรรม์" },
              { icon: LifeBuoy, label: "ขั้นตอนเคลม" },
              { icon: RefreshCw, label: "ต่อประกัน" },
              { icon: Headset, label: "ขอความช่วยเหลือ" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 rounded-xl border border-navy-100 px-3 py-2.5">
                <Icon aria-hidden className="h-4 w-4 text-brand-600" />
                {label}
              </li>
            ))}
          </ul>
          <Link href="/garage" className="link-arrow mt-5">
            ดูตัวอย่าง My Garage
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
