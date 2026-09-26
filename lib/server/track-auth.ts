import { cookies, headers } from "next/headers";
import { REFERENCE_RE } from "@/lib/applications/tokens";
import { getApplicationByReference, type ApplicationRow } from "@/lib/db/applications";
import { getDb } from "@/lib/db/client";
import { signingSecret } from "@/lib/server/admin-auth";

// Customer access to one application. After the private link + phone check (or reference + full phone
// lookup), the browser gets an httpOnly cookie: <expiry>.<hmac(secret, appId.expiry.tokenHash)>.
// Binding to the current token hash means "reset link" in admin locks out every existing browser.

const cookieName = (reference: string) => `ui_app_${reference.replace(/[^A-Z0-9]/g, "")}`;
const MAX_AGE_S = 180 * 24 * 3600;
const enc = new TextEncoder();

async function hmacHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(data))), (b) => b.toString(16).padStart(2, "0")).join("");
}

function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Grant this browser access to the application. Returns false if no signing secret is configured. */
export async function grantAccess(app: Pick<ApplicationRow, "id" | "reference" | "tokenHash">): Promise<boolean> {
  const secret = await signingSecret();
  if (!secret) return false;
  const exp = Date.now() + MAX_AGE_S * 1000;
  const sig = await hmacHex(secret, `${app.id}.${exp}.${app.tokenHash}`);
  (await cookies()).set(cookieName(app.reference), `${exp}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
  return true;
}

/** The application if this browser has been granted access to it, else null. */
export async function customerApplication(reference: string): Promise<ApplicationRow | null> {
  if (!REFERENCE_RE.test(reference)) return null;
  const raw = (await cookies()).get(cookieName(reference))?.value;
  const secret = await signingSecret();
  if (!raw || !secret) return null;
  const [expStr, sig] = raw.split(".");
  const exp = Number(expStr);
  if (!sig || !Number.isFinite(exp) || exp < Date.now()) return null;
  const app = await getApplicationByReference(await getDb(), reference);
  if (!app) return null;
  return equal(sig, await hmacHex(secret, `${app.id}.${exp}.${app.tokenHash}`)) ? app : null;
}

// Best-effort per-isolate throttle for phone checks and lookups (hashed keys, memory only).
const hits = new Map<string, number[]>();
export async function throttled(scope: string, limit = 8, windowMs = 10 * 60 * 1000): Promise<boolean> {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${scope}:${ip}`));
  const key = Array.from(new Uint8Array(d).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}
