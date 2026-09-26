import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Circle, CircleSlash, ClipboardList, Download, Hourglass, ShieldCheck, FileText, LifeBuoy, LockKeyhole, MessageSquare, Phone, TriangleAlert } from "lucide-react";
import { confirmPhone, notifyPayment, sendForReview } from "@/app/(site)/track/actions";
import { CopyLink } from "@/components/track/CopyLink";
import { Timeline } from "@/components/track/Timeline";
import { UploadForm } from "@/components/track/UploadForm";
import { buttonClass } from "@/components/ui/button";
import { purchaseCopy as c } from "@/content/purchase";
import { requiredCustomerDocuments, type ApplicationStatus } from "@/lib/applications/status";
import { REFERENCE_RE } from "@/lib/applications/tokens";
import { amountDue, getApplicationByReference, getApplicationDetail, missingRequiredDocuments, verifyApplicationToken } from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { getPaymentSettings, paymentConfigured } from "@/lib/db/settings";
import { formatBaht, formatDate } from "@/lib/format";
import { promptPayPayload } from "@/lib/payment/promptpay";
import { qrSvg } from "@/lib/payment/qr";
import { customerApplication } from "@/lib/server/track-auth";
import { publicOrigin } from "@/lib/server/origin";
import { cx } from "@/lib/cx";

export const metadata: Metadata = { title: "ติดตามใบสมัคร", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

type Search = { t?: string; new?: string; ok?: string; error?: string };

const errorText: Record<string, string> = {
  phone: "เบอร์โทร 4 ตัวท้ายไม่ตรงกับที่ใช้สมัคร",
  throttled: "ลองหลายครั้งเกินไป กรุณารอ 10 นาทีแล้วลองใหม่",
  missing_documents: "ยังขาดเอกสารที่จำเป็น",
  missing_payment_slip: "อัปโหลดสลิปการโอนก่อนแจ้งชำระเงิน",
  not_allowed: "ทำรายการนี้ในขั้นตอนนี้ไม่ได้",
};

const customerTurn: ApplicationStatus[] = ["documents_pending", "needs_info", "awaiting_payment"];
const statusTone = {
  turn: { Icon: ClipboardList, card: "", bar: "bg-brand-600", icon: "bg-brand-50 text-brand-600", badge: "bg-brand-600 text-white" },
  waiting: { Icon: Hourglass, card: "", bar: "bg-navy-300", icon: "bg-navy-50 text-navy-600", badge: "bg-navy-100 text-navy-700" },
  done: { Icon: ShieldCheck, card: "", bar: "bg-success-600", icon: "bg-success-50 text-success-700", badge: "" },
  stopped: { Icon: CircleSlash, card: "", bar: "bg-danger-600", icon: "bg-danger-50 text-danger-600", badge: "" },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-canvas pb-16">
      <div className="container-page max-w-4xl py-8 sm:py-12">{children}</div>
    </div>
  );
}

function NoAccess({ reference, invalidLink }: { reference: string; invalidLink: boolean }) {
  return (
    <Shell>
      <div className="card mx-auto max-w-lg p-7 text-center">
        <LockKeyhole aria-hidden className="mx-auto h-10 w-10 text-brand-600" />
        <h1 className="mt-4 text-2xl font-bold">{invalidLink ? "ลิงก์นี้ใช้ไม่ได้" : "เปิดด้วยลิงก์ส่วนตัวของคุณ"}</h1>
        <p className="mt-2 text-navy-600">
          {invalidLink ? "ลิงก์อาจหมดอายุหรือถูกเปลี่ยนแล้ว " : ""}
          {c.tracking.lostLink}
        </p>
        <p className="mt-1 font-mono text-sm text-navy-400">{REFERENCE_RE.test(reference) ? reference : ""}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/garage" className={buttonClass("primary", "md")}>ค้นหาใบสมัคร</Link>
          <Link href="/advisor" className={buttonClass("secondary", "md")}>ติดต่อที่ปรึกษา</Link>
        </div>
      </div>
    </Shell>
  );
}

