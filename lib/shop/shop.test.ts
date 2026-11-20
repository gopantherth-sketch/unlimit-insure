import { beforeEach, describe, expect, it } from "vitest";
import type { ShopProduct } from "@/content/shop";
import { createShopOrder, getShopOrder, getStock, moveShopOrder, setStock, soldOutSkus, updateShopOrderDetails } from "@/lib/db/shop";
import {
  addShopProductPhoto,
  addShopVariant,
  createShopProduct,
  deleteShopVariant,
  discardShopDraft,
  getShopCatalog,
  getShopPhoto,
  getShopProductEdit,
  MAX_PHOTOS,
  publishShopDraft,
  removeShopProductPhoto,
  setShopProductCover,
  setShopProductPublished,
  sniffPhoto,
  updateShopProduct,
  updateShopVariant,
} from "@/lib/db/shop-catalog";
import { createTestDb } from "@/lib/db/testing";
import { cleanQty, formatBaht, fromPrice, orderMessage, parseBaht } from "@/lib/shop/catalog";
import { canMoveOrder } from "@/lib/shop/status";

// Test catalogue: the real one has no prices until the owner sends them (O12).
const catalog: ShopProduct[] = [
  {
    slug: "cloth",
    name: "ผ้าไมโครไฟเบอร์",
    summary: "",
    description: [],
    variants: [
      { sku: "C-S", label: "40×40 ซม. สีเทา", priceSatang: 8900 },
      { sku: "C-L", label: "60×160 ซม.", priceSatang: 25950 },
    ],
  },
];
const staff = { name: "staff", userId: null };

describe("catalogue helpers", () => {
  it("formats and parses baht in satang", () => {
    expect(formatBaht(8900)).toBe("89");
    expect(formatBaht(25950)).toBe("259.50");
    expect(formatBaht(129000)).toBe("1,290");
    expect(parseBaht("1,290")).toBe(129000);
    expect(parseBaht("259.5")).toBe(25950);
    expect(parseBaht("0")).toBeNull();
    expect(parseBaht("1.234")).toBeNull();
    expect(parseBaht("-5")).toBeNull();
    expect(parseBaht("abc")).toBeNull();
  });

  it("accepts whole quantities 1–99 only", () => {
    expect(cleanQty("3")).toBe(3);
    expect(cleanQty(99)).toBe(99);
    for (const bad of ["0", "100", "1.5", "", "x", -1]) expect(cleanQty(bad)).toBeNull();
  });

  it("builds the LINE order message, one detail per line, first line fixed", () => {
    const msg = orderMessage(catalog[0]!, catalog[0]!.variants[1]!, 2);
    expect(msg.split("\n")).toEqual([
      "สั่งซื้อสินค้า (จากเว็บไซต์)",
      "สินค้า: ผ้าไมโครไฟเบอร์",
      "แบบ: 60×160 ซม.",
      "จำนวน: 2",
      "ราคาสินค้า: 2 × 259.50 = 519 บาท",
      "ค่าส่ง: (แอดมินแจ้ง)",
    ]);
  });

  it("leaves the price to the admin while it is not set", () => {
    const p: ShopProduct = { slug: "x", name: "x", summary: "", description: [], variants: [{ sku: "X-1", label: "x", priceSatang: null }] };
    expect(orderMessage(p, p.variants[0]!, 1)).toContain("ราคาสินค้า: (แอดมินแจ้ง)");
    expect(fromPrice(p)).toBeNull();
    expect(fromPrice(catalog[0]!)).toBe(8900);
  });

  it("allows only forward moves, cancel before shipping", () => {
    expect(canMoveOrder("pending_payment", "paid")).toBe(true);
    expect(canMoveOrder("paid", "cancelled")).toBe(true);
    expect(canMoveOrder("shipped", "cancelled")).toBe(false);
    expect(canMoveOrder("shipped", "pending_payment")).toBe(false);
    expect(canMoveOrder("cancelled", "paid")).toBe(false);
  });
});

