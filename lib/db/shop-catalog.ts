import { and, asc, eq, inArray, notInArray } from "drizzle-orm";
import type { ShopPhoto, ShopProduct } from "@/content/shop";
import type { Database } from "@/lib/db/client";
import { shopOrderItems, shopPhotos, shopProducts, shopStock, shopVariants } from "@/lib/db/schema";

// Shop catalogue (task C16): entered by the owner in admin → ร้านค้า → สินค้า, read by /shop.
//
// Drafts (C18): every admin edit works on a "working copy" (fields, photos, variants). A product that is not on
// sale applies it at once; a product on sale keeps it in `draft` until the owner presses publish, so customers
// only ever see the published columns. Stock is not part of the draft: it is operational and always live.

export type ShopProductRow = typeof shopProducts.$inferSelect;
export type ShopVariantRow = typeof shopVariants.$inferSelect;

/** Admin list view: the published state of every product, with flags. */
export interface AdminShopProduct extends ShopProduct {
  published: boolean;
  sort: number;
  photoId: string | null;
  hasDraft: boolean;
  variants: (ShopProduct["variants"][number] & { active: boolean })[];
}

/** What the admin edits. Variant order = array order; photo order = array order, cover first. */
export interface WorkingProduct {
  name: string;
  summary: string;
  description: string;
  sort: number;
  photoIds: string[];
  variants: { sku: string; label: string; priceSatang: number | null; active: boolean }[];
}

/** Admin edit page: the working copy plus what customers see now. */
export interface ShopProductEdit {
  slug: string;
  published: boolean;
  hasDraft: boolean;
  working: WorkingProduct;
  /** Working photos with sizes, cover first. */
  photos: ShopPhoto[];
}

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;
export const SKU_RE = /^[A-Z0-9](?:[A-Z0-9-]{0,38}[A-Z0-9])?$/;
export const PHOTO_MIMES = ["image/webp", "image/jpeg", "image/png"] as const;
export const MAX_PHOTO_BYTES = 600 * 1024;
export const MAX_PHOTOS = 6;
const MAX_PRICE_SATANG = 100_000_000;
const nowIso = () => new Date().toISOString();

export type CatalogError =
  | "invalid_slug"
  | "slug_taken"
  | "missing_name"
  | "not_found"
  | "invalid_sku"
  | "sku_taken"
  | "missing_label"
  | "invalid_price"
  | "invalid_photo"
  | "photo_too_large"
  | "too_many_photos"
  | "no_variants"
  | "has_orders";

type Result = { ok: true } | { ok: false; error: CatalogError };

export const photoUrl = (id: string) => `/api/shop/photo/${id}`;

