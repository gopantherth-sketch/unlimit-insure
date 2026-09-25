"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { buttonClass } from "@/components/ui/button";
import { cx } from "@/lib/cx";
import { primaryNav } from "@/lib/nav";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Logo size="sm" />

        <nav aria-label="เมนูหลัก" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cx(
                    "rounded-full px-4 py-2 text-[15px] font-medium transition-colors",
                    isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-navy-600 hover:text-brand-700",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/advisor" className={buttonClass("primary", "sm", "hidden sm:inline-flex")}>
            ปรึกษาฟรี
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy-700 hover:bg-navy-50 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav id="mobile-nav" aria-label="เมนูหลัก" hidden={!open} className="border-t border-navy-100 bg-white lg:hidden">
        <ul className="container-page flex flex-col py-3">
          {primaryNav.map((item) => (
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
          <li className="pt-2">
            <Link href="/advisor" className={buttonClass("primary", "md", "w-full")}>
              ปรึกษาผู้เชี่ยวชาญฟรี
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
