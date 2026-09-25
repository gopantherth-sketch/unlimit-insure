import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { Photo, ScriptAccent } from "@/components/brand/Photo";
import { homeCopy } from "@/content/home";
import { AdvisorHandoff } from "@/components/insurance/AdvisorHandoff";
import { contextFromParams } from "@/lib/leads";
import type { RawParams } from "@/lib/params";
import { getCatalog } from "@/lib/server/catalog";
import { resolveVehicle, vehicleLabel } from "@/lib/vehicle";

export const metadata: Metadata = seo("/advisor", { noindex: true });

export default async function AdvisorPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const context = contextFromParams(await searchParams);
  const catalog = await getCatalog();
  const vehicle = context.vehicle ? resolveVehicle(catalog, context.vehicle) : null;
  const planNames = Object.fromEntries(catalog.products.map((p) => [p.id, p.name]));
  const safeContext = { ...context, vehicle: vehicle ? context.vehicle : null };

  return (
    <div className="bg-canvas pb-16">
      <section aria-labelledby="advisor-title" className="relative overflow-hidden bg-gradient-to-b from-wash to-canvas">
        <div className="container-page relative grid items-end gap-6 pt-8 sm:pt-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="pb-8 lg:pb-14">
            <p className="eyebrow">Advisor</p>
            <h1 id="advisor-title" className="mt-3 text-[32px] font-bold leading-tight text-navy-900 sm:text-[44px]">
              ปรึกษาผู้เชี่ยวชาญ<span className="text-brand-600">ฟรี</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-navy-600 sm:text-lg">
              ที่ปรึกษาช่วยอธิบายความคุ้มครองและตอบคำถาม โดยเห็นข้อมูลรถและแผนที่คุณดูไว้แล้ว ไม่มีการเร่งให้ตัดสินใจ
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
              {homeCopy.advisorPoints.map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-medium text-navy-700 shadow-card">
                  <CircleCheck aria-hidden className="h-4 w-4 text-brand-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto hidden h-[300px] w-[240px] lg:block">
            <Photo slot="advisor" sizes="240px" className="object-contain object-bottom" />
            <ScriptAccent lines={["We're", "Here for You"]} className="absolute -left-44 bottom-20 -rotate-[8deg] text-[40px]" />
          </div>
        </div>
      </section>
      <div className="container-page mt-6 sm:mt-8">
        <AdvisorHandoff context={safeContext} planNames={planNames} vehicleText={vehicle ? vehicleLabel(vehicle) : null} />
      </div>
    </div>
  );
}
