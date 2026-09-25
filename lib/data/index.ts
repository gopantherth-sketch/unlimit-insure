import { insurers } from "@/lib/data/insurers";
import { products } from "@/lib/data/products";
import { brands, models } from "@/lib/data/vehicles";
import type { Catalog } from "@/lib/types";

/** MOCK catalogue: the seed for local databases and the fixture for engine tests. Never imported by app code. */
export const mockCatalog: Catalog = { insurers, products, brands, models };
