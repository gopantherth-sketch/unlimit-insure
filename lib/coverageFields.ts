import type { GlossaryKey } from "@/content/types";
import { formatBaht, formatNumber } from "@/lib/format";
import type { InsuranceType, Quote, RepairType } from "@/lib/types";

// Single source of truth for every coverage attribute shown in cards, tables, detail pages
// and difference summaries. Add a field here and it appears everywhere consistently.

export const insuranceTypeLabel: Record<InsuranceType, string> = {
  type1: "ชั้น 1",
  type2plus: "ชั้น 2+",
  type3plus: "ชั้น 3+",
  type3: "ชั้น 3",
};

const insuranceTypeRank: Record<InsuranceType, number> = { type1: 4, type2plus: 3, type3plus: 2, type3: 1 };

export const repairTypeLabel: Record<RepairType, string> = { dealer: "ซ่อมศูนย์", garage: "ซ่อมอู่" };

export type FieldGroup = "core" | "ownDamage" | "thirdParty" | "people" | "services";

export interface CoverageField {
  key: string;
  label: string;
  group: FieldGroup;
  glossaryKey?: GlossaryKey;
  /** Raw comparable value. */
  value: (q: Quote) => number | boolean | string;
  display: (q: Quote) => string;
  /** Returns >0 when a is better for the customer than b, <0 when worse, 0 when equal. Omit for neutral fields. */
  compare?: (a: Quote, b: Quote) => number;
  /** Trade-off phrase used when `other` is worse than `base`. */
  worse?: (other: Quote, base: Quote) => string;
  /** Gain phrase used when `other` is better than `base`. */
  better?: (other: Quote, base: Quote) => string;
}

const yesNo = (b: boolean) => (b ? "คุ้มครอง" : "ไม่คุ้มครอง");
const boolCompare = (get: (q: Quote) => boolean) => (a: Quote, b: Quote) => Number(get(a)) - Number(get(b));
const numCompare = (get: (q: Quote) => number, lowerIsBetter = false) => (a: Quote, b: Quote) =>
  lowerIsBetter ? get(b) - get(a) : get(a) - get(b);

function boolField(
  key: string,
  label: string,
  group: FieldGroup,
  glossaryKey: GlossaryKey,
  get: (q: Quote) => boolean,
  noun: string,
): CoverageField {
  return {
    key,
    label,
    group,
    glossaryKey,
    value: get,
    display: (q) => yesNo(get(q)),
    compare: boolCompare(get),
    worse: () => `ไม่คุ้มครอง${noun}`,
    better: () => `คุ้มครอง${noun}เพิ่ม`,
  };
}

function amountField(
  key: string,
  label: string,
  group: FieldGroup,
  glossaryKey: GlossaryKey,
  get: (q: Quote) => number,
  noun: string,
): CoverageField {
  return {
    key,
    label,
    group,
    glossaryKey,
    value: get,
    display: (q) => (get(q) > 0 ? formatBaht(get(q)) : "ไม่มี"),
    compare: numCompare(get),
    worse: (o, b) => `${noun}ต่ำกว่า ${formatBaht(get(b) - get(o))}`,
    better: (o, b) => `${noun}สูงกว่า ${formatBaht(get(o) - get(b))}`,
  };
}

