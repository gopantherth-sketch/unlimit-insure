import { beforeEach, describe, expect, it } from "vitest";
import { safeFileName, sniffType } from "@/lib/applications/files";
import { canMove } from "@/lib/applications/status";
import { REFERENCE_RE } from "@/lib/applications/tokens";
import { mockCatalog } from "@/lib/data";
import {
  addDocument,
  amountDue,
  createApplication,
  getApplicationDetail,
  moveApplication,
  phoneLast4Matches,
  resetApplicationToken,
  setFinalPremium,
  setPolicyDetails,
  verifyApplicationToken,
} from "@/lib/db/applications";
import { seedCatalog } from "@/lib/db/catalog";
import { createTestDb } from "@/lib/db/testing";
import { crc16, promptPayPayload } from "@/lib/payment/promptpay";
import { quoteForProduct } from "@/lib/quote";
import { resolveVehicle } from "@/lib/vehicle";

describe("promptpay", () => {
  it("uses CRC-16/CCITT-FALSE", () => {
    expect(crc16("123456789")).toBe("29B1");
  });
  it("builds phone and ID payloads with amount", () => {
    const p = promptPayPayload("081-234-5678", 17580)!;
    expect(p.startsWith("000201010212")).toBe(true);
    expect(p).toContain("0016A000000677010111" + "0113" + "0066812345678");
    expect(p).toContain("5802TH5303764");
    expect(p).toContain("540817580.00");
    expect(p.slice(-8, -4)).toBe("6304");
    expect(p.slice(-4)).toBe(crc16(p.slice(0, -4)));
    expect(promptPayPayload("1234567890123")).toContain("02131234567890123");
    expect(promptPayPayload("12345")).toBeNull();
  });
});

