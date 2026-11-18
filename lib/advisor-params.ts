import type { AdvisorCar } from "@/components/insurance/AdvisorContact";
import { contact } from "@/content/contact";
import { parseFrom, parsePlanIds, parsePriorities, parseTrim, parseUsage, parseVehicle, type RawParams } from "@/lib/params";

// /advisor URL handling (CLEAR row 42). Plain module: used by the prebuilt page (server) and AdvisorFromUrl (browser).

/** What the advisor page needs to know about each model: name, EV or not, and the years it is sold. */
export type AdvisorCars = Record<string, { name: string; ev: boolean; yearFrom: number; yearTo: number }>;
export const advisorCarKey = (brandId: string, modelId: string) => `${brandId}/${modelId}`;

/** Like Next.js searchParams: a repeated key becomes an array (the parsers read its first value). */
export function toRawParams(search: string): RawParams {
  const sp = new URLSearchParams(search);
  const out: RawParams = {};
  for (const k of new Set(sp.keys())) {
    const all = sp.getAll(k);
    out[k] = all.length > 1 ? all : all[0];
  }
  return out;
}

/** Car, plan picks, sub-model and source page from the URL, resolved exactly as the server page used to. */
export function advisorPropsFromParams(raw: RawParams, cars: AdvisorCars, planNames: Record<string, string>) {
  const selection = parseVehicle(raw);
  const known = selection ? cars[advisorCarKey(selection.brandId, selection.modelId)] : undefined;
  const valid = !!(selection && known && Number.isInteger(selection.year) && selection.year >= known.yearFrom && selection.year <= known.yearTo);
  const context = { vehicle: valid ? selection : null, usage: parseUsage(raw), priorities: parsePriorities(raw), selectedPlanIds: parsePlanIds(raw) };
  // X8: the optional sub-model only goes into the on-screen summary and the LINE message, never the stored lead.
  const trim = parseTrim(raw);
  const from = parseFrom(raw);
  // A model page link carries a default year the customer did not pick, so leave the year blank for them.
  const car: AdvisorCar | null = valid && known ? { name: known.name, ev: known.ev, year: from === "model" ? null : selection!.year, trim: trim ?? null } : null;
  const fromText = from === "home" ? contact.messages.from.home : from === "model" && car ? contact.messages.from.model(car.name) : null;
  return { context, car, fromText, planNames };
}

