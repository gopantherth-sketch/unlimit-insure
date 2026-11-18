import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Flash } from "@/components/admin/Flash";
import { shopCatalogErrorMessages, shopCatalogOkMessages } from "@/components/admin/labels";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import { getShopCatalog } from "@/lib/db/shop-catalog";
import { cx } from "@/lib/cx";
import { requireOwner } from "@/lib/server/admin-auth";
import { formatBaht, fromPrice } from "@/lib/shop/catalog";
import { createShopProductAction } from "./actions";

export const metadata: Metadata = { title: "สินค้าในร้านค้า" };

export default async function AdminShopProductsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireOwner();
  const { ok, error } = await searchParams;
  const products = await getShopCatalog(await getDb(), { admin: true });

  return (
    <div className="max-w-4xl space-y-8">
      <Link href="/admin/shop" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft aria-hidden className="h-4 w-4" /> ร้านค้า
      </Link>
      <div>
        <h1 className="text-2xl font-bold">สินค้าในร้านค้า</h1>
        <p className="mt-1 text-sm text-navy-500">เพิ่มและแก้สินค้า ราคา และรูปได้ที่นี่ สินค้าขึ้นหน้าร้านเมื่อกด “เปิดขาย” และหน้าร้าน /shop เปิดอยู่</p>
      </div>
      <Flash ok={ok} error={error} okMessages={shopCatalogOkMessages} errorMessages={shopCatalogErrorMessages} />

      <section aria-labelledby="list-title" className="space-y-3">
        <h2 id="list-title" className="text-xl font-bold">สินค้าทั้งหมด</h2>
        {products.length === 0 ? (
          <p className="card p-5 text-navy-600">ยังไม่มีสินค้า เพิ่มสินค้าแรกด้านล่าง</p>
        ) : (
          <ul className="card divide-y divide-navy-100">
            {products.map((p) => {
              const price = fromPrice(p);
              return (
                <li key={p.slug}>
                  <Link href={`/admin/shop/products/${p.slug}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-canvas">
                    <span className="min-w-0">
                      <span className="block font-semibold">{p.name}</span>
                      <span className="block text-xs text-navy-500">
                        /shop/{p.slug} · {p.variants.length} แบบ · {price !== null ? `เริ่มต้น ${formatBaht(price)} บาท` : "ยังไม่มีราคา"} · {p.photo ? "มีรูป" : "ยังไม่มีรูป"}
                      </span>
                    </span>
                    <span className={cx("rounded-full px-3 py-1 text-xs font-semibold", p.published ? "bg-success-50 text-success-700" : "bg-navy-50 text-navy-600")}>
                      {p.published ? "เปิดขาย" : "ยังไม่เปิดขาย"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="new-title" className="card space-y-4 p-5">
        <h2 id="new-title" className="text-xl font-bold">เพิ่มสินค้า</h2>
        <form action={createShopProductAction} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">ชื่อสินค้า</label>
              <input id="name" name="name" required maxLength={120} className="field-input" />
            </div>
            <div>
              <label htmlFor="slug" className="field-label">ชื่อในลิงก์ (ภาษาอังกฤษ แก้ทีหลังไม่ได้)</label>
              <input id="slug" name="slug" required maxLength={60} pattern="[a-z0-9][a-z0-9\-]*" placeholder="microfiber-cloth" className="field-input" />
            </div>
          </div>
          <div>
            <label htmlFor="summary" className="field-label">คำอธิบายสั้น (ใต้ชื่อสินค้า)</label>
            <input id="summary" name="summary" maxLength={200} className="field-input" />
          </div>
          <div>
            <label htmlFor="description" className="field-label">รายละเอียด (เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่)</label>
            <textarea id="description" name="description" rows={4} maxLength={4000} className="field-input" />
          </div>
          <fieldset className="grid gap-3 sm:grid-cols-3">
            <legend className="field-label">แบบแรก (เพิ่มแบบอื่นได้ทีหลัง)</legend>
            <div>
              <label htmlFor="sku" className="field-label">รหัสสินค้า (SKU)</label>
              <input id="sku" name="sku" required maxLength={40} placeholder="MF-40" className="field-input uppercase" />
            </div>
            <div>
              <label htmlFor="label" className="field-label">ชื่อแบบ</label>
              <input id="label" name="label" required maxLength={80} placeholder="40×40 ซม. สีเทา" className="field-input" />
            </div>
            <div>
              <label htmlFor="price" className="field-label">ราคาต่อชิ้น (บาท)</label>
              <input id="price" name="price" inputMode="decimal" placeholder="เว้นว่างถ้ายังไม่มี" className="field-input" />
            </div>
          </fieldset>
          <input type="hidden" name="sort" value={products.length} />
          <button type="submit" className={buttonClass("primary", "sm")}>เพิ่มสินค้า</button>
        </form>
      </section>
    </div>
  );
}
