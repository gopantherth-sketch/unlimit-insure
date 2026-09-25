/** Public site origin. Set NEXT_PUBLIC_SITE_URL at build time once the domain is chosen. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
