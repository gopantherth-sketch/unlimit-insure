import type { Metadata } from "next";
import Link from "next/link";
import { BarList, type BarItem } from "@/components/admin/BarList";
import { glossary } from "@/content/glossary";
import { labArticles } from "@/content/lab";
import { scenarioCopy } from "@/content/scenarios";
import type { GlossaryKey, ScenarioId } from "@/content/types";
import { FUNNEL, eventDefs } from "@/lib/analytics/events";
import { insuranceTypeLabel } from "@/lib/coverageFields";
import { eventTotals } from "@/lib/db/analytics";
import { getDb } from "@/lib/db/client";
import { formatDate } from "@/lib/format";
import { priorityLabel, usageLabel } from "@/lib/priorities";
import type { InsuranceType, PriorityId, UsageId } from "@/lib/types";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "สถิติการใช้งาน" };

const RANGES = [7, 30, 90] as const;
// Visitors can enter mid-journey (shared links), so a step can exceed the one before it.
const pct = (a: number, b: number) => (b <= 0 ? "—" : a > b ? "100%+" : `${Math.round((a / b) * 100)}%`);

function breakdown(dims: Record<string, number> | undefined, label: (d: string) => string, limit = 10): BarItem[] {
  return Object.entries(dims ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, v]) => ({ key: k, label: label(k), value: v }));
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const { days: raw } = await searchParams;
  const days = RANGES.find((d) => String(d) === raw) ?? 30;
  const { since, byName, byDim } = await eventTotals(await getDb(), days);

  const first = byName[FUNNEL[0]!] ?? 0;
  const funnel: BarItem[] = FUNNEL.map((name, i) => {
    const v = byName[name] ?? 0;
    const prev = i > 0 ? (byName[FUNNEL[i - 1]!] ?? 0) : v;
    return { key: name, label: eventDefs[name].label, value: v, note: i === 0 ? undefined : `${pct(v, prev)} จากขั้นก่อน` };
  });

  const sections: { title: string; items: BarItem[] }[] = [
    { title: "คำที่เปิดอ่านคำอธิบาย", items: breakdown(byDim.explain_opened, (d) => glossary[d as GlossaryKey]?.term ?? d) },
    { title: "สิ่งที่ลูกค้าเลือกว่าสำคัญ", items: breakdown(byDim.priority_selected, (d) => priorityLabel(d as PriorityId)) },
    { title: "การใช้รถ", items: breakdown(byDim.usage_selected, (d) => usageLabel(d as UsageId)) },
    { title: "เหตุการณ์ที่จำลอง", items: breakdown(byDim.simulator_used, (d) => scenarioCopy[d as ScenarioId]?.label ?? d) },
    { title: "ประเภทแพ็กเกจที่ดูรายละเอียด", items: breakdown(byDim.plan_viewed, (d) => insuranceTypeLabel[d as InsuranceType] ?? d) },
    { title: "บทความ Insurance Lab", items: breakdown(byDim.lab_viewed, (d) => labArticles.find((a) => a.slug === d)?.title ?? d) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">สถิติการใช้งาน</h1>
          <p className="mt-1 text-sm text-navy-500">
            นับแบบไม่ระบุตัวตน ไม่มีคุกกี้หรือข้อมูลส่วนบุคคล · ตั้งแต่ {formatDate(since)} · ผู้ที่ตั้งค่า Do Not Track จะไม่ถูกนับ
          </p>
        </div>
        <nav aria-label="ช่วงเวลา" className="flex gap-1 text-sm">
          {RANGES.map((d) => (
            <Link key={d} href={`/admin/analytics?days=${d}`} aria-current={d === days ? "page" : undefined} className={cx("rounded-full border px-3 py-1 font-medium", d === days ? "border-navy-900 bg-navy-900 text-white" : "border-navy-200 bg-white")}>
              {d} วัน
            </Link>
          ))}
        </nav>
      </div>

      <section className="card p-5 sm:p-6" aria-labelledby="funnel">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="funnel" className="text-lg font-bold">เส้นทางลูกค้า</h2>
          <p className="text-sm text-navy-500">
            จากเริ่มเลือกรถถึงส่งคำขอ: <span className="tabular font-semibold text-navy-900">{pct(byName.lead_submitted ?? 0, first)}</span>
          </p>
        </div>
        <div className="mt-4">
          {funnel.every((f) => f.value === 0) ? <p className="text-navy-500">ยังไม่มีข้อมูลในช่วงนี้</p> : <BarList items={funnel} caption="จำนวนต่อขั้นของเส้นทางลูกค้า" />}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((s) => (
          <section key={s.title} className="card p-5">
            <h2 className="font-bold">{s.title}</h2>
            <div className="mt-3">{s.items.length ? <BarList items={s.items} caption={s.title} /> : <p className="text-sm text-navy-500">ยังไม่มีข้อมูล</p>}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
