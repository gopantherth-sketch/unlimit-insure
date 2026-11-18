import { describe, expect, it } from "vitest";
import { advisorNoindex, canonicalRedirect, EDGE_PRIORITY_IDS, EDGE_USAGE_IDS, htmlCacheControl, HTML_CACHE, journeyRedirect, NEXT_VARY, prebuiltAsset, type PrebuiltPage } from "@/lib/edge";
import { parseQuoteInput, parseTrim, parseVehicle, selectPlanHref, withJourney } from "@/lib/params";
import { priorityIds, usageIds } from "@/lib/priorities";

describe("canonicalRedirect", () => {
  it("sends http and www to https://unlimitinsure.com, keeping path and query", () => {
    expect(canonicalRedirect(new URL("http://unlimitinsure.com/quote?x=1"))).toBe("https://unlimitinsure.com/quote?x=1");
    expect(canonicalRedirect(new URL("https://www.unlimitinsure.com/lab"))).toBe("https://unlimitinsure.com/lab");
    expect(canonicalRedirect(new URL("http://www.unlimitinsure.com/"))).toBe("https://unlimitinsure.com/");
  });
  it("leaves the canonical origin and other hosts alone", () => {
    expect(canonicalRedirect(new URL("https://unlimitinsure.com/"))).toBeNull();
    expect(canonicalRedirect(new URL("http://127.0.0.1:8787/"))).toBeNull();
    expect(canonicalRedirect(new URL("https://unlimit-insure.example.workers.dev/"))).toBeNull();
  });
});

describe("htmlCacheControl", () => {
  it("shortens shared caching of HTML", () => {
    expect(htmlCacheControl("text/html; charset=utf-8", "s-maxage=31536000")).toBe(HTML_CACHE);
    expect(htmlCacheControl("text/html", null)).toBe(HTML_CACHE);
  });
  it("keeps private/no-store and non-HTML responses as they are", () => {
    expect(htmlCacheControl("text/html", "private, no-cache, no-store, max-age=0, must-revalidate")).toBeNull();
    expect(htmlCacheControl("application/javascript", "public, max-age=31536000, immutable")).toBeNull();
    expect(htmlCacheControl(null, null)).toBeNull();
  });
});

describe("journeyRedirect (row 41) matches the Next.js pages", () => {
  const on = { journeyRedirects: true, purchaseEnabled: false };
  const req = (path: string, init?: RequestInit) => new Request("https://unlimitinsure.com" + path, init);
  // Like Next.js searchParams: a repeated key becomes an array, and the pages read its first value.
  const raw = (path: string) => {
    const sp = new URL("https://x" + path).searchParams;
    const out: Record<string, string | string[]> = {};
    for (const k of new Set(sp.keys())) {
      const all = sp.getAll(k);
      out[k] = all.length > 1 ? all : all[0]!;
    }
    return out;
  };
  const queries = [
    "",
    "?brand=toyota&model=toyota-corolla-cross&year=2022",
    "?brand=toyota&model=toyota-corolla-cross&year=2022&trim=%20%201.8%20Hybrid%20%3Cb%3EPremium%3C%2Fb%3E%20",
    "?brand=toyota&model=toyota-corolla-cross&year=2022&use=commute&p=flood,dealer,bogus&step=use",
    "?brand=toyota&model=toyota-corolla-cross&year=20x2&use=commute",
    "?brand=&model=a&year=2022",
    "?brand=a&model=b&year=2022&use=nope&p=&plans=a,b&from=home",
    "?brand=a&brand=b&model=c&year=2020&trim=" + "x".repeat(80),
  ];

  it("uses the same id lists as lib/priorities", () => {
    expect([...EDGE_USAGE_IDS]).toEqual(usageIds);
    expect([...EDGE_PRIORITY_IDS]).toEqual(priorityIds);
  });

  it("/quote, /quote/results, /compare, /plans/*: same target as the pages", () => {
    for (const q of queries) {
      const r = raw(q);
      const input = parseQuoteInput(r);
      expect(journeyRedirect(req("/quote" + q), on)).toEqual({ location: withJourney("/advisor", { vehicle: parseVehicle(r), trim: parseTrim(r) }), status: 308 });
      const results = withJourney("/advisor", input ? { vehicle: input.vehicle, trim: parseTrim(r), usage: input.usage, priorities: input.priorities } : {});
      expect(journeyRedirect(req("/quote/results" + q), on)).toEqual({ location: results, status: 308 });
      expect(journeyRedirect(req("/compare" + q), on)).toEqual({ location: results, status: 308 });
      expect(journeyRedirect(req("/plans/a-type1-dealer" + q), on)).toEqual({ location: "/advisor", status: 308 });
    }
  });

  it("/buy/* while purchase is off: same target as selectPlanHref", () => {
    for (const q of queries) {
      const r = raw(q);
      const input = parseQuoteInput(r);
      const want = selectPlanHref("a-type1-dealer", input ? { vehicle: input.vehicle, usage: input.usage, priorities: input.priorities } : {}, false);
      expect(journeyRedirect(req("/buy/a-type1-dealer" + q), on)).toEqual({ location: want, status: 307 });
      expect(journeyRedirect(req("/buy/a-type1-dealer" + q), { journeyRedirects: false, purchaseEnabled: false })).toEqual({ location: want, status: 307 });
    }
    expect(journeyRedirect(req("/buy/a-type1-dealer"), { journeyRedirects: true, purchaseEnabled: true })).toBeNull();
  });

  it("leaves everything else to Next.js", () => {
    expect(journeyRedirect(req("/quote"), { journeyRedirects: false, purchaseEnabled: false })).toBeNull();
    expect(journeyRedirect(req("/quote", { headers: { RSC: "1" } }), on)).toBeNull();
    expect(journeyRedirect(req("/quote", { method: "POST" }), on)).toBeNull();
    for (const p of ["/", "/advisor", "/quote/", "/quote/results/x", "/plans", "/plans/a/b", "/buy", "/compare/x", "/lab"]) expect(journeyRedirect(req(p), on)).toBeNull();
  });
});

