import { and, asc, eq, sql } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import { nameError, normalizeUsername, passwordError, usernameError } from "@/lib/admin/validate";
import type { Database } from "@/lib/db/client";
import { adminUsers, type AdminRole } from "@/lib/db/schema";

export type AdminUserRow = typeof adminUsers.$inferSelect;
/** Safe to send to pages: no password hash. */
export type AdminUserPublic = Omit<AdminUserRow, "passwordHash">;

const strip = ({ passwordHash: _h, ...u }: AdminUserRow): AdminUserPublic => u;
const nowIso = () => new Date().toISOString();

export type UserError =
  | "invalid_name"
  | "invalid_username"
  | "reserved_username"
  | "username_taken"
  | "invalid_password"
  | "not_found"
  | "self_action"
  | "last_owner";

export type Result<T = void> = { ok: true; value: T } | { ok: false; error: UserError; message?: string };

export interface GuardContext {
  /** admin_users.id of the actor, or null for the break-glass env owner. */
  actorId: string | null;
  /** Whether the ADMIN_USERNAME/ADMIN_PASSWORD owner login is configured (it can't be locked out). */
  envOwnerConfigured: boolean;
  /** The env owner's username, reserved in the table. */
  reservedUsername?: string;
}

export async function listAdminUsers(db: Database): Promise<AdminUserPublic[]> {
  const rows = await db.select().from(adminUsers).orderBy(asc(adminUsers.name));
  return rows.map(strip);
}

export async function listAssignableUsers(db: Database): Promise<Pick<AdminUserRow, "id" | "name" | "role">[]> {
  return db
    .select({ id: adminUsers.id, name: adminUsers.name, role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.active, true))
    .orderBy(asc(adminUsers.name));
}

export async function getAdminUser(db: Database, id: string): Promise<AdminUserRow | null> {
  const [u] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return u ?? null;
}

async function activeOwnerCount(db: Database): Promise<number> {
  const [r] = await db
    .select({ n: sql<number>`count(*)` })
    .from(adminUsers)
    .where(and(eq(adminUsers.role, "owner"), eq(adminUsers.active, true)));
  return Number(r?.n ?? 0);
}

export interface NewAdminUser {
  name: string;
  username: string;
  password: string;
  role: AdminRole;
  mustChangePassword: boolean;
  createdBy: string;
}

export async function createAdminUser(db: Database, input: NewAdminUser, ctx: GuardContext): Promise<Result<AdminUserPublic>> {
  if (nameError(input.name)) return { ok: false, error: "invalid_name" };
  const uErr = usernameError(input.username, ctx.reservedUsername);
  if (uErr) return { ok: false, error: uErr.includes("สงวน") ? "reserved_username" : "invalid_username", message: uErr };
  if (passwordError(input.password)) return { ok: false, error: "invalid_password", message: passwordError(input.password)! };
  const username = normalizeUsername(input.username);
  const [existing] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  if (existing) return { ok: false, error: "username_taken" };
  const row = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    username,
    passwordHash: await hashPassword(input.password),
    role: input.role,
    mustChangePassword: input.mustChangePassword,
    createdBy: input.createdBy,
  };
  await db.insert(adminUsers).values(row);
  const created = await getAdminUser(db, row.id);
  return created ? { ok: true, value: strip(created) } : { ok: false, error: "not_found" };
}

/** Name and role. Demoting yourself, or the last active owner when there is no env owner, is refused. */
export async function updateAdminUser(db: Database, id: string, patch: { name: string; role: AdminRole }, ctx: GuardContext): Promise<Result> {
  const u = await getAdminUser(db, id);
  if (!u) return { ok: false, error: "not_found" };
  if (nameError(patch.name)) return { ok: false, error: "invalid_name" };
  if (u.role === "owner" && patch.role !== "owner") {
    if (id === ctx.actorId) return { ok: false, error: "self_action" };
    if (u.active && !ctx.envOwnerConfigured && (await activeOwnerCount(db)) <= 1) return { ok: false, error: "last_owner" };
  }
  await db.update(adminUsers).set({ name: patch.name.trim(), role: patch.role, updatedAt: nowIso() }).where(eq(adminUsers.id, id));
  return { ok: true, value: undefined };
}

/** Enable or disable. Disabling ends the user's sessions. */
export async function setAdminUserActive(db: Database, id: string, active: boolean, ctx: GuardContext): Promise<Result> {
  const u = await getAdminUser(db, id);
  if (!u) return { ok: false, error: "not_found" };
  if (u.active === active) return { ok: true, value: undefined };
  if (!active) {
    if (id === ctx.actorId) return { ok: false, error: "self_action" };
    if (u.role === "owner" && !ctx.envOwnerConfigured && (await activeOwnerCount(db)) <= 1) return { ok: false, error: "last_owner" };
  }
  await db
    .update(adminUsers)
    .set({ active, updatedAt: nowIso(), ...(!active && { sessionVersion: u.sessionVersion + 1 }) })
    .where(eq(adminUsers.id, id));
  return { ok: true, value: undefined };
}

/** Owner sets a temporary password. Ends the user's sessions and forces a change at next login. */
export async function resetAdminPassword(db: Database, id: string, newPassword: string): Promise<Result> {
  const u = await getAdminUser(db, id);
  if (!u) return { ok: false, error: "not_found" };
  const pErr = passwordError(newPassword);
  if (pErr) return { ok: false, error: "invalid_password", message: pErr };
  await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(newPassword), mustChangePassword: true, sessionVersion: u.sessionVersion + 1, updatedAt: nowIso() })
    .where(eq(adminUsers.id, id));
  return { ok: true, value: undefined };
}

/** User changes their own password. Returns the new session version so the caller can re-issue the cookie. */
export async function changeOwnPassword(db: Database, id: string, current: string, next: string): Promise<Result<number> | { ok: false; error: "wrong_password" }> {
  const u = await getAdminUser(db, id);
  if (!u || !u.active) return { ok: false, error: "not_found" };
  if (!(await verifyPassword(current, u.passwordHash))) return { ok: false, error: "wrong_password" };
  const pErr = passwordError(next);
  if (pErr) return { ok: false, error: "invalid_password", message: pErr };
  if (current === next) return { ok: false, error: "invalid_password", message: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม" };
  const ver = u.sessionVersion + 1;
  await db
    .update(adminUsers)
    .set({ passwordHash: await hashPassword(next), mustChangePassword: false, sessionVersion: ver, updatedAt: nowIso() })
    .where(eq(adminUsers.id, id));
  return { ok: true, value: ver };
}

/** Username + password check for login. Returns the active user or null (never says which part was wrong). */
export async function authenticateAdminUser(db: Database, username: string, password: string): Promise<AdminUserRow | null> {
  const [u] = await db.select().from(adminUsers).where(eq(adminUsers.username, normalizeUsername(username))).limit(1);
  if (!u) {
    // Spend comparable time so response timing doesn't reveal whether the username exists.
    await verifyPassword(password, DUMMY_HASH);
    return null;
  }
  const ok = await verifyPassword(password, u.passwordHash);
  if (!ok || !u.active) return null;
  await db.update(adminUsers).set({ lastLoginAt: nowIso() }).where(eq(adminUsers.id, u.id));
  return u;
}

// Hash of a random string; only used to equalise timing for unknown usernames.
const DUMMY_HASH = "pbkdf2-sha256$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
