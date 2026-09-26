import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, FileText, Headset } from "lucide-react";
import { CoverageSimulator } from "@/components/home/CoverageSimulatorDemo";
import { ExplainButton } from "@/components/insurance/ExplainButton";
import { InsurerMark } from "@/components/insurance/InsurerMark";
import { MatchBadge, MatchList } from "@/components/insurance/MatchSummary";
import { VerifiedSource } from "@/components/insurance/VerifiedSource";
import { TrackView } from "@/components/TrackView";
import { buttonClass } from "@/components/ui/button";
import { CoverMark } from "@/components/ui/CoverMark";
import { fieldGroupLabel, insuranceTypeLabel, repairTypeLabel, visibleFields, type FieldGroup } from "@/lib/coverageFields";
import { formatBaht, formatNumber } from "@/lib/format";
import { buildMatchContext, matchQuote } from "@/lib/match";
import { parseQuoteInput, withJourney, type RawParams } from "@/lib/params";
import { activeVersion, findProduct, generateQuotes, quoteForProduct } from "@/lib/quote";
import { getCatalog } from "@/lib/server/catalog";
import { isElectric, resolveVehicle, vehicleLabel } from "@/lib/vehicle";

type Params = Promise<{ productId: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = findProduct(await getCatalog(), (await params).productId);
  return product ? { title: product.name, description: product.summary, alternates: { canonical: `/plans/${product.id}` } } : { title: "ไม่พบแพ็กเกจ" };
}

const groups: FieldGroup[] = ["core", "ownDamage", "thirdParty", "people", "services"];

