import type { Catalog } from "@/lib/types";

/** Public pages never read mock or pending product versions. */
export function publicCatalog(catalog: Catalog, enabled: boolean): Catalog {
  return {
    ...catalog,
    products: enabled
      ? catalog.products
          .map((product) => ({ ...product, versions: product.versions.filter((version) => version.source.status === "verified") }))
          .filter((product) => product.versions.length > 0)
      : [],
  };
}
