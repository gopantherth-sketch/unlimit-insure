import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { ShopProduct } from "@/content/shop";
import { cx } from "@/lib/cx";

/** The owner's product photo (uploaded in admin, already resized; served as is), or a designed tile until one arrives (O12). */
export function ProductImage({ product, sizes, className }: { product: ShopProduct; sizes: string; className?: string }) {
  if (product.photo) {
    return <Image src={product.photo.src} width={product.photo.width} height={product.photo.height} alt={product.photo.alt} sizes={sizes} unoptimized className={cx("h-full w-full object-cover", className)} />;
  }
  return (
    <span aria-hidden className={cx("relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-navy-900", className)}>
      <span className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
      <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/25">
        <Sparkles className="h-10 w-10 text-white" strokeWidth={1.5} />
      </span>
    </span>
  );
}
