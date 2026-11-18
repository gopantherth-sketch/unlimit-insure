import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { ShopProduct } from "@/content/shop";
import type { Database } from "@/lib/db/client";
import type { Actor } from "@/lib/db/leads";
import { shopOrderItems, shopOrders, shopStock, type ShopOrderStatus } from "@/lib/db/schema";
import { cleanQty, findSku } from "@/lib/shop/catalog";
import { canMoveOrder } from "@/lib/shop/status";

export type ShopOrderRow = typeof shopOrders.$inferSelect;
export type ShopOrderItemRow = typeof shopOrderItems.$inferSelect;

const nowIso = () => new Date().toISOString();
const MAX_SATANG = 100_000_000; // 1,000,000 บาท: far above any real order, catches typos.

export interface NewShopOrder {
  items: { sku: string; qty: number; unitSatang: number }[];
  shippingSatang: number;
  lineName: string;
  note?: string;
}

export type ShopOrderError = "no_items" | "unknown_sku" | "invalid_qty" | "invalid_price" | "invalid_shipping" | "missing_line_name";

function makeNumber(): string {
  const d = new Date(Date.now() + 7 * 3600_000); // Thai date (UTC+7)
  const ymd = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  const rand = crypto.getRandomValues(new Uint32Array(1))[0]!.toString(36).toUpperCase().padStart(4, "0").slice(-4);
  return `SO-${ymd}-${rand}`;
}

export async function createShopOrder(
  db: Database,
  input: NewShopOrder,
  actor: Actor,
  catalog: ShopProduct[],
): Promise<{ ok: true; id: string; number: string } | { ok: false; error: ShopOrderError }> {
  const lineName = input.lineName.trim().slice(0, 80);
  if (!lineName) return { ok: false, error: "missing_line_name" };
  if (input.items.length === 0) return { ok: false, error: "no_items" };
  const rows: { sku: string; label: string; qty: number; unitSatang: number }[] = [];
  for (const it of input.items) {
    const found = findSku(it.sku, catalog);
    if (!found) return { ok: false, error: "unknown_sku" };
    if (cleanQty(it.qty) === null) return { ok: false, error: "invalid_qty" };
    if (!Number.isInteger(it.unitSatang) || it.unitSatang <= 0 || it.unitSatang > MAX_SATANG) return { ok: false, error: "invalid_price" };
    rows.push({ sku: it.sku, label: `${found.product.name} · ${found.variant.label}`, qty: it.qty, unitSatang: it.unitSatang });
  }
  const shipping = input.shippingSatang;
  if (!Number.isInteger(shipping) || shipping < 0 || shipping > MAX_SATANG) return { ok: false, error: "invalid_shipping" };
  const itemsSatang = rows.reduce((s, r) => s + r.qty * r.unitSatang, 0);

  const id = crypto.randomUUID();
  const number = makeNumber();
  await db.insert(shopOrders).values({
    id,
    number,
    itemsSatang,
    shippingSatang: shipping,
    totalSatang: itemsSatang + shipping,
    lineName,
    note: input.note?.trim().slice(0, 500) || null,
    createdBy: actor.name,
  });
  await db.insert(shopOrderItems).values(rows.map((r) => ({ id: crypto.randomUUID(), orderId: id, ...r })));
  return { ok: true, id, number };
}

export async function listShopOrders(db: Database, opts: { status?: ShopOrderStatus; limit?: number } = {}) {
  const q = db.select().from(shopOrders);
  return (opts.status ? q.where(eq(shopOrders.status, opts.status)) : q).orderBy(desc(shopOrders.createdAt)).limit(opts.limit ?? 200);
}

export async function getShopOrder(db: Database, id: string): Promise<{ order: ShopOrderRow; items: ShopOrderItemRow[] } | null> {
  const [order] = await db.select().from(shopOrders).where(eq(shopOrders.id, id)).limit(1);
  if (!order) return null;
  const items = await db.select().from(shopOrderItems).where(eq(shopOrderItems.orderId, id));
  return { order, items };
}