describe("file checks", () => {
  it("decides type from bytes", () => {
    expect(sniffType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffType(new TextEncoder().encode("%PDF-1.7"))).toBe("application/pdf");
    expect(sniffType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(sniffType(new TextEncoder().encode("MZ\x90\x00"))).toBeNull();
    expect(safeFileName("../../ทะเบียน<rot>.exe", "image/jpeg")).toBe("ทะเบียนrot.jpg");
  });
});

describe("status rules", () => {
  it("only allows listed moves by the right side", () => {
    expect(canMove("documents_pending", "submitted", "customer")).toBe(true);
    expect(canMove("documents_pending", "submitted", "staff")).toBe(false);
    expect(canMove("submitted", "policy_issued", "staff")).toBe(false);
    expect(canMove("policy_issued", "cancelled", "staff")).toBe(false);
  });
});

describe("applications", () => {
  let db: ReturnType<typeof createTestDb>["db"];
  const staff = { name: "นก", userId: "u1" };
  const customer = { name: "customer", userId: null };
  const now = new Date("2026-09-26T03:00:00Z");

  beforeEach(async () => {
    db = createTestDb().db;
    await seedCatalog(db, mockCatalog);
  });

  async function make() {
    const vehicle = resolveVehicle(mockCatalog, { brandId: "toyota", modelId: "toyota-corolla-cross", year: 2025 }, now)!;
    const r = quoteForProduct(mockCatalog, "a-type1-dealer", vehicle, now);
    if (r.status !== "ok") throw new Error();
    const created = await createApplication(db, {
      quote: r.quote,
      vehicle,
      customerName: "ลูกค้า",
      phone: "0812345678",
      email: null,
      address: "กรุงเทพฯ",
      plateNumber: "1กข 1234",
      province: "กรุงเทพมหานคร",
      coverageStart: "2026-10-01",
      consentMarketing: false,
    });
    return { ...created, quote: r.quote };
  }
  const doc = (applicationId: string, kind: "registration" | "driving_license" | "id_card" | "payment_slip" | "policy", by: "customer" | "staff" = "customer") =>
    addDocument(db, { id: crypto.randomUUID(), applicationId, kind, r2Key: "k", fileName: "f.jpg", contentType: "image/jpeg", sizeBytes: 1, uploadedBy: by }, by === "staff" ? staff : customer);

  it("freezes the quote and protects the link", async () => {
    const { id, reference, token, quote } = await make();
    expect(reference).toMatch(REFERENCE_RE);
    const d = (await getApplicationDetail(db, id))!;
    expect(d.app.status).toBe("documents_pending");
    expect(d.app.tokenHash).not.toContain(token);
    expect(d.snapshot).toMatchObject({ premium: quote.premium, productVersionId: quote.productVersionId });
    expect(await verifyApplicationToken(d.app, token)).toBe(true);
    expect(await verifyApplicationToken(d.app, token + "x")).toBe(false);
    expect(phoneLast4Matches(d.app, "5678")).toBe(true);
    expect(phoneLast4Matches(d.app, "1234")).toBe(false);
    const fresh = await resetApplicationToken(db, id, staff);
    const again = (await getApplicationDetail(db, id))!;
    expect(await verifyApplicationToken(again.app, token)).toBe(false);
    expect(await verifyApplicationToken(again.app, fresh)).toBe(true);
  });

  it("walks the full lifecycle with guards", async () => {
    const { id, quote } = await make();
    expect(await moveApplication(db, id, "submitted", "customer", customer)).toEqual({ ok: false, error: "missing_documents" });
    await doc(id, "registration");
    await doc(id, "driving_license");
    await doc(id, "id_card");
    expect(await moveApplication(db, id, "submitted", "customer", customer)).toEqual({ ok: true });
    expect(await moveApplication(db, id, "needs_info", "staff", staff)).toEqual({ ok: false, error: "missing_reason" });
    expect(await moveApplication(db, id, "needs_info", "staff", staff, { message: "ขอรูปทะเบียนที่ชัดกว่านี้" })).toEqual({ ok: true });
    expect(await moveApplication(db, id, "submitted", "customer", customer)).toEqual({ ok: true });

    expect(await setFinalPremium(db, id, 18200, "", staff)).toMatchObject({ ok: false });
    expect(await setFinalPremium(db, id, 18200, "บริษัทยืนยันเบี้ยหลังตรวจสภาพรถ", staff)).toEqual({ ok: true });
    expect(await moveApplication(db, id, "awaiting_payment", "staff", staff)).toEqual({ ok: true });
    let d = (await getApplicationDetail(db, id))!;
    expect(amountDue(d.app)).toBe(18200);
    expect(d.app.estimatedPremium).toBe(quote.premium);

    expect(await moveApplication(db, id, "payment_submitted", "customer", customer)).toEqual({ ok: false, error: "missing_payment_slip" });
    await doc(id, "payment_slip");
    expect(await moveApplication(db, id, "payment_submitted", "customer", customer)).toEqual({ ok: true });
    expect(await setFinalPremium(db, id, 1, "late change", staff)).toMatchObject({ ok: false, error: "not_allowed" });
    expect(await moveApplication(db, id, "sent_to_insurer", "staff", staff)).toEqual({ ok: true });
    expect(await moveApplication(db, id, "policy_issued", "staff", staff)).toEqual({ ok: false, error: "missing_policy" });
    expect((await setPolicyDetails(db, id, { policyNumber: "POL-1", policyStart: "2026-10-01", policyEnd: "2027-10-01" }, staff)).ok).toBe(true);
    await doc(id, "policy", "staff");
    expect(await moveApplication(db, id, "policy_issued", "staff", staff)).toEqual({ ok: true });
    expect(await moveApplication(db, id, "cancelled", "staff", staff, { message: "x" })).toEqual({ ok: false, error: "not_allowed" });

    d = (await getApplicationDetail(db, id))!;
    const visible = d.events.filter((e) => e.visibleToCustomer).map((e) => e.type);
    expect(visible).toEqual(expect.arrayContaining(["created", "status_changed", "premium_changed"]));
    expect(d.events.some((e) => e.type === "status_changed" && e.actorUserId === "u1")).toBe(true);
  });
});

describe("buy form validation", () => {
  const now = new Date("2026-09-26T03:00:00Z");
  const good = {
    customerName: "สมชาย ใจดี",
    phone: "081-234-5678",
    email: "",
    address: "99/1 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ 10110",
    plateNumber: "1กข 1234",
    province: "กรุงเทพมหานคร",
    coverageStart: "2026-10-01",
    commercialUse: "no",
    consentData: true,
    consentInsurer: true,
    consentTruthful: true,
  };
  it("accepts a complete form and rejects bad fields", async () => {
    const { validateBuyForm, startDateWindow } = await import("@/lib/applications/validate");
    expect(validateBuyForm(good, now)).toEqual({});
    expect(startDateWindow(now)).toEqual({ min: "2026-09-27", max: "2026-12-25" });
    const bad = validateBuyForm({ ...good, plateNumber: "ABC", province: "Tokyo", coverageStart: "2026-09-26", commercialUse: "yes", consentInsurer: false }, now);
    expect(Object.keys(bad).sort()).toEqual(["commercialUse", "consentInsurer", "coverageStart", "plateNumber", "province"]);
    expect(bad.commercialUse).toBe("commercial");
    expect(validateBuyForm({ ...good, plateNumber: "กก 12" }, now)).toEqual({});
  });
});
