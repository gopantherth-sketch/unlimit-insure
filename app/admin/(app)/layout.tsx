import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout, requireAdmin } from "@/lib/server/admin-auth";
import { redirect } from "next/navigation";

async function signOut() {
  "use server";
  await logout();
  redirect("/admin/login");
}

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const who = await requireAdmin();
  return (
    <>
      <header className="border-b border-navy-800 bg-navy-900 text-white">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold">
              Unlimit <span className="text-brand-200">Admin</span>
            </Link>
            <AdminNav />
          </div>
          <form action={signOut} className="flex items-center gap-3 text-sm">
            <span className="hidden text-navy-300 sm:inline">{who}</span>
            <button type="submit" className="rounded-full px-3 py-1.5 font-medium text-navy-100 hover:bg-navy-800">ออกจากระบบ</button>
          </form>
        </div>
      </header>
      <div className="container-page py-8">{children}</div>
    </>
  );
}
