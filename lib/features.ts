// Build-time switches (safe in client and server components). Server-side runtime flags live in
// lib/server/features.ts.

/**
 * Show premiums and estimated car values. Off until real rate tables replace the mock catalogue:
 * customers get real prices through LINE or phone instead (owner decision 2026-09-26).
 */
export const SHOW_PRICES = false;

/** My Garage, renewal reminders and other after-purchase features that need the back office. */
export const SHOW_AFTER_PURCHASE = false;

/**
 * Read the plan catalogue from code (lib/data, the same data seeded into D1) instead of D1, so public
 * pages can be prebuilt and served with little CPU on the Workers Free plan. Turn off when real
 * products are imported and published through admin (task C4): admin changes only reach the site
 * with this off.
 */
export const CATALOG_FROM_CODE = true;

/** Partner insurer logo strip: only with licensed logos and permission (task D4). */
export const SHOW_PARTNER_LOGOS = false;
