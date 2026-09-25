import type { ResolvedVehicle, VehicleCatalog, VehicleModel, VehicleSelection } from "@/lib/types";

/** Annual depreciation used for the mock estimated value. Replace with a vehicle valuation source. */
const ANNUAL_RETENTION = 0.9;
const MIN_RETENTION = 0.35;

export const defaultVehicle: VehicleSelection = { brandId: "toyota", modelId: "toyota-corolla-cross", year: 2025 };
export const defaultEvVehicle: VehicleSelection = { brandId: "byd", modelId: "byd-atto-3", year: 2025 };

export function modelsForBrand(catalog: VehicleCatalog, brandId: string): VehicleModel[] {
  return catalog.models.filter((m) => m.brandId === brandId);
}

export function yearsForModel(model: VehicleModel, currentYear: number): number[] {
  const last = Math.min(model.yearTo, currentYear + 1);
  const years: number[] = [];
  for (let y = last; y >= model.yearFrom; y--) years.push(y);
  return years;
}

export function estimateValue(newPrice: number, age: number): number {
  const retention = Math.max(MIN_RETENTION, ANNUAL_RETENTION ** Math.max(0, age));
  return Math.round((newPrice * retention) / 10_000) * 10_000;
}

export function resolveVehicle(catalog: VehicleCatalog, selection: VehicleSelection, now: Date = new Date()): ResolvedVehicle | null {
  const brand = catalog.brands.find((b) => b.id === selection.brandId);
  const model = catalog.models.find((m) => m.id === selection.modelId && m.brandId === selection.brandId);
  if (!brand || !model) return null;
  if (!Number.isInteger(selection.year) || selection.year < model.yearFrom || selection.year > model.yearTo) return null;
  const age = Math.max(0, now.getFullYear() - selection.year);
  return { ...selection, brand, model, age, estimatedValue: estimateValue(model.newPrice, age) };
}

export function vehicleLabel(v: Pick<ResolvedVehicle, "brand" | "model" | "year">): string {
  return `${v.brand.name} ${v.model.name} ${v.year}`;
}

export function isElectric(v: Pick<ResolvedVehicle, "model">): boolean {
  return v.model.powertrain === "EV";
}
