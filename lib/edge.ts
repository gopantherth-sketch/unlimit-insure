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

// ---------------------------------------------------------------------------------------------------
// Old journey redirects at the edge (CLEAR row 41, docs/cpu-proposal.md #1).
// While no insurance products are published, /quote, /quote/results, /compare and /plans/* only send the
// visitor to /advisor, and /buy/* does the same while online purchase is off. Next.js answers these
// after booting and reading D1 (22–37 ms CPU live); here they cost ~1 ms.
// This file has no imports on purpose (it is frozen alone into release candidates), so the few journey
// rules below repeat lib/params.ts. lib/edge.test.ts checks they give exactly the same URLs.

/** Same lists as lib/priorities.ts (usageIds, priorityIds); edge.test.ts keeps them equal. */
export const EDGE_USAGE_IDS = ["commute", "weekend", "upcountry", "second", "family"] as const;
export const EDGE_PRIORITY_IDS = ["dealer", "lowPremium", "noExcess", "flood", "replacementCar", "highCoverage", "roadside", "evBattery"] as const;
const TRIM_MAX = 60;

function edgeTrim(value: string | null): string | undefined {
  if (!value) return undefined;
  const text = value.replace(/[\u0000-\u001f\u007f-\u009f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, TRIM_MAX).trim();
  return text || undefined;
}

function edgeVehicle(sp: URLSearchParams): { brand: string; model: string; year: number } | null {
  const brand = sp.get("brand");
  const model = sp.get("model");
  const year = Number(sp.get("year"));
  if (!brand || !model || !Number.isInteger(year)) return null;
  return { brand, model, year };
}

function advisorUrl(parts: { car?: { brand: string; model: string; year: number } | null; trim?: string; use?: string; p?: string[]; plans?: string[] }): string {
  const q = new URLSearchParams();
  if (parts.car) {
    q.set("brand", parts.car.brand);
    q.set("model", parts.car.model);
    q.set("year", String(parts.car.year));
    if (parts.trim) q.set("trim", parts.trim);
  }
  if (parts.use) q.set("use", parts.use);
  if (parts.p && parts.p.length) q.set("p", parts.p.join(","));
  if (parts.plans && parts.plans.length) q.set("plans", parts.plans.join(","));
  const s = q.toString();
  return `/advisor${s ? `?${s}` : ""}`;
}

/**
 * Redirect for an old journey page, or null to let Next.js answer.
 * - `journeyRedirects`: no insurance products are published (wrangler.jsonc var JOURNEY_REDIRECTS = "1").
 * - `purchaseEnabled`: PURCHASE_ENABLED = "true".
 * Only plain page loads: Next.js client navigations (RSC header) and non-GET requests go to Next.js.
 */
export function journeyRedirect(request: Request, opts: { journeyRedirects: boolean; purchaseEnabled: boolean }): { location: string; status: 307 | 308 } | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (request.headers.has("RSC") || request.headers.has("Next-Router-State-Tree")) return null;
  const url = new URL(request.url);
  const path = url.pathname;
  const sp = url.searchParams;
  const car = edgeVehicle(sp);
  const u = sp.get("use");
  const use = EDGE_USAGE_IDS.find((id) => id === u);
  const wanted = new Set((sp.get("p") ?? "").split(","));
  const p = sp.get("p") ? EDGE_PRIORITY_IDS.filter((id) => wanted.has(id)) : [];

  if (!opts.purchaseEnabled) {
    const m = /^\/buy\/([^/]+)$/.exec(path);
    if (m) {
      let productId: string;
      try {
        productId = decodeURIComponent(m[1]!);
      } catch {
        return null;
      }
      // Same as /buy: selectPlanHref(productId, { vehicle, usage, priorities }, false) — no sub-model.
      return { location: advisorUrl(car ? { car, use, p, plans: [productId] } : { plans: [productId] }), status: 307 };
    }
  }
  if (!opts.journeyRedirects) return null;
  if (path === "/quote") return { location: advisorUrl({ car, trim: edgeTrim(sp.get("trim")) }), status: 308 };
  if (path === "/quote/results" || path === "/compare") {
    return { location: advisorUrl(car ? { car, trim: edgeTrim(sp.get("trim")), use, p } : {}), status: 308 };
  }
  if (/^\/plans\/[^/]+$/.test(path)) return { location: "/advisor", status: 308 };
  return null;
}

