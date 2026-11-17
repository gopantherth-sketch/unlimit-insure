import { shopCopy, shopProducts, type ShopProduct, type ShopVariant } from "@/content/shop";

export const MAX_ORDER_QTY = 99;
/** Product lines on the admin "new order" form. */
export const NEW_ORDER_LINES = 3;

export function findProduct(slug: string, products: ShopProduct[] = shopProducts): ShopProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function findSku(sku: string, products: ShopProduct[] = shopProducts): { product: ShopProduct; variant: ShopVariant } | undefined {
  for (const product of products) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

/** Whole quantity between 1 and MAX_ORDER_QTY, or null. */
export function cleanQty(raw: unknown): number | null {
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").trim());
  return Number.isInteger(n) && n >= 1 && n <= MAX_ORDER_QTY ? n : null;
}

/** 12345 satang → "123.45"; whole baht drop the decimals ("1,290"). */
export function formatBaht(satang: number): string {
  const baht = satang / 100;
  return baht.toLocaleString("en-US", { minimumFractionDigits: satang % 100 ? 2 : 0, maximumFractionDigits: 2 });
}

/** "129" / "129.50" / "1,290" → satang, or null if not a positive amount with at most 2 decimals. */
export function parseBaht(raw: string): number | null {
  const s = raw.replace(/[,\s]/g, "");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(s)) return null;
  const [b, d = ""] = s.split(".");
  const v = Number(b) * 100 + Number(d.padEnd(2, "0"));
  return v > 0 ? v : null;
}

/** Prefilled LINE text for one product line. Price parts are left to the admin when the price is not set. */
export function orderMessage(product: ShopProduct, variant: ShopVariant, qty: number): string {
  const priced = variant.priceSatang !== null;
  return shopCopy.orderMessage({
    product: product.name,
    variant: variant.label,
    qty,
    unit: priced ? formatBaht(variant.priceSatang!) : null,
    total: priced ? formatBaht(variant.priceSatang! * qty) : null,
  });
}

/** Lowest set price across variants, for cards ("เริ่มต้น"). */
export function fromPrice(product: ShopProduct): number | null {
  const prices = product.variants.map((v) => v.priceSatang).filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
}
