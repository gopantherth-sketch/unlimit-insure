import { describe, expect, it } from "vitest";
import { mockCatalog } from "@/lib/data";
import { publicCatalog } from "@/lib/public-catalog";

describe("publicCatalog", () => {
  it("keeps the back-office catalogue intact while public products are off", () => {
    expect(publicCatalog(mockCatalog, false).products).toEqual([]);
    expect(mockCatalog.products.length).toBeGreaterThan(0);
  });

  it("excludes every mock product when public products are enabled", () => {
    expect(publicCatalog(mockCatalog, true).products).toEqual([]);
  });

  it("shows only verified versions of a product", () => {
    const product = mockCatalog.products[0]!;
    const verifiedVersion = { ...product.versions[0]!, source: { ...product.versions[0]!.source, status: "verified" as const } };
    const catalog = { ...mockCatalog, products: [{ ...product, versions: [verifiedVersion, ...product.versions.slice(1)] }] };
    const published = publicCatalog(catalog, true);
    expect(published.products).toHaveLength(1);
    expect(published.products[0]?.versions).toEqual([verifiedVersion]);
    expect(catalog.products[0]?.versions).toHaveLength(product.versions.length);
  });
});
