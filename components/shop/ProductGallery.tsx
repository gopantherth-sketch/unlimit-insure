"use client";

import Image from "next/image";
import { useState } from "react";
import type { ShopProduct } from "@/content/shop";
import { cx } from "@/lib/cx";
import { ProductImage } from "./ProductImage";

/** Product page photos (C18): the chosen photo large, thumbnails under it when there is more than one. */
export function ProductGallery({ product }: { product: ShopProduct }) {
  const photos = product.photos ?? (product.photo ? [product.photo] : []);
  const [at, setAt] = useState(0);
  const main = photos[Math.min(at, photos.length - 1)];

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-xl2 bg-wash">
        {main ? (
          <Image key={main.src} src={main.src} width={main.width} height={main.height} alt={main.alt} sizes="(min-width: 1024px) 560px, 100vw" unoptimized priority={at === 0} className="h-full w-full object-cover" />
        ) : (
          <ProductImage product={product} sizes="(min-width: 1024px) 560px, 100vw" />
        )}
      </div>
      {photos.length > 1 && (
        <ul className="grid grid-cols-6 gap-2" aria-label="รูปสินค้า">
          {photos.map((p, i) => (
            <li key={p.src}>
              <button
                type="button"
                onClick={() => setAt(i)}
                aria-label={`ดูรูปที่ ${i + 1} จาก ${photos.length}`}
                aria-pressed={i === at}
                className={cx(
                  "block aspect-square w-full overflow-hidden rounded-lg bg-wash ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600",
                  i === at ? "ring-2 ring-navy-900" : "opacity-80 hover:opacity-100",
                )}
              >
                <Image src={p.src} width={p.width} height={p.height} alt="" sizes="96px" unoptimized className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
