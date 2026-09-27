"use client";

// After a deploy, a tab opened on the previous build can request JS chunks or server actions that no
// longer exist, which surfaces as "Application error: a client-side exception". A single reload loads
// the current build. Guarded so a real bug can't cause a reload loop.

const KEY = "ui_stale_reload_at";
const WINDOW_MS = 60_000;

export function isStaleBuildError(error: unknown): boolean {
  const e = error as { name?: string; message?: string } | null;
  const text = `${e?.name ?? ""} ${e?.message ?? ""}`;
  return /ChunkLoadError|Loading (CSS )?chunk|dynamically imported module|Failed to find Server Action|Failed to fetch RSC payload|unexpected response was received from the server/i.test(text);
}

/** Reloads once per minute at most. Returns true if a reload was started. */
export function reloadForStaleBuild(): boolean {
  try {
    const last = Number(window.sessionStorage.getItem(KEY) ?? 0);
    if (Date.now() - last < WINDOW_MS) return false;
    window.sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Storage blocked: still reload once; the guard just can't persist.
  }
  window.location.reload();
  return true;
}