describe("shop orders", () => {
  let db: ReturnType<typeof createTestDb>["db"];
  beforeEach(() => {
    db = createTestDb().db;
  });

  const order = (items: { sku: string; qty: number; unitSatang: number }[], shippingSatang = 4000) =>
    createShopOrder(db, { items, shippingSatang, lineName: "  ลูกค้า A  " }, staff, catalog);

  it("creates an order with totals and snapshot labels", async () => {
    const r = await order([
      { sku: "C-S", qty: 3, unitSatang: 8900 },
      { sku: "C-L", qty: 1, unitSatang: 25950 },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.number).toMatch(/^SO-\d{6}-[0-9A-Z]{4}$/);
    const got = (await getShopOrder(db, r.id))!;
    expect(got.order.itemsSatang).toBe(3 * 8900 + 25950);
    expect(got.order.totalSatang).toBe(3 * 8900 + 25950 + 4000);
    expect(got.order.lineName).toBe("ลูกค้า A");
    expect(got.order.status).toBe("pending_payment");
    expect(got.items.map((i) => i.label)).toContain("ผ้าไมโครไฟเบอร์ · 60×160 ซม.");
  });

  it("refuses bad input", async () => {
    expect(await order([])).toEqual({ ok: false, error: "no_items" });
    expect(await order([{ sku: "NOPE", qty: 1, unitSatang: 100 }])).toEqual({ ok: false, error: "unknown_sku" });
    expect(await order([{ sku: "C-S", qty: 0, unitSatang: 100 }])).toEqual({ ok: false, error: "invalid_qty" });
    expect(await order([{ sku: "C-S", qty: 1, unitSatang: 0 }])).toEqual({ ok: false, error: "invalid_price" });
    expect(await order([{ sku: "C-S", qty: 1, unitSatang: 100 }], -1)).toEqual({ ok: false, error: "invalid_shipping" });
    expect(await createShopOrder(db, { items: [{ sku: "C-S", qty: 1, unitSatang: 100 }], shippingSatang: 0, lineName: " " }, staff, catalog)).toEqual({
      ok: false,
      error: "missing_line_name",
    });
  });

  it("takes stock on paid and returns it on cancel, exactly once", async () => {
    await setStock(db, "C-S", 5, catalog);
    const r = await order([{ sku: "C-S", qty: 2, unitSatang: 8900 }]);
    if (!r.ok) throw new Error(r.error);
    expect(await moveShopOrder(db, r.id, "paid")).toEqual({ ok: true });
    expect((await getStock(db)).get("C-S")).toBe(3);
    expect(await moveShopOrder(db, r.id, "paid")).toEqual({ ok: false, error: "not_allowed" });
    expect((await getStock(db)).get("C-S")).toBe(3);
    expect(await moveShopOrder(db, r.id, "cancelled")).toEqual({ ok: true });
    expect((await getStock(db)).get("C-S")).toBe(5);
  });

  it("cancelling an unpaid order leaves stock alone", async () => {
    await setStock(db, "C-S", 5, catalog);
    const r = await order([{ sku: "C-S", qty: 2, unitSatang: 8900 }]);
    if (!r.ok) throw new Error(r.error);
    expect(await moveShopOrder(db, r.id, "cancelled")).toEqual({ ok: true });
    expect((await getStock(db)).get("C-S")).toBe(5);
  });

  it("refuses paid when tracked stock is short; untracked SKUs are not limited", async () => {
    await setStock(db, "C-S", 1, catalog);
    const short = await order([{ sku: "C-S", qty: 2, unitSatang: 8900 }]);
    if (!short.ok) throw new Error(short.error);
    expect(await moveShopOrder(db, short.id, "paid")).toEqual({ ok: false, error: "no_stock" });
    const untracked = await order([{ sku: "C-L", qty: 50, unitSatang: 25950 }]);
    if (!untracked.ok) throw new Error(untracked.error);
    expect(await moveShopOrder(db, untracked.id, "paid")).toEqual({ ok: true });
    expect((await getStock(db)).has("C-L")).toBe(false);
  });

  it("needs a tracking number to ship, then completes", async () => {
    const r = await order([{ sku: "C-S", qty: 1, unitSatang: 8900 }]);
    if (!r.ok) throw new Error(r.error);
    await moveShopOrder(db, r.id, "paid");
    expect(await moveShopOrder(db, r.id, "shipped")).toEqual({ ok: false, error: "missing_tracking" });
    await updateShopOrderDetails(db, r.id, { courier: "Flash", tracking: "TH123", note: "" });
    expect(await moveShopOrder(db, r.id, "shipped")).toEqual({ ok: true });
    expect(await moveShopOrder(db, r.id, "cancelled")).toEqual({ ok: false, error: "not_allowed" });
    expect(await moveShopOrder(db, r.id, "completed")).toEqual({ ok: true });
    expect((await updateShopOrderDetails(db, r.id, { courier: "", tracking: "", note: "" })).ok).toBe(false);
  });

  it("lists sold-out SKUs and can stop tracking", async () => {
    await setStock(db, "C-S", 0, catalog);
    await setStock(db, "C-L", 4, catalog);
    expect(await soldOutSkus(db)).toEqual(["C-S"]);
    await setStock(db, "C-S", null, catalog);
    expect(await soldOutSkus(db)).toEqual([]);
    expect((await setStock(db, "C-S", -1, catalog)).ok).toBe(false);
    expect((await setStock(db, "NOPE", 1, catalog)).ok).toBe(false);
  });
});

describe("shop catalogue in D1 (C16)", () => {
  let db: ReturnType<typeof createTestDb>["db"];
  beforeEach(() => {
    db = createTestDb().db;
  });
  const fields = { name: " ผ้าเช็ดรถ ", summary: "นุ่ม", description: ["ย่อหน้าแรก", "", "ย่อหน้าสอง"].join("\n"), sort: 0 };
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 1, 2, 3]);

  it("migration keeps the placeholder product so SKU MF-01 still resolves (unpublished)", async () => {
    const admin = await getShopCatalog(db, { admin: true });
    expect(admin.map((p) => p.slug)).toEqual(["microfiber-cloth"]);
    expect(admin[0]!.variants[0]).toMatchObject({ sku: "MF-01", priceSatang: null, active: true });
    expect(await getShopCatalog(db)).toEqual([]);
  });

  it("creates, validates, publishes and lists a product", async () => {
    expect(await createShopProduct(db, "Bad Slug", fields, { sku: "T-1", label: "S", priceSatang: 100 })).toEqual({ ok: false, error: "invalid_slug" });
    expect(await createShopProduct(db, "towel", { ...fields, name: " " }, { sku: "T-1", label: "S", priceSatang: 100 })).toEqual({ ok: false, error: "missing_name" });
    expect(await createShopProduct(db, "towel", fields, { sku: "t-1", label: "S", priceSatang: 100 })).toEqual({ ok: false, error: "invalid_sku" });
    expect(await createShopProduct(db, "towel", fields, { sku: "MF-01", label: "S", priceSatang: 100 })).toEqual({ ok: false, error: "sku_taken" });
    expect(await createShopProduct(db, "towel", fields, { sku: "T-1", label: "S", priceSatang: 0 })).toEqual({ ok: false, error: "invalid_price" });
    expect(await createShopProduct(db, "towel", fields, { sku: "T-1", label: "40×40", priceSatang: 8900 })).toEqual({ ok: true });
    expect(await createShopProduct(db, "towel", fields, { sku: "T-2", label: "S", priceSatang: 100 })).toEqual({ ok: false, error: "slug_taken" });
    expect(await getShopCatalog(db)).toEqual([]); // not published yet
    expect(await setShopProductPublished(db, "towel", true)).toEqual({ ok: true });
    const [p] = await getShopCatalog(db);
    expect(p).toMatchObject({ slug: "towel", name: "ผ้าเช็ดรถ", description: ["ย่อหน้าแรก", "ย่อหน้าสอง"], variants: [{ sku: "T-1", label: "40×40", priceSatang: 8900 }] });
    expect(p!.variants[0]).not.toHaveProperty("active");
    // On sale: edits are a draft until published (C18).
    expect(await updateShopProduct(db, "towel", { ...fields, name: "ผ้าเช็ดรถ 2" })).toEqual({ ok: true });
    expect((await getShopCatalog(db))[0]!.name).toBe("ผ้าเช็ดรถ");
    expect((await getShopCatalog(db, { admin: true })).find((x) => x.slug === "towel")!.hasDraft).toBe(true);
    expect((await getShopProductEdit(db, "towel"))!.working.name).toBe("ผ้าเช็ดรถ 2");
    expect(await publishShopDraft(db, "towel")).toEqual({ ok: true });
    expect((await getShopCatalog(db))[0]!.name).toBe("ผ้าเช็ดรถ 2");
    expect((await getShopProductEdit(db, "towel"))!.hasDraft).toBe(false);
  });

  it("not on sale: edits apply at once, no draft", async () => {
    await createShopProduct(db, "towel", fields, { sku: "T-1", label: "S", priceSatang: 8900 });
    await updateShopProduct(db, "towel", { ...fields, name: "ใหม่" });
    const p = (await getShopCatalog(db, { admin: true })).find((x) => x.slug === "towel");
    expect(p).toMatchObject({ name: "ใหม่", hasDraft: false });
  });

  it("on sale: variant edits, new variants and deletes wait for publish; discard drops them", async () => {
    await createShopProduct(db, "towel", fields, { sku: "T-1", label: "S", priceSatang: 8900 });
    await setShopProductPublished(db, "towel", true);
    expect(await updateShopVariant(db, "towel", "T-1", { label: "S", priceSatang: 9900, active: true })).toEqual({ ok: true });
    expect(await addShopVariant(db, "towel", { sku: "T-2", label: "L", priceSatang: 25900 })).toEqual({ ok: true });
    expect(await addShopVariant(db, "towel", { sku: "T-2", label: "L", priceSatang: 100 })).toEqual({ ok: false, error: "sku_taken" });
    expect((await getShopCatalog(db))[0]!.variants).toEqual([{ sku: "T-1", label: "S", priceSatang: 8900 }]);
    expect(await discardShopDraft(db, "towel")).toEqual({ ok: true });
    expect((await getShopProductEdit(db, "towel"))!.working.variants).toEqual([{ sku: "T-1", label: "S", priceSatang: 8900, active: true }]);

    await addShopVariant(db, "towel", { sku: "T-2", label: "L", priceSatang: 25900 });
    await updateShopVariant(db, "towel", "T-1", { label: "S", priceSatang: 8900, active: false });
    expect(await publishShopDraft(db, "towel")).toEqual({ ok: true });
    expect((await getShopCatalog(db))[0]!.variants).toEqual([{ sku: "T-2", label: "L", priceSatang: 25900 }]);
    // A draft with no active variant cannot be published; the shop keeps the old version.
    await updateShopVariant(db, "towel", "T-2", { label: "L", priceSatang: 25900, active: false });
    expect(await publishShopDraft(db, "towel")).toEqual({ ok: false, error: "no_variants" });
    expect((await getShopCatalog(db))[0]!.variants.map((v) => v.sku)).toEqual(["T-2"]);
    // Off sale applies the draft (nobody sees it); on sale again needs an active variant.
    expect(await setShopProductPublished(db, "towel", false)).toEqual({ ok: true });
    expect(await getShopCatalog(db)).toEqual([]);
    expect(await setShopProductPublished(db, "towel", true)).toEqual({ ok: false, error: "no_variants" });
  });

  it("variants while off sale: add, duplicate SKU, unknown SKU", async () => {
    await createShopProduct(db, "towel", fields, { sku: "T-1", label: "S", priceSatang: 8900 });
    expect(await addShopVariant(db, "towel", { sku: "MF-01", label: "L", priceSatang: null })).toEqual({ ok: false, error: "sku_taken" });
    expect(await addShopVariant(db, "towel", { sku: "T-2", label: "L", priceSatang: null })).toEqual({ ok: true });
    expect(await updateShopVariant(db, "towel", "T-9", { label: "L", priceSatang: null, active: true })).toEqual({ ok: false, error: "not_found" });
    await setShopProductPublished(db, "towel", true);
    expect((await getShopCatalog(db))[0]!.variants.map((v) => v.sku)).toEqual(["T-1", "T-2"]);
  });

  it("deletes an unordered variant, refuses one with orders", async () => {
    await createShopProduct(db, "towel", fields, { sku: "T-1", label: "S", priceSatang: 8900 });
    await addShopVariant(db, "towel", { sku: "T-2", label: "L", priceSatang: 100 });
    const cat = await getShopCatalog(db, { admin: true });
    expect((await createShopOrder(db, { items: [{ sku: "T-1", qty: 1, unitSatang: 8900 }], shippingSatang: 0, lineName: "A" }, staff, cat)).ok).toBe(true);
    expect(await deleteShopVariant(db, "towel", "T-1")).toEqual({ ok: false, error: "has_orders" });
    expect(await deleteShopVariant(db, "towel", "T-2")).toEqual({ ok: true });
    expect((await getShopProductEdit(db, "towel"))!.working.variants.map((v) => v.sku)).toEqual(["T-1"]);
  });

  it("photos: sniffed type, size limit, up to 6, cover first, removed photos are deleted", async () => {
    expect(sniffPhoto(webp)).toBe("image/webp");
    expect(sniffPhoto(new Uint8Array([0x3c, 0x73, 0x76, 0x67]))).toBeNull();
    await createShopProduct(db, "towel", fields, { sku: "T-1", label: "S", priceSatang: 8900 });
    expect(await addShopProductPhoto(db, "towel", new Uint8Array([1, 2, 3, 4]), { width: 10, height: 10 })).toEqual({ ok: false, error: "invalid_photo" });
    expect(await addShopProductPhoto(db, "towel", new Uint8Array(700 * 1024), { width: 10, height: 10 })).toEqual({ ok: false, error: "photo_too_large" });
    const ids: string[] = [];
    for (let i = 0; i < MAX_PHOTOS; i++) {
      const r = await addShopProductPhoto(db, "towel", webp, { width: 800, height: 600 + i });
      if (!r.ok) throw new Error("photo");
      ids.push(r.id);
    }
    expect(await addShopProductPhoto(db, "towel", webp, { width: 800, height: 800 })).toEqual({ ok: false, error: "too_many_photos" });
    expect(Array.from((await getShopPhoto(db, ids[0]!))!.bytes)).toEqual(Array.from(webp));
    expect(await setShopProductCover(db, "towel", ids[2]!)).toEqual({ ok: true });
    const p = (await getShopCatalog(db, { admin: true })).find((x) => x.slug === "towel")!;
    expect(p.photo).toEqual({ src: `/api/shop/photo/${ids[2]}`, width: 800, height: 602, alt: "ผ้าเช็ดรถ" });
    expect(p.photos!.map((x) => x.src.split("/").pop())).toEqual([ids[2], ids[0], ids[1], ids[3], ids[4], ids[5]]);
    expect(await removeShopProductPhoto(db, "towel", ids[0]!)).toEqual({ ok: true });
    expect(await getShopPhoto(db, ids[0]!)).toBeNull();
    expect(await removeShopProductPhoto(db, "towel", ids[0]!)).toEqual({ ok: false, error: "not_found" });
  });

  it("photos on a product on sale: new ones stay hidden until publish, discard deletes them", async () => {
    await createShopProduct(db, "towel", fields, { sku: "T-1", label: "S", priceSatang: 8900 });
    const a = await addShopProductPhoto(db, "towel", webp, { width: 800, height: 800 });
    if (!a.ok) throw new Error("photo");
    await setShopProductPublished(db, "towel", true);
    const b = await addShopProductPhoto(db, "towel", webp, { width: 800, height: 800 });
    if (!b.ok) throw new Error("photo");
    await removeShopProductPhoto(db, "towel", a.id);
    expect((await getShopCatalog(db))[0]!.photos!.map((x) => x.src)).toEqual([`/api/shop/photo/${a.id}`]);
    expect(await getShopPhoto(db, a.id)).not.toBeNull(); // customers still see it
    await discardShopDraft(db, "towel");
    expect(await getShopPhoto(db, b.id)).toBeNull();
    expect((await getShopProductEdit(db, "towel"))!.working.photoIds).toEqual([a.id]);
    const c = await addShopProductPhoto(db, "towel", webp, { width: 800, height: 800 });
    if (!c.ok) throw new Error("photo");
    await setShopProductCover(db, "towel", c.id);
    await removeShopProductPhoto(db, "towel", a.id);
    await publishShopDraft(db, "towel");
    expect((await getShopCatalog(db))[0]!.photos!.map((x) => x.src)).toEqual([`/api/shop/photo/${c.id}`]);
    expect(await getShopPhoto(db, a.id)).toBeNull();
  });
});
