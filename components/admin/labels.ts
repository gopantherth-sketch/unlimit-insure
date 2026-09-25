import type { LeadStatus, VersionStatus } from "@/lib/db/schema";
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
