import { priorityIds, usageIds } from "@/lib/priorities";
import type { PriorityId, QuoteInput, UsageId, VehicleSelection } from "@/lib/types";

// Journey state lives in the URL: shareable, back-button friendly, and contains no personal data.

export type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function toRaw(sp: URLSearchParams): RawParams {
  const out: RawParams = {};
  sp.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

export function parseVehicle(raw: RawParams): VehicleSelection | null {
  const brandId = first(raw.brand);
  const modelId = first(raw.model);
  const year = Number(first(raw.year));
  if (!brandId || !modelId || !Number.isInteger(year)) return null;
  return { brandId, modelId, year };
}

/** Longest sub-model / engine-size text kept from the URL or the form. */
export const TRIM_MAX = 60;

/**
 * Optional free-text sub-model / engine size (X8). Plain text only: control characters and angle
 * brackets are removed, whitespace collapsed, capped at TRIM_MAX. Empty means absent. Never stored
 * server-side and never used for pricing or matching; it only travels in the URL and the LINE message.
 */
export function cleanTrim(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const text = value.replace(/[\u0000-\u001f\u007f-\u009f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, TRIM_MAX).trim();
  return text || undefined;
}

export function parseTrim(raw: RawParams): string | undefined {
  return cleanTrim(first(raw.trim));
}

export function parseUsage(raw: RawParams): UsageId | undefined {
  const u = first(raw.use);
  return usageIds.find((id) => id === u);
}

export function parsePriorities(raw: RawParams): PriorityId[] {
  const p = first(raw.p);
  if (!p) return [];
  const wanted = new Set(p.split(","));
  return priorityIds.filter((id) => wanted.has(id));
}

export function parsePlanIds(raw: RawParams): string[] {
  const v = first(raw.plans);
  if (!v) return [];
  return [...new Set(v.split(",").filter(Boolean))].slice(0, 3);
}

export function parseQuoteInput(raw: RawParams): QuoteInput | null {
  const vehicle = parseVehicle(raw);
  if (!vehicle) return null;
  return { vehicle, usage: parseUsage(raw), priorities: parsePriorities(raw) };
}

export interface JourneyState {
  vehicle?: VehicleSelection | null;
  /** Optional sub-model / engine size; see cleanTrim. */
  trim?: string;
  usage?: UsageId;
  priorities?: PriorityId[];
  plans?: string[];
  step?: string;
}

export function buildQuery(state: JourneyState): string {
  const sp = new URLSearchParams();
  if (state.vehicle) {
    sp.set("brand", state.vehicle.brandId);
    sp.set("model", state.vehicle.modelId);
    sp.set("year", String(state.vehicle.year));
    const trim = cleanTrim(state.trim);
    if (trim) sp.set("trim", trim);
  }
  if (state.usage) sp.set("use", state.usage);
  if (state.priorities && state.priorities.length > 0) sp.set("p", state.priorities.join(","));
  if (state.plans && state.plans.length > 0) sp.set("plans", state.plans.join(","));
  if (state.step) sp.set("step", state.step);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function withJourney(path: string, state: JourneyState): string {
  return `${path}${buildQuery(state)}`;
}

/** Where "select this plan" goes: online application when buying is switched on, otherwise the advisor form. */
export function selectPlanHref(productId: string, state: JourneyState, buyEnabled: boolean): string {
  return buyEnabled ? withJourney(`/buy/${productId}`, state) : withJourney("/advisor", { ...state, plans: [productId] });
}
