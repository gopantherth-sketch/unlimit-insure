import type { Metadata } from "next";
import { Download } from "lucide-react";
import { ImportUploader } from "@/components/admin/ImportUploader";
import { buttonClass } from "@/components/ui/button";

export const metadata: Metadata = { title: "นำเข้าข้อมูล" };

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">นำเข้าข้อมูลแพ็กเกจ</h1>
          <p className="mt-1 max-w-2xl text-navy-500">
            กรอกแม่แบบจากใบเสนอราคาหรือโบรชัวร์ของบริษัทประกัน หนึ่งแถวต่อหนึ่งเวอร์ชัน ทุกแถวนำเข้าเป็นฉบับร่าง
            แล้วตรวจกับเอกสารและเผยแพร่ที่หน้าแพ็กเกจ
          </p>
        </div>
        <a href="/templates/unlimit-product-import.xlsx" download className={buttonClass("secondary", "md")}>
          <Download aria-hidden className="h-4 w-4" />
          ดาวน์โหลดแม่แบบ
        </a>
      </div>
      <ImportUploader />
    </div>
  );
}
