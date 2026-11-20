import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Flash } from "@/components/admin/Flash";
import { shopCatalogErrorMessages, shopCatalogOkMessages } from "@/components/admin/labels";
import { ShopPhotoUploader } from "@/components/admin/ShopPhotoUploader";
import { ProductImage } from "@/components/shop/ProductImage";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import { getShopProductEdit, MAX_PHOTOS } from "@/lib/db/shop-catalog";
import { cx } from "@/lib/cx";
import { SHOW_SHOP } from "@/lib/features";
import { requireOwner } from "@/lib/server/admin-auth";
import { formatBaht } from "@/lib/shop/catalog";
import {
  addShopVariantAction,
  publishShopProductAction,
  shopDraftAction,
  shopPhotoAction,
  updateShopProductAction,
  updateShopVariantAction,
  uploadShopPhotoAction,
} from "../actions";

export const metadata: Metadata = { title: "แก้ไขสินค้า" };

export default async function AdminShopProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireOwner();
  const [{ slug }, { ok, error }] = await Promise.all([params, searchParams]);
  const edit = await getShopProductEdit(await getDb(), slug);
  if (!edit) notFound();
  const { working: w, published, hasDraft, photos } = edit;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/shop/products" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft aria-hidden className="h-4 w-4" /> สินค้าทั้งหมด
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{w.name}</h1>
          <p className="text-sm text-navy-500">/shop/{slug}</p>
        </div>
        <form action={publishShopProductAction} className="flex items-center gap-3">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="published" value={published ? "0" : "1"} />
          <span className={cx("rounded-full px-3 py-1 text-xs font-semibold", published ? "bg-success-50 text-success-700" : "bg-navy-50 text-navy-600")}>
            {published ? "เปิดขาย" : "ยังไม่เปิดขาย"}
          </span>
          <button type="submit" className={buttonClass(published ? "secondary" : "primary", "sm")}>
            {published ? "ปิดขาย" : "เปิดขาย"}
          </button>
        </form>
      </div>
      {published && SHOW_SHOP && (
        <Link href={`/shop/${slug}`} className="text-sm font-medium text-brand-700 hover:underline">
          ดูหน้าสินค้า (แบบที่ลูกค้าเห็น)
        </Link>
      )}
      <Flash ok={ok} error={error} okMessages={shopCatalogOkMessages} errorMessages={shopCatalogErrorMessages} />

      {published && hasDraft && (
        <section aria-labelledby="draft-title" className="card space-y-3 bg-warning-50 p-5">
          <h2 id="draft-title" className="text-lg font-bold">มีการแก้ไขที่ลูกค้ายังไม่เห็น</h2>
          <p className="text-sm text-navy-600">ข้อมูล รูป และแบบ/ราคาในหน้านี้คือฉบับร่าง หน้าร้านยังแสดงแบบเดิมจนกว่าจะกดเผยแพร่ (สต็อกไม่อยู่ในฉบับร่าง)</p>
          <form action={shopDraftAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="slug" value={slug} />
            <button type="submit" name="intent" value="publish" className={buttonClass("primary", "sm")}>เผยแพร่การแก้ไข</button>
            <button type="submit" name="intent" value="discard" className={buttonClass("secondary", "sm")}>ยกเลิกการแก้ไข</button>
          </form>
        </section>
      )}
      {published && !hasDraft && (
        <p className="text-sm text-navy-600">สินค้านี้เปิดขายอยู่: สิ่งที่แก้จะเก็บเป็นฉบับร่างก่อน ลูกค้าจะเห็นเมื่อกด “เผยแพร่การแก้ไข”</p>
      )}

      <section aria-labelledby="info-title" className="card space-y-4 p-5">
        <h2 id="info-title" className="text-xl font-bold">ข้อมูลสินค้า</h2>
        <form action={updateShopProductAction} className="space-y-4">
          <input type="hidden" name="slug" value={slug} />
          <div>
            <label htmlFor="name" className="field-label">ชื่อสินค้า</label>
            <input id="name" name="name" required maxLength={120} defaultValue={w.name} className="field-input" />
          </div>
          <div>
            <label htmlFor="summary" className="field-label">คำอธิบายสั้น (ใต้ชื่อสินค้า)</label>
            <input id="summary" name="summary" maxLength={200} defaultValue={w.summary} className="field-input" />
          </div>
          <div>
            <label htmlFor="description" className="field-label">รายละเอียด (เว้นบรรทัดว่างเพื่อขึ้นย่อหน้าใหม่)</label>
            <textarea id="description" name="description" rows={6} maxLength={4000} defaultValue={w.description} className="field-input" />
          </div>
          <div className="max-w-40">
            <label htmlFor="sort" className="field-label">ลำดับในหน้าร้าน</label>
            <input id="sort" name="sort" type="number" min={-999} max={999} defaultValue={w.sort} className="field-input" />
          </div>
          <button type="submit" className={buttonClass("primary", "sm")}>บันทึก</button>
        </form>
      </section>

      <section id="photo" aria-labelledby="photo-title" className="card space-y-4 p-5">
        <div>
          <h2 id="photo-title" className="text-xl font-bold">รูปสินค้า</h2>
          <p className="mt-1 text-sm text-navy-500">
            ใส่ได้สูงสุด {MAX_PHOTOS} รูป รูปหลักแสดงบนการ์ดในหน้าร้านและเป็นรูปแรกในหน้าสินค้า ({photos.length}/{MAX_PHOTOS})
          </p>
        </div>
        {photos.length === 0 ? (
          <div className="aspect-square w-40 overflow-hidden rounded-xl bg-wash">
            <ProductImage product={{ slug, name: w.name, summary: "", description: [], variants: [] }} sizes="160px" />
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map((p, i) => {
              const id = w.photoIds[i]!;
              return (
                <li key={id} className="space-y-2">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-wash">
                    <Image src={p.src} width={p.width} height={p.height} alt={`${w.name} รูปที่ ${i + 1}`} sizes="200px" unoptimized className="h-full w-full object-cover" />
                    {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-navy-900/85 px-3 py-1 text-xs font-semibold text-white">รูปหลัก</span>}
                  </div>
                  <form action={shopPhotoAction} className="flex flex-wrap items-center gap-x-4">
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="id" value={id} />
                    {i > 0 && (
                      <button type="submit" name="intent" value="cover" className="min-h-11 text-sm font-medium text-brand-700 hover:underline sm:min-h-0">
                        ตั้งเป็นรูปหลัก<span className="sr-only"> (รูปที่ {i + 1})</span>
                      </button>
                    )}
                    <button type="submit" name="intent" value="remove" className="min-h-11 text-sm font-medium text-danger-600 hover:underline sm:min-h-0">
                      ลบรูป<span className="sr-only"> (รูปที่ {i + 1})</span>
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
        {photos.length < MAX_PHOTOS ? (
          <ShopPhotoUploader slug={slug} action={uploadShopPhotoAction} />
        ) : (
          <p className="text-sm font-medium text-navy-600">ครบ {MAX_PHOTOS} รูปแล้ว ลบรูปเดิมก่อนถ้าจะเพิ่มรูปใหม่</p>
        )}
      </section>

      <section id="variants" aria-labelledby="variants-title" className="card space-y-4 p-5">
        <div>
          <h2 id="variants-title" className="text-xl font-bold">แบบและราคา</h2>
          <p className="mt-1 text-sm text-navy-500">รหัสสินค้า (SKU) แก้ไม่ได้ แบบที่มีคำสั่งซื้อแล้วลบไม่ได้ ให้ “ปิดขาย” แทน สต็อกตั้งได้ในหน้าร้านค้า</p>
        </div>
        <ul className="divide-y divide-navy-100">
          {w.variants.map((v) => (
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
