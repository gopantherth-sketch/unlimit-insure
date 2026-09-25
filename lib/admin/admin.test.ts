import { beforeEach, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/admin/password";
import { decodeSession, encodeSession } from "@/lib/admin/session";
import {
  authenticateAdminUser,
  changeOwnPassword,
  createAdminUser,
  getAdminUser,
  resetAdminPassword,
  setAdminUserActive,
  updateAdminUser,
  type GuardContext,
} from "@/lib/db/admin-users";
import { assignLead, createLead, getLead, updateLeadStatus } from "@/lib/db/leads";
import { createTestDb } from "@/lib/db/testing";

const PW = "correct-horse-battery";
const SECRET = "x".repeat(40);

describe("password hashing", () => {
  it("verifies the right password only", async () => {
    const h = await hashPassword(PW, 1000);
    expect(h).toMatch(/^pbkdf2-sha256\$1000\$/);
    expect(await verifyPassword(PW, h)).toBe(true);
    expect(await verifyPassword(PW + "!", h)).toBe(false);
    expect(await verifyPassword(PW, h.replace(/.$/, h.endsWith("A") ? "B" : "A"))).toBe(false);
    expect(await verifyPassword(PW, "garbage")).toBe(false);
    expect(await hashPassword(PW, 1000)).not.toBe(h); // salted
  });
});

describe("session tokens", () => {
  const claims = { kind: "db" as const, sub: "user-1", ver: 3, exp: Date.now() + 60_000 };
  it("round-trips and rejects tampering, wrong secret and expiry", async () => {
    const t = await encodeSession(claims, SECRET);
    expect(await decodeSession(t, SECRET)).toEqual(claims);
    expect(await decodeSession(t, "y".repeat(40))).toBeNull();
    expect(await decodeSession(t.replace(".3.", ".4."), SECRET)).toBeNull();
    expect(await decodeSession(t.replace("v2.db.", "v2.env."), SECRET)).toBeNull();
    expect(await decodeSession(t, SECRET, claims.exp + 1)).toBeNull();
    expect(await decodeSession("v1.whatever", SECRET)).toBeNull();
  });
});

describe("admin users", () => {
  let db: ReturnType<typeof createTestDb>["db"];
  const envCtx = (actorId: string | null): GuardContext => ({ actorId, envOwnerConfigured: true, reservedUsername: "admin" });
  const noEnvCtx = (actorId: string | null): GuardContext => ({ actorId, envOwnerConfigured: false });
  const make = async (username: string, role: "owner" | "staff" = "staff", ctx = envCtx(null)) => {
    const r = await createAdminUser(db, { name: username.toUpperCase(), username, password: PW, role, mustChangePassword: false, createdBy: "test" }, ctx);
    if (!r.ok) throw new Error(r.error);
    return r.value;
  };

  beforeEach(() => {
    db = createTestDb().db;
  });

  it("validates, normalises and de-duplicates usernames; never exposes the hash", async () => {
    const u = await make("Somchai.K");
    expect(u.username).toBe("somchai.k");
    expect("passwordHash" in u).toBe(false);
    const dup = await createAdminUser(db, { name: "x", username: "SOMCHAI.K", password: PW, role: "staff", mustChangePassword: false, createdBy: "t" }, envCtx(null));
    expect(dup).toMatchObject({ ok: false, error: "username_taken" });
    const reserved = await createAdminUser(db, { name: "x", username: "Admin", password: PW, role: "staff", mustChangePassword: false, createdBy: "t" }, envCtx(null));
    expect(reserved).toMatchObject({ ok: false, error: "reserved_username" });
    const short = await createAdminUser(db, { name: "x", username: "ok-user", password: "short", role: "staff", mustChangePassword: false, createdBy: "t" }, envCtx(null));
    expect(short).toMatchObject({ ok: false, error: "invalid_password" });
  });

  it("authenticates active users only and records last login", async () => {
    const u = await make("staff1");
    expect(await authenticateAdminUser(db, "STAFF1", PW)).not.toBeNull();
    expect((await getAdminUser(db, u.id))?.lastLoginAt).toBeTruthy();
    expect(await authenticateAdminUser(db, "staff1", "wrong-password-123")).toBeNull();
    expect(await authenticateAdminUser(db, "nobody", PW)).toBeNull();
    await setAdminUserActive(db, u.id, false, envCtx(null));
    expect(await authenticateAdminUser(db, "staff1", PW)).toBeNull();
  });

  it("disable and reset end sessions; reset forces a change; own change clears it", async () => {
    const u = await make("staff2");
    const v0 = (await getAdminUser(db, u.id))!.sessionVersion;
    await resetAdminPassword(db, u.id, "temporary-pass-1");
    const afterReset = (await getAdminUser(db, u.id))!;
    expect(afterReset.sessionVersion).toBe(v0 + 1);
    expect(afterReset.mustChangePassword).toBe(true);
    expect(await authenticateAdminUser(db, "staff2", PW)).toBeNull();
    expect(await changeOwnPassword(db, u.id, "wrong", "new-password-123")).toMatchObject({ ok: false, error: "wrong_password" });
    const ch = await changeOwnPassword(db, u.id, "temporary-pass-1", "new-password-123");
    expect(ch).toEqual({ ok: true, value: v0 + 2 });
    expect((await getAdminUser(db, u.id))!.mustChangePassword).toBe(false);
    await setAdminUserActive(db, u.id, false, envCtx(null));
    expect((await getAdminUser(db, u.id))!.sessionVersion).toBe(v0 + 3);
  });

  it("refuses self-disable, self-demotion and removing the last owner without an env owner", async () => {
    const o = await make("owner1", "owner", noEnvCtx(null));
    expect(await setAdminUserActive(db, o.id, false, noEnvCtx(o.id))).toMatchObject({ ok: false, error: "self_action" });
    expect(await updateAdminUser(db, o.id, { name: "O", role: "staff" }, noEnvCtx(o.id))).toMatchObject({ ok: false, error: "self_action" });
    expect(await setAdminUserActive(db, o.id, false, noEnvCtx("someone-else"))).toMatchObject({ ok: false, error: "last_owner" });
    // With the break-glass env owner configured the team can't be locked out, so it's allowed.
    expect(await setAdminUserActive(db, o.id, false, envCtx(null))).toMatchObject({ ok: true });
    await setAdminUserActive(db, o.id, true, envCtx(null));
    const o2 = await make("owner2", "owner", noEnvCtx(null));
    expect(await setAdminUserActive(db, o.id, false, noEnvCtx(o2.id))).toMatchObject({ ok: true });
  });
});

describe("lead actors and assignment", () => {
  it("records the acting user and assigns only to active users", async () => {
    const { db } = createTestDb();
    const staff = await createAdminUser(db, { name: "Nok", username: "nok", password: PW, role: "staff", mustChangePassword: false, createdBy: "t" }, { actorId: null, envOwnerConfigured: true });
    if (!staff.ok) throw new Error();
    const actor = { name: staff.value.name, userId: staff.value.id };
    const { id } = await createLead(db, {
      name: "ลูกค้า",
      phone: "0812345678",
      preferredChannel: "phone",
      consentMarketing: false,
      context: { vehicle: null, priorities: [], selectedPlanIds: [], viewedPlanIds: [], comparedPlanIds: [] },
    });
    expect(await assignLead(db, id, staff.value.id, actor)).toBe("ok");
    expect(await assignLead(db, id, staff.value.id, actor)).toBe("unchanged");
    await updateLeadStatus(db, id, "contacted", actor);
    const got = await getLead(db, id);
    expect(got?.lead.assignedTo).toBe(staff.value.id);
    const byType = Object.fromEntries(got!.activities.map((a) => [a.type, a]));
    expect(byType.assigned).toMatchObject({ actor: "Nok", actorUserId: staff.value.id, note: "Nok" });
    expect(byType.status_changed).toMatchObject({ actorUserId: staff.value.id });
    expect(byType.created).toMatchObject({ actor: "customer", actorUserId: null });

    await setAdminUserActive(db, staff.value.id, false, { actorId: null, envOwnerConfigured: true });
    expect(await assignLead(db, id, null, { name: "boss", userId: null })).toBe("ok");
    expect(await assignLead(db, id, staff.value.id, { name: "boss", userId: null })).toBe("user_not_found");
    expect(await assignLead(db, "missing", null, actor)).toBe("lead_not_found");
  });
});
