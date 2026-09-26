import { normalizePhone, PHONE_PATTERN } from "@/lib/leads";
import { provinces } from "@/lib/data/provinces";

export interface BuyFormInput {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  plateNumber: string;
  province: string;
  coverageStart: string;
  commercialUse: string;
  consentData: boolean;
  consentInsurer: boolean;
  consentTruthful: boolean;
}

export type BuyField = keyof BuyFormInput;
export type BuyErrors = Partial<Record<BuyField, string>>;

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
// Thai plates: optional leading digit, 1–3 Thai letters, then 1–4 digits (e.g. "1กข 1234", "กก 12").
const PLATE_RE = /^\d?\s?[ก-ฮ]{1,3}\s?-?\s?\d{1,4}$/;

const addDays = (iso: string, days: number) => new Date(new Date(`${iso}T00:00:00Z`).getTime() + days * 86_400_000).toISOString().slice(0, 10);

/** Earliest/latest coverage start the form accepts, as Bangkok dates. */
export function startDateWindow(now = new Date()): { min: string; max: string } {
  const today = new Date(now.getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
  return { min: addDays(today, 1), max: addDays(today, 90) };
}

export function validateBuyForm(v: BuyFormInput, now = new Date()): BuyErrors {
  const e: BuyErrors = {};
  const name = v.customerName.trim();
  if (name.length < 2 || name.length > 100) e.customerName = "กรอกชื่อ-นามสกุลตามบัตรประชาชน";
  if (!PHONE_PATTERN.test(normalizePhone(v.phone))) e.phone = "เบอร์โทรศัพท์ 9–10 หลัก ขึ้นต้นด้วย 0";
  if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) e.email = "อีเมลไม่ถูกต้อง";
  const addr = v.address.trim();
  if (addr.length < 10 || addr.length > 500) e.address = "กรอกที่อยู่สำหรับส่งเอกสารกรมธรรม์";
  if (!PLATE_RE.test(v.plateNumber.trim())) e.plateNumber = "กรอกเลขทะเบียน เช่น 1กข 1234";
  if (!(provinces as readonly string[]).includes(v.province)) e.province = "เลือกจังหวัดของป้ายทะเบียน";
  const { min, max } = startDateWindow(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.coverageStart) || v.coverageStart < min || v.coverageStart > max) e.coverageStart = "เลือกวันเริ่มคุ้มครองภายใน 90 วันนับจากพรุ่งนี้";
  if (v.commercialUse !== "no") e.commercialUse = v.commercialUse === "yes" ? "commercial" : "เลือกลักษณะการใช้รถ";
  if (!v.consentData) e.consentData = "จำเป็นต้องยินยอมเพื่อดำเนินการใบสมัคร";
  if (!v.consentInsurer) e.consentInsurer = "จำเป็นต้องยินยอมเพื่อให้บริษัทประกันพิจารณา";
  if (!v.consentTruthful) e.consentTruthful = "กรุณายืนยันว่าข้อมูลถูกต้อง";
  return e;
}

export const normalizePlate = (p: string) => p.trim().replace(/\s*-\s*/, " ").replace(/\s+/g, " ");
