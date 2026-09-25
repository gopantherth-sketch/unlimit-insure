import { FileCheck2, LockKeyhole, PhoneOff } from "lucide-react";
import { insurers } from "@/lib/data/insurers";
import { InsurerMark } from "@/components/insurance/InsurerMark";

const credentials = [
  { icon: FileCheck2, title: "ใบอนุญาตนายหน้าประกันวินาศภัย", body: "เลขที่ใบอนุญาต: รอข้อมูลจากทีมงาน" },
  { icon: LockKeyhole, title: "ข้อมูลส่วนบุคคลตาม PDPA", body: "ขอข้อมูลเท่าที่จำเป็น เมื่อคุณพร้อมเท่านั้น" },
  { icon: PhoneOff, title: "ดูราคาได้โดยไม่ต้องให้เบอร์", body: "ไม่มีสายขายโทรตาม" },
];

export function TrustStrip() {
  return (
    <section aria-labelledby="partners-title" className="border-y border-navy-100 bg-white py-12 sm:py-14">
      <div className="container-page">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="partners-title" className="text-xl font-bold sm:text-2xl">
            บริษัทประกันที่เราร่วมงานด้วย
          </h2>
          <p className="text-sm text-navy-400">ต้นแบบ: แสดงบริษัทตัวอย่าง รอรายชื่อและโลโก้จริง</p>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {insurers.map((ins) => (
            <li key={ins.id} className="flex h-16 items-center justify-center gap-2 rounded-2xl border border-navy-100 bg-white px-3 text-sm font-semibold text-navy-600">
              <InsurerMark insurer={ins} size="sm" />
              {ins.shortName}
            </li>
          ))}
          {[1, 2, 3].map((n) => (
            <li key={n} aria-hidden className="flex h-16 items-center justify-center rounded-2xl border border-dashed border-navy-200 text-xs text-navy-300">
              พื้นที่โลโก้พันธมิตร
            </li>
          ))}
        </ul>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {credentials.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy-800">{title}</p>
                <p className="mt-0.5 text-sm text-navy-500">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
