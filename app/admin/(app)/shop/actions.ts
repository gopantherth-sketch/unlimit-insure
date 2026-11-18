"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import type { ShopOrderStatus } from "@/lib/db/schema";
import { setSetting, shopSettingKeys } from "@/lib/db/settings";
import { createShopOrder, moveShopOrder, setStock, updateShopOrderDetails } from "@/lib/db/shop";
import { classifyPromptPayId } from "@/lib/payment/promptpay";
import { actorOf, requireAdmin, requireOwner } from "@/lib/server/admin-auth";
import { cleanQty, findSku, NEW_ORDER_LINES, parseBaht } from "@/lib/shop/catalog";
import { shopOrderStatuses } from "@/lib/shop/status";



const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const toOrder = (id: string, q: string) => {
  revalidatePath(`/admin/shop/${id}`);
  revalidatePath("/admin/shop");
  redirect(`/admin/shop/${encodeURIComponent(id)}?${q}`);
};

export async function createShopOrderAction(formData: FormData) {
  const who = await requireAdmin();
  const items: { sku: string; qty: number; unitSatang: number }[] = [];
  for (let i = 0; i < NEW_ORDER_LINES; i++) {
    const sku = str(formData, `sku_${i}`, 40);
    if (!sku) continue;
    const qty = cleanQty(str(formData, `qty_${i}`, 4));
    if (qty === null) redirect("/admin/shop?error=invalid_qty");
    // Blank price = the catalogue price. Admins type one only while the catalogue has none.
    const rawPrice = str(formData, `price_${i}`, 20);
    const unit = rawPrice ? parseBaht(rawPrice) : (findSku(sku)?.variant.priceSatang ?? null);
    if (unit === null) redirect("/admin/shop?error=invalid_price");
    items.push({ sku, qty, unitSatang: unit });
  }
  const rawShipping = str(formData, "shipping", 20);
  const shipping = rawShipping === "" || rawShipping === "0" ? 0 : parseBaht(rawShipping);
  if (shipping === null) redirect("/admin/shop?error=invalid_shipping");
  const r = await createShopOrder(await getDb(), { items, shippingSatang: shipping, lineName: str(formData, "lineName", 80), note: str(formData, "note") }, actorOf(who));
  if (!r.ok) redirect(`/admin/shop?error=${r.error}`);
  toOrder(r.id, "ok=created");
}

export async function moveShopOrderAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 64);
  const to = str(formData, "to", 30) as ShopOrderStatus;
  if (!id || !shopOrderStatuses.includes(to)) return;
  const r = await moveShopOrder(await getDb(), id, to);
  toOrder(id, r.ok ? "ok=moved" : `error=${r.error}`);
}

export async function shopOrderDetailsAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id", 64);
  if (!id) return;
  const r = await updateShopOrderDetails(await getDb(), id, { courier: str(formData, "courier", 60), tracking: str(formData, "tracking", 60), note: str(formData, "note") });
  toOrder(id, r.ok ? "ok=saved" : `error=${r.error}`);
}

export async function setStockAction(formData: FormData) {
  await requireAdmin();
  const sku = str(formData, "sku", 40);
  const raw = str(formData, "qty", 8);
  const qty = raw === "" ? null : Number(raw);
  const r = await setStock(await getDb(), sku, qty);
  revalidatePath("/admin/shop");
  redirect(`/admin/shop?${r.ok ? "ok=stock" : `error=${r.error}`}#stock`);
}

export async function saveShopPayeeAction(formData: FormData) {
  const who = await requireOwner();
  const promptpay = str(formData, "shop.promptpayId", 40);
  if (promptpay && !classifyPromptPayId(promptpay)) redirect("/admin/settings?error=promptpay");
  const db = await getDb();
  for (const k of shopSettingKeys) await setSetting(db, k, str(formData, k, 200), who.name);
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=saved");
}
