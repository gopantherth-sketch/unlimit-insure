import { and, asc, eq, inArray } from "drizzle-orm";
import type { ShopProduct } from "@/content/shop";
import type { Database } from "@/lib/db/client";
import { shopOrderItems, shopPhotos, shopProducts, shopStock, shopVariants } from "@/lib/db/schema";

// Shop catalogue (task C16): entered by the owner in admin → ร้านค้า → สินค้า, read by /shop.

export type ShopProductRow = typeof shopProducts.$inferSelect;
export type ShopVariantRow = typeof shopVariants.$inferSelect;

/** Admin view: every product and variant, with flags. */
export interface AdminShopProduct extends ShopProduct {
  published: boolean;
  sort: number;
  photoId: string | null;
  variants: (ShopProduct["variants"][number] & { active: boolean })[];
}

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;
export const SKU_RE = /^[A-Z0-9](?:[A-Z0-9-]{0,38}[A-Z0-9])?$/;
export const PHOTO_MIMES = ["image/webp", "image/jpeg", "image/png"] as const;
export const MAX_PHOTO_BYTES = 600 * 1024;
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
  | "no_variants";

export const photoUrl = (id: string) => `/api/shop/photo/${id}`;

const paragraphs = (d: string) =>
  d
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/**
 * The catalogue. Public (default): published products with at least one active variant, active variants only.
 * Admin: everything.
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
  const photoIds = shown.map((p) => p.photoId).filter((x): x is string => !!x);
  const photos = photoIds.length
    ? await db.select({ id: shopPhotos.id, width: shopPhotos.width, height: shopPhotos.height }).from(shopPhotos).where(inArray(shopPhotos.id, photoIds))
    : [];
  const photoById = new Map(photos.map((p) => [p.id, p]));

  const out = shown.map((p) => {
    const photo = p.photoId ? photoById.get(p.photoId) : undefined;
    const vs = variants.filter((v) => v.productSlug === p.slug && (opts.admin || v.active));
    return {
      slug: p.slug,
      name: p.name,
      summary: p.summary,
      description: paragraphs(p.description),
      ...(photo && { photo: { src: photoUrl(photo.id), width: photo.width, height: photo.height, alt: p.name } }),
      variants: vs.map((v) => ({ sku: v.sku, label: v.label, priceSatang: v.priceSatang, ...(opts.admin && { active: v.active }) })),
      ...(opts.admin && { published: p.published, sort: p.sort, photoId: p.photoId }),
    };
  });
  return opts.admin ? (out as AdminShopProduct[]) : (out.filter((p) => p.variants.length > 0) as ShopProduct[]);
}

/** Raw product row for the admin edit form (description as typed). */
export async function getShopProductRow(db: Database, slug: string): Promise<ShopProductRow | null> {
  const [p] = await db.select().from(shopProducts).where(eq(shopProducts.slug, slug)).limit(1);
  return p ?? null;
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

/** New product, unpublished, with its first variant (a product without a variant cannot be ordered). */
export async function createShopProduct(
  db: Database,
  slug: string,
  fields: ProductFields,
  first: { sku: string; label: string; priceSatang: number | null },
): Promise<{ ok: true } | { ok: false; error: CatalogError }> {
  if (!SLUG_RE.test(slug)) return { ok: false, error: "invalid_slug" };
  const f = cleanFields(fields);
  if (!f) return { ok: false, error: "missing_name" };
  if (await getShopProductRow(db, slug)) return { ok: false, error: "slug_taken" };
  const v = await checkVariant(db, first.sku, first.label, first.priceSatang);
  if (!v.ok) return v;
  await db.insert(shopProducts).values({ slug, ...f, published: false });
  await db.insert(shopVariants).values({ sku: first.sku, productSlug: slug, label: v.label, priceSatang: first.priceSatang, sort: 0 });
  return { ok: true };
}

export async function updateShopProduct(db: Database, slug: string, fields: ProductFields): Promise<{ ok: true } | { ok: false; error: CatalogError }> {
  if (!(await getShopProductRow(db, slug))) return { ok: false, error: "not_found" };
  const f = cleanFields(fields);
  if (!f) return { ok: false, error: "missing_name" };
  await db.update(shopProducts).set({ ...f, updatedAt: nowIso() }).where(eq(shopProducts.slug, slug));
  return { ok: true };
}

/** Publishing needs at least one active variant. */
export async function setShopProductPublished(db: Database, slug: string, published: boolean): Promise<{ ok: true } | { ok: false; error: CatalogError }> {
  if (!(await getShopProductRow(db, slug))) return { ok: false, error: "not_found" };
  if (published) {
    const active = await db.select({ sku: shopVariants.sku }).from(shopVariants).where(and(eq(shopVariants.productSlug, slug), eq(shopVariants.active, true))).limit(1);
    if (active.length === 0) return { ok: false, error: "no_variants" };
  }
  await db.update(shopProducts).set({ published, updatedAt: nowIso() }).where(eq(shopProducts.slug, slug));
  return { ok: true };
}

async function checkVariant(db: Database, sku: string, label: string, priceSatang: number | null): Promise<{ ok: true; label: string } | { ok: false; error: CatalogError }> {
  if (!SKU_RE.test(sku)) return { ok: false, error: "invalid_sku" };
  const l = label.trim().slice(0, 80);
  if (!l) return { ok: false, error: "missing_label" };
  if (priceSatang !== null && (!Number.isInteger(priceSatang) || priceSatang <= 0 || priceSatang > MAX_PRICE_SATANG)) return { ok: false, error: "invalid_price" };
  const [taken] = await db.select({ sku: shopVariants.sku }).from(shopVariants).where(eq(shopVariants.sku, sku)).limit(1);
  if (taken) return { ok: false, error: "sku_taken" };
  return { ok: true, label: l };
}

export async function addShopVariant(
  db: Database,
  slug: string,
  v: { sku: string; label: string; priceSatang: number | null },
): Promise<{ ok: true } | { ok: false; error: CatalogError }> {
  if (!(await getShopProductRow(db, slug))) return { ok: false, error: "not_found" };
  const c = await checkVariant(db, v.sku, v.label, v.priceSatang);
  if (!c.ok) return c;
  const existing = await db.select({ sort: shopVariants.sort }).from(shopVariants).where(eq(shopVariants.productSlug, slug));
  const sort = existing.reduce((m, r) => Math.max(m, r.sort + 1), 0);
  await db.insert(shopVariants).values({ sku: v.sku, productSlug: slug, label: c.label, priceSatang: v.priceSatang, sort });
  return { ok: true };
}

/** Label, price and active flag. The SKU itself never changes. */
export async function updateShopVariant(
  db: Database,
  sku: string,
  v: { label: string; priceSatang: number | null; active: boolean },
): Promise<{ ok: true } | { ok: false; error: CatalogError }> {
  const [row] = await db.select().from(shopVariants).where(eq(shopVariants.sku, sku)).limit(1);
  if (!row) return { ok: false, error: "not_found" };
  const label = v.label.trim().slice(0, 80);
  if (!label) return { ok: false, error: "missing_label" };
  if (v.priceSatang !== null && (!Number.isInteger(v.priceSatang) || v.priceSatang <= 0 || v.priceSatang > MAX_PRICE_SATANG)) return { ok: false, error: "invalid_price" };
  await db.update(shopVariants).set({ label, priceSatang: v.priceSatang, active: v.active }).where(eq(shopVariants.sku, sku));
  // The last active variant of a published product was switched off: take the product off the shop.
  if (!v.active) {
    const active = await db.select({ sku: shopVariants.sku }).from(shopVariants).where(and(eq(shopVariants.productSlug, row.productSlug), eq(shopVariants.active, true))).limit(1);
    if (active.length === 0) await db.update(shopProducts).set({ published: false, updatedAt: nowIso() }).where(eq(shopProducts.slug, row.productSlug));
  }
  return { ok: true };
}

/** Delete a variant nobody ordered yet; otherwise it must be set inactive instead. */
export async function deleteShopVariant(db: Database, sku: string): Promise<{ ok: true } | { ok: false; error: "not_found" | "has_orders" }> {
  const [row] = await db.select().from(shopVariants).where(eq(shopVariants.sku, sku)).limit(1);
  if (!row) return { ok: false, error: "not_found" };
  const [used] = await db.select({ id: shopOrderItems.id }).from(shopOrderItems).where(eq(shopOrderItems.sku, sku)).limit(1);
  if (used) return { ok: false, error: "has_orders" };
  await db.delete(shopStock).where(eq(shopStock.sku, sku));
  await db.delete(shopVariants).where(eq(shopVariants.sku, sku));
  const left = await db.select({ sku: shopVariants.sku }).from(shopVariants).where(and(eq(shopVariants.productSlug, row.productSlug), eq(shopVariants.active, true))).limit(1);
  if (left.length === 0) await db.update(shopProducts).set({ published: false, updatedAt: nowIso() }).where(eq(shopProducts.slug, row.productSlug));
  return { ok: true };
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

/** Replace the product photo. The old photo row is deleted; the new one gets a new id (so caches never serve the old one). */
export async function setShopProductPhoto(
  db: Database,
  slug: string,
  bytes: Uint8Array,
  size: { width: number; height: number },
): Promise<{ ok: true; id: string } | { ok: false; error: CatalogError }> {
  const product = await getShopProductRow(db, slug);
  if (!product) return { ok: false, error: "not_found" };
  if (bytes.length > MAX_PHOTO_BYTES) return { ok: false, error: "photo_too_large" };
  const mime = sniffPhoto(bytes);
  const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= 4000;
  if (!mime || !ok(size.width) || !ok(size.height)) return { ok: false, error: "invalid_photo" };
  const id = crypto.randomUUID();
  await db.insert(shopPhotos).values({ id, productSlug: slug, mime, width: size.width, height: size.height, dataB64: toB64(bytes) });
  await db.update(shopProducts).set({ photoId: id, updatedAt: nowIso() }).where(eq(shopProducts.slug, slug));
  if (product.photoId) await db.delete(shopPhotos).where(eq(shopPhotos.id, product.photoId));
  return { ok: true, id };
}

export async function removeShopProductPhoto(db: Database, slug: string): Promise<void> {
  const product = await getShopProductRow(db, slug);
  if (!product?.photoId) return;
  await db.update(shopProducts).set({ photoId: null, updatedAt: nowIso() }).where(eq(shopProducts.slug, slug));
  await db.delete(shopPhotos).where(eq(shopPhotos.id, product.photoId));
}

export async function getShopPhoto(db: Database, id: string): Promise<{ mime: string; bytes: Uint8Array<ArrayBuffer> } | null> {
  const [p] = await db.select({ mime: shopPhotos.mime, dataB64: shopPhotos.dataB64 }).from(shopPhotos).where(eq(shopPhotos.id, id)).limit(1);
  if (!p) return null;
  const bin = atob(p.dataB64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { mime: p.mime, bytes };
}
