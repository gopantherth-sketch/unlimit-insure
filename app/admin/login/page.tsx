import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { adminConfigured, currentAdmin, login } from "@/lib/server/admin-auth";

async function signIn(formData: FormData) {
  "use server";
  const result = await login(String(formData.get("username") ?? "").slice(0, 64), String(formData.get("password") ?? "").slice(0, 256));
  if (result === "ok") redirect("/admin");
  if (result === "must_change") redirect("/admin/account?required=1");
  await new Promise((r) => setTimeout(r, 600));
  redirect(`/admin/login?error=${result}`);
}

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = await adminConfigured();

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form action={signIn} className="card w-full max-w-sm p-7">
        <div className="flex items-center gap-2 text-brand-600">
          <Lock aria-hidden className="h-5 w-5" />
          <p className="text-sm font-semibold uppercase tracking-wider">Unlimit Insure Admin</p>
        </div>
        <h1 className="mt-3 text-2xl font-bold">เข้าสู่ระบบ</h1>
        {!configured ? (
          <p className="mt-4 rounded-xl bg-warning-50 p-3 text-sm text-warning-700">
            ยังไม่ได้ตั้งค่าการเข้าสู่ระบบ ตั้งค่า ADMIN_USERNAME และ ADMIN_PASSWORD (อย่างน้อย 12 ตัวอักษร) หรือ SESSION_SECRET (อย่างน้อย 32 ตัวอักษร) ก่อน
          </p>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="username" className="field-label">ชื่อผู้ใช้</label>
                <input id="username" name="username" autoComplete="username" required className="field-input" />
              </div>
              <div>
                <label htmlFor="password" className="field-label">รหัสผ่าน</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required className="field-input" />
              </div>
            </div>
            {error === "invalid" && (
              <p role="alert" className="mt-4 text-sm font-medium text-danger-600">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</p>
            )}
            {error === "throttled" && (
              <p role="alert" className="mt-4 text-sm font-medium text-danger-600">ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอ 10 นาทีแล้วลองใหม่</p>
            )}
            <button type="submit" className={buttonClass("primary", "md", "mt-6 w-full")}>เข้าสู่ระบบ</button>
          </>
        )}
      </form>
    </main>
  );
}
