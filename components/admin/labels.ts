import type { AdminRole, LeadStatus, VersionStatus } from "@/lib/db/schema";
import type { ApplicationStatus } from "@/lib/applications/status";
import type { VerificationStatus } from "@/lib/types";

export const leadStatusLabel: Record<LeadStatus, string> = {
  new: "ใหม่",
  contacted: "ติดต่อแล้ว",
  quoted: "เสนอราคาแล้ว",
  won: "ปิดการขาย",
  lost: "ไม่สำเร็จ",
};

export const leadStatusTone: Record<LeadStatus, string> = {
  new: "bg-brand-50 text-brand-700",
  contacted: "bg-navy-100 text-navy-700",
  quoted: "bg-warning-50 text-warning-700",
  won: "bg-success-50 text-success-700",
  lost: "bg-danger-50 text-danger-600",
};

export const versionStatusLabel: Record<VersionStatus, string> = { draft: "ร่าง", published: "เผยแพร่", retired: "เลิกใช้" };
export const sourceStatusLabel: Record<VerificationStatus, string> = { mock: "ข้อมูลตัวอย่าง", pending: "รอตรวจสอบ", verified: "ตรวจสอบแล้ว" };
export const sourceStatusTone: Record<VerificationStatus, string> = {
  mock: "bg-warning-50 text-warning-700",
  pending: "bg-navy-100 text-navy-700",
  verified: "bg-success-50 text-success-700",
};

const dt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dt.format(d);
};

export const roleLabel: Record<AdminRole, string> = { owner: "เจ้าของ", staff: "ทีมงาน" };

export const userErrorMessage: Record<string, string> = {
  invalid_name: "กรุณากรอกชื่อ 1–80 ตัวอักษร",
  invalid_username: "ชื่อผู้ใช้ 3–32 ตัว ใช้ a-z 0-9 . _ - และขึ้นต้นด้วยตัวอักษรหรือตัวเลข",
  reserved_username: "ชื่อผู้ใช้นี้สงวนไว้สำหรับบัญชีหลักของระบบ",
  username_taken: "ชื่อผู้ใช้นี้มีคนใช้แล้ว",
  invalid_password: "รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร",
  invalid_role: "บทบาทไม่ถูกต้อง",
  not_found: "ไม่พบผู้ใช้นี้",
  self_action: "ปิดหรือลดสิทธิ์บัญชีของตัวเองไม่ได้",
  last_owner: "ต้องมีเจ้าของที่ใช้งานอยู่อย่างน้อย 1 บัญชี",
};

export const userOkMessage: Record<string, string> = {
  created: "สร้างผู้ใช้แล้ว",
  updated: "บันทึกแล้ว",
  enabled: "เปิดใช้งานแล้ว",
  disabled: "ปิดการใช้งานแล้ว ผู้ใช้ถูกออกจากระบบทุกอุปกรณ์",
  reset: "ตั้งรหัสผ่านชั่วคราวแล้ว ผู้ใช้ต้องเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งถัดไป",
};

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  documents_pending: "รอเอกสารลูกค้า",
  submitted: "รอตรวจเอกสาร",
  needs_info: "ขอข้อมูลเพิ่ม",
  awaiting_payment: "รอชำระเงิน",
  payment_submitted: "รอยืนยันการชำระ",
  sent_to_insurer: "ส่งบริษัทประกันแล้ว",
  policy_issued: "ออกกรมธรรม์แล้ว",
  rejected: "ไม่รับประกัน",
  cancelled: "ยกเลิก",
};

export const applicationStatusTone: Record<ApplicationStatus, string> = {
  documents_pending: "bg-navy-100 text-navy-700",
  submitted: "bg-brand-50 text-brand-700",
  needs_info: "bg-warning-50 text-warning-700",
  awaiting_payment: "bg-navy-100 text-navy-700",
  payment_submitted: "bg-brand-50 text-brand-700",
  sent_to_insurer: "bg-navy-100 text-navy-700",
  policy_issued: "bg-success-50 text-success-700",
  rejected: "bg-danger-50 text-danger-600",
  cancelled: "bg-danger-50 text-danger-600",
};

/** Statuses where Unlimit staff must act next. */
export const staffActionStatuses: ApplicationStatus[] = ["submitted", "payment_submitted", "sent_to_insurer"];

export const applicationErrorMessage: Record<string, string> = {
  not_found: "ไม่พบใบสมัคร",
  not_allowed: "เปลี่ยนสถานะนี้ไม่ได้จากสถานะปัจจุบัน (อาจมีคนเปลี่ยนไปแล้ว รีเฟรชหน้า)",
  missing_documents: "เอกสารบังคับยังไม่ครบ",
  missing_payment_slip: "ยังไม่มีสลิปโอนเงิน",
  missing_policy: "ต้องบันทึกเลขกรมธรรม์ วันเริ่ม-สิ้นสุด และอัปโหลดไฟล์กรมธรรม์ก่อน",
  missing_reason: "ต้องใส่ข้อความถึงลูกค้าสำหรับการเปลี่ยนสถานะนี้",
  invalid_premium: "เบี้ยต้องเป็นจำนวนเต็มบาทมากกว่า 0",
  invalid_policy: "ตรวจเลขกรมธรรม์และวันที่ (วันสิ้นสุดต้องหลังวันเริ่ม)",
  assignee: "มอบหมายไม่ได้: ผู้ใช้นี้ถูกปิดการใช้งาน",
  empty: "กรุณากรอกข้อความ",
};

export const applicationOkMessage: Record<string, string> = {
  moved: "เปลี่ยนสถานะแล้ว",
  message: "บันทึกข้อความแล้ว",
  premium: "บันทึกเบี้ยสุดท้ายแล้ว ลูกค้าจะเห็นยอดใหม่และเหตุผล",
  policy: "บันทึกข้อมูลกรมธรรม์แล้ว",
  assigned: "บันทึกผู้รับผิดชอบแล้ว",
};