export default async function TrackPage({ params, searchParams }: { params: Promise<{ reference: string }>; searchParams: Promise<Search> }) {
  const [{ reference: rawRef }, sp] = await Promise.all([params, searchParams]);
  const reference = rawRef.toUpperCase();
  const db = await getDb();
  const granted = await customerApplication(reference);

  if (!granted) {
    // Private link without access yet → phone check.
    const app = REFERENCE_RE.test(reference) ? await getApplicationByReference(db, reference) : null;
    const linkOk = !!(app && sp.t && (await verifyApplicationToken(app, sp.t)));
    if (!linkOk) return <NoAccess reference={reference} invalidLink={!!sp.t || sp.error === "link"} />;
    return (
      <Shell>
        <form action={confirmPhone} className="card mx-auto max-w-md space-y-4 p-7">
          <LockKeyhole aria-hidden className="h-8 w-8 text-brand-600" />
          <h1 className="text-2xl font-bold">{c.tracking.phoneCheckTitle}</h1>
          <p className="text-navy-600">{c.tracking.phoneCheckBody}</p>
          <input type="hidden" name="reference" value={reference} />
          <input type="hidden" name="token" value={sp.t} />
          <div>
            <label htmlFor="last4" className="field-label">เบอร์โทร 4 ตัวท้าย</label>
            <input id="last4" name="last4" inputMode="numeric" pattern="\d{4}" maxLength={4} autoComplete="off" required className="field-input tabular w-40 text-center text-xl tracking-[0.4em]" />
          </div>
          {sp.error && errorText[sp.error] && (
            <p role="alert" className="text-sm font-medium text-danger-600">{errorText[sp.error]}</p>
          )}
          <button type="submit" className={buttonClass("primary", "md", "w-full")}>ดูใบสมัคร</button>
        </form>
      </Shell>
    );
  }

  const detail = (await getApplicationDetail(db, granted.id))!;
  const { app, snapshot, documents, events } = detail;
  const src = snapshot.source as Record<string, unknown>;
  const productName = String(src.productName ?? "");
  const insurerName = String(src.insurerName ?? "");
  const claimsHotline = typeof src.claimsHotline === "string" ? src.claimsHotline : null;
  const vehicleText = String(src.vehicleLabel ?? "");
  const status = app.status as ApplicationStatus;
  const st = c.statusText[status];
  const missing = missingRequiredDocuments(documents);
  const customerDocs = documents.filter((d) => d.kind !== "policy");
  const policyDoc = documents.find((d) => d.kind === "policy");
  const messages = events.filter((e) => e.visibleToCustomer && e.note && (e.type === "message" || e.type === "status_changed"));
  const pay = status === "awaiting_payment" || status === "payment_submitted" ? await getPaymentSettings(db) : null;
  const due = amountDue(app);
  const qr = pay && pay["payment.promptpayId"] ? promptPayPayload(pay["payment.promptpayId"], due) : null;
  const privateUrl = sp.new && sp.t ? `${await publicOrigin()}/track/${app.reference}?t=${encodeURIComponent(sp.t)}` : null;
  const daysLeft = app.policyEnd ? Math.ceil((new Date(`${app.policyEnd}T00:00:00+07:00`).getTime() - Date.now()) / 86_400_000) : null;
  const priceChanged = app.finalPremium !== null && app.finalPremium !== app.estimatedPremium;
  const kind = customerTurn.includes(status) ? "turn" : status === "policy_issued" ? "done" : status === "rejected" || status === "cancelled" ? "stopped" : "waiting";
  const tone = statusTone[kind];
  const StatusIcon = tone.Icon;
  const badge = kind === "turn" ? c.tracking.yourTurn : kind === "waiting" ? c.tracking.waiting : null;

  return (
    <Shell>
      {privateUrl && (
        <section aria-labelledby="link-title" className="card mb-6 border-brand-200 p-5 sm:p-7">
          <h2 id="link-title" className="flex items-center gap-2 text-xl font-bold text-success-700">
            <CheckCircle2 aria-hidden className="h-6 w-6" />
            {c.linkCreated.title}
          </h2>
          <p className="mt-2 text-navy-600">{c.linkCreated.body}</p>
          <div className="mt-4">
            <CopyLink url={privateUrl} />
          </div>
          <p className="mt-2 text-xs text-navy-400">{c.linkCreated.saveHint}</p>
        </section>
      )}

      <section aria-labelledby="status-title" className={cx("card relative overflow-hidden p-5 sm:p-7", tone.card)}>
        <span aria-hidden className={cx("absolute inset-y-0 left-0 w-1.5", tone.bar)} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow">{c.tracking.title}</p>
          <span className="font-mono text-xs text-navy-500">{app.reference}</span>
        </div>
        <div className="mt-3 flex items-start gap-3 sm:gap-4">
          <span aria-hidden className={cx("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", tone.icon)}>
            <StatusIcon className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h1 id="status-title" className="text-2xl font-bold leading-tight sm:text-3xl">{st.title}</h1>
            {badge && <p className={cx("mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold", tone.badge)}>{badge}</p>}
            <p className="mt-2 max-w-2xl text-navy-600">{st.body}</p>
          </div>
        </div>
      </section>
      {sp.error && errorText[sp.error] && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger-600">{errorText[sp.error]}</p>
      )}

      {!["rejected", "cancelled"].includes(status) && (
        <div className="mt-6">
          <Timeline status={status} />
        </div>
      )}

      {messages.length > 0 && (
        <section aria-labelledby="msg-title" className="card mt-6 p-5">
          <h2 id="msg-title" className="flex items-center gap-2 font-bold">
            <MessageSquare aria-hidden className="h-5 w-5 text-brand-600" /> ข้อความจากทีม Unlimit
          </h2>
          <ul className="mt-3 space-y-3">
            {messages.slice(0, 5).map((m) => (
              <li key={m.id} className="rounded-xl bg-canvas p-3 text-sm">
                <p className="whitespace-pre-wrap text-navy-800">{m.note}</p>
                <p className="mt-1 text-xs text-navy-400">{formatDate(m.createdAt.slice(0, 10))}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {status === "policy_issued" && (
        <section aria-labelledby="policy-title" className="card mt-6 border-success-600/30 p-5 sm:p-7">
          <h2 id="policy-title" className="text-xl font-bold text-success-700">{c.policyIssued.title}</h2>
          <p className="mt-1 text-navy-600">{c.policyIssued.body}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-canvas p-3">
              <dt className="text-xs text-navy-500">เลขกรมธรรม์</dt>
              <dd className="mt-1 font-mono font-semibold">{app.policyNumber}</dd>
            </div>
            <div className="rounded-xl bg-canvas p-3">
              <dt className="text-xs text-navy-500">คุ้มครอง</dt>
              <dd className="mt-1 font-semibold">
                {app.policyStart && formatDate(app.policyStart)} – {app.policyEnd && formatDate(app.policyEnd)}
              </dd>
            </div>
            <div className="rounded-xl bg-canvas p-3">
              <dt className="text-xs text-navy-500">ต่ออายุในอีก</dt>
              <dd className="tabular mt-1 font-semibold">{daysLeft !== null ? `${Math.max(0, daysLeft)} วัน` : "—"}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            {policyDoc && (
              <a href={`/track/${app.reference}/documents/${policyDoc.id}`} className={buttonClass("primary", "md")}>
                <Download aria-hidden className="h-4 w-4" /> ดาวน์โหลดกรมธรรม์
              </a>
            )}
            <Link href="/claims" className={buttonClass("secondary", "md")}>
              <LifeBuoy aria-hidden className="h-4 w-4" /> ขั้นตอนเมื่อเกิดเหตุ
            </Link>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-navy-600">
            <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span>
              {c.policyIssued.claimsHint} {insurerName}: <span className="font-semibold">{claimsHotline ?? "[รอข้อมูล]"}</span>
            </span>
          </p>
          <p className="mt-2 text-sm text-navy-500">{c.policyIssued.renewalHint}</p>
        </section>
      )}

      {(status === "awaiting_payment" || status === "payment_submitted") && (
        <section aria-labelledby="pay-title" className="card mt-6 p-5 sm:p-7">
          <h2 id="pay-title" className="text-xl font-bold">{c.payment.title}</h2>
          <p className="mt-1 text-navy-600">{c.payment.intro}</p>
          {priceChanged && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-warning-50 p-4 text-sm text-warning-700">
              <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              {c.payment.priceChanged
                .replace("{old}", formatBaht(app.estimatedPremium))
                .replace("{new}", formatBaht(app.finalPremium!))
                .replace("{reason}", app.finalPremiumReason ?? "")}
            </p>
          )}
          <p className="tabular mt-4 text-3xl font-bold">{formatBaht(due)}</p>
          {pay && paymentConfigured(pay) ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
              {qr && (
                <div className="rounded-2xl border border-navy-100 bg-white p-3 text-center">
                  {/* eslint-disable-next-line react/no-danger */}
                  <div aria-label={`QR พร้อมเพย์ ยอด ${formatBaht(due)}`} role="img" dangerouslySetInnerHTML={{ __html: qrSvg(qr, 200) }} />
                  <p className="mt-1 text-xs text-navy-500">สแกนด้วยแอปธนาคาร</p>
                </div>
              )}
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-navy-500">ชื่อบัญชี</dt>
                  <dd className="font-semibold">{pay["payment.accountName"]}</dd>
                </div>
                {pay["payment.promptpayId"] && (
                  <div>
                    <dt className="text-navy-500">พร้อมเพย์</dt>
                    <dd className="font-mono font-semibold">{pay["payment.promptpayId"]}</dd>
                  </div>
                )}
                {pay["payment.bankName"] && pay["payment.bankAccount"] && (
                  <div>
                    <dt className="text-navy-500">โอนผ่านบัญชีธนาคาร</dt>
                    <dd className="font-semibold">
                      {pay["payment.bankName"]} <span className="font-mono">{pay["payment.bankAccount"]}</span>
                    </dd>
                  </div>
                )}
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-navy-600">
                  {c.payment.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </dl>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-navy-50 p-4 text-sm text-navy-600">ทีมงานจะแจ้งช่องทางชำระเงินให้คุณ</p>
          )}
          {status === "awaiting_payment" && (
            <div className="mt-6 space-y-3">
              <UploadForm reference={app.reference} kinds={["payment_slip"]} fixedKind="payment_slip" />
              <form action={notifyPayment}>
                <input type="hidden" name="reference" value={app.reference} />
                <button type="submit" disabled={!documents.some((d) => d.kind === "payment_slip")} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
                  แจ้งชำระเงินแล้ว
                </button>
              </form>
            </div>
          )}
          {status === "payment_submitted" && <p className="mt-4 text-sm text-navy-600">{c.payment.afterUpload}</p>}
        </section>
      )}

      {["documents_pending", "needs_info", "submitted"].includes(status) && (
        <section aria-labelledby="docs-title" className="card mt-6 p-5 sm:p-7">
          <h2 id="docs-title" className="text-xl font-bold">เอกสาร</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {requiredCustomerDocuments.map((k) => {
              const has = !missing.includes(k);
              return (
                <li key={k} className={cx("flex items-start gap-2 rounded-xl p-3 text-sm", has ? "bg-success-50" : "bg-canvas")}>
                  {has ? <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success-600" /> : <Circle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />}
                  <span>
                    <span className="font-semibold">{c.documents[k].label}</span>
                    <span className="sr-only">{has ? " (อัปโหลดแล้ว)" : " (ยังไม่มี)"}</span>
                    <span className="block text-xs text-navy-500">{c.documents[k].hint}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4">
            <UploadForm reference={app.reference} kinds={["registration", "driving_license", "id_card", "vehicle_photo", "other"]} />
          </div>
          {status !== "submitted" && (
            <form action={sendForReview} className="mt-5">
              <input type="hidden" name="reference" value={app.reference} />
              <button type="submit" disabled={missing.length > 0} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
                ส่งใบสมัครให้ตรวจ
              </button>
              {missing.length > 0 && <p className="mt-2 text-sm text-navy-500">ยังขาด: {missing.map((k) => c.documents[k].label).join(", ")}</p>}
            </form>
          )}
        </section>
      )}

      {customerDocs.length > 0 && (
        <section aria-labelledby="uploaded-title" className="card mt-6 p-5">
          <h2 id="uploaded-title" className="font-bold">ไฟล์ที่อัปโหลดแล้ว</h2>
          <ul className="mt-3 divide-y divide-navy-100 text-sm">
            {customerDocs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="flex items-center gap-2">
                  <FileText aria-hidden className="h-4 w-4 text-navy-400" />
                  <span className="font-medium">{c.documents[d.kind].label}</span>
                  <span className="text-navy-400">{d.fileName}</span>
                </span>
                <a href={`/track/${app.reference}/documents/${d.id}`} className="font-semibold text-brand-600">ดาวน์โหลด</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="plan-title" className="card mt-6 p-5">
        <h2 id="plan-title" className="font-bold">แผนที่สมัคร</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-navy-500">แผน</dt>
          <dd className="font-semibold">
            {productName} · {insurerName}
          </dd>
          <dt className="text-navy-500">รถ</dt>
          <dd>
            {vehicleText} · {app.plateNumber} {app.province}
          </dd>
          <dt className="text-navy-500">เริ่มคุ้มครองที่ขอ</dt>
          <dd>{formatDate(app.coverageStart)}</dd>
          <dt className="text-navy-500">เบี้ยประกัน</dt>
          <dd className="tabular">
            {formatBaht(due)}
            {priceChanged && <span className="ml-2 text-xs text-navy-400 line-through">{formatBaht(app.estimatedPremium)}</span>}
          </dd>
        </dl>
        <p className="mt-3 text-xs text-navy-400">{c.priceNote}</p>
      </section>

      <p className="mt-8 text-center text-sm text-navy-500">
        {c.tracking.lostLink}{" "}
        <Link href="/advisor" className="font-semibold text-brand-600">ติดต่อที่ปรึกษา</Link>
      </p>
    </Shell>
  );
}
