import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { roleLabel } from "@/components/admin/labels";
import { changeOwnPassword } from "@/lib/db/admin-users";
import { getDb } from "@/lib/db/client";
import { refreshSession, requireAdmin } from "@/lib/server/admin-auth";

export const metadata: Metadata = { title: "บัญชีของฉัน" };

async function changePassword(formData: FormData) {
  "use server";
  const who = await requireAdmin({ allowPasswordChange: true });
  if (!who.userId) redirect("/admin/account");
  const next = String(formData.get("next") ?? "");
  if (next !== String(formData.get("confirm") ?? "")) redirect("/admin/account?error=mismatch");
  const result = await changeOwnPassword(await getDb(), who.userId, String(formData.get("current") ?? ""), next);
  if (!result.ok) {
    const msg = result.error === "invalid_password" && "message" in result && result.message ? "weak" : result.error;
    redirect(`/admin/account?error=${encodeURIComponent(msg)}`);
  }
  await refreshSession(who.userId, result.value);
  redirect("/admin?ok=password");
}

const errors: Record<string, string> = {
  mismatch: "รหัสผ่านใหม่สองช่องไม่ตรงกัน",
  wrong_password: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
  weak: "รหัสผ่านใหม่ต้องมีอย่างน้อย 12 ตัวอักษร และไม่ซ้ำกับรหัสเดิม",
  invalid_password: "รหัสผ่านใหม่ต้องมีอย่างน้อย 12 ตัวอักษร และไม่ซ้ำกับรหัสเดิม",
  not_found: "ไม่พบบัญชี กรุณาเข้าสู่ระบบใหม่",
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ required?: string; error?: string }> }) {
  const who = await requireAdmin({ allowPasswordChange: true });
  const { required, error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">บัญชีของฉัน</p>
        <h1 className="mt-2 text-2xl font-bold">{who.name}</h1>
        <p className="text-sm text-navy-500">
          {who.username} · {roleLabel[who.role]}
        </p>

        {who.kind === "env" ? (
          <p className="mt-6 rounded-xl bg-navy-50 p-4 text-sm text-navy-700">
            นี่คือบัญชีหลักจาก ADMIN_USERNAME / ADMIN_PASSWORD ใช้สำหรับกรณีฉุกเฉิน เปลี่ยนรหัสผ่านได้ที่ Cloudflare secrets
            แนะนำให้สร้างบัญชีเจ้าของส่วนตัวที่หน้า ผู้ใช้ แล้วใช้บัญชีนั้นในการทำงานประจำ
          </p>
        ) : (
          <form action={changePassword} className="mt-6 space-y-4">
            {(required || who.mustChangePassword) && (
              <p role="status" className="rounded-xl bg-warning-50 p-3 text-sm text-warning-700">กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งาน</p>
            )}
            {error && errors[error] && (
              <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger-600">{errors[error]}</p>
            )}
            <div>
              <label htmlFor="current" className="field-label">รหัสผ่านปัจจุบัน</label>
              <input id="current" name="current" type="password" autoComplete="current-password" required className="field-input" />
            </div>
            <div>
              <label htmlFor="next" className="field-label">รหัสผ่านใหม่ (อย่างน้อย 12 ตัวอักษร)</label>
              <input id="next" name="next" type="password" autoComplete="new-password" minLength={12} required className="field-input" />
            </div>
            <div>
              <label htmlFor="confirm" className="field-label">ยืนยันรหัสผ่านใหม่</label>
              <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required className="field-input" />
            </div>
            <button type="submit" className={buttonClass("primary", "md", "w-full")}>เปลี่ยนรหัสผ่าน</button>
          </form>
        )}
        {!who.mustChangePassword && (
          <Link href="/admin" className="mt-5 inline-block text-sm font-semibold text-brand-600">← กลับหน้าผู้ดูแล</Link>
        )}
      </div>
    </div>
  );
}
