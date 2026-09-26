// Staff alerts: tell the team something needs them. Pure core (no env, no request) so it is unit-testable.
// Privacy: alerts carry only the reference and an admin link — never names, phones or documents.
// Staff open the admin (login required) to see details.

export type AlertKind = "lead" | "application" | "documents" | "payment" | "test";

export interface StaffAlert {
  kind: AlertKind;
  reference: string;
  /** Admin path, e.g. /admin/leads/<id>. */
  path: string;
}

export interface AlertConfig {
  line?: { token: string; to: string[] };
  email?: { apiKey: string; from: string; to: string[] };
}

export type ChannelResult = { channel: "line" | "email"; ok: boolean; status?: number };

const titles: Record<AlertKind, string> = {
  lead: "ลีดใหม่ขอให้ที่ปรึกษาติดต่อกลับ",
  application: "ใบสมัครใหม่ (รอลูกค้าส่งเอกสาร)",
  documents: "ลูกค้าส่งเอกสารแล้ว รอตรวจ",
  payment: "ลูกค้าแจ้งชำระเงินแล้ว รอยืนยันยอด",
  test: "ข้อความทดสอบจากระบบ Unlimit Insure",
};

export function alertText(alert: StaffAlert, origin: string): { subject: string; body: string } {
  const subject = `[Unlimit] ${titles[alert.kind]} · ${alert.reference}`;
  const body = `${titles[alert.kind]}\nเลขอ้างอิง: ${alert.reference}\nเปิดในระบบผู้ดูแล: ${origin.replace(/\/$/, "")}${alert.path}`;
  return { subject, body };
}

const list = (v: string | undefined) =>
  (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Reads channel settings from env vars. A channel is on only when all its values are present. */
export function alertConfigFromEnv(env: Record<string, string | undefined>): AlertConfig {
  const cfg: AlertConfig = {};
  const lineTo = list(env.LINE_ALERT_TO);
  if (env.LINE_CHANNEL_ACCESS_TOKEN && lineTo.length) cfg.line = { token: env.LINE_CHANNEL_ACCESS_TOKEN, to: lineTo.slice(0, 20) };
  const mailTo = list(env.ALERT_EMAIL_TO);
  if (env.RESEND_API_KEY && env.ALERT_EMAIL_FROM && mailTo.length) cfg.email = { apiKey: env.RESEND_API_KEY, from: env.ALERT_EMAIL_FROM, to: mailTo.slice(0, 20) };
  return cfg;
}

type Fetch = (input: string, init: RequestInit) => Promise<Response>;

/** Sends to every configured channel. Never throws; returns one result per channel attempted. */
export async function sendAlert(cfg: AlertConfig, alert: StaffAlert, origin: string, fetchFn: Fetch = fetch): Promise<ChannelResult[]> {
  const { subject, body } = alertText(alert, origin);
  const jobs: Promise<ChannelResult>[] = [];
  const attempt = async (channel: ChannelResult["channel"], run: () => Promise<Response>): Promise<ChannelResult> => {
    try {
      const r = await run();
      return { channel, ok: r.ok, status: r.status };
    } catch {
      return { channel, ok: false };
    }
  };
  if (cfg.line) {
    const { token, to } = cfg.line;
    // LINE Messaging API: push to one id, multicast to several user ids. Group ids need push, so push each.
    jobs.push(
      attempt("line", async () => {
        let last: Response | null = null;
        for (const id of to) {
          last = await fetchFn("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ to: id, messages: [{ type: "text", text: body }] }),
          });
          if (!last.ok) return last;
        }
        return last!;
      }),
    );
  }
  if (cfg.email) {
    const { apiKey, from, to } = cfg.email;
    jobs.push(
      attempt("email", () =>
        fetchFn("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ from, to, subject, text: body }),
        }),
      ),
    );
  }
  return Promise.all(jobs);
}
