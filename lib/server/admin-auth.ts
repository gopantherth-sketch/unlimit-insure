import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeEqualString } from "@/lib/admin/password";
import { decodeSession, encodeSession, type SessionClaims } from "@/lib/admin/session";
import { normalizeUsername } from "@/lib/admin/validate";
import { authenticateAdminUser, getAdminUser, type GuardContext } from "@/lib/db/admin-users";
import { getDb } from "@/lib/db/client";
import type { AdminRole } from "@/lib/db/schema";
import type { Actor } from "@/lib/db/leads";

// Two ways in:
//  1. Break-glass owner: ADMIN_USERNAME / ADMIN_PASSWORD secrets. Always an owner, not stored in D1,
//     so the team can never be locked out. Rotating ADMIN_PASSWORD ends its sessions.
//  2. admin_users rows (owner / staff). Every request re-checks active + session_version.
// Sessions are signed with SESSION_SECRET if set, else ADMIN_PASSWORD.

const COOKIE = "ui_admin";
const SESSION_MS = 12 * 60 * 60 * 1000;

export interface AdminPrincipal {
  kind: "env" | "db";
  /** admin_users.id; null for the break-glass owner. */
  userId: string | null;
  username: string;
  name: string;
  role: AdminRole;
  mustChangePassword: boolean;
}

interface AuthConfig {
  envUsername: string | null;
  envPassword: string | null;
  secret: string | null;
}

async function config(): Promise<AuthConfig> {
  let env: Partial<CloudflareEnv> & { SESSION_SECRET?: string } = {};
  try {
    env = (await getCloudflareContext({ async: true })).env;
  } catch {
    // Outside the Worker: fall back to process env.
  }
  const username = env.ADMIN_USERNAME ?? process.env.ADMIN_USERNAME ?? null;
  const password = env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? null;
  const envOk = !!username && !!password && password.length >= 12;
  const sessionSecret = env.SESSION_SECRET ?? process.env.SESSION_SECRET ?? null;
  const secret = sessionSecret && sessionSecret.length >= 32 ? sessionSecret : envOk ? password : null;
  return { envUsername: envOk ? username : null, envPassword: envOk ? password : null, secret };
}

export async function guardContext(actor: AdminPrincipal): Promise<GuardContext> {
  const cfg = await config();
  return { actorId: actor.userId, envOwnerConfigured: cfg.envUsername !== null, reservedUsername: cfg.envUsername ?? undefined };
}

export function actorOf(p: AdminPrincipal): Actor {
  return { name: p.name, userId: p.userId };
}

/** Whether any login is possible (a signing secret exists). */
export async function adminConfigured(): Promise<boolean> {
  return (await config()).secret !== null;
}

// Best-effort per-isolate login throttle (keys hashed, memory only).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, number[]>();

async function throttleKey(username: string): Promise<string> {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`login:${ip}:${normalizeUsername(username)}`));
  return Array.from(new Uint8Array(d).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

function throttled(key: string, record: boolean): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (record) recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > MAX_ATTEMPTS;
}

async function setSession(claims: Omit<SessionClaims, "exp">, secret: string) {
  const token = await encodeSession({ ...claims, exp: Date.now() + SESSION_MS }, secret);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_MS / 1000,
  });
}

export type LoginResult = "ok" | "must_change" | "invalid" | "not_configured" | "throttled";

export async function login(username: string, password: string): Promise<LoginResult> {
  const cfg = await config();
  if (!cfg.secret) return "not_configured";
  const key = await throttleKey(username);
  if (throttled(key, false)) return "throttled";

  if (cfg.envUsername && cfg.envPassword) {
    const [u, p] = await Promise.all([
      safeEqualString(normalizeUsername(username), normalizeUsername(cfg.envUsername)),
      safeEqualString(password, cfg.envPassword),
    ]);
    if (u && p) {
      await setSession({ kind: "env", sub: cfg.envUsername, ver: 1 }, cfg.secret);
      return "ok";
    }
  }

  const user = await authenticateAdminUser(await getDb(), username, password);
  if (!user) {
    throttled(key, true);
    return "invalid";
  }
  await setSession({ kind: "db", sub: user.id, ver: user.sessionVersion }, cfg.secret);
  return user.mustChangePassword ? "must_change" : "ok";
}

/** Re-issue the current user's cookie after their session version changed (own password change). */
export async function refreshSession(userId: string, sessionVersion: number): Promise<void> {
  const cfg = await config();
  if (cfg.secret) await setSession({ kind: "db", sub: userId, ver: sessionVersion }, cfg.secret);
}

export async function logout(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function currentAdmin(): Promise<AdminPrincipal | null> {
  const cfg = await config();
  if (!cfg.secret) return null;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const claims = await decodeSession(raw, cfg.secret);
  if (!claims) return null;

  if (claims.kind === "env") {
    if (!cfg.envUsername || claims.sub !== cfg.envUsername) return null;
    return { kind: "env", userId: null, username: cfg.envUsername, name: `${cfg.envUsername} (บัญชีหลัก)`, role: "owner", mustChangePassword: false };
  }
  const u = await getAdminUser(await getDb(), claims.sub);
  if (!u || !u.active || u.sessionVersion !== claims.ver) return null;
  return { kind: "db", userId: u.id, username: u.username, name: u.name, role: u.role, mustChangePassword: u.mustChangePassword };
}

/** Guard for admin pages and actions. Users with a temporary password are sent to change it first. */
export async function requireAdmin(opts: { allowPasswordChange?: boolean } = {}): Promise<AdminPrincipal> {
  const who = await currentAdmin();
  if (!who) redirect("/admin/login");
  if (who.mustChangePassword && !opts.allowPasswordChange) redirect("/admin/account?required=1");
  return who;
}

export async function requireOwner(): Promise<AdminPrincipal> {
  const who = await requireAdmin();
  if (who.role !== "owner") redirect("/admin?denied=owner");
  return who;
}
