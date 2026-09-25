import type { GlossaryKey } from "@/content/types";
import type { PriorityId, UsageId } from "@/lib/types";

export interface PriorityDefinition {
  id: PriorityId;
  label: string;
  hint: string;
  glossaryKey?: GlossaryKey;
  /** Shown only for electric vehicles. */
  evOnly?: boolean;
}

export const priorityDefinitions: PriorityDefinition[] = [
  { id: "dealer", label: "ซ่อมศูนย์", hint: "ซ่อมที่ศูนย์บริการของยี่ห้อรถ", glossaryKey: "dealerRepair" },
  { id: "lowPremium", label: "ค่าเบี้ยประหยัด", hint: "เบี้ยต่ำเมื่อเทียบกับแผนประเภทเดียวกัน", glossaryKey: "premium" },
  { id: "noExcess", label: "ไม่มีค่าเสียหายส่วนแรก", hint: "ไม่ต้องจ่ายเองก่อนเมื่อเคลม", glossaryKey: "excess" },
  { id: "flood", label: "คุ้มครองน้ำท่วม", hint: "รถเสียหายจากน้ำท่วม", glossaryKey: "flood" },
  { id: "replacementCar", label: "รถใช้ระหว่างซ่อม", hint: "มีรถให้ใช้ระหว่างรถเข้าซ่อม", glossaryKey: "replacementCar" },
  { id: "highCoverage", label: "ทุนประกันสูง", hint: "ทุนใกล้เคียงมูลค่ารถ", glossaryKey: "sumInsured" },
  { id: "roadside", label: "ช่วยเหลือฉุกเฉิน", hint: "รถยก เปลี่ยนยาง พ่วงแบต", glossaryKey: "roadside" },
  { id: "evBattery", label: "คุ้มครองแบตเตอรี่ EV", hint: "แบตเตอรี่รถไฟฟ้าเสียหายจากอุบัติเหตุ", glossaryKey: "evBattery", evOnly: true },
];

export const priorityIds = priorityDefinitions.map((p) => p.id);

export function priorityLabel(id: PriorityId): string {
  return priorityDefinitions.find((p) => p.id === id)?.label ?? id;
}

export interface UsageDefinition {
  id: UsageId;
  label: string;
  hint: string;
  /** Pre-selected priorities. The user can change them; usage never changes the price. */
  suggests: PriorityId[];
}

export const usageDefinitions: UsageDefinition[] = [
  { id: "commute", label: "ขับไปทำงานทุกวัน", hint: "ใช้รถเป็นประจำ ขาดรถไม่ได้", suggests: ["replacementCar", "noExcess", "roadside"] },
  { id: "weekend", label: "ใช้เฉพาะวันหยุด", hint: "ใช้ไม่บ่อย เน้นความคุ้มค่า", suggests: ["lowPremium", "flood"] },
  { id: "upcountry", label: "วิ่งต่างจังหวัดบ่อย", hint: "เดินทางไกลเป็นประจำ", suggests: ["roadside", "highCoverage", "noExcess"] },
  { id: "second", label: "รถคันที่สอง", hint: "มีรถคันอื่นใช้แทนได้", suggests: ["lowPremium"] },
  { id: "family", label: "รถครอบครัว", hint: "มีผู้โดยสารเป็นประจำ", suggests: ["highCoverage", "dealer", "flood"] },
];

export const usageIds = usageDefinitions.map((u) => u.id);

export function usageLabel(id: UsageId): string {
  return usageDefinitions.find((u) => u.id === id)?.label ?? id;
}
