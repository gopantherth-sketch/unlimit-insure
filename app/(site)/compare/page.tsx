import { seo } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Headset } from "lucide-react";
import { CoverageSimulator } from "@/components/home/CoverageSimulatorDemo";
import { CompareTable } from "@/components/insurance/CompareTable";
import { DifferenceSummary } from "@/components/insurance/DifferenceSummary";
import { InsurerMark } from "@/components/insurance/InsurerMark";
import { PriceOnRequest } from "@/components/insurance/PriceOnRequest";
import { contact } from "@/content/contact";
import { SHOW_PRICES } from "@/lib/features";
import { formatNumber } from "@/lib/format";
import { JourneySteps } from "@/components/quote/JourneySteps";
import { NeedVehicle } from "@/components/quote/NeedVehicle";
import { RememberCompared } from "@/components/quote/RememberCompared";
import { buttonClass } from "@/components/ui/button";
import { rankQuotes } from "@/lib/match";
import { parsePlanIds, parseQuoteInput, withJourney, type RawParams, selectPlanHref } from "@/lib/params";
import { generateQuotes } from "@/lib/quote";
import type { RankedQuote } from "@/lib/types";
import { getCatalog } from "@/lib/server/catalog";
import { purchaseEnabled } from "@/lib/server/features";
import { isElectric, resolveVehicle, vehicleLabel } from "@/lib/vehicle";

export const metadata: Metadata = seo("/compare", { noindex: true });

const planLabel = (i: number) => `แผน ${String.fromCharCode(65 + i)}`;

export default async function ComparePage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const input = parseQuoteInput(raw);
  const catalog = await getCatalog();
  const buyEnabled = await purchaseEnabled();
  const vehicle = input ? resolveVehicle(catalog, input.vehicle) : null;
  if (!input || !vehicle) {
    return <NeedVehicle title="เลือกรถก่อนเปรียบเทียบ" body="การเปรียบเทียบจะแม่นขึ้นเมื่อเรารู้ว่าคุณขับรถอะไร ใช้เวลาไม่ถึงนาที และยังไม่ต้องให้เบอร์โทร" />;
  }

  const ranked = rankQuotes(generateQuotes(catalog, vehicle), input.priorities, vehicle);
  const requested = parsePlanIds(raw)
    .map((id) => ranked.find((q) => q.productId === id))
    .filter((q): q is RankedQuote => q !== undefined);
  // Fewer than two chosen: keep the chosen plan first and fill with the best-matching others.
  const quotes = requested.length >= 2 ? requested : [...requested, ...ranked.filter((q) => !requested.includes(q))].slice(0, 3);
  const labels = quotes.map((_, i) => planLabel(i));
  const journey = { vehicle: input.vehicle, usage: input.usage, priorities: input.priorities };
  const plans = quotes.map((q) => q.productId);

  return (
    <div className="bg-canvas pb-16">
      <RememberCompared ids={plans} />
      <div className="bg-gradient-to-b from-wash to-canvas">
        <div className="container-page pb-2 pt-6 sm:pt-10">
          <JourneySteps current={4} />
          <Link href={withJourney("/quote/results", journey)} className="link-arrow mt-6 min-h-[44px]">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            กลับไปดูแพ็กเกจทั้งหมด
          </Link>
          <p className="eyebrow mt-2">Smart Compare</p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight text-navy-900 sm:text-[36px]">เปรียบเทียบแพ็กเกจ</h1>
          <p className="mt-2 text-[15px] text-navy-500 sm:text-base">
            สำหรับ {vehicleLabel(vehicle)}
            {requested.length < 2 && " — เราเพิ่มแพ็กเกจที่ตรงกับสิ่งที่คุณต้องการให้แล้ว เปลี่ยนได้จากหน้าแพ็กเกจ"}
          </p>
        </div>
      </div>

      <div className="container-page">
        {quotes.length < 2 ? (
          <p className="card mt-8 rounded-xl2 p-8 text-center text-navy-500">มีแพ็กเกจไม่พอให้เปรียบเทียบ ลองกลับไปเลือกแพ็กเกจอื่น</p>
        ) : (
          <div className="mt-6 space-y-8 sm:mt-8 sm:space-y-10">
            <DifferenceSummary quotes={quotes} labels={labels} />
            <section aria-labelledby="table-title">
              <h2 id="table-title" className="mb-4 text-[22px] font-bold text-navy-900 sm:text-2xl">
                ตารางเปรียบเทียบความคุ้มครอง
              </h2>
              <CompareTable quotes={quotes} labels={labels} />
            </section>
            <section aria-labelledby="sim-title">
              <h2 id="sim-title" className="mb-4 text-[22px] font-bold text-navy-900 sm:text-2xl">
                เกิดแบบนี้ แผนไหนคุ้มครอง?
              </h2>
              <CoverageSimulator quotes={quotes} labels={labels} showEv={isElectric(vehicle)} />
            </section>
            <section aria-labelledby="pick-title">
              <h2 id="pick-title" className="mb-4 text-[22px] font-bold text-navy-900 sm:text-2xl">
                เลือกแพ็กเกจ
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quotes.map((q, i) => (
                  <div key={q.id} className="card flex flex-col gap-4 rounded-xl2 p-5">
                    <div className="flex items-center gap-3">
                      <InsurerMark insurer={q.insurer} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-brand-600">{labels[i]}</p>
                        <p className="font-display text-[17px] font-semibold leading-snug text-navy-900">{q.product.name}</p>
                      </div>
                    </div>
                    {SHOW_PRICES ? (
                      <p className="tabular font-display text-2xl font-bold text-navy-900">
                        {formatNumber(q.premium)} <span className="font-sans text-sm font-normal text-navy-500">บาท / ปี</span>
                      </p>
                    ) : (
                      <PriceOnRequest placement="compare" compact message={contact.messages.plan(`${q.product.name} (${q.insurer.name})`)} />
                    )}
                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <Link href={selectPlanHref(q.productId, journey, buyEnabled)} className={buttonClass("primary", "md", "rounded-xl px-3")}>
                        เลือกแผนนี้
                      </Link>
                      <Link href={withJourney(`/plans/${q.productId}`, journey)} className={buttonClass("secondary", "md", "rounded-xl px-3")}>
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <div className="flex flex-col items-start gap-5 rounded-xl2 bg-gradient-to-r from-brand-50 to-wash p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-4">
                <Headset aria-hidden className="h-10 w-10 shrink-0 text-brand-600" strokeWidth={1.5} />
                <div>
                  <p className="font-display text-lg font-semibold text-navy-900">ยังตัดสินใจไม่ได้?</p>
                  <p className="mt-0.5 text-navy-600">ที่ปรึกษาจะเห็นแผนที่คุณเปรียบเทียบอยู่แล้ว ไม่ต้องเล่าซ้ำ</p>
                </div>
              </div>
              <Link href={withJourney("/advisor", { ...journey, plans })} className={buttonClass("primary", "md", "shrink-0 rounded-xl px-6")}>
                ปรึกษาผู้เชี่ยวชาญ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
