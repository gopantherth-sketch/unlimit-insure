import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Photo, type PhotoSlot } from "@/components/brand/Photo";
import { labToolIcon } from "@/components/home/InsuranceLabSection";
import { PageHero } from "@/components/ui/PageHero";
import { labArticles } from "@/content/lab";
import { homeCopy } from "@/content/home";

export const metadata: Metadata = seo("/lab");

// Thumbnail photo (when a slot exists) and category chip per article, as in the homepage ContentRow.
const cardMeta: Record<string, { photo?: PhotoSlot; tag: string }> = {
  "type1-vs-2plus": { photo: "articleSteering", tag: "ความรู้" },
  "dealer-vs-garage": { tag: "การซ่อม" },
  "what-is-excess": { tag: "คำศัพท์" },
  "flood-cover": { photo: "articleFlood", tag: "น้ำท่วม" },
  "ev-insurance": { photo: "articleEv", tag: "EV" },
};

export default function LabIndexPage() {
  return (
    <div className="bg-canvas pb-16">
      <PageHero id="lab-title" eyebrow="Insurance Lab" title="เข้าใจประกันด้วยการลองเอง" body={homeCopy.labBody} />
      <div className="container-page">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {labArticles.map((a) => {
            const Icon = labToolIcon[a.tool];
            const meta = cardMeta[a.slug];
            return (
              <li key={a.slug}>
                <Link href={`/lab/${a.slug}`} className="card group flex h-full flex-col overflow-hidden rounded-xl2 transition-shadow hover:shadow-float">
                  <span className="relative block aspect-[3/2] overflow-hidden bg-wash">
                    {meta?.photo ? (
                      <Photo slot={meta.photo} alt="" sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span aria-hidden className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-wash">
                        <Icon className="h-16 w-16 text-brand-600" strokeWidth={1.25} />
                      </span>
                    )}
                  </span>
                  <span className="flex flex-1 flex-col p-5 sm:p-6">
                    <span className="flex items-center gap-2">
                      {meta && <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{meta.tag}</span>}
                      <span className="inline-flex items-center gap-1 text-[13px] text-navy-400">
                        <Clock aria-hidden className="h-3.5 w-3.5" />
                        อ่าน {a.readMinutes} นาที
                      </span>
                    </span>
                    <h2 className="mt-3 text-[19px] font-bold leading-snug text-navy-900 group-hover:text-brand-700">{a.title}</h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-navy-500">{a.summary}</p>
                    <span className="link-arrow mt-auto pt-5">
                      {a.ctaLabel}
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
