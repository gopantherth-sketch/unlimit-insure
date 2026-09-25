import Image from "next/image";
import { cx } from "@/lib/cx";

/**
 * Photo slots for the homepage (design/mockup-spec.md). Each slot points at a file in
 * public/images/. The files shipped now are original placeholder illustrations; to use real
 * photography, overwrite the file with the same name and size ratio (≤ 250 KB, .webp) — no code
 * change needed. If the ratio changes, update width/height here.
 *
 * Original photos for every slot were generated in Canva (media ids below) and can be exported
 * from there: they could not be downloaded from this build environment.
 * Never use real insurer logos, car brand badges or readable number plates.
 */
export const photos = {
  hero: {
    src: "/images/hero-suv.webp",
    width: 1400,
    height: 1000,
    alt: "รถ SUV สีเงินจอดบนถนนโล่ง ท้องฟ้าสีฟ้าและตึกในเมืองอยู่ด้านหลัง",
    canva: "MAHWOnIofOk",
  },
  lifestyle: {
    src: "/images/lifestyle-driver.webp",
    width: 1200,
    height: 771,
    alt: "ผู้หญิงยิ้มมองออกมาจากหน้าต่างฝั่งคนขับในวันที่แดดดี",
    canva: "MAHWOqRfgFM",
  },
  advisor: {
    src: "/images/advisor.webp",
    width: 640,
    height: 800,
    alt: "ที่ปรึกษาของ Unlimit Insure สวมหูฟังพร้อมให้คำแนะนำ",
    canva: "MAHWOmIS6lI",
  },
  articleFlood: {
    src: "/images/article-flood.webp",
    width: 480,
    height: 320,
    alt: "",
    canva: "MAHWOqfOnkQ",
  },
  articleEv: {
    src: "/images/article-ev.webp",
    width: 480,
    height: 320,
    alt: "",
    canva: "MAHWOk_eNcc",
  },
  articleSteering: {
    src: "/images/article-steering.webp",
    width: 480,
    height: 320,
    alt: "",
    canva: "MAHWOgbskAk",
  },
} as const;

export type PhotoSlot = keyof typeof photos;

interface Props {
  slot: PhotoSlot;
  /** Responsive `sizes` hint, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Override the slot's default alt (use "" when the image is decorative in context). */
  alt?: string;
}

// Files are pre-sized and compressed, so they are served as-is (no runtime optimiser on Workers).
export function Photo({ slot, sizes, className, priority, alt }: Props) {
  const p = photos[slot];
  return (
    <Image
      src={p.src}
      width={p.width}
      height={p.height}
      alt={alt ?? p.alt}
      sizes={sizes}
      priority={priority}
      unoptimized
      className={cx("h-full w-full object-cover", className)}
    />
  );
}

/** Blue handwritten English accent. Decorative only. */
export function ScriptAccent({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <span aria-hidden className={cx("script-accent block", className)}>
      {lines.map((l, i) => (
        <span key={l} className="block whitespace-nowrap" style={{ paddingLeft: `${i * 0.9}em` }}>
          {l}
        </span>
      ))}
    </span>
  );
}
