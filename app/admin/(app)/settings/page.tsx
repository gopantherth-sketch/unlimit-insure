import type { Metadata } from "next";
import { savePaymentSettings, sendTestAlertAction } from "@/app/admin/(app)/applications/actions";
import { alertChannels } from "@/lib/server/notify";
import { Flash } from "@/components/admin/Flash";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/lib/db/client";
import { getPaymentSettings, paymentConfigured, type PaymentSettingKey } from "@/lib/db/settings";
import { requireOwner } from "@/lib/server/admin-auth";

export const metadata: Metadata = { title: "ตั้งค่า" };

const fields: { key: PaymentSettingKey; label: string; hint: string }[] = [
  { key: "payment.accountName", label: "ชื่อบัญชีผู้รับเงิน", hint: "ต้องตรงกับชื่อที่ลูกค้าเห็นในแอปธนาคารตอนโอน" },
  { key: "payment.promptpayId", label: "พร้อมเพย์ (เบอร์มือถือ หรือเลขผู้เสียภาษี 13 หลัก)", hint: "ใช้สร้าง QR พร้อมยอดเงินให้ลูกค้าสแกน" },
  { key: "payment.bankName", label: "ธนาคาร", hint: "ไม่บังคับถ้ามีพร้อมเพย์" },
  { key: "payment.bankAccount", label: "เลขบัญชีธนาคาร", hint: "ไม่บังคับถ้ามีพร้อมเพย์" },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; failed?: string }> }) {
  await requireOwner();
  const [{ ok, error, failed }, s, channels] = await Promise.all([searchParams, getPaymentSettings(await getDb()), alertChannels()]);
  const ready = paymentConfigured(s);
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>
      <Flash ok={ok} error={error} okMessages={{ saved: "บันทึกแล้ว", test_sent: "ส่งข้อความทดสอบแล้ว ตรวจใน LINE / อีเมลของทีม" }}
        errorMessages={{
          promptpay: "พร้อมเพย์ต้องเป็นเบอร์มือถือ 10 หลัก เลข 13 หลัก หรือ e-Wallet 15 หลัก",
          no_channels: "ยังไม่ได้ตั้งค่าช่องทางแจ้งเตือน",
          test_failed: `ส่งไม่สำเร็จ: ${failed ?? ""} ตรวจค่าที่ตั้งไว้ใน Cloudflare`,
        }}
      />
      <form action={savePaymentSettings} className="card space-y-4 p-5">
        <div>
          <h2 className="font-bold">บัญชีรับชำระเบี้ย</h2>
          <p className="mt-1 text-sm text-navy-500">ลูกค้าเห็นข้อมูลนี้ในขั้นชำระเงิน ตรวจให้ถูกต้องก่อนบันทึก และต้องเป็นบัญชีที่รับเบี้ยได้ตามข้อกำหนดของนายหน้า</p>
          <p className={`mt-2 text-sm font-medium ${ready ? "text-success-700" : "text-warning-700"}`}>
            {ready ? "พร้อมรับชำระ" : "ยังไม่ครบ: ต้องมีชื่อบัญชี และพร้อมเพย์หรือธนาคาร+เลขบัญชี ลูกค้าจะเห็นข้อความให้ติดต่อที่ปรึกษาแทน"}
          </p>
        </div>
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="field-label">{f.label}</label>
            <input id={f.key} name={f.key} defaultValue={s[f.key]} maxLength={f.key === "payment.promptpayId" ? 40 : 200} className="field-input" />
            <p className="mt-1 text-xs text-navy-400">{f.hint}</p>
          </div>
        ))}
        <button type="submit" className={buttonClass("primary", "sm")}>บันทึก</button>
      </form>

      <section className="card space-y-4 p-5">
        <div>
          <h2 className="font-bold">แจ้งเตือนทีมงาน</h2>
          <p className="mt-1 text-sm text-navy-500">
            แจ้งเมื่อมีลีดใหม่ ใบสมัครใหม่ ลูกค้าส่งเอกสาร หรือแจ้งชำระเงิน ข้อความมีแค่เลขอ้างอิงและลิงก์เข้าระบบผู้ดูแล ไม่มีชื่อหรือเบอร์โทรลูกค้า
          </p>
        </div>
        <ul className="space-y-2 text-sm">
          {([
            ["LINE Official Account", channels.line, "LINE_CHANNEL_ACCESS_TOKEN, LINE_ALERT_TO"],
            ["อีเมล (Resend)", channels.email, "RESEND_API_KEY, ALERT_EMAIL_FROM, ALERT_EMAIL_TO"],
          ] as const).map(([label, on, keys]) => (
            <li key={label} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas px-4 py-3">
              <span className="font-medium">{label}</span>
              <span className={on ? "font-semibold text-success-700" : "text-navy-500"}>{on ? "เปิดใช้งาน" : `ยังไม่ตั้งค่า (${keys})`}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-navy-400">ค่าเหล่านี้ตั้งเป็น secret ใน Cloudflare (Workers → unlimit-insure → Settings → Variables and Secrets) ไม่ได้เก็บในระบบนี้</p>
        <form action={sendTestAlertAction}>
          <button type="submit" disabled={!channels.line && !channels.email} className={buttonClass("secondary", "sm")}>ส่งข้อความทดสอบ</button>
        </form>
      </section>
    </div>
  );
}
