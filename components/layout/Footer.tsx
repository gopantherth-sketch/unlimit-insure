import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
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
      { href: "/lab", label: "บทความและคู่มือ" },
      { href: "/lab/type1-vs-2plus", label: "ชั้น 1 กับ 2+ ต่างกันอย่างไร" },
      { href: "/#faq", label: "คำถามที่พบบ่อย" },
      { href: "/#why", label: "เกี่ยวกับเรา" },
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

// Contact details are not confirmed yet: placeholders only, never invented numbers or handles.
const contacts = [
  { icon: Phone, label: "โทรศัพท์" },
  { icon: MessageCircle, label: "LINE" },
  { icon: Mail, label: "อีเมล" },
];

// Social accounts are not live yet: shown as neutral, non-interactive placeholders.
const socials = [
  { name: "Facebook", glyph: "f", className: "bg-[#1877F2] font-bold" },
  { name: "LINE", glyph: "L", className: "bg-[#06C755] font-bold" },
  { name: "YouTube", glyph: "▶", className: "bg-[#FF0000] text-[11px]" },
  { name: "TikTok", glyph: "♪", className: "bg-navy-900" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-navy-100 bg-white">
      <div className="container-page grid gap-10 py-12 md:py-14 lg:grid-cols-[1.15fr_2.6fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[15px] leading-relaxed text-navy-600">{homeCopy.footerTagline}</p>
          <p className="mt-3 text-xs leading-relaxed text-navy-400">ใบอนุญาตนายหน้าประกันวินาศภัย: [รอข้อมูล]</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-display text-[15px] font-semibold text-navy-900">{col.title}</h2>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-navy-600 hover:text-brand-700">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="font-display text-[15px] font-semibold text-navy-900">ติดต่อเรา</h2>
            <ul className="mt-3 space-y-2.5">
              {contacts.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-navy-500">
                  <Icon aria-hidden className="h-4 w-4 shrink-0 text-brand-600" />
                  <span>
                    <span className="sr-only">{label}: </span>[รอข้อมูล]
                  </span>
                </li>
              ))}
            </ul>
            <ul aria-label="โซเชียลมีเดีย (เร็ว ๆ นี้)" className="mt-5 flex gap-2">
              {socials.map((s) => (
                <li
                  key={s.name}
                  title={`${s.name} — เร็ว ๆ นี้`}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm text-white opacity-90 ${s.className}`}
                >
                  <span aria-hidden>{s.glyph}</span>
                  <span className="sr-only">{s.name} (เร็ว ๆ นี้)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-navy-900 text-navy-200">
        <div className="container-page flex flex-col gap-2 py-5 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Unlimit Insure. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-white">นโยบายความเป็นส่วนตัว</Link>
            <span aria-hidden className="text-navy-500">|</span>
            <Link href="/terms" className="hover:text-white">ข้อกำหนดการใช้งาน</Link>
          </p>
        </div>
        <p className="container-page border-t border-white/10 py-3 text-xs text-navy-300">
          ต้นแบบระบบ — ข้อมูลแพ็กเกจทั้งหมดเป็นข้อมูลตัวอย่าง ยังไม่ใช่ข้อเสนอประกันภัยจริง
        </p>
      </div>
    </footer>
  );
}
