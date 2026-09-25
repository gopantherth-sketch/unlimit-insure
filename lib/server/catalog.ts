import { cache } from "react";
import { loadCatalog } from "@/lib/db/catalog";
import { getDb } from "@/lib/db/client";
import type { Catalog, VehicleCatalog } from "@/lib/types";

/** Published catalogue from D1, loaded once per request. */
export const getCatalog = cache(async (): Promise<Catalog> => loadCatalog(await getDb()));

export async function getVehicleCatalog(): Promise<VehicleCatalog> {
  const { brands, models } = await getCatalog();
  return { brands, models };
}
