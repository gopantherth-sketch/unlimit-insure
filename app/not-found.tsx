import Link from "next/link";
import SiteLayout from "@/app/(site)/layout";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteLayout>
    <div className="container-page max-w-xl py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-bold">ไม่พบหน้าที่คุณต้องการ</h1>
      <p className="mt-3 text-navy-500">ลิงก์อาจเปลี่ยนไปแล้ว หรือแพ็กเกจนี้ไม่มีให้บริการ</p>
      <Link href="/" className={buttonClass("primary", "md", "mt-8")}>
        กลับหน้าแรก
      </Link>
    </div>
    </SiteLayout>
  );
}
