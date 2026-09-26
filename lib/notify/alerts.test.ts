import { describe, expect, it } from "vitest";
import { alertConfigFromEnv, alertText, sendAlert } from "./alerts";

const alert = { kind: "payment" as const, reference: "APP-ABCDEFGHJK", path: "/admin/applications/x" };

describe("staff alerts", () => {
  it("builds text with reference and admin link only", () => {
    const t = alertText(alert, "https://example.com/");
    expect(t.subject).toContain("APP-ABCDEFGHJK");
    expect(t.body).toContain("https://example.com/admin/applications/x");
  });

  it("enables a channel only when all its settings exist", () => {
    expect(alertConfigFromEnv({})).toEqual({});
    expect(alertConfigFromEnv({ LINE_CHANNEL_ACCESS_TOKEN: "t" })).toEqual({});
    expect(alertConfigFromEnv({ RESEND_API_KEY: "k", ALERT_EMAIL_TO: "a@x.co" })).toEqual({});
    const cfg = alertConfigFromEnv({ LINE_CHANNEL_ACCESS_TOKEN: "t", LINE_ALERT_TO: "U1, C2 ,", RESEND_API_KEY: "k", ALERT_EMAIL_FROM: "f@x.co", ALERT_EMAIL_TO: "a@x.co,b@x.co" });
    expect(cfg.line?.to).toEqual(["U1", "C2"]);
    expect(cfg.email?.to).toEqual(["a@x.co", "b@x.co"]);
  });

  it("posts to each channel and never throws", async () => {
    const calls: { url: string; body: unknown; auth: string | null }[] = [];
    const fake = async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)), auth: new Headers(init.headers).get("Authorization") });
      return new Response("{}", { status: url.includes("resend") ? 500 : 200 });
    };
    const cfg = alertConfigFromEnv({ LINE_CHANNEL_ACCESS_TOKEN: "t", LINE_ALERT_TO: "U1,C2", RESEND_API_KEY: "k", ALERT_EMAIL_FROM: "f@x.co", ALERT_EMAIL_TO: "a@x.co" });
    const results = await sendAlert(cfg, alert, "https://example.com", fake);
    expect(results).toEqual([
      { channel: "line", ok: true, status: 200 },
      { channel: "email", ok: false, status: 500 },
    ]);
    expect(calls.filter((c) => c.url.includes("line.me")).map((c) => (c.body as { to: string }).to)).toEqual(["U1", "C2"]);
    expect(calls.every((c) => c.auth?.startsWith("Bearer "))).toBe(true);
    const thrown = await sendAlert(cfg, alert, "https://example.com", async () => {
      throw new Error("offline");
    });
    expect(thrown.every((r) => !r.ok)).toBe(true);
  });
});
