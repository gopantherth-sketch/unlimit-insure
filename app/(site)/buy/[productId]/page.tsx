import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BuyForm } from "@/components/buy/BuyForm";
import { InsurerMark } from "@/components/insurance/InsurerMark";
import { NeedVehicle } from "@/components/quote/NeedVehicle";
import { purchaseCopy as c } from "@/content/purchase";
import { startDateWindow } from "@/lib/applications/validate";
import { fieldByKey, insuranceTypeLabel } from "@/lib/coverageFields";
import { formatNumber } from "@/lib/format";
import { parseQuoteInput, withJourney, type RawParams } from "@/lib/params";
import { quoteForProduct } from "@/lib/quote";
import { getCatalog } from "@/lib/server/catalog";
import { resolveVehicle, vehicleLabel } from "@/lib/vehicle";

export const metadata: Metadata = { title: "สมัครแผนประกัน", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const KEY_FIELDS = ["sumInsured", "repairType", "excess", "flood"] as const;

export default async function BuyPage({ params, searchParams }: { params: Promise<{ productId: string }>; searchParams: Promise<RawParams> }) {
  const [{ productId }, raw] = await Promise.all([params, searchParams]);
  const input = parseQuoteInput(raw);
  const catalog = await getCatalog();
  if (!catalog.products.some((p) => p.id === productId)) notFound();
  const vehicle = input ? resolveVehicle(catalog, input.vehicle) : null;
  if (!input || !vehicle) {
    return <NeedVehicle title="เลือกรถก่อนสมัคร" body="เบี้ยและความคุ้มครองขึ้นอยู่กับรถของคุณ เลือกรถก่อนแล้วกลับมาที่แผนนี้" />;
  }
  const result = quoteForProduct(catalog, productId, vehicle);
  const journey = { vehicle: input.vehicle, usage: input.usage, priorities: input.priorities };
  const advisorHref = withJourney("/advisor", { ...journey, plans: [productId] });
  if (result.status !== "ok") {
    return (
      <div className="container-page max-w-xl py-16 text-center">
        <h1 className="text-2xl font-bold">แผนนี้ไม่รับ {vehicleLabel(vehicle)}</h1>
        <p className="mt-3 text-navy-500">ลองดูแผนอื่นที่รับรถคันนี้ หรือให้ที่ปรึกษาช่วยหา</p>
        <Link href={withJourney("/quote/results", journey)} className="mt-6 inline-block font-semibold text-brand-600">
          กลับไปดูแพ็กเกจ
        </Link>
      </div>
    );
  }
  const q = result.quote;
  const { min, max } = startDateWindow();

  return (
    <div className="bg-canvas pb-16">
      <div className="container-page max-w-5xl py-8 sm:py-10">
        <Link href={withJourney(`/plans/${productId}`, journey)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          กลับไปดูรายละเอียดแผน
        </Link>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{c.buyTitle}</h1>
        <p className="mt-2 max-w-2xl text-navy-500">{c.buyIntro}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <BuyForm productId={productId} vehicle={input.vehicle} startMin={min} startMax={max} advisorHref={advisorHref} />

          <aside aria-labelledby="sec-plan" className="card p-5 lg:sticky lg:top-24">
            <h2 id="sec-plan" className="text-sm font-semibold uppercase tracking-wider text-brand-600">{c.sections.plan}</h2>
            <div className="mt-3 flex items-center gap-3">
              <InsurerMark insurer={q.insurer} />
              <div>
                <p className="text-sm text-navy-500">{q.insurer.name}</p>
                <p className="font-bold">{q.product.name}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-navy-500">
              {insuranceTypeLabel[q.coverage.insuranceType]} · {vehicleLabel(vehicle)}
            </p>
            <p className="tabular mt-4 text-3xl font-bold">
              {formatNumber(q.premium)} <span className="text-base font-normal text-navy-500">บาท / ปี</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-navy-400">{c.priceNote}</p>
            <dl className="mt-4 divide-y divide-navy-100 border-t border-navy-100 text-sm">
              {KEY_FIELDS.map((k) => {
                const f = fieldByKey(k)!;
                return (
                  <div key={k} className="flex justify-between gap-3 py-2">
                    <dt className="text-navy-500">{f.label}</dt>
                    <dd className="tabular font-semibold">{f.display(q)}</dd>
                  </div>
                );
              })}
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
