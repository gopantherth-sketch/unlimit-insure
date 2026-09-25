import { glossary } from "@/content/glossary";
import { labArticles } from "@/content/lab";
import { INSURANCE_TYPES } from "@/lib/import/columns";
import { priorityIds, usageIds } from "@/lib/priorities";
import { scenarioRules } from "@/lib/scenarios";

// Allowlisted funnel events. Anything else is dropped by the API.
// Order of FUNNEL is the journey order shown in admin.

const terms = Object.keys(glossary);
const scenarios = scenarioRules.map((r) => r.id as string);

export const eventDefs = {
  quote_started: { label: "เริ่มเลือกรถ", dims: [] as string[] },
  usage_selected: { label: "เลือกการใช้งาน", dims: [...usageIds] as string[] },
  results_viewed: { label: "ดูผลแพ็กเกจ", dims: [] as string[] },
  priority_selected: { label: "เลือกสิ่งที่สำคัญ", dims: [...priorityIds] as string[] },
  compare_viewed: { label: "เปิดหน้าเปรียบเทียบ", dims: [] as string[] },
  plan_viewed: { label: "ดูรายละเอียดแพ็กเกจ", dims: [...INSURANCE_TYPES] as string[] },
  advisor_viewed: { label: "เปิดหน้าที่ปรึกษา", dims: [] as string[] },
  lead_submitted: { label: "ส่งคำขอที่ปรึกษา", dims: [] as string[] },
  explain_opened: { label: "เปิดคำอธิบาย", dims: terms },
  simulator_used: { label: "ใช้เครื่องจำลอง", dims: scenarios },
  lab_viewed: { label: "อ่าน Insurance Lab", dims: labArticles.map((a) => a.slug) },
  model_page_viewed: { label: "ดูหน้ารุ่นรถ", dims: [] as string[] },
} as const;

export type EventName = keyof typeof eventDefs;

export const FUNNEL: EventName[] = ["quote_started", "usage_selected", "results_viewed", "compare_viewed", "advisor_viewed", "lead_submitted"];

export function isValidEvent(name: unknown, dim: unknown): name is EventName {
  if (typeof name !== "string" || !(name in eventDefs)) return false;
  const dims = eventDefs[name as EventName].dims;
  if (dim === undefined || dim === "") return true;
  return typeof dim === "string" && dims.includes(dim);
}
