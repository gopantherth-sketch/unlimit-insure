import { cx } from "@/lib/cx";

interface Props {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Rendered above the eyebrow (e.g. a back link). */
  before?: React.ReactNode;
  /** Rendered under the body (CTAs, chips, notices). */
  children?: React.ReactNode;
  /** Optional right-hand column on desktop (photo, icon, summary). */
  aside?: React.ReactNode;
  /** Narrow the text column for reading pages. */
  narrow?: boolean;
  id?: string;
  className?: string;
}

/** Hero band for inner pages: pale-blue wash, eyebrow, Prompt heading (homepage visual language). */
export function PageHero({ eyebrow, title, body, before, children, aside, narrow, id, className }: Props) {
  return (
    <section aria-labelledby={id} className={cx("bg-gradient-to-b from-wash to-canvas", className)}>
      <div className={cx("container-page pb-8 pt-8 sm:pb-12 sm:pt-12", narrow && "max-w-4xl", !!aside && "grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center")}>
        <div>
          {before}
          {eyebrow && <p className={cx("eyebrow", !!before && "mt-4")}>{eyebrow}</p>}
          <h1 id={id} className="mt-3 text-[30px] font-bold leading-[1.2] text-navy-900 sm:text-[40px]">
            {title}
          </h1>
          {body && <div className="mt-3 max-w-2xl text-[17px] leading-relaxed text-navy-600 sm:text-lg">{body}</div>}
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}
