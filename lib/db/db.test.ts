import { beforeEach, describe, expect, it } from "vitest";
import { mockCatalog } from "@/lib/data";
import { loadCatalog, seedCatalog } from "@/lib/db/catalog";
import { addLeadNote, countLeadsByStatus, createLead, getLead, listLeads, updateLeadStatus } from "@/lib/db/leads";
import { listProductsWithVersions, markVersionVerified, setVersionStatus } from "@/lib/db/products-admin";
import { createTestDb } from "@/lib/db/testing";
import { generateQuotes } from "@/lib/quote";
import { resolveVehicle } from "@/lib/vehicle";

let db: ReturnType<typeof createTestDb>["db"];

beforeEach(async () => {
  db = createTestDb().db;
  await seedCatalog(db, mockCatalog);
});

const byId = <T extends { id: string }>(xs: T[]) => [...xs].sort((a, b) => a.id.localeCompare(b.id));

describe("catalogue", () => {
  it("round-trips the mock catalogue through D1 schema", async () => {
    const c = await loadCatalog(db);
    expect(byId(c.insurers)).toEqual(byId(mockCatalog.insurers));
    expect(byId(c.models)).toEqual(byId(mockCatalog.models));
    expect(byId(c.products)).toEqual(byId(mockCatalog.products));
  });

  it("produces the same quotes as the in-memory catalogue", async () => {
    const c = await loadCatalog(db);
    const now = new Date("2026-09-25T09:00:00Z");
    const sel = { brandId: "toyota", modelId: "toyota-corolla-cross", year: 2025 };
    const fromDb = generateQuotes(c, resolveVehicle(c, sel, now)!, now).map((q) => [q.productId, q.premium]);
    const fromMock = generateQuotes(mockCatalog, resolveVehicle(mockCatalog, sel, now)!, now).map((q) => [q.productId, q.premium]);
    expect(fromDb.sort()).toEqual(fromMock.sort());
  });

  it("hides unpublished versions and requires verification to publish", async () => {
    await setVersionStatus(db, "b-type3plus-v1", "draft");
    expect((await loadCatalog(db)).products.some((p) => p.id === "b-type3plus")).toBe(false);

    const all = await listProductsWithVersions(db);
    expect(all.find((p) => p.id === "b-type3plus")?.versions[0]?.status).toBe("draft");

    await markVersionVerified(db, { versionId: "b-type3plus-v1", documentName: "Brochure Q4.pdf", page: 3, verifiedBy: "admin" });
    expect(await setVersionStatus(db, "b-type3plus-v1", "published")).toBe("ok");
    const p = (await loadCatalog(db)).products.find((x) => x.id === "b-type3plus");
    expect(p?.versions[0]?.source).toMatchObject({ status: "verified", documentName: "Brochure Q4.pdf", page: 3, verifiedBy: "admin" });
  });
});

describe("leads", () => {
  const input = {
    name: "ทดสอบ",
    phone: "0812345678",
    preferredChannel: "phone" as const,
    consentMarketing: false,
    context: { vehicle: null, priorities: ["flood"], selectedPlanIds: ["a-type1-dealer"], viewedPlanIds: [], comparedPlanIds: [] },
  };

  it("stores a lead with a consent log per purpose", async () => {
    const { id, reference } = await createLead(db, input);
    expect(reference).toMatch(/^UI-/);
    const got = await getLead(db, id);
    expect(got?.lead.status).toBe("new");
    expect(got?.consents.map((c) => [c.purpose, c.granted]).sort()).toEqual([
      ["contact", true],
      ["marketing", false],
    ]);
    expect(got?.consents.every((c) => c.wording.length > 0 && c.wordingVersion)).toBe(true);
    expect(got?.activities.map((a) => a.type)).toEqual(["created"]);
  });

  it("tracks status changes and notes", async () => {
    const { id } = await createLead(db, input);
    await updateLeadStatus(db, id, "contacted", { name: "admin", userId: null });
    await addLeadNote(db, id, "โทรแล้ว", { name: "admin", userId: null });
    const got = await getLead(db, id);
    expect(got?.lead.status).toBe("contacted");
    expect(got?.activities.map((a) => a.type).sort()).toEqual(["created", "note", "status_changed"]);
    expect((await countLeadsByStatus(db)).contacted).toBe(1);
    expect(await listLeads(db, { status: "new" })).toHaveLength(0);
  });
});

describe("analytics", () => {
  it("aggregates anonymous counters per Bangkok day", async () => {
    const { recordEvent, eventTotals, bangkokDay } = await import("@/lib/db/analytics");
    const { isValidEvent } = await import("@/lib/analytics/events");
    const t = new Date("2026-09-25T20:00:00Z"); // 03:00 next day in Bangkok
    expect(bangkokDay(t)).toBe("2026-09-26");
    await recordEvent(db, "quote_started", "", t);
    await recordEvent(db, "quote_started", "", t);
    await recordEvent(db, "explain_opened", "excess", t);
    const r = await eventTotals(db, 7, t);
    expect(r.byName.quote_started).toBe(2);
    expect(r.byDim.explain_opened).toEqual({ excess: 1 });
    expect(isValidEvent("explain_opened", "excess")).toBe(true);
    expect(isValidEvent("explain_opened", "<script>")).toBe(false);
    expect(isValidEvent("anything", "")).toBe(false);
  });
});
