import type { AdminRole } from "@/lib/db/schema";

export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
export const MIN_PASSWORD = 12;
export const MAX_PASSWORD = 128;
export const adminRoles: AdminRole[] = ["owner", "staff"];

export const normalizeUsername = (u: string) => u.trim().toLowerCase();

export function usernameError(u: string, reserved?: string): string | null {
  const n = normalizeUsername(u);
  if (!USERNAME_RE.test(n)) return "ชื่อผู้ใช้ 3–32 ตัว ใช้ a-z 0-9 . _ - และขึ้นต้นด้วยตัวอักษรหรือตัวเลข";
  if (reserved && n === normalizeUsername(reserved)) return "ชื่อผู้ใช้นี้สงวนไว้สำหรับบัญชีหลักของระบบ";
  return null;
}

export function passwordError(p: string): string | null {
  if (p.length < MIN_PASSWORD) return `รหัสผ่านต้องมีอย่างน้อย ${MIN_PASSWORD} ตัวอักษร`;
  if (p.length > MAX_PASSWORD) return "รหัสผ่านยาวเกินไป";
  return null;
}

export function nameError(n: string): string | null {
  const t = n.trim();
  return t.length < 1 || t.length > 80 ? "กรุณากรอกชื่อ 1–80 ตัวอักษร" : null;
}
