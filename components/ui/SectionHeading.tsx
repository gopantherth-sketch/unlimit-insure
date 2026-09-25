import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cx } from "@/lib/cx";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: { href: string; label: string };
  align?: "left" | "center";
  id?: string;
}

export function SectionHeading({ eyebrow, title, body, action, align = "left", id }: Props) {
  return (
    <div className={cx("mb-8 flex flex-col gap-4 sm:mb-10", align === "center" ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between")}>
      <div className={cx("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 id={id} className="h-section">
          {title}
        </h2>
        {body && <p className="mt-3 text-base leading-relaxed text-navy-500 sm:text-lg">{body}</p>}
      </div>
      {action && (
        <Link href={action.href} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          {action.label}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
