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
  const mark = size === "sm" ? 44 : 52;
  return (
    <Link href="/" className={cx("inline-flex items-center gap-2.5", className)} aria-label="Unlimit Insure หน้าแรก">
      <span className={cx("inline-flex shrink-0 items-center justify-center rounded-full", tone === "light" && "bg-white p-0.5")}>
        <Image src="/brand/unlimit-mark.png" alt="" width={mark} height={mark} priority />
      </span>
      <span className={cx("flex flex-col font-display font-semibold leading-[1.02] tracking-tight", size === "sm" ? "text-[19px]" : "text-[22px]")}>
        <span className={tone === "light" ? "text-white" : "text-brand-700"}>Unlimit</span>
        <span className={tone === "light" ? "text-brand-200" : "text-brand-600"}>Insure</span>
      </span>
    </Link>
  );
}
