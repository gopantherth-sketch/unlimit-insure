import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Flash } from "@/components/admin/Flash";
import { formatDateTime, shopErrorMessages, shopOrderStatusLabel, shopOrderStatusTone } from "@/components/admin/labels";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import { getShopPayee } from "@/lib/db/settings";
import { getShopOrder } from "@/lib/db/shop";
import { cx } from "@/lib/cx";
import { promptPayPayload } from "@/lib/payment/promptpay";
import { qrSvg } from "@/lib/payment/qr";
import { requireAdmin } from "@/lib/server/admin-auth";
import { formatBaht } from "@/lib/shop/catalog";
import { nextOrderMoves } from "@/lib/shop/status";
import { moveShopOrderAction, shopOrderDetailsAction } from "../actions";

export const metadata: Metadata = { title: "คำสั่งซื้อ" };

const moveLabel = { paid: "ได้รับเงินแล้ว (ชำระแล้ว)", shipped: "จัดส่งแล้ว", completed: "สำเร็จ", cancelled: "ยกเลิกคำสั่งซื้อ", pending_payment: "รอชำระ" } as const;

export default async function AdminShopOrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin();
  const [{ id }, { ok, error }] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const found = await getShopOrder(db, id);
  if (!found) notFound();
  const { order, items } = found;
  const payee = order.status === "pending_payment" ? await getShopPayee(db) : null;
  const payload = payee?.promptpayId ? promptPayPayload(payee.promptpayId, order.totalSatang / 100) : null;
  const editable = order.status !== "completed" && order.status !== "cancelled";
  const moves = nextOrderMoves(order.status);

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/shop" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft aria-hidden className="h-4 w-4" /> ร้านค้า
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{order.number}</h1>
        <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", shopOrderStatusTone[order.status])}>{shopOrderStatusLabel[order.status]}</span>
      </div>
      <Flash ok={ok} error={error} okMessages={{ created: "สร้างคำสั่งซื้อแล้ว", moved: "เปลี่ยนสถานะแล้ว", saved: "บันทึกแล้ว" }} errorMessages={shopErrorMessages} />

      <section aria-labelledby="items-title" className="card p-5">
        <h2 id="items-title" className="font-bold">รายการ</h2>
        <p className="mt-1 text-sm text-navy-500">
          ชื่อ LINE: <span className="font-medium text-navy-800">{order.lineName}</span> · สร้างโดย {order.createdBy} · {formatDateTime(order.createdAt)}
        </p>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-navy-500">
            <tr>
              <th scope="col" className="py-2 font-medium">สินค้า</th>
              <th scope="col" className="py-2 text-right font-medium">จำนวน</th>
              <th scope="col" className="py-2 text-right font-medium">ราคา/ชิ้น</th>
              <th scope="col" className="py-2 text-right font-medium">รวม (บาท)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="py-2">{it.label}</td>
                <td className="py-2 text-right tabular-nums">{it.qty}</td>
                <td className="py-2 text-right tabular-nums">{formatBaht(it.unitSatang)}</td>
                <td className="py-2 text-right tabular-nums">{formatBaht(it.unitSatang * it.qty)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-navy-200">
            <tr>
              <td colSpan={3} className="py-2 text-right text-navy-500">ค่าส่ง</td>
              <td className="py-2 text-right tabular-nums">{formatBaht(order.shippingSatang)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="py-2 text-right font-bold">ยอดรวม</td>
              <td className="py-2 text-right text-lg font-bold tabular-nums">{formatBaht(order.totalSatang)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {order.status === "pending_payment" && (
        <section aria-labelledby="qr-title" className="card p-5">
          <h2 id="qr-title" className="font-bold">QR พร้อมเพย์ {formatBaht(order.totalSatang)} บาท</h2>
          {payload ? (
            <div className="mt-3 flex flex-wrap items-start gap-5">
              <div className="rounded-xl border border-navy-100 bg-white p-2" dangerouslySetInnerHTML={{ __html: qrSvg(payload, 220) }} />
              <div className="space-y-2 text-sm text-navy-600">
                <p>ผู้รับเงิน: {payee?.accountName || "—"}{payee && !payee.fromShop ? " (บัญชีรับชำระเบี้ย เพราะยังไม่ได้ตั้งบัญชีร้านค้า)" : ""}</p>
                <p>บันทึกภาพ QR (คลิกขวา หรือกดค้างบนมือถือ) แล้วส่งให้ลูกค้าในแชต LINE พร้อมยอดรวม</p>
                <p>ตรวจสลิปว่ายอดและชื่อผู้รับตรง แล้วกด “ได้รับเงินแล้ว” ด้านล่าง ไม่ต้องอัปโหลดสลิปเข้าระบบ</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-warning-700">ยังไม่ได้ตั้งพร้อมเพย์ เจ้าของตั้งได้ที่ ตั้งค่า → บัญชีรับเงินร้านค้า</p>
          )}
        </section>
      )}

      <section aria-labelledby="ship-title" className="card p-5">
        <h2 id="ship-title" className="font-bold">การจัดส่ง</h2>
        {editable ? (
          <form action={shopOrderDetailsAction} className="mt-3 space-y-3">
            <input type="hidden" name="id" value={order.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="courier" className="field-label">ขนส่ง</label>
                <input id="courier" name="courier" defaultValue={order.courier ?? ""} maxLength={60} className="field-input" />
              </div>
              <div>
                <label htmlFor="tracking" className="field-label">เลขพัสดุ</label>
                <input id="tracking" name="tracking" defaultValue={order.tracking ?? ""} maxLength={60} className="field-input" />
              </div>
            </div>
            <div>
              <label htmlFor="note" className="field-label">หมายเหตุ</label>
              <input id="note" name="note" defaultValue={order.note ?? ""} maxLength={500} className="field-input" />
            </div>
            <button type="submit" className={buttonClass("secondary", "sm")}>บันทึก</button>
          </form>
        ) : (
          <p className="mt-2 text-sm text-navy-600">
            {order.courier || "—"} · {order.tracking || "—"}
            {order.note ? ` · ${order.note}` : ""}
          </p>
        )}
      </section>

      {moves.length > 0 && (
        <section aria-labelledby="status-title" className="card p-5">
          <h2 id="status-title" className="font-bold">เปลี่ยนสถานะ</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {moves.map((to) => (
              <form key={to} action={moveShopOrderAction}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="to" value={to} />
                <button type="submit" className={buttonClass(to === "cancelled" ? "ghost" : "primary", "sm", to === "cancelled" ? "text-danger-600 hover:bg-danger-50" : undefined)}>
                  {moveLabel[to]}
                </button>
              </form>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
