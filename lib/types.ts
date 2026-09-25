// Domain model for motor insurance. Mirrors PROJECT_MASTER.md §27–29:
// products are versioned, every coverage fact points to a source, quotes are snapshotted.

export type Powertrain = "ICE" | "HEV" | "PHEV" | "EV";
export type BodyType = "sedan" | "hatchback" | "suv" | "pickup" | "mpv";

export interface VehicleModel {
  id: string;
  brandId: string;
  name: string;
  bodyType: BodyType;
  powertrain: Powertrain;
  /** Indicative new-car price in THB. Mock until a vehicle data source is connected. */
  newPrice: number;
  yearFrom: number;
  yearTo: number;
}

export interface VehicleBrand {
  id: string;
  name: string;
  nameTh: string;
}

/** A concrete car the user is exploring. Contains no personal data. */
export interface VehicleSelection {
  brandId: string;
  modelId: string;
  year: number;
}

export interface ResolvedVehicle extends VehicleSelection {
  brand: VehicleBrand;
  model: VehicleModel;
  /** Vehicle age in years at the quote date. */
  age: number;
  /** Estimated market value used for sum-insured calculation. */
  estimatedValue: number;
}

export type InsuranceType = "type1" | "type2plus" | "type3plus" | "type3";
export type RepairType = "dealer" | "garage";

export interface Insurer {
  id: string;
  name: string;
  shortName: string;
  /** Hex accent for the placeholder mark until real logos are provided. */
  accent: string;
  claimsHotline?: string;
}

export type VerificationStatus = "mock" | "pending" | "verified";

export interface SourceReference {
  status: VerificationStatus;
  documentName: string;
  page?: number;
  verifiedBy?: string;
  /** ISO date */
  verifiedAt?: string;
  note?: string;
}

/** Coverage terms of one product version. Monetary values in THB. */
export interface Coverage {
  insuranceType: InsuranceType;
  repairType: RepairType;
  /** Excess (deductible) per claim where the insured is at fault or no counterparty is identified. */
  excess: number;
  collisionWithCounterparty: boolean;
  collisionNoCounterparty: boolean;
  fireTheft: boolean;
  flood: boolean;
  thirdPartyBodilyPerPerson: number;
  thirdPartyBodilyPerAccident: number;
  thirdPartyProperty: number;
  personalAccidentPerPerson: number;
  medicalPerPerson: number;
  bailBond: number;
  coveredSeats: number;
  roadsideAssistance: boolean;
  replacementCarDays: number;
  evBattery: boolean;
  evCharger: boolean;
}

/** How this version prices and sizes cover. Mock pricing — replace with insurer rate tables. */
export type PricingRule =
  | {
      kind: "percentOfValue";
      /** Annual premium as a fraction of sum insured. */
      rate: number;
      minPremium: number;
      /** Sum insured as a fraction of estimated vehicle value. */
      sumInsuredRatio: number;
    }
  | {
      kind: "fixed";
      /** Premium by vehicle body type. */
      premiumByBody: Record<BodyType, number>;
      /** Fixed own-damage sum insured (0 for type 3). */
      sumInsured: number;
    };

export interface Eligibility {
  minYear?: number;
  maxAgeYears?: number;
  powertrains?: Powertrain[];
  bodyTypes?: BodyType[];
}

export interface ProductVersion {
  id: string;
  productId: string;
  version: number;
  /** ISO date */
  effectiveFrom: string;
  /** ISO date */
  effectiveUntil: string;
  coverage: Coverage;
  pricing: PricingRule;
  eligibility: Eligibility;
  benefits: string[];
  suitableFor: string[];
  source: SourceReference;
}

export interface Product {
  id: string;
  insurerId: string;
  name: string;
  summary: string;
  versions: ProductVersion[];
}

export type UsageId = "commute" | "weekend" | "upcountry" | "second" | "family";

export type PriorityId =
  | "dealer"
  | "lowPremium"
  | "noExcess"
  | "flood"
  | "replacementCar"
  | "highCoverage"
  | "roadside"
  | "evBattery";

export interface QuoteInput {
  vehicle: VehicleSelection;
  usage?: UsageId;
  priorities: PriorityId[];
}

/** A priced offer for one vehicle. Immutable once created; persist as a QuoteSnapshot on purchase. */
export interface Quote {
  id: string;
  productId: string;
  productVersionId: string;
  insurer: Insurer;
  product: Product;
  version: ProductVersion;
  premium: number;
  sumInsured: number;
  coverage: Coverage;
  /** ISO timestamp */
  createdAt: string;
}

export interface PriorityResult {
  priority: PriorityId;
  met: boolean;
  /** Plain-language reason, shown to the user. */
  reason: string;
}

export interface MatchResult {
  matched: number;
  total: number;
  results: PriorityResult[];
}

export interface RankedQuote extends Quote {
  match: MatchResult;
}

export interface QuoteSnapshot {
  quoteId: string;
  productVersionId: string;
  vehicle: VehicleSelection;
  premium: number;
  sumInsured: number;
  coverage: Coverage;
  benefits: string[];
  source: SourceReference;
  /** ISO timestamp */
  capturedAt: string;
  capturedBy: "system" | "advisor";
}
