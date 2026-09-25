import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ExplainButton } from "@/components/insurance/ExplainButton";
import { LabTool } from "@/components/lab/LabTool";
import { buttonClass } from "@/components/ui/button";
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
    <div className="bg-canvas pb-16">
      <article className="container-page max-w-4xl py-10 sm:py-14">
        <Link href="/lab" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Insurance Lab
        </Link>
        <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
        <p className="mt-3 text-lg text-navy-500">{article.summary}</p>
        <p className="mt-2 text-sm text-navy-400">อ่าน {article.readMinutes} นาที</p>

        <div className="mt-8">
          <LabTool tool={article.tool} />
        </div>

        <div className="mt-10 space-y-8">
          {article.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-bold sm:text-2xl">{s.heading}</h2>
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
            <h2 id="terms" className="text-lg font-bold">
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

        <div className="card mt-10 flex flex-col items-start gap-4 bg-navy-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="text-lg font-semibold">ดูความต่างนี้กับรถของคุณเอง</p>
          <Link href="/quote" className={buttonClass("white", "md")}>
            เพิ่มรถของคุณ
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
