import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import {
  applicationMessageAction,
  assignApplicationAction,
  finalPremiumAction,
  moveApplicationAction,
  policyDetailsAction,
} from "@/app/admin/(app)/applications/actions";
import { Flash } from "@/components/admin/Flash";
import { ResetLinkForm } from "@/components/admin/ResetLinkForm";
import { StaffUploadForm } from "@/components/admin/StaffUploadForm";
import { applicationErrorMessage, applicationOkMessage, applicationStatusLabel, applicationStatusTone, formatDateTime } from "@/components/admin/labels";
import { buttonClass } from "@/components/ui/button";
import { purchaseCopy as c } from "@/content/purchase";
import { transitions, type ApplicationStatus } from "@/lib/applications/status";
import { listAdminUsers } from "@/lib/db/admin-users";
import { amountDue, getApplicationDetail, missingRequiredDocuments } from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { requireAdmin } from "@/lib/server/admin-auth";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "รายละเอียดใบสมัคร" };

const baht = new Intl.NumberFormat("th-TH");
const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

const eventText = (e: { type: string; fromStatus: string | null; toStatus: string | null; note: string | null }) => {
  const label = (s: string | null) => (s ? (applicationStatusLabel[s as ApplicationStatus] ?? s) : "");
  switch (e.type) {
    case "created":
      return "ลูกค้าส่งใบสมัคร";
    case "status_changed":
      return `สถานะ: ${label(e.fromStatus)} → ${label(e.toStatus)}`;
    case "document_added":
      return `อัปโหลด: ${c.documents[e.note as keyof typeof c.documents]?.label ?? e.note}`;
    case "premium_changed":
      return "เปลี่ยนเบี้ยสุดท้าย";
    case "assigned":
      return `มอบหมายให้: ${e.note}`;
    case "link_reset":
      return "สร้างลิงก์ส่วนตัวใหม่";
    case "message":
      return "ข้อความถึงลูกค้า";
    default:
      return "บันทึกภายใน";
  }
};

