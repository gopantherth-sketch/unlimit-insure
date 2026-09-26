"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { CallButton, LineButton } from "@/components/contact/ContactButtons";
import { contact } from "@/content/contact";
import { track } from "@/lib/analytics/track";
import { telHref } from "@/lib/contact";
import { cx } from "@/lib/cx";

// Customer navigation, labelled as in the selected mockup. My Garage and sign-in are hidden until
// customer accounts exist; contact goes through LINE and phone.
const siteNav = [
  { href: "/insurance", label: "ประกันรถยนต์" },
  { href: "/quote", label: "เลือกแผนประกัน" },
  { href: "/lab", label: "บทความ" },
  { href: "/claims", label: "เมื่อเกิดเหตุ" },
  { href: "/#why", label: "เกี่ยวกับเรา" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 px-2 pt-2 sm:px-4 sm:pt-3">
      <div className="mx-auto max-w-[1280px] rounded-2xl border border-navy-100/80 bg-white/95 shadow-float backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:h-[76px] lg:px-7">
          <Logo size="sm" />

          <nav aria-label="เมนูหลัก" className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-3">
              {siteNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cx(
                      "relative rounded-lg px-3 py-2 text-[15px] transition-colors",
                      isActive(item.href) ? "font-semibold text-brand-700" : "text-navy-700 hover:text-brand-700",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) && <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-600" />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={telHref}
              onClick={() => track("contact_call", "header")}
              className="hidden items-center gap-1.5 text-[15px] font-semibold text-navy-700 hover:text-brand-700 xl:inline-flex"
            >
              <Phone aria-hidden className="h-[18px] w-[18px] text-brand-600" />
              <span className="tabular">{contact.phoneDisplay}</span>
            </a>
            <LineButton placement="header" className="hidden px-6 sm:inline-flex" />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-navy-700 hover:bg-navy-50 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav id="mobile-nav" aria-label="เมนูหลัก (มือถือ)" hidden={!open} className="border-t border-navy-100 lg:hidden">
          <ul className="flex flex-col px-3 py-3">
            {siteNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cx("block rounded-xl px-3 py-3 text-base font-medium", isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-navy-700")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="grid grid-cols-2 gap-2 pt-2">
              <LineButton placement="header" className="w-full" />
              <CallButton placement="header" className="w-full" />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
