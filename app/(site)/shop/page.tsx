import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/shop/ProductImage";
import { PageHero } from "@/components/ui/PageHero";
import { shopCopy } from "@/content/shop";
import { getDb } from "@/lib/db/client";
import { getShopCatalog } from "@/lib/db/shop-catalog";
import { SHOW_SHOP } from "@/lib/features";
import { seo } from "@/lib/seo";
import { formatBaht, fromPrice } from "@/lib/shop/catalog";

export const metadata: Metadata = seo("/shop");
// Products are entered in admin (C16), so the page reads D1 on each request (one small query).
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  if (!SHOW_SHOP) notFound();
  const shopProducts = await getShopCatalog(await getDb());
  return (
    <div className="bg-canvas pb-16">
      <PageHero id="shop-title" eyebrow={shopCopy.eyebrow} title={shopCopy.title} body={shopCopy.intro} />
      <div className="container-page space-y-10">
        {shopProducts.length === 0 && <p className="card p-5 text-navy-700">{shopCopy.empty}</p>}
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shopProducts.map((p) => {
            const price = fromPrice(p);
            const many = new Set(p.variants.map((v) => v.priceSatang)).size > 1;
            return (
              <li key={p.slug}>
                <Link href={`/shop/${p.slug}`} className="card group flex h-full flex-col overflow-hidden rounded-xl2 transition-shadow hover:shadow-float">
                  <span className="relative block aspect-square overflow-hidden bg-wash">
                    <ProductImage product={p} sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" />
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="text-lg font-bold text-navy-900">{p.name}</span>
                    <span className="mt-1 text-navy-600">{p.summary}</span>
                    <span className="mt-auto pt-3 text-lg font-bold text-navy-900">
                      {price !== null ? `${many ? "เริ่มต้น " : ""}${formatBaht(price)} บาท` : shopCopy.priceMissing}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <section aria-labelledby="shop-how" className="card p-5 sm:p-6">
          <h2 id="shop-how" className="text-xl font-bold text-navy-900">{shopCopy.howTo.title}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-navy-700">
            {shopCopy.howTo.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-navy-500">{shopCopy.seller}</p>
        </section>
      </div>
    </div>
  );
}
