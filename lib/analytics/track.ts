"use client";

import type { EventName } from "@/lib/analytics/events";

// Anonymous, cookie-free counters. Honors Do Not Track / Global Privacy Control.

function optedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

export function track(name: EventName, dim?: string): void {
  if (optedOut()) return;
  const body = JSON.stringify(dim ? { name, dim } : { name });
  try {
    if (navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) return;
  } catch {
    // fall through to fetch
  }
  void fetch("/api/events", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}