export default async function PlanPage({ params, searchParams }: { params: Params; searchParams: Promise<RawParams> }) {
  const { productId } = await params;
  const catalog = await getCatalog();
  const product = findProduct(catalog, productId);
  if (!product) notFound();
  const insurer = catalog.insurers.find((i) => i.id === product.insurerId);
  const version = activeVersion(product, new Date());
  if (!insurer || !version) notFound();

  const input = parseQuoteInput(await searchParams);
  const vehicle = input ? resolveVehicle(catalog, input.vehicle) : null;
  const result = vehicle ? quoteForProduct(catalog, productId, vehicle) : null;
  const quote = result?.status === "ok" ? result.quote : null;
  const match = quote && vehicle && input ? matchQuote(quote, input.priorities, buildMatchContext(generateQuotes(catalog, vehicle), vehicle)) : null;
  const journey = input ? { vehicle: input.vehicle, usage: input.usage, priorities: input.priorities } : {};
  const c = version.coverage;

  return (
    <div className="bg-gradient-to-b from-wash via-canvas to-canvas pb-16">
      <TrackView name="plan_viewed" dim={c.insuranceType} />
      <div className="container-page py-6 sm:py-10">
        {input && (
          <Link href={withJourney("/quote/results", journey)} className="link-arrow min-h-[44px]">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            กลับไปดูแพ็กเกจทั้งหมด
          </Link>
        )}

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="space-y-6">
            <header className="card rounded-xl2 border-white p-6 shadow-float sm:p-8">
              <div className="flex items-center gap-3">
                <InsurerMark insurer={insurer} />
                <div>
                  <p className="text-sm text-navy-500">{insurer.name}</p>
                  <p className="mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{insuranceTypeLabel[c.insuranceType]}</span>
                    <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{repairTypeLabel[c.repairType]}</span>
                  </p>
                </div>
              </div>
              <p className="eyebrow mt-6">Plan detail</p>
              <h1 className="mt-2 text-[30px] font-bold leading-tight text-navy-900 sm:text-[38px]">{product.name}</h1>
              <p className="mt-2 text-[17px] leading-relaxed text-navy-500 sm:text-lg">{product.summary}</p>
              {match && match.total > 0 && (
                <div className="mt-6 space-y-3 rounded-2xl bg-wash p-4 sm:p-5">
                  <MatchBadge match={match} />
                  <MatchList match={match} />
                </div>
              )}
            </header>

            <section aria-labelledby="coverage-title" className="card rounded-xl2 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="coverage-title" className="text-[22px] font-bold text-navy-900">
                  ความคุ้มครอง
                </h2>
                <p className="text-sm text-navy-400">กด ⓘ เพื่อดูคำอธิบายง่าย ๆ</p>
              </div>
              {quote ? (
                groups.map((g) => {
                  const fields = visibleFields([quote]).filter((f) => f.group === g);
                  if (fields.length === 0) return null;
                  return (
                    <div key={g} className="mt-6">
                      <h3 className="rounded-lg bg-wash px-3 py-2 font-sans text-[13px] font-semibold text-brand-700">{fieldGroupLabel[g]}</h3>
                      <dl className="mt-2 divide-y divide-navy-100">
                        {fields.map((f) => {
                          const v = f.value(quote);
                          return (
                            <div key={f.key} className="flex min-h-[48px] items-center justify-between gap-4 px-1 py-2">
                              <dt className="flex items-center gap-0.5 text-navy-600">
                                {f.label}
                                {f.glossaryKey && <ExplainButton term={f.glossaryKey} />}
                              </dt>
                              <dd className="tabular flex items-center gap-2 text-right font-semibold text-navy-900">
                                {typeof v === "boolean" && (
                                  <span aria-hidden>
                                    <CoverMark covered={v} />
                                  </span>
                                )}
                                {f.display(quote)}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>
                  );
                })
              ) : (
                <p className="mt-4 text-navy-500">เพิ่มรถของคุณเพื่อดูทุนประกันและเบี้ยสำหรับรถคันนั้น</p>
              )}
            </section>

            {version.benefits.length > 0 && (
              <section aria-labelledby="benefits-title" className="card rounded-xl2 p-6 sm:p-8">
                <h2 id="benefits-title" className="text-[22px] font-bold text-navy-900">
                  สิทธิประโยชน์เพิ่มเติม
                </h2>
                <ul className="mt-4 space-y-2">
                  {version.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-navy-700">
                      <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-success-600" />
                      {b}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="fit-title" className="card rounded-xl2 p-6 sm:p-8">
              <h2 id="fit-title" className="text-[22px] font-bold text-navy-900">
                เหมาะกับใคร
              </h2>
              <ul className="mt-4 space-y-2">
                {version.suitableFor.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-navy-700">
                    <Check aria-hidden className="mt-1 h-4 w-4 shrink-0 text-brand-600" />
                    {s}
                  </li>
                ))}
              </ul>
              {c.excess > 0 && (
                <div className="mt-5 rounded-2xl bg-warning-50 p-4 text-sm leading-relaxed text-warning-700">
                  แผนนี้มีค่าเสียหายส่วนแรก {formatBaht(c.excess)} ต่อครั้ง <ExplainButton term="excess" withLabel />
                </div>
              )}
            </section>

            {quote && (
              <section aria-labelledby="sim-title">
                <h2 id="sim-title" className="mb-4 text-[22px] font-bold text-navy-900">
                  เกิดแบบนี้ แผนนี้คุ้มครองไหม?
                </h2>
                <CoverageSimulator quotes={[quote]} labels={["แผนนี้"]} showEv={vehicle ? isElectric(vehicle) : false} />
              </section>
            )}

            <section aria-labelledby="terms-title" className="card rounded-xl2 p-6 sm:p-8">
              <h2 id="terms-title" className="text-[22px] font-bold text-navy-900">
                เงื่อนไขและเอกสารกรมธรรม์
              </h2>
              <p className="mt-3 text-navy-600">
                ความคุ้มครองเป็นไปตามเงื่อนไขและข้อยกเว้นในกรมธรรม์ ก่อนชำระเงินคุณจะได้รับเอกสารเงื่อนไขฉบับเต็มเพื่ออ่านก่อนตัดสินใจ
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-navy-200 px-4 py-3 text-sm text-navy-400">
                <FileText aria-hidden className="h-4 w-4" />
                เอกสารกรมธรรม์: รอไฟล์จากบริษัทประกัน
              </p>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="card rounded-xl2 border-white p-6 shadow-float">
              {quote && vehicle ? (
                <>
                  <p className="text-sm text-navy-500">เบี้ยประกันโดยประมาณสำหรับ {vehicleLabel(vehicle)}</p>
                  <div className="mt-3 rounded-2xl bg-wash px-4 py-4">
                    <p className="tabular font-display text-[40px] font-bold leading-none text-navy-900">
                      {formatNumber(quote.premium)} <span className="font-sans text-base font-normal text-navy-500">บาท / ปี</span>
                    </p>
                    <p className="mt-2 text-sm text-navy-600">ทุนประกัน <span className="tabular font-semibold">{formatBaht(quote.sumInsured)}</span></p>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-navy-400">ราคาเบื้องต้น อาจเปลี่ยนได้หลังยืนยันข้อมูล · ผ่อนชำระ: รอข้อมูลเงื่อนไขจากบริษัทประกัน</p>
                </>
              ) : result && result.status === "ineligible" ? (
                <p className="text-navy-600">แผนนี้ไม่รับ {vehicle ? vehicleLabel(vehicle) : "รถคันนี้"} ตามเงื่อนไขของแผน (เช่น อายุรถหรือประเภทรถ)</p>
              ) : (
                <>
                  <p className="text-navy-600">เพิ่มรถของคุณเพื่อดูเบี้ยของแผนนี้</p>
                  <Link href="/quote" className={buttonClass("secondary", "md", "mt-4 w-full rounded-xl")}>
                    เพิ่มรถของคุณ
                  </Link>
                </>
              )}
              <div className="mt-6 flex flex-col gap-2">
                <Link href={withJourney(`/buy/${product.id}`, journey)} className={buttonClass("primary", "lg", "w-full rounded-xl")}>
                  เลือกแพ็กเกจนี้
                </Link>
                {input && (
                  <Link href={withJourney("/compare", { ...journey, plans: [product.id] })} className={buttonClass("secondary", "md", "w-full rounded-xl")}>
                    เปรียบเทียบกับแผนอื่น
                  </Link>
                )}
                <Link href={withJourney("/advisor", { ...journey, plans: [product.id] })} className={buttonClass("ghost", "md", "w-full rounded-xl")}>
                  <Headset aria-hidden className="h-4 w-4" />
                  คุยกับที่ปรึกษา
                </Link>
              </div>
            </div>
            <VerifiedSource version={version} variant="panel" />
          </aside>
        </div>
      </div>
    </div>
  );
}
