import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LineButton } from "@/components/contact/ContactButtons";
import { contact } from "@/content/contact";
import { homeCopy } from "@/content/home";
import { lineAddUrl, telHref } from "@/lib/contact";

const columns = [
  {
    title: "ประกันรถ",
    links: [
      { href: "/quote", label: "เลือกแผนประกันรถ" },
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
    title: "ช่วยเหลือ",
    links: [
      { href: "/claims", label: "ขั้นตอนเมื่อเกิดเหตุ" },
      { href: "/advisor", label: "คุยกับที่ปรึกษา" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-navy-100 bg-white">
      <div className="container-page grid gap-10 py-12 md:py-14 lg:grid-cols-[1.15fr_2.6fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[15px] leading-relaxed text-navy-600">{homeCopy.footerTagline}</p>
          <LineButton placement="footer" message={contact.messages.general} label={contact.labels.lineLong} className="mt-5" />
          <p className="mt-3 text-xs leading-relaxed text-navy-400">{contact.brokerLine}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-[1fr_1.2fr_0.9fr_1.3fr]">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-display text-[15px] font-semibold text-navy-900">{col.title}</h2>
              <ul className="mt-2 space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block py-1 text-[15px] text-navy-600 hover:text-brand-700 sm:text-sm">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {/* Full width on phones so the email address never breaks mid-word. */}
          <div className="col-span-2 sm:col-span-1">
            <h2 className="font-display text-[15px] font-semibold text-navy-900">ติดต่อเรา</h2>
            <ul className="mt-2 space-y-1 text-[15px] sm:text-sm">
              <li>
                <a href={telHref} className="flex items-center gap-2 py-1 text-navy-600 hover:text-brand-700">
                  <Phone aria-hidden className="h-4 w-4 shrink-0 text-brand-600" />
                  <span className="sr-only">โทรศัพท์: </span>
                  <span className="tabular">{contact.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={lineAddUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1 text-navy-600 hover:text-brand-700">
                  <MessageCircle aria-hidden className="h-4 w-4 shrink-0 text-line-600" />
                  <span className="sr-only">LINE: </span>
                  {contact.lineId}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 py-1 text-navy-600 hover:text-brand-700">
                  <Mail aria-hidden className="h-4 w-4 shrink-0 text-brand-600" />
                  <span className="sr-only">อีเมล: </span>
                  <span className="whitespace-nowrap">{contact.email}</span>
                </a>
              </li>
              <li>
                {contact.facebookUrl ? (
                  <a href={contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1 text-navy-600 hover:text-brand-700">
                    <span aria-hidden className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-[11px] font-bold leading-none text-white">f</span>
                    <span className="sr-only">Facebook: </span>
                    {contact.facebookName}
                  </a>
                ) : (
                  <span className="flex items-center gap-2 py-1 text-navy-600">
                    <span aria-hidden className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-[11px] font-bold leading-none text-white">f</span>
                    <span className="sr-only">Facebook: </span>
                    {contact.facebookName}
                  </span>
                )}
              </li>
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
        <div className="border-t border-white/10">
          <p className="container-page py-4 text-xs leading-relaxed text-navy-300">
            <span className="block max-w-3xl">
              แพ็กเกจบนเว็บไซต์เป็นตัวอย่างเพื่ออธิบายความคุ้มครอง ยังไม่ใช่ข้อเสนอประกันภัยจริง ราคาและเงื่อนไขจริงสอบถามทาง LINE หรือโทรศัพท์
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
