import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { ExplainButton } from "@/components/insurance/ExplainButton";
import { LabTool } from "@/components/lab/LabTool";
import { TrackView } from "@/components/TrackView";
import { buttonClass } from "@/components/ui/button";
import { PageHero } from "@/components/ui/PageHero";
import { glossary } from "@/content/glossary";
import { labArticles } from "@/content/lab";

type Params = Promise<{ slug: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const a = labArticles.find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.summary } : { title: "ไม่พบบทความ" };
}

export default async function LabArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = labArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <article aria-labelledby="article-title" className="bg-canvas pb-16">
      <TrackView name="lab_viewed" dim={article.slug} />
      <PageHero
        id="article-title"
        narrow
        before={
          <Link href="/lab" className="link-arrow min-h-[44px]">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Insurance Lab
          </Link>
        }
        eyebrow="Insurance Lab"
        title={article.title}
        body={article.summary}
      >
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-navy-400">
          <Clock aria-hidden className="h-4 w-4" />
          อ่าน {article.readMinutes} นาที
        </p>
      </PageHero>
      <div className="container-page max-w-4xl">
        <div>
          <LabTool tool={article.tool} />
        </div>

        <div className="mt-10 space-y-8">
          {article.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-[22px] font-bold leading-snug text-navy-900 sm:text-[26px]">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 text-[17px] leading-[1.85] text-navy-700">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[17px] leading-relaxed text-navy-700 marker:text-brand-500">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {article.relatedTerms.length > 0 && (
          <section aria-labelledby="terms" className="mt-10">
            <h2 id="terms" className="text-lg font-bold text-navy-900">
              คำที่เกี่ยวข้อง
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {article.relatedTerms.map((t) => (
                <li key={t} className="inline-flex items-center gap-1 rounded-full bg-white py-1 pl-3.5 pr-1 text-sm font-medium text-navy-700 shadow-card">
                  {glossary[t].term}
                  <ExplainButton term={t} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 flex flex-col items-start gap-4 rounded-xl2 border border-brand-100 bg-gradient-to-r from-brand-50 to-wash p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-xl font-semibold text-navy-900">ดูความต่างนี้กับรถของคุณเอง</p>
            <p className="mt-1 text-navy-600">เลือกรถแล้วลองเปรียบเทียบแผนสำหรับรถคันนั้น ยังไม่ต้องให้เบอร์โทร</p>
          </div>
          <Link href="/quote" className={buttonClass("primary", "md", "shrink-0 rounded-xl px-6")}>
            เพิ่มรถของคุณ
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