describe("advisorNoindex (row 42)", () => {
  it("noindex only for /advisor with a non-empty query value", () => {
    const u = (p: string) => new URL("https://unlimitinsure.com" + p);
    expect(advisorNoindex(u("/advisor"))).toBe(false);
    expect(advisorNoindex(u("/advisor?"))).toBe(false);
    expect(advisorNoindex(u("/advisor?brand="))).toBe(false);
    expect(advisorNoindex(u("/advisor?brand=toyota"))).toBe(true);
    expect(advisorNoindex(u("/advisor?from=home"))).toBe(true);
    expect(advisorNoindex(u("/lab?x=1"))).toBe(false);
  });
});

describe("prebuiltAsset (row 43) follows OpenNext's cacheInterceptor", () => {
  const pages: Record<string, PrebuiltPage> = {
    "/": { file: "index", headers: { "x-nextjs-prerender": "1", "x-nextjs-stale-time": "300" }, segments: ["/_tree", "/!KHNpdGUp/__PAGE__"] },
    "/lab/flood-cover": { file: "lab/flood-cover", headers: { "x-nextjs-prerender": "1" }, segments: [] },
  };
  const req = (path: string, init: RequestInit = {}) => new Request(`https://unlimitinsure.com${path}`, init);

  it("serves the HTML for a plain page load, with or without a query", () => {
    expect(prebuiltAsset(req("/"), pages)).toEqual({
      asset: "/cdn-cgi/_prebuilt/index.html.bin",
      headers: { "x-nextjs-prerender": "1", "x-nextjs-stale-time": "300", Vary: NEXT_VARY, "Content-Type": "text/html; charset=utf-8" },
    });
    expect(prebuiltAsset(req("/lab/flood-cover?utm_source=x", { method: "HEAD" }), pages)?.asset).toBe("/cdn-cgi/_prebuilt/lab/flood-cover.html.bin");
    expect(prebuiltAsset(req("/", { headers: { rsc: "0" } }), pages)?.asset).toBe("/cdn-cgi/_prebuilt/index.html.bin");
  });

  it("serves the RSC payload and known segments, else leaves it to Next.js", () => {
    expect(prebuiltAsset(req("/?_rsc=1", { headers: { rsc: "1", "next-router-state-tree": "x" } }), pages)).toEqual({
      asset: "/cdn-cgi/_prebuilt/index.rsc.bin",
      headers: { "x-nextjs-prerender": "1", "x-nextjs-stale-time": "300", Vary: NEXT_VARY, "Content-Type": "text/x-component" },
    });
    expect(prebuiltAsset(req("/", { headers: { rsc: "1", "next-router-segment-prefetch": "/!KHNpdGUp/__PAGE__" } }), pages)).toEqual({
      asset: "/cdn-cgi/_prebuilt/index.segments/!KHNpdGUp/__PAGE__.segment.rsc.bin",
      headers: { "x-nextjs-prerender": "1", "x-nextjs-stale-time": "300", Vary: NEXT_VARY, "Content-Type": "text/x-component", "x-nextjs-postponed": "2" },
    });
    expect(prebuiltAsset(req("/", { headers: { rsc: "1", "next-router-segment-prefetch": "/nope" } }), pages)).toBeNull();
    expect(prebuiltAsset(req("/", { headers: { rsc: "1", "next-router-segment-prefetch": "" } }), pages)).toBeNull();
  });

  it("leaves everything else to Next.js", () => {
    expect(prebuiltAsset(req("/", { method: "POST" }), pages)).toBeNull();
    expect(prebuiltAsset(req("/", { headers: { "next-action": "abc" } }), pages)).toBeNull();
    expect(prebuiltAsset(req("/", { headers: { "x-prerender-revalidate": "1" } }), pages)).toBeNull();
    expect(prebuiltAsset(req("/", { headers: { cookie: "a=1; __prerender_bypass=x" } }), pages)).toBeNull();
    expect(prebuiltAsset(req("/lab/flood-cover/"), pages)).toBeNull();
    expect(prebuiltAsset(req("/LAB/flood-cover"), pages)).toBeNull();
    expect(prebuiltAsset(req("/lab/flood%2Dcover"), pages)).toBeNull();
    expect(prebuiltAsset(req("/garage"), pages)).toBeNull();
    expect(prebuiltAsset(req("/hasOwnProperty"), pages)).toBeNull();
  });
});
