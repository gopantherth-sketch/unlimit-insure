import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, CarFront, FileText, Headset, LifeBuoy, RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { PageHero } from "@/components/ui/PageHero";

export const metadata: Metadata = seo("/garage");

const vehicles = [
  { name: "Toyota Corolla Cross", plate: "กข 1234", status: "active" as const, note: "คุ้มครองถึง 24 ก.ย. 2570" },
  { name: "Honda City", plate: "1กก 5678", status: "renewal" as const, note: "ต่ออายุภายใน 32 วัน" },
  { name: "BYD Sealion 6", plate: "—", status: "none" as const, note: "ยังไม่ได้เชื่อมกรมธรรม์" },
];

const statusMeta = {
  active: { label: "คุ้มครองอยู่", icon: ShieldCheck, tone: "bg-success-50 text-success-700" },
  renewal: { label: "ใกล้ครบกำหนด", icon: TriangleAlert, tone: "bg-warning-50 text-warning-700" },
  none: { label: "ไม่มีกรมธรรม์", icon: CalendarClock, tone: "bg-navy-50 text-navy-600" },
};

const actions = [
  { icon: FileText, label: "กรมธรรม์และเอกสาร" },
  { icon: ShieldCheck, label: "ดูความคุ้มครอง" },
  { icon: LifeBuoy, label: "ขั้นตอนเคลม", href: "/claims" },
  { icon: RefreshCw, label: "เปรียบเทียบการต่ออายุ" },
  { icon: Headset, label: "ติดต่อที่ปรึกษา" },
];

const timeline = [
  { label: "ชำระเงินแล้ว", state: "done" },
  { label: "ตรวจสอบเอกสาร", state: "current" },
  { label: "บริษัทประกันอนุมัติ", state: "todo" },
  { label: "ออกกรมธรรม์", state: "todo" },
  { label: "กรมธรรม์พร้อมใช้งาน", state: "todo" },
] as const;

export default function GaragePage() {
  return (
    <div className="bg-canvas pb-16">
      <PageHero
        id="garage-title"
        eyebrow={
          <span className="flex flex-wrap items-center gap-3">
            My Garage
            <span className="rounded-full bg-warning-50 px-2.5 py-1 text-xs font-medium normal-case tracking-normal text-warning-700">ตัวอย่างหน้าจอ เปิดใช้ในระยะถัดไป</span>
          </span>
        }
        title="รถและกรมธรรม์ของคุณ ในที่เดียว"
        body="ก่อนซื้อเราอธิบาย หลังซื้อเรายังดูแล ดูสถานะ เอกสาร ขั้นตอนเคลม และการต่ออายุได้ในที่เดียว"
      />
      <div className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="cars" className="space-y-4">
            <h2 id="cars" className="sr-only">
              รถของคุณ
            </h2>
            {vehicles.map((v) => {
              const m = statusMeta[v.status];
              const Icon = m.icon;
              return (
                <div key={v.name} className="card flex flex-col gap-4 rounded-xl2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-4">
                    <span aria-hidden className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-wash text-brand-600">
                      <CarFront className="h-6 w-6" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="font-display text-lg font-semibold text-navy-900">{v.name}</p>
                      <p className="text-sm text-navy-500">{v.plate}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${m.tone}`}>
                      <Icon aria-hidden className="h-4 w-4" />
                      {m.label}
                    </span>
                    <span className="text-sm text-navy-500">{v.note}</span>
                  </div>
                </div>
              );
            })}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {actions.map(({ icon: Icon, label, ...rest }) => {
                const href = "href" in rest ? rest.href : undefined;
                const inner = (
                  <>
                    <Icon aria-hidden className="h-6 w-6 shrink-0 text-brand-600" strokeWidth={1.5} />
                    {label}
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <Link href={href} className="card flex h-full min-h-[64px] items-center gap-2.5 p-4 text-sm font-medium text-brand-700 hover:shadow-lift">{inner}</Link>
                    ) : (
                      <span className="card flex h-full min-h-[64px] items-center gap-2.5 p-4 text-sm font-medium text-navy-700">{inner}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="timeline" className="card rounded-xl2 p-6 sm:p-7 lg:self-start">
            <h2 id="timeline" className="text-xl font-bold text-navy-900">
              สถานะการสมัคร
            </h2>
            <p className="mt-1 text-sm text-navy-500">บอกชัดว่าตอนนี้อยู่ขั้นไหน</p>
            <ol className="mt-6 space-y-0">
              {timeline.map((t, i) => (
                <li key={t.label} className="relative flex gap-3 pb-6 last:pb-0">
                  {i < timeline.length - 1 && <span aria-hidden className="absolute left-[11px] top-6 h-full w-px bg-navy-200" />}
                  <span
                    aria-hidden
                    className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${
                      t.state === "done" ? "border-success-600 bg-success-600" : t.state === "current" ? "border-brand-600 bg-white ring-4 ring-brand-100" : "border-navy-200 bg-white"
                    }`}
                  />
                  <span className={t.state === "todo" ? "text-navy-400" : "font-semibold text-navy-900"}>
                    {t.label}
                    <span className="sr-only">{t.state === "done" ? " (เสร็จแล้ว)" : t.state === "current" ? " (กำลังดำเนินการ)" : ""}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="mt-10 text-center">
          <Link href="/quote" className={buttonClass("primary", "lg", "rounded-xl px-8")}>
            เริ่มจากรถของคุณ
          </Link>
        </div>
      </div>
    </div>
  );
}
