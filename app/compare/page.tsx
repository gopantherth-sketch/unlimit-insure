import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Headset } from "lucide-react";
import { CoverageSimulator } from "@/components/home/CoverageSimulatorDemo";
import { CompareTable } from "@/components/insurance/CompareTable";
import { DifferenceSummary } from "@/components/insurance/DifferenceSummary";
import { JourneySteps } from "@/components/quote/JourneySteps";
import { NeedVehicle } from "@/components/quote/NeedVehicle";
import { RememberCompared } from "@/components/quote/RememberCompared";
import { buttonClass } from "@/components/ui/button";
import { rankQuotes } from "@/lib/match";
import { parsePlanIds, parseQuoteInput, withJourney, type RawParams } from "@/lib/params";
import { generateQuotes } from "@/lib/quote";
import type { RankedQuote } from "@/lib/types";
import { isElectric, resolveVehicle, vehicleLabel } from "@/lib/vehicle";

export const metadata: Metadata = { title: "เปรียบเทียบแพ็กเกจ" };

const planLabel = (i: number) => `แผน ${String.fromCharCode(65 + i)}`;

export default async function ComparePage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const input = parseQuoteInput(raw);
  const vehicle = input ? resolveVehicle(input.vehicle) : null;
  if (!input || !vehicle) {
    return <NeedVehicle title="เลือกรถก่อนเปรียบเทียบ" body="การเปรียบเทียบจะแม่นขึ้นเมื่อเรารู้ว่าคุณขับรถอะไร ใช้เวลาไม่ถึงนาที และยังไม่ต้องให้เบอร์โทร" />;
  }

  const ranked = rankQuotes(generateQuotes(vehicle), input.priorities, vehicle);
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
      <div className="container-page py-8 sm:py-10">
        <JourneySteps current={4} />
        <Link href={withJourney("/quote/results", journey)} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          กลับไปดูแพ็กเกจทั้งหมด
        </Link>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">เปรียบเทียบแพ็กเกจ</h1>
        <p className="mt-2 text-navy-500">
          สำหรับ {vehicleLabel(vehicle)}
          {requested.length < 2 && " — เพิ่มแพ็กเกจที่ตรงกับสิ่งที่คุณต้องการมากที่สุดให้อัตโนมัติ"}
        </p>

        {quotes.length < 2 ? (
          <p className="card mt-8 p-8 text-center text-navy-500">มีแพ็กเกจไม่พอสำหรับเปรียบเทียบ</p>
        ) : (
          <div className="mt-8 space-y-8">
            <CompareTable quotes={quotes} labels={labels} />
            <DifferenceSummary quotes={quotes} labels={labels} />
            <section aria-labelledby="sim-title">
              <h2 id="sim-title" className="mb-4 text-xl font-bold">
                เกิดแบบนี้ แผนไหนคุ้มครอง?
              </h2>
              <CoverageSimulator quotes={quotes} labels={labels} showEv={isElectric(vehicle)} />
            </section>
            <section aria-label="เลือกแพ็กเกจ" className="grid gap-3 sm:grid-cols-3">
              {quotes.map((q, i) => (
                <div key={q.id} className="card flex flex-col gap-3 p-5">
                  <p className="text-sm">
                    <span className="font-semibold text-brand-600">{labels[i]}</span> · {q.product.name}
                  </p>
                  <div className="mt-auto flex gap-2">
                    <Link href={withJourney("/advisor", { ...journey, plans: [q.productId] })} className={buttonClass("primary", "sm", "flex-1")}>
                      เลือกแผนนี้
                    </Link>
                    <Link href={withJourney(`/plans/${q.productId}`, journey)} className={buttonClass("secondary", "sm", "flex-1")}>
                      รายละเอียด
                    </Link>
                  </div>
                </div>
              ))}
            </section>
            <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Headset aria-hidden className="h-8 w-8 text-brand-600" />
                <p className="text-navy-700">ยังตัดสินใจไม่ได้? ที่ปรึกษาจะเห็นแผนที่คุณเปรียบเทียบอยู่แล้ว ไม่ต้องเล่าซ้ำ</p>
              </div>
              <Link href={withJourney("/advisor", { ...journey, plans })} className={buttonClass("primary", "md")}>
                ปรึกษาผู้เชี่ยวชาญ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
