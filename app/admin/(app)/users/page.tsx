import type { Metadata } from "next";
import Link from "next/link";
import { createUserAction } from "@/app/admin/(app)/actions";
import { Flash } from "@/components/admin/Flash";
import { formatDateTime, roleLabel, userErrorMessage, userOkMessage } from "@/components/admin/labels";
import { buttonClass } from "@/components/ui/button";
import { listAdminUsers } from "@/lib/db/admin-users";
import { getDb } from "@/lib/db/client";
import { requireOwner } from "@/lib/server/admin-auth";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "ผู้ใช้" };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const who = await requireOwner();
  const [{ ok, error }, users] = await Promise.all([searchParams, listAdminUsers(await getDb())]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ผู้ใช้ระบบผู้ดูแล</h1>
        <p className="mt-1 text-sm text-navy-500">
          เจ้าของจัดการผู้ใช้ ตรวจสอบและเผยแพร่แพ็กเกจได้ ทีมงานดูแลลีดและนำเข้าข้อมูลเป็นฉบับร่างได้
          {who.kind === "env" && " · คุณกำลังใช้บัญชีหลัก (ADMIN_USERNAME) ซึ่งไม่แสดงในรายการนี้"}
        </p>
      </div>
      <Flash ok={ok} error={error} okMessages={userOkMessage} errorMessages={userErrorMessage} />

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-canvas text-left text-navy-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">ชื่อ</th>
              <th scope="col" className="px-4 py-3 font-medium">ชื่อผู้ใช้</th>
              <th scope="col" className="px-4 py-3 font-medium">บทบาท</th>
              <th scope="col" className="px-4 py-3 font-medium">สถานะ</th>
              <th scope="col" className="px-4 py-3 font-medium">เข้าสู่ระบบล่าสุด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-navy-500">ยังไม่มีผู้ใช้ เพิ่มผู้ใช้คนแรกด้านล่าง</td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-canvas">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="font-semibold text-brand-700 hover:underline">{u.name}</Link>
                  {u.id === who.userId && <span className="ml-2 text-xs text-navy-400">(คุณ)</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-3">{roleLabel[u.role]}</td>
                <td className="px-4 py-3">
                  <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", u.active ? "bg-success-50 text-success-700" : "bg-navy-100 text-navy-600")}>
                    {u.active ? "ใช้งาน" : "ปิดใช้งาน"}
                  </span>
                  {u.mustChangePassword && u.active && <span className="ml-2 text-xs text-warning-700">รอเปลี่ยนรหัสผ่าน</span>}
                </td>
                <td className="px-4 py-3 text-navy-500">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={createUserAction} className="card max-w-2xl space-y-4 p-5 sm:p-6" aria-labelledby="new-user">
        <h2 id="new-user" className="text-lg font-bold">เพิ่มผู้ใช้</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="field-label">ชื่อที่แสดง</label>
            <input id="name" name="name" required maxLength={80} className="field-input" />
          </div>
          <div>
            <label htmlFor="username" className="field-label">ชื่อผู้ใช้ (a-z 0-9 . _ -)</label>
            <input id="username" name="username" required minLength={3} maxLength={32} pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{2,31}" autoComplete="off" className="field-input" />
          </div>
          <div>
            <label htmlFor="role" className="field-label">บทบาท</label>
            <select id="role" name="role" defaultValue="staff" className="field-select">
              <option value="staff">ทีมงาน</option>
              <option value="owner">เจ้าของ</option>
            </select>
          </div>
          <div>
            <label htmlFor="password" className="field-label">รหัสผ่านชั่วคราว (อย่างน้อย 12 ตัว)</label>
            <input id="password" name="password" type="password" required minLength={12} autoComplete="new-password" className="field-input" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input type="checkbox" name="mustChange" defaultChecked className="h-4 w-4 accent-brand-600" />
          ให้เปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งแรก
        </label>
        <p className="text-xs text-navy-400">ส่งรหัสผ่านชั่วคราวให้ผู้ใช้ทางช่องทางที่ปลอดภัย ระบบไม่แสดงรหัสผ่านนี้อีก</p>
        <button type="submit" className={buttonClass("primary", "md")}>เพิ่มผู้ใช้</button>
      </form>
    </div>
  );
}
