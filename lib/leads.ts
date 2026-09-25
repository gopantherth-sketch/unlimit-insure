import { parsePlanIds, parsePriorities, parseUsage, parseVehicle, type RawParams } from "@/lib/params";
import type { PriorityId, UsageId, VehicleSelection } from "@/lib/types";

// Advisor handoff payload (PROJECT_MASTER.md §22). Shared by the form and the API route.

export type ContactChannel = "phone" | "line";

export interface LeadContext {
  vehicle: VehicleSelection | null;
  usage?: UsageId;
  priorities: PriorityId[];
  selectedPlanIds: string[];
  viewedPlanIds: string[];
  comparedPlanIds: string[];
}

export interface LeadRequest {
  name: string;
  phone: string;
  lineId?: string;
  preferredChannel: ContactChannel;
  question?: string;
  consentContact: true;
  consentMarketing: boolean;
  context: LeadContext;
}

export type LeadErrors = Partial<Record<"name" | "phone" | "lineId" | "question" | "consentContact", string>>;

export const PHONE_PATTERN = /^0\d{8,9}$/;

export function normalizePhone(v: string): string {
  return v.replace(/[\s-]/g, "");
}

export function validateLead(input: {
  name: string;
  phone: string;
  lineId?: string;
  preferredChannel: ContactChannel;
  question?: string;
  consentContact: boolean;
}): LeadErrors {
  const e: LeadErrors = {};
  const name = input.name.trim();
  if (name.length < 2 || name.length > 100) e.name = "กรุณากรอกชื่อ 2–100 ตัวอักษร";
  if (!PHONE_PATTERN.test(normalizePhone(input.phone))) e.phone = "กรุณากรอกเบอร์โทรศัพท์ 9–10 หลัก ขึ้นต้นด้วย 0";
  if (input.preferredChannel === "line" && !input.lineId?.trim()) e.lineId = "กรุณากรอก LINE ID";
  if (input.lineId && input.lineId.length > 50) e.lineId = "LINE ID ยาวเกินไป";
  if (input.question && input.question.length > 1000) e.question = "คำถามยาวเกิน 1,000 ตัวอักษร";
  if (!input.consentContact) e.consentContact = "กรุณายินยอมให้ติดต่อกลับเพื่อให้ที่ปรึกษาช่วยคุณได้";
  return e;
}

export function contextFromParams(raw: RawParams): Omit<LeadContext, "viewedPlanIds" | "comparedPlanIds"> {
  return {
    vehicle: parseVehicle(raw),
    usage: parseUsage(raw),
    priorities: parsePriorities(raw),
    selectedPlanIds: parsePlanIds(raw),
  };
}
