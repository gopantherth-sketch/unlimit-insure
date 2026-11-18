import { describe, expect, it } from "vitest";
import { advisorCarKey, advisorPropsFromParams, type AdvisorCars } from "@/lib/advisor-params";
import { contact } from "@/content/contact";
import { contextFromParams } from "@/lib/leads";
import { parseFrom, parseTrim, type RawParams } from "@/lib/params";
import { getPublicCatalog } from "@/lib/server/catalog";
import { isElectric, resolveVehicle } from "@/lib/vehicle";

// Row 42: /advisor moved its URL handling from the server page to the browser. This is the old server
// code, kept here to prove the new one gives the same context, car and source text.
async function oldServerProps(raw: RawParams) {
  const context = contextFromParams(raw);
  const trim = parseTrim(raw);
  const catalog = await getPublicCatalog();
  const vehicle = context.vehicle ? resolveVehicle(catalog, context.vehicle) : null;
  const planNames = Object.fromEntries(catalog.products.map((p) => [p.id, p.name]));
  const safeContext = { ...context, vehicle: vehicle ? context.vehicle : null };
  const from = parseFrom(raw);
  const carName = vehicle ? `${vehicle.brand.name} ${vehicle.model.name}` : null;
  const car = vehicle && carName ? { name: carName, ev: isElectric(vehicle), year: from === "model" ? null : vehicle.year, trim: trim ?? null } : null;
  const fromText = from === "home" ? contact.messages.from.home : from === "model" && carName ? contact.messages.from.model(carName) : null;
  return { context: safeContext, car, fromText, planNames };
}

describe("advisor URL handling in the browser (row 42)", () => {
  it("matches the old server page for every model and a set of awkward URLs", async () => {
    const catalog = await getPublicCatalog();
    const brandName = new Map(catalog.brands.map((b) => [b.id, b.name]));
    const cars: AdvisorCars = {};
    for (const m of catalog.models) cars[advisorCarKey(m.brandId, m.id)] = { name: `${brandName.get(m.brandId)} ${m.name}`, ev: m.powertrain === "EV", yearFrom: m.yearFrom, yearTo: m.yearTo };
    const planNames = Object.fromEntries(catalog.products.map((p) => [p.id, p.name]));

    const cases: RawParams[] = [
      {},
      { brand: "nope", model: "x", year: "2022" },
      { brand: ["toyota", "honda"], model: "toyota-corolla-cross", year: "2022" },
      { brand: "toyota", model: "toyota-corolla-cross", year: "1990" },
      { brand: "toyota", model: "honda-civic", year: "2022" },
      { brand: "toyota", model: "toyota-corolla-cross", year: "2022", trim: "  1.8 <b>Hybrid</b> ", from: "model", use: "commute", p: "flood,dealer,x", plans: "a,b,a" },
      { from: "home" },
      { from: "model" },
    ];
    for (const m of catalog.models) {
      cases.push({ brand: m.brandId, model: m.id, year: String(m.yearTo), from: "home" });
      cases.push({ brand: m.brandId, model: m.id, year: String(m.yearFrom), from: "model", trim: "x" });
    }
    for (const raw of cases) expect(advisorPropsFromParams(raw, cars, planNames)).toEqual(await oldServerProps(raw));
  });
});
