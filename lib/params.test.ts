import { describe, expect, it } from "vitest";
import { vehicleForm } from "@/content/vehicle-form";
import { TRIM_MAX, buildQuery, cleanTrim, parseTrim } from "@/lib/params";

const car = { brandId: "toyota", modelId: "toyota-corolla-cross", year: 2022 };

describe("trim (X8 sub-model / engine size)", () => {
  it("is optional: empty or blank means absent", () => {
    expect(cleanTrim(undefined)).toBeUndefined();
    expect(cleanTrim("")).toBeUndefined();
    expect(cleanTrim("   ")).toBeUndefined();
    expect(parseTrim({})).toBeUndefined();
  });

  it("trims and collapses whitespace", () => {
    expect(cleanTrim("  1.8   Hybrid\tPremium ")).toBe("1.8 Hybrid Premium");
  });

  it("removes angle brackets and control characters", () => {
    expect(cleanTrim("<script>x</script>")).toBe("script x /script");
    expect(cleanTrim("1.8\u0000\u0007 GR")).toBe("1.8 GR");
  });

  it(`caps at ${TRIM_MAX} characters`, () => {
    expect(cleanTrim("ก".repeat(200))).toHaveLength(TRIM_MAX);
  });

  it("reads the first value from the URL", () => {
    expect(parseTrim({ trim: ["1.5 Turbo", "x"] })).toBe("1.5 Turbo");
  });

  it("only goes into the URL with a car, and only when present", () => {
    expect(buildQuery({ vehicle: car, trim: "1.8 HEV" })).toBe("?brand=toyota&model=toyota-corolla-cross&year=2022&trim=1.8+HEV");
    expect(buildQuery({ vehicle: car, trim: "  " })).toBe("?brand=toyota&model=toyota-corolla-cross&year=2022");
    expect(buildQuery({ trim: "1.8 HEV" })).toBe("");
  });

  it("appears after the car in the LINE message", () => {
    const text = vehicleForm.withTrim("Toyota Corolla Cross 2022", "1.8 Hybrid Premium");
    expect(text).toBe("Toyota Corolla Cross 2022 · 1.8 Hybrid Premium");
    expect(vehicleForm.withTrim("Toyota Corolla Cross 2022", undefined)).toBe("Toyota Corolla Cross 2022");
  });
});