export const coverageFields: CoverageField[] = [
  {
    key: "insuranceType",
    label: "ประเภทประกัน",
    group: "core",
    glossaryKey: "type1",
    value: (q) => q.coverage.insuranceType,
    display: (q) => insuranceTypeLabel[q.coverage.insuranceType],
    compare: (a, b) => insuranceTypeRank[a.coverage.insuranceType] - insuranceTypeRank[b.coverage.insuranceType],
    worse: (o) => `เป็น${insuranceTypeLabel[o.coverage.insuranceType]} ความคุ้มครองแคบกว่า`,
    better: (o) => `เป็น${insuranceTypeLabel[o.coverage.insuranceType]} ความคุ้มครองกว้างกว่า`,
  },
  amountField("sumInsured", "ทุนประกัน", "core", "sumInsured", (q) => q.sumInsured, "ทุนประกัน"),
  {
    key: "repairType",
    label: "การซ่อม",
    group: "core",
    glossaryKey: "dealerRepair",
    value: (q) => q.coverage.repairType,
    display: (q) => repairTypeLabel[q.coverage.repairType],
    compare: (a, b) => Number(a.coverage.repairType === "dealer") - Number(b.coverage.repairType === "dealer"),
    worse: () => "ซ่อมอู่แทนซ่อมศูนย์",
    better: () => "ซ่อมศูนย์แทนซ่อมอู่",
  },
  {
    key: "excess",
    label: "ค่าเสียหายส่วนแรก",
    group: "core",
    glossaryKey: "excess",
    value: (q) => q.coverage.excess,
    display: (q) => (q.coverage.excess > 0 ? formatBaht(q.coverage.excess) : "ไม่มี"),
    compare: numCompare((q) => q.coverage.excess, true),
    worse: (o) => `มีค่าเสียหายส่วนแรก ${formatBaht(o.coverage.excess)}`,
    better: (o, b) =>
      o.coverage.excess === 0 ? "ไม่มีค่าเสียหายส่วนแรก" : `ค่าเสียหายส่วนแรกน้อยกว่า ${formatBaht(b.coverage.excess - o.coverage.excess)}`,
  },
  boolField("collisionNoCounterparty", "ชนแบบไม่มีคู่กรณี", "ownDamage", "collisionNoCounterparty", (q) => q.coverage.collisionNoCounterparty, "กรณีชนแบบไม่มีคู่กรณี"),
  boolField("fireTheft", "รถหาย / ไฟไหม้", "ownDamage", "fireTheft", (q) => q.coverage.fireTheft, "รถหายและไฟไหม้"),
  boolField("flood", "น้ำท่วม", "ownDamage", "flood", (q) => q.coverage.flood, "น้ำท่วม"),
  boolField("evBattery", "แบตเตอรี่ EV", "ownDamage", "evBattery", (q) => q.coverage.evBattery, "แบตเตอรี่ EV"),
  amountField("thirdPartyProperty", "ทรัพย์สินบุคคลภายนอก", "thirdParty", "thirdPartyProperty", (q) => q.coverage.thirdPartyProperty, "วงเงินทรัพย์สินบุคคลภายนอก"),
  amountField("thirdPartyBodily", "ชีวิต/ร่างกายบุคคลภายนอก (ต่อคน)", "thirdParty", "thirdPartyBodily", (q) => q.coverage.thirdPartyBodilyPerPerson, "วงเงินชีวิต/ร่างกายบุคคลภายนอก"),
  amountField("personalAccident", "อุบัติเหตุส่วนบุคคล (ต่อคน)", "people", "personalAccident", (q) => q.coverage.personalAccidentPerPerson, "วงเงินอุบัติเหตุส่วนบุคคล"),
  amountField("medical", "ค่ารักษาพยาบาล (ต่อคน)", "people", "medical", (q) => q.coverage.medicalPerPerson, "วงเงินค่ารักษาพยาบาล"),
  amountField("bailBond", "ประกันตัวผู้ขับขี่", "people", "bailBond", (q) => q.coverage.bailBond, "วงเงินประกันตัว"),
  boolField("roadside", "ช่วยเหลือฉุกเฉิน 24 ชม.", "services", "roadside", (q) => q.coverage.roadsideAssistance, "บริการช่วยเหลือฉุกเฉิน"),
  {
    key: "replacementCar",
    label: "รถใช้ระหว่างซ่อม",
    group: "services",
    glossaryKey: "replacementCar",
    value: (q) => q.coverage.replacementCarDays,
    display: (q) => (q.coverage.replacementCarDays > 0 ? `สูงสุด ${formatNumber(q.coverage.replacementCarDays)} วัน` : "ไม่มี"),
    compare: numCompare((q) => q.coverage.replacementCarDays),
    worse: (o) => (o.coverage.replacementCarDays === 0 ? "ไม่มีรถใช้ระหว่างซ่อม" : "รถใช้ระหว่างซ่อมน้อยวันกว่า"),
    better: (o) => `มีรถใช้ระหว่างซ่อม ${formatNumber(o.coverage.replacementCarDays)} วัน`,
  },
  boolField("evCharger", "เครื่องชาร์จ EV", "services", "evCharger", (q) => q.coverage.evCharger, "เครื่องชาร์จ EV"),
];

export const fieldGroupLabel: Record<FieldGroup, string> = {
  core: "ภาพรวม",
  ownDamage: "ความเสียหายต่อรถของคุณ",
  thirdParty: "บุคคลภายนอก",
  people: "ผู้ขับขี่และผู้โดยสาร",
  services: "บริการเสริม",
};

export function fieldByKey(key: string): CoverageField | undefined {
  return coverageFields.find((f) => f.key === key);
}

/** EV-only fields are hidden when no quote in view has them. */
export function visibleFields(quotes: Quote[]): CoverageField[] {
  const evRelevant = quotes.some((q) => q.coverage.evBattery || q.coverage.evCharger);
  return coverageFields.filter((f) => evRelevant || (f.key !== "evBattery" && f.key !== "evCharger"));
}
