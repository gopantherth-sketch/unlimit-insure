"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";

const items = [
  { href: "/admin", label: "ภาพรวม" },
  { href: "/admin/leads", label: "ลีด" },
  { href: "/admin/products", label: "แพ็กเกจ" },
  { href: "/admin/import", label: "นำเข้าข้อมูล" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="เมนูผู้ดูแล">
      <ul className="flex gap-1 text-sm">
        {items.map((i) => {
          const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link href={i.href} aria-current={active ? "page" : undefined} className={cx("rounded-full px-3 py-1.5 font-medium", active ? "bg-white/15 text-white" : "text-navy-200 hover:text-white")}>
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
