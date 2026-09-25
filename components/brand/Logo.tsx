import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/cx";

interface Props {
  className?: string;
  /** "dark" for light backgrounds, "light" for navy backgrounds. */
  tone?: "dark" | "light";
  size?: "sm" | "md";
}

export function Logo({ className, tone = "dark", size = "md" }: Props) {
  const mark = size === "sm" ? 36 : 44;
  return (
    <Link href="/" className={cx("inline-flex items-center gap-2.5", className)} aria-label="Unlimit Insure หน้าแรก">
      <span className={cx("inline-flex shrink-0 items-center justify-center rounded-full", tone === "light" && "bg-white p-0.5")}>
        <Image src="/brand/unlimit-mark.png" alt="" width={mark} height={mark} priority />
      </span>
      <span className={cx("flex flex-col font-bold leading-[1.05]", size === "sm" ? "text-base" : "text-lg")}>
        <span className={tone === "light" ? "text-white" : "text-navy-900"}>Unlimit</span>
        <span className={tone === "light" ? "text-brand-200" : "text-brand-600"}>Insure</span>
      </span>
    </Link>
  );
}