/** Stock rows for these SKUs (or all). SKUs without a row are not tracked. */
export async function getStock(db: Database, skus?: string[]): Promise<Map<string, number>> {
  const rows = skus ? (skus.length ? await db.select().from(shopStock).where(inArray(shopStock.sku, skus)) : []) : await db.select().from(shopStock);
  return new Map(rows.map((r) => [r.sku, r.qty]));
}

/** Set (qty ≥ 0) or stop tracking (null) stock for a SKU. */
export async function setStock(db: Database, sku: string, qty: number | null, catalog: ShopProduct[]): Promise<{ ok: boolean; error?: string }> {
  if (!findSku(sku, catalog)) return { ok: false, error: "unknown_sku" };
  if (qty === null) {
    await db.delete(shopStock).where(eq(shopStock.sku, sku));
    return { ok: true };
  }
  if (!Number.isInteger(qty) || qty < 0 || qty > 1_000_000) return { ok: false, error: "invalid_qty" };
  await db.insert(shopStock).values({ sku, qty }).onConflictDoUpdate({ target: shopStock.sku, set: { qty, updatedAt: nowIso() } });
  return { ok: true };
}

/** SKUs that are tracked and at 0 or below: shown as sold out on the site. */
export async function soldOutSkus(db: Database): Promise<string[]> {
  const rows = await db.select({ sku: shopStock.sku }).from(shopStock).where(sql`${shopStock.qty} <= 0`);
  return rows.map((r) => r.sku);
}

export type MoveOrderError = "not_found" | "not_allowed" | "no_stock" | "missing_tracking";

/**
 * Move an order. Paid takes stock for tracked SKUs (refused if not enough); cancelling a paid order
 * puts it back. Shipping needs a tracking number set first.
 */
export async function moveShopOrder(db: Database, id: string, to: ShopOrderStatus): Promise<{ ok: true } | { ok: false; error: MoveOrderError }> {
  const found = await getShopOrder(db, id);
  if (!found) return { ok: false, error: "not_found" };
  const { order, items } = found;
  if (!canMoveOrder(order.status, to)) return { ok: false, error: "not_allowed" };
  if (to === "shipped" && !order.tracking) return { ok: false, error: "missing_tracking" };

  const need = new Map<string, number>();
  for (const it of items) need.set(it.sku, (need.get(it.sku) ?? 0) + it.qty);
  if (to === "paid") {
    const stock = await getStock(db, [...need.keys()]);
    for (const [sku, qty] of need) if (stock.has(sku) && stock.get(sku)! < qty) return { ok: false, error: "no_stock" };
  }

  const takeStock = to === "paid";
  const returnStock = to === "cancelled" && order.stockTaken;
  // Guard against concurrent moves: only update if still in the status we checked.
  await db
    .update(shopOrders)
    .set({ status: to, updatedAt: nowIso(), ...(takeStock && { stockTaken: true }), ...(returnStock && { stockTaken: false }) })
    .where(and(eq(shopOrders.id, id), eq(shopOrders.status, order.status)));
  const [after] = await db.select({ status: shopOrders.status }).from(shopOrders).where(eq(shopOrders.id, id)).limit(1);
  if (after?.status !== to) return { ok: false, error: "not_allowed" };

  if (takeStock || returnStock) {
    const sign = takeStock ? -1 : 1;
    for (const [sku, qty] of need) {
      await db
        .update(shopStock)
        .set({ qty: sql`${shopStock.qty} + ${sign * qty}`, updatedAt: nowIso() })
        .where(eq(shopStock.sku, sku));
    }
  }
  return { ok: true };
}

/** Courier, tracking number and note. Editable until the order is completed or cancelled. */
export async function updateShopOrderDetails(
  db: Database,
  id: string,
  d: { courier: string; tracking: string; note: string },
): Promise<{ ok: boolean; error?: string }> {
  const found = await getShopOrder(db, id);
  if (!found) return { ok: false, error: "not_found" };
  if (found.order.status === "completed" || found.order.status === "cancelled") return { ok: false, error: "not_allowed" };
  await db
    .update(shopOrders)
    .set({
      courier: d.courier.trim().slice(0, 60) || null,
      tracking: d.tracking.trim().slice(0, 60) || null,
      note: d.note.trim().slice(0, 500) || null,
      updatedAt: nowIso(),
    })
    .where(eq(shopOrders.id, id));
  return { ok: true };
}
