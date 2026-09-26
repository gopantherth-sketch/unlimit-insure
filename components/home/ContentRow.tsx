import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { photos, type PhotoSlot } from "@/components/brand/Photo";
import { buttonClass } from "@/components/ui/button";
import { CoverMark } from "@/components/ui/CoverMark";
import { homeCopy } from "@/content/home";
import { labArticles } from "@/content/lab";

const featured: { slug: string; photo: PhotoSlot; tag: string }[] = [
  { slug: "flood-cover", photo: "articleFlood", tag: "น้ำท่วม" },
  { slug: "ev-insurance", photo: "articleEv", tag: "EV" },
  { slug: "type1-vs-2plus", photo: "articleSteering", tag: "ความรู้" },
];

export interface TypeTable {
  /** Column headers, e.g. ชั้น 1 / ชั้น 2+ / ชั้น 3+ */
  columns: string[];
  rows: { label: string; covered: boolean[] }[];
  caption: string;
  href: string;
}

function CardHeader({ id, title, href }: { id: string; title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 id={id} className="text-[22px] font-bold text-navy-900 sm:text-2xl">
        {title}
      </h2>
      <Link href={href} className="link-arrow">
        ดูทั้งหมด
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </div>
  );
}

/** Two-column row: articles with thumbnails + compact insurance-type table (mockup §8). */
export function ContentRow({ table }: { table: TypeTable | null }) {
  const articles = featured
    .map((f) => ({ ...f, article: labArticles.find((a) => a.slug === f.slug) }))
    .filter((f) => f.article !== undefined);

  return (
    <div className="bg-white py-14 sm:py-16">
      <div className="container-page grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="articles-title" className="flex min-w-0 flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-7">
          <CardHeader id="articles-title" title={homeCopy.articlesTitle} href="/lab" />
          <ul className="mt-5 flex flex-1 flex-col justify-evenly gap-4">
            {articles.map(({ slug, photo, tag, article }) => {
              const p = photos[photo];
              return (
                <li key={slug}>
                  <Link href={`/lab/${slug}`} className="group flex items-center gap-4 rounded-xl p-1 transition-colors hover:bg-wash">
                    <span className="relative block h-[76px] w-[112px] shrink-0 overflow-hidden rounded-xl sm:h-[100px] sm:w-[150px]">
                      <Image src={p.src} width={p.width} height={p.height} alt="" sizes="150px" unoptimized className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    </span>
                    <span className="min-w-0">
                      <span className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">{tag}</span>
                      <span className="mt-1 block text-base font-medium leading-snug text-navy-900 group-hover:text-brand-700 sm:text-[17px]">{article!.title}</span>
                      <span className="mt-1 flex items-center gap-1.5 text-[13px] text-navy-400">
                        <Clock aria-hidden className="h-3.5 w-3.5" />
                        อ่าน {article!.readMinutes} นาที
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {table && (
          <section aria-labelledby="type-table-title" className="flex min-w-0 flex-col rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-7">
            <CardHeader id="type-table-title" title={homeCopy.typeTableTitle} href="/lab/type1-vs-2plus" />
            <div tabIndex={0} role="region" aria-label="ตารางเทียบชั้นประกัน (เลื่อนซ้าย-ขวาได้)" className="-mx-1 mt-5 overflow-x-auto rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
              <table className="w-full min-w-[300px] overflow-hidden rounded-xl text-[13px] sm:text-sm">
                <caption className="caption-bottom pt-3 text-left text-xs text-navy-400">{table.caption}</caption>
                <thead>
                  <tr className="bg-wash">
                    <th scope="col" className="px-3 py-3 text-left font-sans font-semibold text-navy-800">ความคุ้มครอง</th>
                    {table.columns.map((c, i) => (
                      <th key={c} scope="col" className={`w-[17%] px-1 py-3 text-center font-sans font-semibold ${i === 0 ? "text-brand-600" : "text-navy-800"}`}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r, ri) => (
                    <tr key={r.label} className={ri % 2 === 1 ? "bg-wash/60" : undefined}>
                      <th scope="row" className="px-2.5 py-2.5 text-left font-normal text-navy-700 sm:px-3">{r.label}</th>
                      {r.covered.map((c, i) => (
                        <td key={i} className="px-1 py-2.5 text-center">
                          <CoverMark covered={c} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href={table.href} className={buttonClass("primary", "md", "mt-5 w-full sm:w-auto sm:self-start sm:px-10")}>
              {homeCopy.typeTableCta}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
