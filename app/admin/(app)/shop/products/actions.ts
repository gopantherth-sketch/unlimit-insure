"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import {
  addShopVariant,
  createShopProduct,
  deleteShopVariant,
  MAX_PHOTO_BYTES,
  removeShopProductPhoto,
  setShopProductPhoto,
  setShopProductPublished,
  updateShopProduct,
  updateShopVariant,
} from "@/lib/db/shop-catalog";
import { requireOwner } from "@/lib/server/admin-auth";
import { parseBaht } from "@/lib/shop/catalog";

// Shop catalogue (C16). Owners only: products and prices are the owner's facts (O12).

const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const num = (f: FormData, k: string) => {
  const n = Number(str(f, k, 10));
  return Number.isFinite(n) ? Math.round(n) : 0;
};
/** Blank = no price yet (null); otherwise a valid amount or "invalid". */
const price = (f: FormData, k: string): number | null | "invalid" => {
  const raw = str(f, k, 20);
  if (!raw) return null;
  return parseBaht(raw) ?? "invalid";
};
const fields = (f: FormData) => ({ name: str(f, "name", 120), summary: str(f, "summary", 200), description: str(f, "description", 4000), sort: num(f, "sort") });

function done(slug: string | null, q: string): never {
  revalidatePath("/admin/shop/products");
  revalidatePath("/admin/shop");
  if (slug) revalidatePath(`/admin/shop/products/${slug}`);
  redirect(slug ? `/admin/shop/products/${encodeURIComponent(slug)}?${q}` : `/admin/shop/products?${q}`);
}

export async function createShopProductAction(formData: FormData) {
  await requireOwner();
  const slug = str(formData, "slug", 60).toLowerCase();
  const p = price(formData, "price");
  if (p === "invalid") done(null, "error=invalid_price");
  const r = await createShopProduct(await getDb(), slug, fields(formData), { sku: str(formData, "sku", 40).toUpperCase(), label: str(formData, "label", 80), priceSatang: p });
  if (!r.ok) done(null, `error=${r.error}`);
  done(slug, "ok=created");
}

export async function updateShopProductAction(formData: FormData) {
  await requireOwner();
  const slug = str(formData, "slug", 60);
  const r = await updateShopProduct(await getDb(), slug, fields(formData));
  done(slug, r.ok ? "ok=saved" : `error=${r.error}`);
}

export async function publishShopProductAction(formData: FormData) {
  await requireOwner();
  const slug = str(formData, "slug", 60);
  const on = str(formData, "published", 5) === "1";
  const r = await setShopProductPublished(await getDb(), slug, on);
  done(slug, r.ok ? `ok=${on ? "published" : "unpublished"}` : `error=${r.error}`);
}

export async function addShopVariantAction(formData: FormData) {
  await requireOwner();
  const slug = str(formData, "slug", 60);
  const p = price(formData, "price");
  if (p === "invalid") done(slug, "error=invalid_price#variants");
  const r = await addShopVariant(await getDb(), slug, { sku: str(formData, "sku", 40).toUpperCase(), label: str(formData, "label", 80), priceSatang: p });
  done(slug, r.ok ? "ok=variant_added#variants" : `error=${r.error}#variants`);
}

export async function updateShopVariantAction(formData: FormData) {
  await requireOwner();
  const slug = str(formData, "slug", 60);
  const sku = str(formData, "sku", 40);
  if (str(formData, "intent", 10) === "delete") {
    const r = await deleteShopVariant(await getDb(), sku);
    done(slug, r.ok ? "ok=variant_deleted#variants" : `error=${r.error}#variants`);
  }
  const p = price(formData, "price");
  if (p === "invalid") done(slug, "error=invalid_price#variants");
  const r = await updateShopVariant(await getDb(), sku, { label: str(formData, "label", 80), priceSatang: p, active: formData.get("active") === "on" });
  done(slug, r.ok ? "ok=variant#variants" : `error=${r.error}#variants`);
}

export async function uploadShopPhotoAction(formData: FormData) {
  await requireOwner();
  const slug = str(formData, "slug", 60);
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) done(slug, "error=invalid_photo#photo");
  if (file.size > MAX_PHOTO_BYTES) done(slug, "error=photo_too_large#photo");
  const r = await setShopProductPhoto(await getDb(), slug, new Uint8Array(await file.arrayBuffer()), { width: num(formData, "width"), height: num(formData, "height") });
  done(slug, r.ok ? "ok=photo#photo" : `error=${r.error}#photo`);
}

export async function removeShopPhotoAction(formData: FormData) {
  await requireOwner();
  const slug = str(formData, "slug", 60);
  await removeShopProductPhoto(await getDb(), slug);
  done(slug, "ok=photo_removed#photo");
}
