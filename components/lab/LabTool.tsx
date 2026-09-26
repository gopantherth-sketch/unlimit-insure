import { CoverageSimulator } from "@/components/home/CoverageSimulatorDemo";
import { CompareTable } from "@/components/insurance/CompareTable";
import { DifferenceSummary } from "@/components/insurance/DifferenceSummary";
import { ExcessCalculator } from "@/components/lab/ExcessCalculator";
import { CoverMark } from "@/components/ui/CoverMark";
import { scenarioCopy } from "@/content/scenarios";
import type { LabToolId } from "@/content/types";
import { insuranceTypeLabel } from "@/lib/coverageFields";
import { generateQuotes } from "@/lib/quote";
import { scenarioRules, simulate } from "@/lib/scenarios";
import { getCatalog } from "@/lib/server/catalog";
import type { Catalog, Quote, VehicleSelection } from "@/lib/types";
import { defaultEvVehicle, defaultVehicle, resolveVehicle, vehicleLabel } from "@/lib/vehicle";

// Every Lab tool runs on the same product engine as the quote journey.

const pick = (quotes: Quote[], ids: string[]) =>
  ids.map((id) => quotes.find((q) => q.productId === id)).filter((q): q is Quote => q !== undefined);

function quotesFor(catalog: Catalog, selection: VehicleSelection) {
  const vehicle = resolveVehicle(catalog, selection);
  return vehicle ? { vehicle, quotes: generateQuotes(catalog, vehicle) } : null;
}

function TypeMatrix({ catalog }: { catalog: Catalog }) {
  const data = quotesFor(catalog, defaultVehicle);
  if (!data) return null;
  const reps = pick(data.quotes, ["a-type1-dealer", "a-type2plus", "b-type3plus"]);
  const scenarios = scenarioRules.filter((r) => !r.evOnly);
  return (
    <div tabIndex={0} role="region" aria-label="ตารางเปรียบเทียบ (เลื่อนซ้าย-ขวาได้)" className="card overflow-x-auto rounded-xl2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500">
      <table className="w-full min-w-[420px] text-[15px]">
        <caption className="px-5 pt-5 text-left text-sm text-navy-500">ตัวอย่างจากแผนตัวอย่างสำหรับ {vehicleLabel(data.vehicle)}</caption>
        <thead>
          <tr className="bg-wash">
            <th scope="col" className="px-5 py-3 text-left text-sm font-semibold text-navy-800">เหตุการณ์</th>
            {reps.map((q) => (
              <th key={q.id} scope="col" className="px-4 py-3 text-center font-sans font-semibold text-navy-800">
                {insuranceTypeLabel[q.coverage.insuranceType]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => (
            <tr key={s.id} className="border-b border-navy-100 last:border-0">
              <th scope="row" className="px-5 py-3 text-left font-medium text-navy-700">{scenarioCopy[s.id].label}</th>
              {reps.map((q) => {
                const covered = simulate(s.id, q).covered;
                return (
                  <td key={q.id} className="px-4 py-3 text-center">
                    <CoverMark covered={covered} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PairCompare({ catalog, selection, ids }: { catalog: Catalog; selection: VehicleSelection; ids: string[] }) {
  const data = quotesFor(catalog, selection);
  if (!data) return null;
  const quotes = pick(data.quotes, ids);
  if (quotes.length < 2) return null;
  const labels = quotes.map((_, i) => `แผน ${String.fromCharCode(65 + i)}`);
  return (
    <div className="space-y-6">
      <p className="text-sm text-navy-500">ตัวอย่างสำหรับ {vehicleLabel(data.vehicle)} — ข้อมูลตัวอย่าง</p>
      <CompareTable quotes={quotes} labels={labels} />
      <DifferenceSummary quotes={quotes} labels={labels} />
    </div>
  );
}

function FloodSimulator({ catalog }: { catalog: Catalog }) {
  const data = quotesFor(catalog, defaultVehicle);
  if (!data) return null;
  const quotes = pick(data.quotes, ["a-type1-dealer", "c-type1-garage", "a-type2plus"]);
  return <CoverageSimulator quotes={quotes} labels={quotes.map((_, i) => `แผน ${String.fromCharCode(65 + i)}`)} />;
}

export async function LabTool({ tool }: { tool: LabToolId }) {
  const catalog = await getCatalog();
  switch (tool) {
    case "typeCompare":
      return <TypeMatrix catalog={catalog} />;
    case "repairCompare":
      return <PairCompare catalog={catalog} selection={defaultVehicle} ids={["a-type1-dealer", "b-type1-garage"]} />;
    case "excessCalculator":
      return <ExcessCalculator />;
    case "floodCheck":
      return <FloodSimulator catalog={catalog} />;
    case "evCoverage":
      return <PairCompare catalog={catalog} selection={defaultEvVehicle} ids={["c-ev-type1", "a-type1-dealer"]} />;
  }
}
