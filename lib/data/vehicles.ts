import type { VehicleBrand, VehicleModel } from "@/lib/types";

// MOCK vehicle catalogue. Prices are indicative placeholders, not market data.
// Replace with the vehicle data source described in PROJECT_MASTER.md §30.

export const brands: VehicleBrand[] = [
  { id: "toyota", name: "Toyota", nameTh: "โตโยต้า" },
  { id: "honda", name: "Honda", nameTh: "ฮอนด้า" },
  { id: "isuzu", name: "Isuzu", nameTh: "อีซูซุ" },
  { id: "mazda", name: "Mazda", nameTh: "มาสด้า" },
  { id: "byd", name: "BYD", nameTh: "บีวายดี" },
  { id: "mg", name: "MG", nameTh: "เอ็มจี" },
];

export const models: VehicleModel[] = [
  { id: "toyota-yaris-ativ", brandId: "toyota", name: "Yaris Ativ", bodyType: "sedan", powertrain: "ICE", newPrice: 600_000, yearFrom: 2020, yearTo: 2026 },
  { id: "toyota-corolla-cross", brandId: "toyota", name: "Corolla Cross", bodyType: "suv", powertrain: "HEV", newPrice: 1_050_000, yearFrom: 2020, yearTo: 2026 },
  { id: "toyota-fortuner", brandId: "toyota", name: "Fortuner", bodyType: "suv", powertrain: "ICE", newPrice: 1_500_000, yearFrom: 2019, yearTo: 2026 },
  { id: "toyota-hilux-revo", brandId: "toyota", name: "Hilux Revo", bodyType: "pickup", powertrain: "ICE", newPrice: 800_000, yearFrom: 2019, yearTo: 2026 },
  { id: "honda-city", brandId: "honda", name: "City", bodyType: "sedan", powertrain: "ICE", newPrice: 620_000, yearFrom: 2020, yearTo: 2026 },
  { id: "honda-civic", brandId: "honda", name: "Civic", bodyType: "sedan", powertrain: "ICE", newPrice: 1_000_000, yearFrom: 2021, yearTo: 2026 },
  { id: "honda-hr-v", brandId: "honda", name: "HR-V e:HEV", bodyType: "suv", powertrain: "HEV", newPrice: 1_100_000, yearFrom: 2022, yearTo: 2026 },
  { id: "isuzu-d-max", brandId: "isuzu", name: "D-Max", bodyType: "pickup", powertrain: "ICE", newPrice: 750_000, yearFrom: 2019, yearTo: 2026 },
  { id: "mazda-2", brandId: "mazda", name: "Mazda2", bodyType: "hatchback", powertrain: "ICE", newPrice: 600_000, yearFrom: 2019, yearTo: 2026 },
  { id: "mazda-cx-5", brandId: "mazda", name: "CX-5", bodyType: "suv", powertrain: "ICE", newPrice: 1_300_000, yearFrom: 2019, yearTo: 2026 },
  { id: "byd-dolphin", brandId: "byd", name: "Dolphin", bodyType: "hatchback", powertrain: "EV", newPrice: 700_000, yearFrom: 2023, yearTo: 2026 },
  { id: "byd-atto-3", brandId: "byd", name: "Atto 3", bodyType: "suv", powertrain: "EV", newPrice: 1_000_000, yearFrom: 2022, yearTo: 2026 },
  { id: "byd-sealion-6", brandId: "byd", name: "Sealion 6", bodyType: "suv", powertrain: "PHEV", newPrice: 1_100_000, yearFrom: 2024, yearTo: 2026 },
  { id: "mg-zs-ev", brandId: "mg", name: "ZS EV", bodyType: "suv", powertrain: "EV", newPrice: 900_000, yearFrom: 2020, yearTo: 2026 },
  { id: "mg-4", brandId: "mg", name: "MG4 Electric", bodyType: "hatchback", powertrain: "EV", newPrice: 850_000, yearFrom: 2022, yearTo: 2026 },
];

export const defaultVehicle = { brandId: "toyota", modelId: "toyota-corolla-cross", year: 2025 } as const;
