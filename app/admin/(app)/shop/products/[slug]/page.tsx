import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Flash } from "@/components/admin/Flash";
import { shopCatalogErrorMessages, shopCatalogOkMessages } from "@/components/admin/labels";
import { ShopPhotoUploader } from "@/components/admin/ShopPhotoUploader";
import { ProductImage } from "@/components/shop/ProductImage";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import { getShopCatalog, getShopProductRow } from "@/lib/db/shop-catalog";
import { cx } from "@/lib/cx";
import { SHOW_SHOP } from "@/lib/features";
import { requireOwner } from "@/lib/server/admin-auth";
import { formatBaht } from "@/lib/shop/catalog";
import {
  addShopVariantAction,
  publishShopProductAction,
  removeShopPhotoAction,
  updateShopProductAction,
  updateShopVariantAction,
  uploadShopPhotoAction,
} from "../actions";

export const metadata: Metadata = { title: "แก้ไขสินค้า" };

export default async function AdminShopProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireOwner();
  const [{ slug }, { ok, error }] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const [row, catalog] = await Promise.all([getShopProductRow(db, slug), getShopCatalog(db, { admin: true })]);
  const product = catalog.find((p) => p.slug === slug);
  if (!row || !product) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/shop/products" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft aria-hidden className="h-4 w-4" /> สินค้าทั้งหมด
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-sm text-navy-500">/shop/{product.slug}</p>
        </div>
        <form action={publishShopProductAction} className="flex items-center gap-3">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="published" value={product.published ? "0" : "1"} />
          <span className={cx("rounded-full px-3 py-1 text-xs font-semibold", product.published ? "bg-success-50 text-success-700" : "bg-navy-50 text-navy-600")}>
            {product.published ? "เปิดขาย" : "ยังไม่เปิดขาย"}
          </span>
          <button type="submit" className={buttonClass(product.published ? "secondary" : "primary", "sm")}>
            {product.published ? "ปิดขาย" : "เปิดขาย"}
          </button>
        </form>
      </div>
      {product.published && SHOW_SHOP && (
        <Link href={`/shop/${slug}`} className="text-sm font-medium text-brand-700 hover:underline">
          ดูหน้าสินค้า
        </Link>
      )}
      <Flash ok={ok} error={error} okMessages={shopCatalogOkMessages} errorMessages={shopCatalogErrorMessages} />

      <section aria-labelledby="info-title" className="card space-y-4 p-5">
        <h2 id="info-title" className="text-xl font-bold">ข้อมูลสินค้า</h2>
        <form action={updateShopProductAction} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />
          <div>
            <label htmlFor="name" className="field-label">ชื่อสินค้า</label>
            <input id="name" name="name" required maxLength={120} defaultValue={row.name} className="field-input" />
          </div>
          <div>
            <label htmlFor="summary" className="field-label">คำอธิบายสั้น (ใต้ชื่อสินค้า)</label>
            <input id="summary" name="summary" maxLength={200} defaultValue={row.summary} className="field-input" />
          </div>
          <div>
            <label htmlFor="description" className="field-label">รายละเอียด (เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่)</label>
            <textarea id="description" name="description" rows={6} maxLength={4000} defaultValue={row.description} className="field-input" />
          </div>
          <div className="max-w-40">
            <label htmlFor="sort" className="field-label">ลำดับในหน้าร้าน</label>
            <input id="sort" name="sort" type="number" min={-999} max={999} defaultValue={row.sort} className="field-input" />
          </div>
          <button type="submit" className={buttonClass("primary", "sm")}>บันทึก</button>
        </form>
      </section>

      <section id="photo" aria-labelledby="photo-title" className="card space-y-4 p-5">
        <h2 id="photo-title" className="text-xl font-bold">รูปสินค้า</h2>
        <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-start">
          <div className="aspect-square w-40 overflow-hidden rounded-xl bg-wash">
            <ProductImage product={product} sizes="160px" />
          </div>
          <div className="space-y-3">
            <ShopPhotoUploader slug={slug} action={uploadShopPhotoAction} />
            {product.photo && (
              <form action={removeShopPhotoAction}>
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="text-sm font-medium text-danger-600 hover:underline">ลบรูป</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section id="variants" aria-labelledby="variants-title" className="card space-y-4 p-5">
        <div>
          <h2 id="variants-title" className="text-xl font-bold">แบบและราคา</h2>
          <p className="mt-1 text-sm text-navy-500">รหัสสินค้า (SKU) แก้ไม่ได้ แบบที่มีคำสั่งซื้อแล้วลบไม่ได้ ให้ “ปิดขาย” แทน สต็อกตั้งได้ในหน้าร้านค้า</p>
        </div>
        <ul className="divide-y divide-navy-100">
          {product.variants.map((v) => (
            <li key={v.sku} className="py-4">
              <form action={updateShopVariantAction} className="grid gap-3 sm:grid-cols-[1fr_2fr_1fr] sm:items-end">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="sku" value={v.sku} />
                <p className="text-sm">
                  <span className="block text-xs text-navy-500">SKU</span>
                  <span className="font-mono font-semibold">{v.sku}</span>
                </p>
                <div>
                  <label htmlFor={`label_${v.sku}`} className="field-label">ชื่อแบบ</label>
                  <input id={`label_${v.sku}`} name="label" required maxLength={80} defaultValue={v.label} className="field-input" />
                </div>
                <div>
                  <label htmlFor={`price_${v.sku}`} className="field-label">ราคา (บาท)</label>
                  <input id={`price_${v.sku}`} name="price" inputMode="decimal" defaultValue={v.priceSatang !== null ? formatBaht(v.priceSatang).replace(/,/g, "") : ""} placeholder="ยังไม่มี" className="field-input" />
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
                  <label className="inline-flex min-h-11 items-center gap-2 text-sm font-medium">
                    <input type="checkbox" name="active" defaultChecked={v.active} className="h-5 w-5" /> เปิดขายแบบนี้
                  </label>
                  <button type="submit" name="intent" value="save" className={buttonClass("secondary", "sm")}>บันทึกแบบ {v.sku}</button>
                  <button type="submit" name="intent" value="delete" className="text-sm font-medium text-danger-600 hover:underline">ลบแบบ {v.sku}</button>
                </div>
              </form>
            </li>
          ))}
        </ul>
        <form action={addShopVariantAction} className="space-y-3 border-t border-navy-100 pt-4">
          <h3 className="font-semibold">เพิ่มแบบ</h3>
          <input type="hidden" name="slug" value={slug} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="new_sku" className="field-label">รหัสสินค้า (SKU)</label>
              <input id="new_sku" name="sku" required maxLength={40} className="field-input uppercase" />
            </div>
            <div>
              <label htmlFor="new_label" className="field-label">ชื่อแบบ</label>
              <input id="new_label" name="label" required maxLength={80} className="field-input" />
            </div>
            <div>
              <label htmlFor="new_price" className="field-label">ราคาต่อชิ้น (บาท)</label>
              <input id="new_price" name="price" inputMode="decimal" placeholder="เว้นว่างถ้ายังไม่มี" className="field-input" />
            </div>
          </div>
          <button type="submit" className={buttonClass("secondary", "sm")}>เพิ่มแบบ</button>
        </form>
      </section>
    </div>
  );
}
