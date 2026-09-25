import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { resetPasswordAction, setUserActiveAction, updateUserAction } from "@/app/admin/(app)/actions";
import { Flash } from "@/components/admin/Flash";
import { formatDateTime, roleLabel, userErrorMessage, userOkMessage } from "@/components/admin/labels";
import { buttonClass } from "@/components/ui/button";
import { getAdminUser } from "@/lib/db/admin-users";
import { getDb } from "@/lib/db/client";
import { requireOwner } from "@/lib/server/admin-auth";

export const metadata: Metadata = { title: "ผู้ใช้" };

export default async function UserDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const who = await requireOwner();
  const [{ id }, { ok, error }] = await Promise.all([params, searchParams]);
  const u = await getAdminUser(await getDb(), id);
  if (!u) notFound();
  const self = u.id === who.userId;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        <ArrowLeft aria-hidden className="h-4 w-4" /> ผู้ใช้ทั้งหมด
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{u.name}</h1>
        <p className="text-sm text-navy-500">
          <span className="font-mono">{u.username}</span> · {roleLabel[u.role]} · {u.active ? "ใช้งาน" : "ปิดใช้งาน"}
          {self && " · บัญชีของคุณ"}
        </p>
        <p className="mt-1 text-xs text-navy-400">
          สร้างโดย {u.createdBy ?? "—"} เมื่อ {formatDateTime(u.createdAt)} · เข้าสู่ระบบล่าสุด {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}
        </p>
      </div>
      <Flash ok={ok} error={error} okMessages={userOkMessage} errorMessages={userErrorMessage} />

      <form action={updateUserAction} className="card space-y-4 p-5">
        <h2 className="font-bold">ข้อมูลและบทบาท</h2>
        <input type="hidden" name="id" value={u.id} />
        <div>
          <label htmlFor="name" className="field-label">ชื่อที่แสดง</label>
          <input id="name" name="name" defaultValue={u.name} required maxLength={80} className="field-input" />
        </div>
        <div>
          <label htmlFor="role" className="field-label">บทบาท</label>
          <select id="role" name="role" defaultValue={u.role} className="field-select">
            <option value="staff">ทีมงาน</option>
            <option value="owner">เจ้าของ</option>
          </select>
        </div>
        <button type="submit" className={buttonClass("secondary", "sm")}>บันทึก</button>
      </form>

      <form action={resetPasswordAction} className="card space-y-4 p-5">
        <h2 className="font-bold">ตั้งรหัสผ่านชั่วคราว</h2>
        <p className="text-sm text-navy-500">ผู้ใช้จะถูกออกจากระบบทุกอุปกรณ์ และต้องตั้งรหัสผ่านใหม่เมื่อเข้าสู่ระบบครั้งถัดไป</p>
        <input type="hidden" name="id" value={u.id} />
        <div>
          <label htmlFor="password" className="field-label">รหัสผ่านชั่วคราว (อย่างน้อย 12 ตัว)</label>
          <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className="field-input" />
        </div>
        <button type="submit" className={buttonClass("secondary", "sm")}>ตั้งรหัสผ่านชั่วคราว</button>
      </form>

      <form action={setUserActiveAction} className="card space-y-3 p-5">
        <h2 className="font-bold">{u.active ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}</h2>
        <p className="text-sm text-navy-500">
          {u.active ? "ผู้ใช้จะเข้าสู่ระบบไม่ได้และถูกออกจากระบบทันที ประวัติการทำงานยังอยู่ครบ" : "ผู้ใช้จะเข้าสู่ระบบได้อีกครั้งด้วยรหัสผ่านเดิม"}
        </p>
        <input type="hidden" name="id" value={u.id} />
        <input type="hidden" name="active" value={u.active ? "false" : "true"} />
        <button type="submit" disabled={self && u.active} className={buttonClass(u.active ? "ghost" : "primary", "sm", u.active ? "text-danger-600 hover:bg-danger-50" : "")}>
          {u.active ? "ปิดการใช้งานบัญชีนี้" : "เปิดการใช้งานบัญชีนี้"}
        </button>
        {self && u.active && <p className="text-xs text-navy-400">ปิดบัญชีของตัวเองไม่ได้</p>}
      </form>
    </div>
  );
}
