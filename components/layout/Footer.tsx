import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { homeCopy } from "@/content/home";

const columns = [
  {
    title: "ประกันรถ",
    links: [
      { href: "/quote", label: "เช็กเบี้ยประกันรถ" },
      { href: "/compare", label: "เปรียบเทียบแพ็กเกจ" },
      { href: "/lab/ev-insurance", label: "ประกันรถ EV" },
      { href: "/insurance", label: "ประกันรถตามรุ่น" },
    ],
  },
  {
    title: "เข้าใจประกัน",
    links: [
      { href: "/lab", label: "Insurance Lab" },
      { href: "/lab/type1-vs-2plus", label: "ชั้น 1 กับ 2+ ต่างกันอย่างไร" },
      { href: "/#faq", label: "คำถามที่พบบ่อย" },
    ],
  },
  {
    title: "หลังการซื้อ",
    links: [
      { href: "/garage", label: "My Garage" },
      { href: "/claims", label: "ขั้นตอนเมื่อเกิดเหตุ" },
      { href: "/advisor", label: "ปรึกษาผู้เชี่ยวชาญ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-navy-100 bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.3fr_2fr] md:py-14">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-navy-500">{homeCopy.footerTagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold text-navy-900">{col.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-navy-500 hover:text-brand-700">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-navy-900 text-navy-200">
        <div className="container-page flex flex-col gap-2 py-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} Unlimit Insure</span>
            <Link href="/privacy" className="hover:text-white">นโยบายความเป็นส่วนตัว</Link>
            <Link href="/terms" className="hover:text-white">ข้อกำหนดการใช้งาน</Link>
          </p>
          <p>ต้นแบบระบบ — ข้อมูลแพ็กเกจทั้งหมดเป็นข้อมูลตัวอย่าง ยังไม่ใช่ข้อเสนอประกันภัยจริง</p>
        </div>
      </div>
    </footer>
  );
}
