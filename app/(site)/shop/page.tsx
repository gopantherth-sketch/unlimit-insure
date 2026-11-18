import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/shop/ProductImage";
import { SoldOutBadge } from "@/components/shop/SoldOutBadge";
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
        {/* D10: two columns on phones, so a short list is not five screens of photos. */}
        <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {shopProducts.map((p) => {
            const price = fromPrice(p);
            const many = new Set(p.variants.map((v) => v.priceSatang)).size > 1;
            return (
              <li key={p.slug}>
                <Link href={`/shop/${p.slug}`} className="card group flex h-full flex-col overflow-hidden rounded-xl2 transition-shadow hover:shadow-float">
                  <span className="relative block aspect-square overflow-hidden bg-wash">
                    <ProductImage product={p} sizes="(min-width: 1024px) 380px, 50vw" />
                    <SoldOutBadge skus={p.variants.map((v) => v.sku)} />
                  </span>
                  <span className="flex flex-1 flex-col p-3 sm:p-5">
                    <span className="text-base font-bold leading-snug text-navy-900 sm:text-lg">{p.name}</span>
                    <span className="mt-1 text-sm text-navy-600 sm:text-base">{p.summary}</span>
                    <span className="tabular mt-auto pt-3 text-base font-bold text-navy-900 sm:text-lg">
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
