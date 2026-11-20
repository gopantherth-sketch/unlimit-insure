import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft } from "lucide-react";
import { OrderPicker } from "@/components/shop/OrderPicker";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { shopCopy } from "@/content/shop";
import { getDb } from "@/lib/db/client";
import { getShopCatalog } from "@/lib/db/shop-catalog";
import { SHOW_SHOP } from "@/lib/features";
import { findProduct } from "@/lib/shop/catalog";
import { SITE_URL } from "@/lib/site";

// Products are entered in admin (C16): read from D1 per request, once for metadata and page (React cache).
export const dynamic = "force-dynamic";

const load = cache(async (slug: string) => (SHOW_SHOP ? findProduct(slug, await getShopCatalog(await getDb())) : undefined));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return {};
  return { title: p.name, description: p.summary, alternates: { canonical: `/shop/${p.slug}` } };
}

export default async function ShopProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await load((await params).slug);
  if (!product) notFound();
  // Product JSON-LD: real price and availability only (no ratings or reviews).
  const priced = product.variants.filter((v) => v.priceSatang !== null);
  const jsonLd = priced.length
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.summary,
        ...(product.photos?.length && { image: product.photos.map((p) => `${SITE_URL}${p.src}`) }),
        offers: priced.map((v) => ({
          "@type": "Offer",
          sku: v.sku,
          name: v.label,
          price: (v.priceSatang! / 100).toFixed(2),
          priceCurrency: "THB",
          url: `${SITE_URL}/shop/${product.slug}`,
        })),
      }
    : null;

  return (
    <div className="bg-canvas pb-16 pt-6 sm:pt-10">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />}
      <div className="container-page">
        <Link href="/shop" className="inline-flex min-h-11 items-center gap-1 font-medium text-brand-700 hover:underline">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          {shopCopy.backToShop}
        </Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:items-start">
          <ProductGallery product={product} />
          <div className="space-y-6">
            <div>
              <h1 className="text-[28px] font-bold leading-tight text-navy-900 sm:text-[36px]">{product.name}</h1>
              <p className="mt-2 text-lg text-navy-600">{product.summary}</p>
            </div>
            <OrderPicker product={product} />
            <div className="space-y-3 text-navy-700">
              {product.description.map((d) => (
                <p key={d}>{d}</p>
              ))}
            </div>
            <p className="text-sm text-navy-500">{shopCopy.seller}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
