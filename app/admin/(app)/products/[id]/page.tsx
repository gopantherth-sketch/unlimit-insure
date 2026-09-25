import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { changeVersionStatus, verifyVersion } from "@/app/admin/(app)/actions";
import { formatDateTime, sourceStatusLabel, sourceStatusTone, versionStatusLabel } from "@/components/admin/labels";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import { getProductWithVersions } from "@/lib/db/products-admin";
import type { VersionStatus } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "รายละเอียดแพ็กเกจ" };

const errors: Record<string, string> = {
  not_verified: "เผยแพร่ไม่ได้: ต้องตรวจสอบแหล่งข้อมูลของเวอร์ชันนี้ก่อน",
  not_found: "ไม่พบเวอร์ชันนี้",
};

export default async function ProductAdminPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const product = await getProductWithVersions(await getDb(), id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        <ArrowLeft aria-hidden className="h-4 w-4" /> แพ็กเกจทั้งหมด
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-navy-500">
          {product.insurer?.name} · <span className="font-mono text-xs">{product.id}</span>
        </p>
      </div>
      {error && errors[error] && (
        <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger-600">{errors[error]}</p>
      )}

      {[...product.versions].reverse().map((v) => (
        <section key={v.id} className="card p-5" aria-labelledby={`v-${v.id}`}>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id={`v-${v.id}`} className="text-lg font-bold">เวอร์ชัน {v.version}</h2>
            <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-semibold text-navy-700">{versionStatusLabel[v.status]}</span>
            <span className={cx("rounded-full px-2.5 py-0.5 text-xs font-semibold", sourceStatusTone[v.sourceStatus])}>{sourceStatusLabel[v.sourceStatus]}</span>
            <span className="text-sm text-navy-500">
              มีผล {formatDate(v.effectiveFrom)} – {formatDate(v.effectiveUntil)}
            </span>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-navy-500">แหล่งข้อมูล</dt>
            <dd>
              {v.sourceDocumentName}
              {v.sourcePage !== null && ` หน้า ${v.sourcePage}`}
            </dd>
            <dt className="text-navy-500">ตรวจสอบโดย</dt>
            <dd>{v.verifiedBy ? `${v.verifiedBy} · ${v.verifiedAt}` : "—"}</dd>
            <dt className="text-navy-500">เผยแพร่เมื่อ</dt>
            <dd>{v.publishedAt ? formatDateTime(v.publishedAt) : "—"}</dd>
          </dl>
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-semibold text-brand-700">ความคุ้มครองและราคา (JSON)</summary>
            <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-navy-900 p-4 text-xs text-navy-100">
              {JSON.stringify({ coverage: v.coverage, pricing: v.pricing, eligibility: v.eligibility, benefits: v.benefits }, null, 2)}
            </pre>
          </details>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <form action={verifyVersion} className="space-y-3 rounded-2xl border border-navy-100 p-4">
              <p className="text-sm font-semibold">บันทึกการตรวจสอบกับเอกสาร</p>
              <input type="hidden" name="versionId" value={v.id} />
              <input type="hidden" name="productId" value={product.id} />
              <div>
                <label htmlFor={`doc-${v.id}`} className="field-label">ชื่อเอกสารต้นฉบับ</label>
                <input id={`doc-${v.id}`} name="documentName" required maxLength={200} className="field-input" placeholder="เช่น Insurer_Product_2026_Q4.pdf" />
              </div>
              <div>
                <label htmlFor={`page-${v.id}`} className="field-label">หน้า</label>
                <input id={`page-${v.id}`} name="page" type="number" min={1} className="field-input" />
              </div>
              <button type="submit" className={buttonClass("secondary", "sm")}>ยืนยันว่าตรวจสอบแล้ว</button>
            </form>
            <div className="space-y-2 rounded-2xl border border-navy-100 p-4">
              <p className="text-sm font-semibold">สถานะการเผยแพร่</p>
              <div className="flex flex-wrap gap-2">
                {(["published", "draft", "retired"] as VersionStatus[])
                  .filter((s) => s !== v.status)
                  .map((s) => (
                    <form key={s} action={changeVersionStatus}>
                      <input type="hidden" name="versionId" value={v.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="status" value={s} />
                      <button type="submit" className={buttonClass(s === "published" ? "primary" : "ghost", "sm")}>
                        {s === "published" ? "เผยแพร่" : s === "draft" ? "กลับเป็นร่าง" : "เลิกใช้"}
                      </button>
                    </form>
                  ))}
              </div>
              <p className="text-xs text-navy-400">เวอร์ชันที่เผยแพร่แล้วไม่ควรแก้ไข ให้สร้างเวอร์ชันใหม่แทน</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
