import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { TrackView } from "@/components/TrackView";
import { InsuranceCard } from "@/components/insurance/InsuranceCard";
import { buttonClass } from "@/components/ui/button";
import { modelPages } from "@/content/models";
import { formatBaht } from "@/lib/format";
import { rankQuotes } from "@/lib/match";
import { withJourney } from "@/lib/params";
import { generateQuotes } from "@/lib/quote";
import { getCatalog } from "@/lib/server/catalog";
import { resolveVehicle, vehicleLabel, yearsForModel } from "@/lib/vehicle";

export const dynamic = "force-dynamic";

type Params = Promise<{ brandId: string; modelId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { brandId, modelId } = await params;
  const copy = modelPages.find((m) => m.modelId === modelId);
  if (!copy) return { title: "ไม่พบรุ่นรถ" };
  return { title: copy.seoTitle, description: copy.seoDescription, alternates: { canonical: `/insurance/${brandId}/${modelId}` } };
}

export default async function ModelPage({ params }: { params: Params }) {
  const { brandId, modelId } = await params;
  const copy = modelPages.find((m) => m.modelId === modelId);
  const catalog = await getCatalog();
  const model = catalog.models.find((m) => m.id === modelId && m.brandId === brandId);
  if (!copy || !model) notFound();

  const year = yearsForModel(model, new Date().getFullYear())[1] ?? model.yearTo;
  const vehicle = resolveVehicle(catalog, { brandId, modelId, year });
  if (!vehicle) notFound();
  const quotes = rankQuotes(generateQuotes(catalog, vehicle), [], vehicle).slice(0, 3);
  const journey = { vehicle: { brandId, modelId, year } };

  return (
    <div className="bg-canvas pb-16">
      <TrackView name="model_page_viewed" />
      <div className="container-page py-10 sm:py-14">
        <p className="eyebrow">{vehicle.brand.name}</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{copy.h1}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-navy-600">{copy.intro}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={withJourney("/quote", { ...journey, step: "use" })} className={buttonClass("primary", "lg")}>
            เช็กประกันสำหรับ {vehicle.model.name}
            <ArrowRight aria-hidden className="h-5 w-5" />
          </Link>
          <span className="text-sm text-navy-500">เลือกปีรถได้ในขั้นถัดไป · ไม่ต้องให้เบอร์โทร</span>
        </div>

        <section aria-labelledby="consider" className="mt-12">
          <h2 id="consider" className="h-section">สิ่งที่ควรพิจารณาสำหรับรถรุ่นนี้</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {copy.considerations.map((c) => (
              <li key={c.title} className="card p-5">
                <Check aria-hidden className="h-5 w-5 text-brand-600" />
                <h3 className="mt-3 font-bold">{c.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-navy-600">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {quotes.length > 0 && (
          <section aria-labelledby="examples" className="mt-12">
            <h2 id="examples" className="h-section">ตัวอย่างแพ็กเกจสำหรับ {vehicleLabel(vehicle)}</h2>
            <p className="mt-2 text-navy-500">
              มูลค่ารถโดยประมาณ {formatBaht(vehicle.estimatedValue)} · เรียงตามเบี้ย เลือกสิ่งที่สำคัญกับคุณเพื่อดูว่าแผนไหนตรงที่สุด
            </p>
            <ul className="mt-6 grid gap-5 md:grid-cols-3">
              {quotes.map((q) => (
                <li key={q.id}>
                  <InsuranceCard
                    quote={q}
                    detailHref={withJourney(`/plans/${q.productId}`, journey)}
                    selectHref={withJourney("/advisor", { ...journey, plans: [q.productId] })}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="model-faq" className="mt-12 max-w-3xl">
          <h2 id="model-faq" className="h-section">คำถามที่พบบ่อย</h2>
          <div className="mt-5 space-y-3">
            {copy.faq.map((f) => (
              <details key={f.question} className="group card overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-navy-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-navy-600">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
