"use client";

import { useEffect, useId, useState } from "react";
import { MessageCircle, Minus, Plus } from "lucide-react";
import { shopCopy, type ShopProduct } from "@/content/shop";
import { track } from "@/lib/analytics/track";
import { lineMessageUrl } from "@/lib/contact";
import { cx } from "@/lib/cx";
import { formatBaht, MAX_ORDER_QTY, orderMessage } from "@/lib/shop/catalog";

/** Variant + quantity picker and the "order on LINE" button with the prefilled order. */
export function OrderPicker({ product }: { product: ShopProduct }) {
  const [sku, setSku] = useState(product.variants[0]!.sku);
  const [qty, setQty] = useState(1);
  const [soldOut, setSoldOut] = useState<string[]>([]);
  const qtyId = useId();

  useEffect(() => {
    track("shop_viewed", product.slug);
    // Stock is checked live; if the check fails the button stays on and the admin confirms in chat.
    fetch("/api/shop/stock")
      .then((r) => (r.ok ? (r.json() as Promise<{ soldOut?: string[] }>) : { soldOut: [] }))
      .then((d: { soldOut?: string[] }) => setSoldOut(Array.isArray(d.soldOut) ? d.soldOut : []))
      .catch(() => {});
  }, [product.slug]);

  const variant = product.variants.find((v) => v.sku === sku) ?? product.variants[0]!;
  const isSoldOut = soldOut.includes(variant.sku);
  const total = variant.priceSatang !== null ? variant.priceSatang * qty : null;
  const setQ = (n: number) => setQty(Math.min(MAX_ORDER_QTY, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1)));

  return (
    <div className="card space-y-5 p-5 sm:p-6">
      {product.variants.length > 1 && (
        <fieldset>
          <legend className="field-label">{shopCopy.variant}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const out = soldOut.includes(v.sku);
              return (
                <label
                  key={v.sku}
                  className={cx(
                    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-[15px] font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500",
                    v.sku === sku ? "border-brand-600 bg-brand-50 text-brand-700" : "border-navy-200 bg-white text-navy-700",
                  )}
                >
                  <input type="radio" name="variant" value={v.sku} checked={v.sku === sku} onChange={() => setSku(v.sku)} className="sr-only" />
                  {v.label}
                  {out && <span className="text-xs text-navy-500">({shopCopy.soldOut})</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor={qtyId} className="field-label">{shopCopy.quantity}</label>
        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={() => setQ(qty - 1)} disabled={qty <= 1} aria-label="ลดจำนวน" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-navy-200 bg-white disabled:opacity-40">
            <Minus aria-hidden className="h-4 w-4" />
          </button>
          <input id={qtyId} type="number" inputMode="numeric" min={1} max={MAX_ORDER_QTY} value={qty} onChange={(e) => setQ(Number(e.target.value))} className="field-input h-11 w-20 text-center" />
          <button type="button" onClick={() => setQ(qty + 1)} disabled={qty >= MAX_ORDER_QTY} aria-label="เพิ่มจำนวน" className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-navy-200 bg-white disabled:opacity-40">
            <Plus aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-navy-100 pt-4">
        <p className="flex items-baseline justify-between gap-4">
          <span className="text-navy-600">{shopCopy.total}</span>
          <span className="text-2xl font-bold text-navy-900" aria-live="polite">
            {total !== null ? `${formatBaht(total)} บาท` : shopCopy.priceMissing}
          </span>
        </p>
        <p className="mt-1 text-sm text-navy-500">{shopCopy.shippingNote}</p>
      </div>

      {isSoldOut ? (
        <p className="flex h-12 items-center justify-center rounded-xl bg-navy-50 font-semibold text-navy-500" role="status">{shopCopy.soldOut}</p>
      ) : (
        <a
          href={lineMessageUrl(orderMessage(product, variant, qty))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("shop_order_clicked", product.slug)}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-line-600 px-6 font-semibold text-white hover:bg-line-700 active:bg-line-800 sm:h-14"
        >
          <MessageCircle aria-hidden className="h-5 w-5" />
          {shopCopy.orderButton}
          <span className="sr-only"> (เปิดแอป LINE)</span>
        </a>
      )}
    </div>
  );
}
