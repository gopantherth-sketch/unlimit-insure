import { CircleCheck, CircleX } from "lucide-react";
import { CoverageSimulator } from "@/components/home/CoverageSimulatorDemo";
import { CompareTable } from "@/components/insurance/CompareTable";
import { DifferenceSummary } from "@/components/insurance/DifferenceSummary";
import { ExcessCalculator } from "@/components/lab/ExcessCalculator";
import { scenarioCopy } from "@/content/scenarios";
import type { LabToolId } from "@/content/types";
import { insuranceTypeLabel } from "@/lib/coverageFields";
import { defaultVehicle } from "@/lib/data/vehicles";
import { generateQuotes } from "@/lib/quote";
import { scenarioRules, simulate } from "@/lib/scenarios";
import type { Quote, VehicleSelection } from "@/lib/types";
import { resolveVehicle, vehicleLabel } from "@/lib/vehicle";

// Every Lab tool runs on the same product engine as the quote journey.

const pick = (quotes: Quote[], ids: string[]) =>
  ids.map((id) => quotes.find((q) => q.productId === id)).filter((q): q is Quote => q !== undefined);

function quotesFor(selection: VehicleSelection) {
  const vehicle = resolveVehicle(selection);
  return vehicle ? { vehicle, quotes: generateQuotes(vehicle) } : null;
}

function TypeMatrix() {
  const data = quotesFor({ ...defaultVehicle });
  if (!data) return null;
  const reps = pick(data.quotes, ["a-type1-dealer", "a-type2plus", "b-type3plus"]);
  const scenarios = scenarioRules.filter((r) => !r.evOnly);
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[480px] text-[15px]">
        <caption className="px-5 pt-5 text-left text-sm text-navy-500">ตัวอย่างจากแผนตัวอย่างสำหรับ {vehicleLabel(data.vehicle)}</caption>
        <thead>
          <tr className="border-b border-navy-100">
            <th scope="col" className="px-5 py-3 text-left text-sm font-medium text-navy-400">เหตุการณ์</th>
            {reps.map((q) => (
              <th key={q.id} scope="col" className="px-4 py-3 text-center font-bold">
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
                    {covered ? (
                      <CircleCheck aria-label="คุ้มครอง" className="mx-auto h-5 w-5 text-success-600" />
                    ) : (
                      <CircleX aria-label="ไม่คุ้มครอง" className="mx-auto h-5 w-5 text-navy-300" />
                    )}
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

function PairCompare({ selection, ids }: { selection: VehicleSelection; ids: string[] }) {
  const data = quotesFor(selection);
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

function FloodSimulator() {
  const data = quotesFor({ ...defaultVehicle });
  if (!data) return null;
  const quotes = pick(data.quotes, ["a-type1-dealer", "c-type1-garage", "a-type2plus"]);
  return <CoverageSimulator quotes={quotes} labels={quotes.map((_, i) => `แผน ${String.fromCharCode(65 + i)}`)} />;
}

export function LabTool({ tool }: { tool: LabToolId }) {
  switch (tool) {
    case "typeCompare":
      return <TypeMatrix />;
    case "repairCompare":
      return <PairCompare selection={{ ...defaultVehicle }} ids={["a-type1-dealer", "b-type1-garage"]} />;
    case "excessCalculator":
      return <ExcessCalculator />;
    case "floodCheck":
      return <FloodSimulator />;
    case "evCoverage":
      return <PairCompare selection={{ brandId: "byd", modelId: "byd-atto-3", year: 2025 }} ids={["c-ev-type1", "a-type1-dealer"]} />;
  }
}
