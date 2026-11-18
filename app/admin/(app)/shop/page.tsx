import type { Metadata } from "next";
import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import { formatDateTime, shopErrorMessages, shopOrderStatusLabel, shopOrderStatusTone } from "@/components/admin/labels";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import type { ShopOrderStatus } from "@/lib/db/schema";
import { getStock, listShopOrders } from "@/lib/db/shop";
import { getShopCatalog } from "@/lib/db/shop-catalog";
import { cx } from "@/lib/cx";
import { SHOW_SHOP } from "@/lib/features";
import { requireAdmin } from "@/lib/server/admin-auth";
import { formatBaht, NEW_ORDER_LINES } from "@/lib/shop/catalog";
import { shopOrderStatuses } from "@/lib/shop/status";
import { createShopOrderAction, setStockAction } from "./actions";

export const metadata: Metadata = { title: "ร้านค้า" };


export default async function AdminShopPage({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string; error?: string }> }) {
  await requireAdmin();
  const { status: raw, ok, error } = await searchParams;
  const status = shopOrderStatuses.find((s) => s === raw) as ShopOrderStatus | undefined;
  const db = await getDb();
  const [orders, stock, catalog] = await Promise.all([listShopOrders(db, { status }), getStock(db), getShopCatalog(db, { admin: true })]);
  const variants = catalog.flatMap((p) => p.variants.map((v) => ({ ...v, name: `${p.name} · ${v.label}` })));
  const orderable = variants.filter((v) => v.active);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-4">
          <h1 className="text-2xl font-bold">ร้านค้า</h1>
          <Link href="/admin/shop/products" className="font-medium text-brand-700 hover:underline">สินค้า ({catalog.length})</Link>
        </div>
        <p className={cx("text-sm font-medium", SHOW_SHOP ? "text-success-700" : "text-navy-500")}>
          {SHOW_SHOP ? "หน้าร้าน /shop เปิดอยู่" : "หน้าร้าน /shop ยังปิดอยู่ (SHOW_SHOP) ใช้หน้านี้ทดสอบได้"}
        </p>
      </div>
      <Flash ok={ok} error={error} okMessages={{ stock: "บันทึกสต็อกแล้ว" }} errorMessages={shopErrorMessages} />

      <section aria-labelledby="orders-title" className="space-y-4">
        <h2 id="orders-title" className="text-xl font-bold">คำสั่งซื้อ</h2>
        <nav aria-label="กรองตามสถานะ" className="flex flex-wrap gap-2 text-sm">
          <Link href="/admin/shop" aria-current={!status ? "page" : undefined} className={cx("rounded-full border px-3 py-1 font-medium", !status ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 bg-white")}>
            ทั้งหมด
          </Link>
          {shopOrderStatuses.map((s) => (
            <Link key={s} href={`/admin/shop?status=${s}`} aria-current={status === s ? "page" : undefined} className={cx("rounded-full border px-3 py-1 font-medium", status === s ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 bg-white")}>
              {shopOrderStatusLabel[s]}
            </Link>
          ))}
        </nav>
        <div tabIndex={0} role="region" aria-label="ตารางคำสั่งซื้อ" className="card overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-canvas text-left text-navy-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">เลขที่</th>
                <th scope="col" className="px-4 py-3 font-medium">ชื่อ LINE</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">ยอดรวม (บาท)</th>
                <th scope="col" className="px-4 py-3 font-medium">สถานะ</th>
                <th scope="col" className="px-4 py-3 font-medium">สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-navy-500">ยังไม่มีคำสั่งซื้อ</td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/shop/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.number}</Link>
                  </td>
                  <td className="px-4 py-3">{o.lineName}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatBaht(o.totalSatang)}</td>
                  <td className="px-4 py-3">
                    <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", shopOrderStatusTone[o.status])}>{shopOrderStatusLabel[o.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-navy-500">{formatDateTime(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="new-title" className="card max-w-3xl space-y-4 p-5">
        <div>
          <h2 id="new-title" className="text-xl font-bold">สร้างคำสั่งซื้อจากแชต LINE</h2>
          <p className="mt-1 text-sm text-navy-500">
            กรอกตามข้อความที่ลูกค้าส่งมา ไม่ต้องใส่ที่อยู่หรือเบอร์โทร ข้อมูลเหล่านั้นอยู่ในแชต LINE เท่านั้น เว้นราคาว่างไว้เพื่อใช้ราคาในระบบ
          </p>
        </div>
        <form action={createShopOrderAction} className="space-y-4">
          <div>
            <label htmlFor="lineName" className="field-label">ชื่อ LINE ของลูกค้า</label>
            <input id="lineName" name="lineName" required maxLength={80} className="field-input" />
          </div>
          {Array.from({ length: NEW_ORDER_LINES }, (_, i) => (
            <fieldset key={i} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
              <legend className="sr-only">สินค้ารายการที่ {i + 1}</legend>
              <div>
                <label htmlFor={`sku_${i}`} className="field-label">สินค้า {i + 1}</label>
                <select id={`sku_${i}`} name={`sku_${i}`} required={i === 0} defaultValue={i === 0 ? orderable[0]?.sku : ""} className="field-input">
                  {i > 0 && <option value="">—</option>}
                  {orderable.map((v) => (
                    <option key={v.sku} value={v.sku}>
                      {v.name} ({v.priceSatang !== null ? `${formatBaht(v.priceSatang)} บาท` : "ยังไม่มีราคา"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`qty_${i}`} className="field-label">จำนวน</label>
                <input id={`qty_${i}`} name={`qty_${i}`} type="number" min={1} max={99} defaultValue={1} className="field-input" />
              </div>
              <div>
                <label htmlFor={`price_${i}`} className="field-label">ราคาต่อชิ้น (บาท)</label>
                <input id={`price_${i}`} name={`price_${i}`} inputMode="decimal" placeholder="ราคาในระบบ" className="field-input" />
              </div>
            </fieldset>
          ))}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="shipping" className="field-label">ค่าส่ง (บาท)</label>
              <input id="shipping" name="shipping" inputMode="decimal" defaultValue="0" className="field-input" />
            </div>
            <div>
              <label htmlFor="note" className="field-label">หมายเหตุ (ไม่บังคับ)</label>
              <input id="note" name="note" maxLength={500} className="field-input" />
            </div>
          </div>
          <button type="submit" className={buttonClass("primary", "sm")}>สร้างคำสั่งซื้อ</button>
        </form>
      </section>

      <section id="stock" aria-labelledby="stock-title" className="card max-w-3xl space-y-4 p-5">
        <div>
          <h2 id="stock-title" className="text-xl font-bold">สต็อก</h2>
          <p className="mt-1 text-sm text-navy-500">
            สต็อกลดเมื่อคำสั่งซื้อเป็น “ชำระแล้ว” และคืนเมื่อยกเลิก ถ้าเว้นว่างคือไม่นับสต็อก (ไม่ขึ้นสินค้าหมด) ถ้าเป็น 0 หน้าร้านจะขึ้น “สินค้าหมด”
          </p>
        </div>
        <ul className="divide-y divide-navy-100">
          {variants.map((v) => (
            <li key={v.sku} className="py-3">
              <form action={setStockAction} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="sku" value={v.sku} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{v.name}{!v.active && " (ปิดขาย)"}</p>
                  <p className="text-xs text-navy-500">
                    {v.sku} · {stock.has(v.sku) ? `คงเหลือ ${stock.get(v.sku)}` : "ไม่นับสต็อก"}
                  </p>
                </div>
                <div>
                  <label htmlFor={`stock_${v.sku}`} className="field-label">ตั้งสต็อก</label>
                  <input id={`stock_${v.sku}`} name="qty" type="number" min={0} defaultValue={stock.get(v.sku) ?? ""} className="field-input w-28" />
                </div>
                <button type="submit" className={buttonClass("secondary", "sm")}>บันทึก</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
