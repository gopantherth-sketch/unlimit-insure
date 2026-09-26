// Build-time switches (safe in client and server components). Server-side runtime flags live in
// lib/server/features.ts.

/**
 * Show premiums and estimated car values. Off until real rate tables replace the mock catalogue:
 * customers get real prices through LINE or phone instead (owner decision 2026-09-26).
 */
export const SHOW_PRICES = false;

/** My Garage, renewal reminders and other after-purchase features that need the back office. */
export const SHOW_AFTER_PURCHASE = false;
