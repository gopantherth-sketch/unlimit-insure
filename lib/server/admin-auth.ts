import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Single shared admin account for V1 (ADMIN_USERNAME / ADMIN_PASSWORD secrets).
// Session = expiry + HMAC(expiry.username) keyed by the password: rotating the password signs everyone out.

const COOKIE = "ui_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;

interface AdminConfig {
  username: string;
  password: string;
}

async function config(): Promise<AdminConfig | null> {
  let env: Partial<CloudflareEnv> = {};
  try {
    env = (await getCloudflareContext({ async: true })).env;
  } catch {
    // Outside the Worker (e.g. plain `next start`): fall back to process env.
  }
  const username = env.ADMIN_USERNAME ?? process.env.ADMIN_USERNAME;
  const password = env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;
  if (!username || !password || password.length < 12) return null;
  return { username, password };
}

const enc = new TextEncoder();

async function hmac(key: string, data: string): Promise<string> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison over SHA-256 digests. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const x = new Uint8Array(da);
  const y = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i]! ^ y[i]!;
  return diff === 0;
}

export async function adminConfigured(): Promise<boolean> {
  return (await config()) !== null;
}

export type LoginResult = "ok" | "invalid" | "not_configured";

export async function login(username: string, password: string): Promise<LoginResult> {
  const cfg = await config();
  if (!cfg) return "not_configured";
  const [u, p] = await Promise.all([safeEqual(username, cfg.username), safeEqual(password, cfg.password)]);
  if (!u || !p) return "invalid";
  const expires = Date.now() + SESSION_MS;
  const sig = await hmac(cfg.password, `${expires}.${cfg.username}`);
  (await cookies()).set(COOKIE, `${expires}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_MS / 1000,
  });
  return "ok";
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

/** Returns the admin username, or null when there is no valid session. */
export async function currentAdmin(): Promise<string | null> {
  const cfg = await config();
  if (!cfg) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [expStr, sig] = raw.split(".");
  const expires = Number(expStr);
  if (!sig || !Number.isFinite(expires) || expires < Date.now()) return null;
  const expected = await hmac(cfg.password, `${expires}.${cfg.username}`);
  return (await safeEqual(sig, expected)) ? cfg.username : null;
}

/** Guard for admin pages and server actions. */
export async function requireAdmin(): Promise<string> {
  const who = await currentAdmin();
  if (!who) redirect("/admin/login");
  return who;
}