export default async function ApplicationDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin();
  const [{ id }, { ok, error }] = await Promise.all([params, searchParams]);
  const db = await getDb();
  const [detail, users] = await Promise.all([getApplicationDetail(db, id), listAdminUsers(db)]);
  if (!detail) notFound();
  const { app, snapshot, documents, events } = detail;
  const src = snapshot.source as Record<string, unknown>;
  const status = app.status as ApplicationStatus;
  const moves = (Object.entries(transitions[status]) as [ApplicationStatus, string[]][]).filter(([, who]) => who.includes("staff")).map(([to]) => to);
  const missing = missingRequiredDocuments(documents);
  const assignee = users.find((u) => u.id === app.assignedTo) ?? null;
  const assignable = users.filter((u) => u.active || u.id === app.assignedTo);
  const premiumEditable = ["submitted", "needs_info", "awaiting_payment"].includes(status);
  const policyEditable = !["rejected", "cancelled", "policy_issued"].includes(status);

  const rows: [string, string][] = [
    ["แผน", `${String(src.productName ?? "")} · ${String(src.insurerName ?? "")}`],
    ["รถ", String(src.vehicleLabel ?? "")],
    ["ทะเบียน", `${app.plateNumber} ${app.province}`],
    ["ทุนประกัน", `${baht.format(snapshot.sumInsured)} บาท`],
    ["เบี้ยตอนสมัคร", `${baht.format(app.estimatedPremium)} บาท`],
    ["เบี้ยสุดท้าย", app.finalPremium ? `${baht.format(app.finalPremium)} บาท (${app.finalPremiumReason})` : "—"],
    ["ยอดที่ต้องชำระ", `${baht.format(amountDue(app))} บาท`],
    ["วันเริ่มที่ขอ", app.coverageStart],
    ["กรมธรรม์", app.policyNumber ? `${app.policyNumber} (${app.policyStart} – ${app.policyEnd})` : "—"],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        <ArrowLeft aria-hidden className="h-4 w-4" /> ใบสมัครทั้งหมด
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{app.customerName}</h1>
        <span className={cx("rounded-full px-3 py-1 text-xs font-semibold", applicationStatusTone[status])}>{applicationStatusLabel[status]}</span>
        <span className="font-mono text-xs text-navy-400">{app.reference}</span>
        <span className="text-sm text-navy-500">ผู้รับผิดชอบ: {assignee ? assignee.name : "ยังไม่มี"}</span>
      </div>
      <Flash ok={ok} error={error} okMessages={applicationOkMessage} errorMessages={applicationErrorMessage} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-bold">ลูกค้า</h2>
            <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-navy-500">โทรศัพท์</dt>
              <dd className="font-mono">{app.phone}</dd>
              <dt className="text-navy-500">อีเมล</dt>
              <dd>{app.email ?? "—"}</dd>
              <dt className="text-navy-500">ที่อยู่</dt>
              <dd className="whitespace-pre-wrap">{app.address}</dd>
              <dt className="text-navy-500">รับข่าวสาร</dt>
              <dd>{app.consentMarketing ? "ยินยอม" : "ไม่ยินยอม"}</dd>
            </dl>
          </section>
          <section className="card p-5">
            <h2 className="font-bold">แผนและราคา (ตอนสมัคร)</h2>
            <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-navy-500">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="card p-5">
            <h2 className="font-bold">เอกสาร</h2>
            {missing.length > 0 && (
              <p className="mt-2 text-sm text-warning-700">ยังขาด: {missing.map((k) => c.documents[k].label).join(", ")}</p>
            )}
            {documents.length === 0 ? (
              <p className="mt-3 text-sm text-navy-500">ยังไม่มีเอกสาร</p>
            ) : (
              <ul className="mt-3 divide-y divide-navy-100 text-sm">
                {documents.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span className="flex items-center gap-2">
                      <FileText aria-hidden className="h-4 w-4 text-navy-400" />
                      <span className="font-medium">{c.documents[d.kind].label}</span>
                      <span className="text-navy-500">{d.fileName} · {kb(d.sizeBytes)}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-navy-400">{d.uploadedBy === "staff" ? "ทีมงาน" : "ลูกค้า"} · {formatDateTime(d.createdAt)}</span>
                      <a href={`/admin/documents/${d.id}`} target="_blank" rel="noopener" className="font-semibold text-brand-700 hover:underline">เปิด</a>
                      <a href={`/admin/documents/${d.id}?download=1`} className="font-semibold text-brand-700 hover:underline">ดาวน์โหลด</a>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="card p-5">
            <h2 className="font-bold">ประวัติ</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {events.map((e) => (
                <li key={e.id} className="border-l-2 border-navy-100 pl-3">
                  <p className="font-medium">
                    {eventText(e)}
                    {e.visibleToCustomer ? <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">ลูกค้าเห็น</span> : null}
                  </p>
                  {e.note && e.type !== "document_added" && e.type !== "assigned" && <p className="whitespace-pre-wrap text-navy-600">{e.note}</p>}
                  <p className="text-xs text-navy-400">
                    {e.actor === "customer" ? "ลูกค้า" : e.actor} · {formatDateTime(e.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          {moves.length > 0 && (
            <form action={moveApplicationAction} className="card space-y-3 p-5">
              <input type="hidden" name="id" value={app.id} />
              <label htmlFor="to" className="field-label">เปลี่ยนสถานะ</label>
              <select id="to" name="to" className="field-select">
                {moves.map((s) => (
                  <option key={s} value={s}>
                    {status === "payment_submitted" && s === "awaiting_payment" ? "ส่งสลิปกลับ (ให้ชำระใหม่)" : applicationStatusLabel[s]}
                  </option>
                ))}
              </select>
              <label htmlFor="move-message" className="field-label">ข้อความถึงลูกค้า</label>
              <textarea id="move-message" name="message" rows={3} maxLength={2000} className="field-input h-auto py-2" />
              <p className="text-xs text-navy-400">จำเป็นเมื่อขอข้อมูลเพิ่ม ส่งสลิปกลับ ไม่รับประกัน หรือยกเลิก ลูกค้าจะเห็นข้อความนี้</p>
              <button type="submit" className={buttonClass("primary", "sm")}>บันทึกสถานะ</button>
            </form>
          )}
          {policyEditable && (
            <form action={policyDetailsAction} className="card space-y-3 p-5">
              <h2 className="font-bold">ข้อมูลกรมธรรม์</h2>
              <input type="hidden" name="id" value={app.id} />
              <div>
                <label htmlFor="policyNumber" className="field-label">เลขกรมธรรม์</label>
                <input id="policyNumber" name="policyNumber" required maxLength={60} defaultValue={app.policyNumber ?? ""} className="field-input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="policyStart" className="field-label">วันเริ่ม</label>
                  <input id="policyStart" name="policyStart" type="date" required defaultValue={app.policyStart ?? app.coverageStart} className="field-input" />
                </div>
                <div>
                  <label htmlFor="policyEnd" className="field-label">วันสิ้นสุด</label>
                  <input id="policyEnd" name="policyEnd" type="date" required defaultValue={app.policyEnd ?? ""} className="field-input" />
                </div>
              </div>
              <p className="text-xs text-navy-400">ตามที่บริษัทประกันระบุในกรมธรรม์ ต้องบันทึกและอัปโหลดไฟล์กรมธรรม์ก่อนเปลี่ยนเป็น "ออกกรมธรรม์แล้ว"</p>
              <button type="submit" className={buttonClass("secondary", "sm")}>บันทึกข้อมูลกรมธรรม์</button>
            </form>
          )}
          {policyEditable && <StaffUploadForm id={app.id} />}
          {premiumEditable && (
            <form action={finalPremiumAction} className="card space-y-3 p-5">
              <h2 className="font-bold">เบี้ยสุดท้ายจากบริษัทประกัน</h2>
              <input type="hidden" name="id" value={app.id} />
              <div>
                <label htmlFor="premium" className="field-label">เบี้ย (บาท)</label>
                <input id="premium" name="premium" inputMode="numeric" required defaultValue={app.finalPremium ?? app.estimatedPremium} className="field-input" />
              </div>
              <div>
                <label htmlFor="reason" className="field-label">เหตุผล (ลูกค้าเห็น)</label>
                <input id="reason" name="reason" required maxLength={500} defaultValue={app.finalPremiumReason ?? ""} className="field-input" />
              </div>
              <button type="submit" className={buttonClass("secondary", "sm")}>บันทึกเบี้ย</button>
            </form>
          )}
          <form action={applicationMessageAction} className="card space-y-3 p-5">
            <input type="hidden" name="id" value={app.id} />
            <label htmlFor="text" className="field-label">ข้อความ / บันทึก</label>
            <textarea id="text" name="text" rows={3} required maxLength={2000} className="field-input h-auto py-2" />
            <fieldset className="flex flex-wrap gap-4 text-sm">
              <legend className="sr-only">ใครเห็น</legend>
              <label className="flex items-center gap-2">
                <input type="radio" name="visible" value="internal" defaultChecked /> บันทึกภายใน
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="visible" value="customer" /> ส่งถึงลูกค้า
              </label>
            </fieldset>
            <button type="submit" className={buttonClass("secondary", "sm")}>บันทึก</button>
          </form>
          <form action={assignApplicationAction} className="card space-y-3 p-5">
            <input type="hidden" name="id" value={app.id} />
            <label htmlFor="assignee" className="field-label">ผู้รับผิดชอบ</label>
            <select id="assignee" name="assignee" defaultValue={app.assignedTo ?? ""} className="field-select">
              <option value="">— ยังไม่มอบหมาย —</option>
              {assignable.map((u) => (
                <option key={u.id} value={u.id} disabled={!u.active}>
                  {u.name}
                  {!u.active ? " (ปิดใช้งาน)" : ""}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonClass("secondary", "sm")}>บันทึกผู้รับผิดชอบ</button>
          </form>
          <ResetLinkForm id={app.id} />
        </div>
      </div>
    </div>
  );
}
