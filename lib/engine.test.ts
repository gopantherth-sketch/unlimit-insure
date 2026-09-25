import { describe, expect, it } from "vitest";
import { summarizeDifference, bestQuoteIdsByField } from "@/lib/compare";
import { rankQuotes } from "@/lib/match";
import { buildQuery, parseQuoteInput, toRaw } from "@/lib/params";
import { activeVersion, findProduct, generateQuotes, quoteForProduct, snapshotQuote } from "@/lib/quote";
import { simulate } from "@/lib/scenarios";
import { resolveVehicle } from "@/lib/vehicle";

const now = new Date("2026-09-25T09:00:00Z");
const corolla = resolveVehicle({ brandId: "toyota", modelId: "toyota-corolla-cross", year: 2025 }, now)!;
const atto = resolveVehicle({ brandId: "byd", modelId: "byd-atto-3", year: 2024 }, now)!;
const oldPickup = resolveVehicle({ brandId: "isuzu", modelId: "isuzu-d-max", year: 2019 }, now)!;

describe("vehicle", () => {
  it("rejects unknown or out-of-range selections", () => {
    expect(resolveVehicle({ brandId: "toyota", modelId: "honda-city", year: 2025 }, now)).toBeNull();
    expect(resolveVehicle({ brandId: "byd", modelId: "byd-atto-3", year: 2015 }, now)).toBeNull();
  });
  it("depreciates with age", () => {
    expect(corolla.age).toBe(1);
    expect(corolla.estimatedValue).toBe(950_000);
  });
});

describe("quotes", () => {
  it("uses the version effective on the quote date", () => {
    const p = findProduct("a-type1-dealer")!;
    expect(activeVersion(p, new Date("2026-03-01"))?.version).toBe(1);
    expect(activeVersion(p, now)?.version).toBe(2);
  });
  it("applies eligibility", () => {
    const ids = (v: typeof corolla) => generateQuotes(v, now).map((q) => q.productId);
    expect(ids(corolla)).not.toContain("c-ev-type1");
    expect(ids(atto)).toContain("c-ev-type1");
    expect(ids(oldPickup)).not.toContain("a-type1-dealer");
    expect(quoteForProduct("a-type1-dealer", oldPickup, now).status).toBe("ineligible");
  });
  it("prices from rules", () => {
    const q = quoteForProduct("a-type1-dealer", corolla, now);
    expect(q.status).toBe("ok");
    if (q.status !== "ok") return;
    expect(q.quote.sumInsured).toBe(950_000);
    expect(q.quote.premium).toBe(17_580);
  });
  it("snapshots are detached from the catalogue", () => {
    const q = generateQuotes(corolla, now)[0]!;
    const snap = snapshotQuote(q, corolla);
    snap.coverage.excess = 99_999;
    expect(q.coverage.excess).not.toBe(99_999);
  });
});

describe("matching", () => {
  it("ranks by priorities met, then premium", () => {
    const ranked = rankQuotes(generateQuotes(corolla, now), ["dealer", "noExcess", "replacementCar"], corolla);
    expect(ranked[0]?.productId).toBe("c-type1-complete");
    expect(ranked[0]?.match).toMatchObject({ matched: 3, total: 3 });
    for (let i = 1; i < ranked.length; i++) {
      const a = ranked[i - 1]!;
      const b = ranked[i]!;
      expect(a.match.matched > b.match.matched || (a.match.matched === b.match.matched && a.premium <= b.premium)).toBe(true);
    }
  });
  it("gives a reason for every priority", () => {
    const [top] = rankQuotes(generateQuotes(corolla, now), ["flood", "lowPremium"], corolla);
    expect(top?.match.results.every((r) => r.reason.length > 0)).toBe(true);
  });
});

describe("compare", () => {
  it("explains why a cheaper plan is cheaper", () => {
    const quotes = generateQuotes(corolla, now);
    const a = quotes.find((q) => q.productId === "a-type1-dealer")!;
    const b = quotes.find((q) => q.productId === "b-type1-garage")!;
    const d = summarizeDifference(a, b);
    expect(d.premiumDelta).toBeLessThan(0);
    expect(d.tradeoffs).toContain("ซ่อมอู่แทนซ่อมศูนย์");
    expect(d.tradeoffs.some((t) => t.includes("ค่าเสียหายส่วนแรก"))).toBe(true);
    expect(d.tradeoffs.some((t) => t.startsWith("ทุนประกันต่ำกว่า"))).toBe(true);
  });
  it("marks best values only when they differ", () => {
    const quotes = generateQuotes(corolla, now).filter((q) => q.coverage.insuranceType === "type1");
    const best = bestQuoteIdsByField(quotes);
    expect(best.has("flood")).toBe(true);
    expect(best.has("fireTheft")).toBe(false);
  });
});

describe("simulator", () => {
  it("derives outcomes from coverage", () => {
    const quotes = generateQuotes(corolla, now);
    const twoPlus = quotes.find((q) => q.productId === "a-type2plus")!;
    expect(simulate("noCounterparty", twoPlus).covered).toBe(false);
    expect(simulate("flood", twoPlus)).toMatchObject({ covered: true, maxAmount: 200_000 });
  });
});

describe("params", () => {
  it("round-trips journey state", () => {
    const qs = buildQuery({ vehicle: { brandId: "toyota", modelId: "toyota-corolla-cross", year: 2025 }, usage: "family", priorities: ["flood", "dealer"] });
    const parsed = parseQuoteInput(toRaw(new URLSearchParams(qs)));
    expect(parsed).toEqual({
      vehicle: { brandId: "toyota", modelId: "toyota-corolla-cross", year: 2025 },
      usage: "family",
      priorities: ["dealer", "flood"],
    });
  });
  it("drops unknown values", () => {
    const parsed = parseQuoteInput({ brand: "toyota", model: "x", year: "2025", use: "hack", p: "flood,evil" });
    expect(parsed?.usage).toBeUndefined();
    expect(parsed?.priorities).toEqual(["flood"]);
  });
});
