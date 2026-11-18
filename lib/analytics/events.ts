import { glossary } from "@/content/glossary";
import { labArticles } from "@/content/lab";
import { INSURANCE_TYPES } from "@/lib/import/columns";
import { priorityIds, usageIds } from "@/lib/priorities";
import { scenarioRules } from "@/lib/scenarios";

// Allowlisted funnel events. Anything else is dropped by the API.
// Order of FUNNEL is the journey order shown in admin.

const terms = Object.keys(glossary);
const scenarios = scenarioRules.map((r) => r.id as string);
/** Where a contact button sits (dimension for contact_line / contact_call). */
export const CONTACT_PLACEMENTS = ["header", "mobile_bar", "footer", "home", "advisor", "plan", "results", "compare", "lab"] as const;
export type ContactPlacement = (typeof CONTACT_PLACEMENTS)[number];

const SHOP_SLUG_DIM = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;

export const eventDefs = {
  quote_started: { label: "เริ่มเลือกรถ", dims: [] as string[] },
  usage_selected: { label: "เลือกการใช้งาน", dims: [...usageIds] as string[] },
  results_viewed: { label: "ดูผลแพ็กเกจ", dims: [] as string[] },
  priority_selected: { label: "เลือกสิ่งที่สำคัญ", dims: [...priorityIds] as string[] },
  compare_viewed: { label: "เปิดหน้าเปรียบเทียบ", dims: [] as string[] },
  plan_viewed: { label: "ดูรายละเอียดแพ็กเกจ", dims: [...INSURANCE_TYPES] as string[] },
  advisor_viewed: { label: "เปิดหน้าที่ปรึกษา", dims: [] as string[] },
  lead_submitted: { label: "ส่งคำขอที่ปรึกษา", dims: [] as string[] },
  contact_line: { label: "กดติดต่อทาง LINE", dims: [...CONTACT_PLACEMENTS] as string[] },
  contact_call: { label: "กดโทรหาเรา", dims: [...CONTACT_PLACEMENTS] as string[] },
  explain_opened: { label: "เปิดคำอธิบาย", dims: terms },
  simulator_used: { label: "เลือกเหตุการณ์", dims: scenarios },
  lab_viewed: { label: "อ่าน Insurance Lab", dims: labArticles.map((a) => a.slug) },
  model_page_viewed: { label: "ดูหน้ารุ่นรถ", dims: [] as string[] },
  buy_viewed: { label: "เปิดหน้าสมัคร", dims: [] as string[] },
  application_submitted: { label: "ส่งใบสมัคร", dims: [] as string[] },
  documents_submitted: { label: "ส่งเอกสารให้ตรวจ", dims: [] as string[] },
  payment_submitted: { label: "แจ้งชำระเงิน", dims: [] as string[] },
  // Shop products are entered in admin (C16), so the dimension is any product slug, checked by shape.
  shop_viewed: { label: "ดูสินค้าในร้านค้า", dims: [] as string[] },
  shop_order_clicked: { label: "กดสั่งซื้อสินค้าทาง LINE", dims: [] as string[] },
} as const;

/** Events whose dimension is checked by shape instead of a fixed list. */
const dimPatterns: Partial<Record<string, RegExp>> = { shop_viewed: SHOP_SLUG_DIM, shop_order_clicked: SHOP_SLUG_DIM };

export type EventName = keyof typeof eventDefs;

export const FUNNEL: EventName[] = ["quote_started", "usage_selected", "results_viewed", "compare_viewed", "advisor_viewed", "contact_line"];

export function isValidEvent(name: unknown, dim: unknown): name is EventName {
  if (typeof name !== "string" || !(name in eventDefs)) return false;
  const dims = eventDefs[name as EventName].dims;
  if (dim === undefined || dim === "") return true;
  if (typeof dim !== "string") return false;
  const pattern = dimPatterns[name];
  return pattern ? pattern.test(dim) : dims.includes(dim);
}