const paragraphs = (d: string) =>
  d
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const parseIds = (json: string | null | undefined): string[] => {
  try {
    const v: unknown = JSON.parse(json ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
};

async function photoSizes(db: Database, ids: string[]): Promise<Map<string, { width: number; height: number }>> {
  if (ids.length === 0) return new Map();
  const rows = await db.select({ id: shopPhotos.id, width: shopPhotos.width, height: shopPhotos.height }).from(shopPhotos).where(inArray(shopPhotos.id, ids));
  return new Map(rows.map((r) => [r.id, { width: r.width, height: r.height }]));
}

const toPhotos = (ids: string[], sizes: Map<string, { width: number; height: number }>, alt: string): ShopPhoto[] =>
  ids.flatMap((id) => {
    const s = sizes.get(id);
    return s ? [{ src: photoUrl(id), width: s.width, height: s.height, alt }] : [];
  });

/**
 * The published catalogue. Public (default): products on sale with at least one active variant, active variants only.
 * Admin: everything, still the published state (drafts are read with getShopProductEdit).
 */
export async function getShopCatalog(db: Database, opts?: { admin?: false }): Promise<ShopProduct[]>;
export async function getShopCatalog(db: Database, opts: { admin: true }): Promise<AdminShopProduct[]>;
export async function getShopCatalog(db: Database, opts: { admin?: boolean } = {}): Promise<ShopProduct[] | AdminShopProduct[]> {
  const products = await db.select().from(shopProducts).orderBy(asc(shopProducts.sort), asc(shopProducts.createdAt));
  const shown = opts.admin ? products : products.filter((p) => p.published);
  if (shown.length === 0) return [];
  const variants = await db
    .select()
    .from(shopVariants)
    .where(inArray(shopVariants.productSlug, shown.map((p) => p.slug)))
    .orderBy(asc(shopVariants.sort), asc(shopVariants.createdAt));
  const idsBySlug = new Map(shown.map((p) => [p.slug, parseIds(p.photoIds)]));
  const sizes = await photoSizes(db, [...idsBySlug.values()].flat());

  const out = shown.map((p) => {
    const photos = toPhotos(idsBySlug.get(p.slug) ?? [], sizes, p.name);
    const vs = variants.filter((v) => v.productSlug === p.slug && (opts.admin || v.active));
    return {
      slug: p.slug,
      name: p.name,
      summary: p.summary,
      description: paragraphs(p.description),
      ...(photos[0] && { photo: photos[0], photos }),
      variants: vs.map((v) => ({ sku: v.sku, label: v.label, priceSatang: v.priceSatang, ...(opts.admin && { active: v.active }) })),
      ...(opts.admin && { published: p.published, sort: p.sort, photoId: photos[0] ? (idsBySlug.get(p.slug)?.[0] ?? null) : null, hasDraft: p.draft !== null }),
    };
  });
  return opts.admin ? (out as AdminShopProduct[]) : (out.filter((p) => p.variants.length > 0) as ShopProduct[]);
}

/** Raw product row. */
export async function getShopProductRow(db: Database, slug: string): Promise<ShopProductRow | null> {
  const [p] = await db.select().from(shopProducts).where(eq(shopProducts.slug, slug)).limit(1);
  return p ?? null;
}

async function liveWorking(db: Database, row: ShopProductRow): Promise<WorkingProduct> {
  const vs = await db.select().from(shopVariants).where(eq(shopVariants.productSlug, row.slug)).orderBy(asc(shopVariants.sort), asc(shopVariants.createdAt));
  return {
    name: row.name,
    summary: row.summary,
    description: row.description,
    sort: row.sort,
    photoIds: parseIds(row.photoIds),
    variants: vs.map((v) => ({ sku: v.sku, label: v.label, priceSatang: v.priceSatang, active: v.active })),
  };
}

function parseDraft(json: string | null): WorkingProduct | null {
  if (!json) return null;
  try {
    const d = JSON.parse(json) as WorkingProduct;
    if (typeof d?.name !== "string" || !Array.isArray(d.photoIds) || !Array.isArray(d.variants)) return null;
    return d;
  } catch {
    return null;
  }
}

async function loadWorking(db: Database, slug: string): Promise<{ row: ShopProductRow; working: WorkingProduct; live: WorkingProduct } | null> {
  const row = await getShopProductRow(db, slug);
  if (!row) return null;
  const live = await liveWorking(db, row);
  return { row, live, working: parseDraft(row.draft) ?? live };
}

/** Admin edit page data. */
export async function getShopProductEdit(db: Database, slug: string): Promise<ShopProductEdit | null> {
  const w = await loadWorking(db, slug);
  if (!w) return null;
  const sizes = await photoSizes(db, w.working.photoIds);
  return { slug, published: w.row.published, hasDraft: w.row.draft !== null, working: w.working, photos: toPhotos(w.working.photoIds, sizes, w.working.name) };
}

/** Make `w` the published state: product columns, variants (insert, update, delete or retire) and photo cleanup. */
async function apply(db: Database, slug: string, w: WorkingProduct, live: WorkingProduct, published: boolean): Promise<Result> {
  // A SKU added in this draft may have been taken by another product since.
  const liveSkus = new Set(live.variants.map((v) => v.sku));
  const added = w.variants.filter((v) => !liveSkus.has(v.sku)).map((v) => v.sku);
  if (added.length) {
    const taken = await db.select({ sku: shopVariants.sku }).from(shopVariants).where(inArray(shopVariants.sku, added)).limit(1);
    if (taken.length) return { ok: false, error: "sku_taken" };
  }
  for (const [i, v] of w.variants.entries()) {
    if (liveSkus.has(v.sku)) await db.update(shopVariants).set({ label: v.label, priceSatang: v.priceSatang, active: v.active, sort: i }).where(eq(shopVariants.sku, v.sku));
    else await db.insert(shopVariants).values({ sku: v.sku, productSlug: slug, label: v.label, priceSatang: v.priceSatang, active: v.active, sort: i });
  }
  const kept = new Set(w.variants.map((v) => v.sku));
  for (const v of live.variants.filter((x) => !kept.has(x.sku))) {
    const [used] = await db.select({ id: shopOrderItems.id }).from(shopOrderItems).where(eq(shopOrderItems.sku, v.sku)).limit(1);
    if (used) {
      await db.update(shopVariants).set({ active: false }).where(eq(shopVariants.sku, v.sku));
    } else {
      await db.delete(shopStock).where(eq(shopStock.sku, v.sku));
      await db.delete(shopVariants).where(eq(shopVariants.sku, v.sku));
    }
  }
  const stillOn = published && w.variants.some((v) => v.active);
  await db
    .update(shopProducts)
    .set({
      name: w.name,
      summary: w.summary,
      description: w.description,
      sort: w.sort,
      photoIds: JSON.stringify(w.photoIds),
      photoId: w.photoIds[0] ?? null,
      draft: null,
      published: stillOn,
      updatedAt: nowIso(),
    })
    .where(eq(shopProducts.slug, slug));
  await dropUnusedPhotos(db, slug, w.photoIds);
  return { ok: true };
}

async function dropUnusedPhotos(db: Database, slug: string, keep: string[]) {
  await db.delete(shopPhotos).where(keep.length ? and(eq(shopPhotos.productSlug, slug), notInArray(shopPhotos.id, keep)) : eq(shopPhotos.productSlug, slug));
}

/** Save a changed working copy: a draft while on sale, applied at once otherwise. */
async function save(db: Database, slug: string, change: (w: WorkingProduct) => WorkingProduct | CatalogError | Promise<WorkingProduct | CatalogError>): Promise<Result> {
  const cur = await loadWorking(db, slug);
  if (!cur) return { ok: false, error: "not_found" };
  const next = await change(structuredClone(cur.working));
  if (typeof next === "string") return { ok: false, error: next };
  if (!cur.row.published) return apply(db, slug, next, cur.live, false);
  await db.update(shopProducts).set({ draft: JSON.stringify(next), updatedAt: nowIso() }).where(eq(shopProducts.slug, slug));
  return { ok: true };
}

export interface ProductFields {
  name: string;
  summary: string;
  description: string;
  sort: number;
}

function cleanFields(f: ProductFields): ProductFields | null {
  const name = f.name.trim().slice(0, 120);
  if (!name) return null;
  return {
    name,
    summary: f.summary.trim().slice(0, 200),
    description: f.description.replace(/\r\n/g, "\n").trim().slice(0, 4000),
    sort: Number.isInteger(f.sort) ? Math.max(-999, Math.min(999, f.sort)) : 0,
  };
}

const priceOk = (p: number | null) => p === null || (Number.isInteger(p) && p > 0 && p <= MAX_PRICE_SATANG);

/** New product, not on sale, with its first variant (a product without a variant cannot be ordered). */
export async function createShopProduct(
  db: Database,
  slug: string,
  fields: ProductFields,
  first: { sku: string; label: string; priceSatang: number | null },
): Promise<Result> {
  if (!SLUG_RE.test(slug)) return { ok: false, error: "invalid_slug" };
  const f = cleanFields(fields);
  if (!f) return { ok: false, error: "missing_name" };
  if (await getShopProductRow(db, slug)) return { ok: false, error: "slug_taken" };
  const v = await checkNewVariant(db, [], first.sku, first.label, first.priceSatang);
  if (typeof v !== "string") return { ok: false, error: v.error };
  await db.insert(shopProducts).values({ slug, ...f, published: false });
  await db.insert(shopVariants).values({ sku: first.sku, productSlug: slug, label: v, priceSatang: first.priceSatang, sort: 0 });
  return { ok: true };
}

export async function updateShopProduct(db: Database, slug: string, fields: ProductFields): Promise<Result> {
  const f = cleanFields(fields);
  if (!f) return { ok: false, error: "missing_name" };
  return save(db, slug, (w) => ({ ...w, ...f }));
}

/**
 * On sale / off sale. Either way any pending draft is applied: turning sale on publishes the edits with it,
 * and off sale nobody sees the product, so there is nothing to hold back. Going on sale needs an active variant.
 */
export async function setShopProductPublished(db: Database, slug: string, published: boolean): Promise<Result> {
  const cur = await loadWorking(db, slug);
  if (!cur) return { ok: false, error: "not_found" };
  if (published && !cur.working.variants.some((v) => v.active)) return { ok: false, error: "no_variants" };
  return apply(db, slug, cur.working, cur.live, published);
}

/** Publish the pending edits of a product on sale. */
export async function publishShopDraft(db: Database, slug: string): Promise<Result> {
  const cur = await loadWorking(db, slug);
  if (!cur) return { ok: false, error: "not_found" };
  if (cur.row.draft === null) return { ok: true };
  if (!cur.working.variants.some((v) => v.active)) return { ok: false, error: "no_variants" };
  return apply(db, slug, cur.working, cur.live, cur.row.published);
}

/** Throw the pending edits away, with any photo uploaded only for them. */
export async function discardShopDraft(db: Database, slug: string): Promise<Result> {
  const cur = await loadWorking(db, slug);
  if (!cur) return { ok: false, error: "not_found" };
  await db.update(shopProducts).set({ draft: null, updatedAt: nowIso() }).where(eq(shopProducts.slug, slug));
  await dropUnusedPhotos(db, slug, cur.live.photoIds);
  return { ok: true };
}

/** Label for a new SKU, or why not. Checks the published variants and this working copy. */
async function checkNewVariant(db: Database, working: WorkingProduct["variants"], sku: string, label: string, priceSatang: number | null): Promise<string | { error: CatalogError }> {
  if (!SKU_RE.test(sku)) return { error: "invalid_sku" };
  const l = label.trim().slice(0, 80);
  if (!l) return { error: "missing_label" };
  if (!priceOk(priceSatang)) return { error: "invalid_price" };
  if (working.some((v) => v.sku === sku)) return { error: "sku_taken" };
  const [taken] = await db.select({ sku: shopVariants.sku }).from(shopVariants).where(eq(shopVariants.sku, sku)).limit(1);
  if (taken) return { error: "sku_taken" };
  return l;
}

export async function addShopVariant(db: Database, slug: string, v: { sku: string; label: string; priceSatang: number | null }): Promise<Result> {
  return save(db, slug, async (w) => {
    const c = await checkNewVariant(db, w.variants, v.sku, v.label, v.priceSatang);
    if (typeof c !== "string") return c.error;
    return { ...w, variants: [...w.variants, { sku: v.sku, label: c, priceSatang: v.priceSatang, active: true }] };
  });
}

/** Label, price and active flag. The SKU itself never changes. */
export async function updateShopVariant(db: Database, slug: string, sku: string, v: { label: string; priceSatang: number | null; active: boolean }): Promise<Result> {
  const label = v.label.trim().slice(0, 80);
  if (!label) return { ok: false, error: "missing_label" };
  if (!priceOk(v.priceSatang)) return { ok: false, error: "invalid_price" };
  return save(db, slug, (w) => {
    if (!w.variants.some((x) => x.sku === sku)) return "not_found";
    return { ...w, variants: w.variants.map((x) => (x.sku === sku ? { ...x, label, priceSatang: v.priceSatang, active: v.active } : x)) };
  });
}

/** Remove a variant nobody ordered yet; one with orders must be set inactive instead. */
export async function deleteShopVariant(db: Database, slug: string, sku: string): Promise<Result> {
  const [used] = await db.select({ id: shopOrderItems.id }).from(shopOrderItems).where(eq(shopOrderItems.sku, sku)).limit(1);
  if (used) return { ok: false, error: "has_orders" };
  return save(db, slug, (w) => (w.variants.some((x) => x.sku === sku) ? { ...w, variants: w.variants.filter((x) => x.sku !== sku) } : "not_found"));
}

/** Image type from the first bytes, so a renamed file can't pass as a photo. */
export function sniffPhoto(bytes: Uint8Array): (typeof PHOTO_MIMES)[number] | null {
  const b = bytes;
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  return null;
}

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** Add a photo at the end (the first photo becomes the cover). Each photo gets a new id, so caches never serve an old one. */
export async function addShopProductPhoto(
  db: Database,
  slug: string,
  bytes: Uint8Array,
  size: { width: number; height: number },
): Promise<{ ok: true; id: string } | { ok: false; error: CatalogError }> {
  const cur = await loadWorking(db, slug);
  if (!cur) return { ok: false, error: "not_found" };
  if (cur.working.photoIds.length >= MAX_PHOTOS) return { ok: false, error: "too_many_photos" };
  if (bytes.length > MAX_PHOTO_BYTES) return { ok: false, error: "photo_too_large" };
  const mime = sniffPhoto(bytes);
  const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= 4000;
  if (!mime || !ok(size.width) || !ok(size.height)) return { ok: false, error: "invalid_photo" };
  const id = crypto.randomUUID();
  await db.insert(shopPhotos).values({ id, productSlug: slug, mime, width: size.width, height: size.height, dataB64: toB64(bytes) });
  const r = await save(db, slug, (w) => ({ ...w, photoIds: [...w.photoIds, id] }));
  return r.ok ? { ok: true, id } : r;
}

export async function removeShopProductPhoto(db: Database, slug: string, id: string): Promise<Result> {
  return save(db, slug, (w) => (w.photoIds.includes(id) ? { ...w, photoIds: w.photoIds.filter((x) => x !== id) } : "not_found"));
}

/** Move a photo to the front: the cover on the shop card and the first photo on the product page. */
export async function setShopProductCover(db: Database, slug: string, id: string): Promise<Result> {
  return save(db, slug, (w) => (w.photoIds.includes(id) ? { ...w, photoIds: [id, ...w.photoIds.filter((x) => x !== id)] } : "not_found"));
}

export async function getShopPhoto(db: Database, id: string): Promise<{ mime: string; bytes: Uint8Array<ArrayBuffer> } | null> {
  const [p] = await db.select({ mime: shopPhotos.mime, dataB64: shopPhotos.dataB64 }).from(shopPhotos).where(eq(shopPhotos.id, id)).limit(1);
  if (!p) return null;
  const bin = atob(p.dataB64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { mime: p.mime, bytes };
}
