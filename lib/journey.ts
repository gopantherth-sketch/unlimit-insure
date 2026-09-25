"use client";

// Per-browser journey memory for the advisor handoff (PROJECT_MASTER.md §22).
// Session storage only: never sent anywhere until the user submits the advisor form.

const KEY = "unlimit.journey.v1";

export interface JourneyMemory {
  viewedPlanIds: string[];
  comparedPlanIds: string[];
}

const empty: JourneyMemory = { viewedPlanIds: [], comparedPlanIds: [] };

export function readJourney(): JourneyMemory {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return { ...empty };
    const parsed = JSON.parse(raw) as Partial<JourneyMemory>;
    return {
      viewedPlanIds: Array.isArray(parsed.viewedPlanIds) ? parsed.viewedPlanIds.filter((x) => typeof x === "string") : [],
      comparedPlanIds: Array.isArray(parsed.comparedPlanIds) ? parsed.comparedPlanIds.filter((x) => typeof x === "string") : [],
    };
  } catch {
    return { ...empty };
  }
}

function write(m: JourneyMemory) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    // Storage unavailable (private mode, blocked). The journey still works without memory.
  }
}

const merge = (a: string[], b: string[]) => [...new Set([...a, ...b])].slice(-30);

export function rememberViewed(ids: string[]) {
  const m = readJourney();
  write({ ...m, viewedPlanIds: merge(m.viewedPlanIds, ids) });
}

export function rememberCompared(ids: string[]) {
  const m = readJourney();
  write({ ...m, comparedPlanIds: ids.slice(0, 3), viewedPlanIds: merge(m.viewedPlanIds, ids) });
}
