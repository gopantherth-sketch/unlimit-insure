import { describe, expect, it } from "vitest";
import { canonicalRedirect, htmlCacheControl, HTML_CACHE } from "@/lib/edge";

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
