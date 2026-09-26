/** Production domain (owner, 2026-09-26). Served by the Worker as a custom domain (wrangler.jsonc). */
const PRODUCTION_URL = "https://unlimitinsure.com";

/** Public site origin for canonical URLs, sitemap and robots. NEXT_PUBLIC_SITE_URL overrides at build time. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000")
).replace(/\/$/, "");