/**
 * /advisor is prebuilt (CLEAR row 42), so its noindex for journey URLs moved here: any non-empty query value
 * means the URL carries one visitor's car or plan picks (same rule the page metadata used).
 */
export function advisorNoindex(url: URL): boolean {
  if (url.pathname !== "/advisor") return false;
  for (const v of url.searchParams.values()) if (v !== "") return true;
  return false;
}

// ---------------------------------------------------------------------------------------------------
// Prebuilt pages straight from static assets (CLEAR row 43).
// On Next 16 each prebuilt page's OpenNext cache entry is one JSON file of up to ~640 KB (HTML + RSC +
// segment prefetch data). Cache interception parses all of it and hashes the body on every request:
// 8–10 ms CPU live for `/`. scripts/prebuilt-pages.mjs copies the same files Next.js wrote for each page
// into the assets folder, and the worker streams them, mirroring OpenNext's cacheInterceptor.

/** One prebuilt page, written by scripts/prebuilt-pages.mjs into .open-next/prebuilt-pages.mjs. */
export interface PrebuiltPage {
  /** Asset file stem, e.g. "index" or "lab/flood-cover". */
  file: string;
  /** Headers Next.js stored with the page (x-nextjs-prerender, x-nextjs-stale-time). */
  headers: Record<string, string>;
  /** Segment prefetch keys with a file, e.g. "/_tree". */
  segments: string[];
}

export const PREBUILT_ASSET_DIR = "/cdn-cgi/_prebuilt/";
/** Same as OpenNext's cacheInterceptor (routes manifest rsc.varyHeader). */
export const NEXT_VARY = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";

/** Asset key for a segment, e.g. "/!KHNpdGUp/__PAGE__" → "!KHNpdGUp/__PAGE__". The file is <file>.segments/<key>.segment.rsc. */
export function segmentAssetKey(segment: string): string {
  return segment.replace(/^\//, "");
}

/**
 * The asset to answer with and its headers, or null to let OpenNext answer. Same rules as OpenNext's
 * cacheInterceptor for a prebuilt app page with no revalidation:
 * - GET or HEAD only, no server action, no revalidation request, no draft-mode cookie;
 * - exact path only (a trailing slash or other spelling goes to Next.js, which redirects or 404s);
 * - `RSC: 1` gets the RSC payload; with `Next-Router-Segment-Prefetch` it gets that segment, or Next.js
 *   when the page has no such segment.
 */
export function prebuiltAsset(request: Request, pages: Record<string, PrebuiltPage>): { asset: string; headers: Record<string, string> } | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const h = request.headers;
  if (h.get("next-action") || h.get("x-prerender-revalidate")) return null;
  const cookie = h.get("cookie") ?? "";
  if (cookie.includes("__prerender_bypass") || cookie.includes("__next_preview_data")) return null;
  const path = new URL(request.url).pathname;
  if (!Object.hasOwn(pages, path)) return null;
  const page = pages[path]!;
  const headers: Record<string, string> = { ...page.headers, Vary: NEXT_VARY };
  if (h.get("rsc") !== "1") {
    return { asset: `${PREBUILT_ASSET_DIR}${page.file}.html.bin`, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } };
  }
  const segment = h.get("next-router-segment-prefetch");
  if (segment !== null) {
    if (!page.segments.includes(segment)) return null;
    return {
      asset: `${PREBUILT_ASSET_DIR}${page.file}.segments/${segmentAssetKey(segment)}.segment.rsc.bin`,
      headers: { ...headers, "Content-Type": "text/x-component", "x-nextjs-prerender": "1", "x-nextjs-postponed": "2" },
    };
  }
  return { asset: `${PREBUILT_ASSET_DIR}${page.file}.rsc.bin`, headers: { ...headers, "Content-Type": "text/x-component" } };
}
