import { cache } from "react";
import { mockCatalog } from "@/lib/data";
import { loadCatalog } from "@/lib/db/catalog";
import { getDb } from "@/lib/db/client";
import { CATALOG_FROM_CODE } from "@/lib/features";
import type { Catalog, VehicleCatalog } from "@/lib/types";

const byName = <T extends { name: string }>(a: T, b: T) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
const byId = <T extends { id: string }>(a: T, b: T) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** The code catalogue (the same data seeded into D1), in the order loadCatalog returns. */
const codeCatalog: Catalog = {
  insurers: [...mockCatalog.insurers].sort(byId),
  brands: [...mockCatalog.brands].sort(byName),
  models: [...mockCatalog.models].sort(byName),
  products: [...mockCatalog.products].sort(byId).map((p) => ({ ...p, versions: [...p.versions].sort((a, b) => a.version - b.version) })),
};

/**
 * Published catalogue, loaded once per request: from code while CATALOG_FROM_CODE is on (pages can be
 * prebuilt and use no D1 query), otherwise from D1.
 */
export const getCatalog = cache(async (): Promise<Catalog> => (CATALOG_FROM_CODE ? codeCatalog : loadCatalog(await getDb())));

export async function getVehicleCatalog(): Promise<VehicleCatalog> {
  const { brands, models } = await getCatalog();
  return { brands, models };
}
