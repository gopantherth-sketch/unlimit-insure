import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { roleLabel } from "@/components/admin/labels";
import { logout, requireAdmin } from "@/lib/server/admin-auth";

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
        <div className="container-page flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/admin" className="font-bold">
              Unlimit <span className="text-brand-200">Admin</span>
            </Link>
            <AdminNav isOwner={who.role === "owner"} />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin/account" className="hidden text-navy-200 hover:text-white sm:inline">
              {who.name} · {roleLabel[who.role]}
            </Link>
            <form action={signOut}>
              <button type="submit" className="rounded-full px-3 py-1.5 font-medium text-navy-100 hover:bg-navy-800">ออกจากระบบ</button>
            </form>
          </div>
        </div>
      </header>
      <div className="container-page py-8">{children}</div>
    </>
  );
}
