// Edge rules used by worker.ts (Cloudflare review 2026-09-27, plan U1/U3/U4/U5). Pure functions so they
// can be unit-tested without the Workers runtime.

export const CANONICAL_HOST = "unlimitinsure.com";

/** 301 target for http:// or www. requests on our domain, else null. Other hosts are left alone. */
export function canonicalRedirect(url: URL): string | null {
  const ours = url.hostname === CANONICAL_HOST || url.hostname === `www.${CANONICAL_HOST}`;
  if (!ours || (url.protocol === "https:" && url.hostname === CANONICAL_HOST)) return null;
  const to = new URL(url.toString());
  to.protocol = "https:";
  to.hostname = CANONICAL_HOST;
  to.port = "";
  return to.toString();
}

export const SECURITY_HEADERS: Record<string, string> = {
  // One year since 2026-10-09 (one day from 2026-09-27, no problems; review plan, rollout step 5).
  // To withdraw: send max-age=0 for a while before removing the header.
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export const HTML_CACHE = "public, max-age=0, s-maxage=300, stale-while-revalidate=86400";

/**
 * Cache-Control for a response, or null to leave it unchanged. Shared-cacheable HTML (prebuilt pages,
 * which OpenNext marks s-maxage=1 year) gets a short cache; private/no-store responses keep theirs.
 */
export function htmlCacheControl(contentType: string | null, cacheControl: string | null): string | null {
  if (!contentType?.includes("text/html")) return null;
  if (/private|no-store/i.test(cacheControl ?? "")) return null;
  return HTML_CACHE;
}
