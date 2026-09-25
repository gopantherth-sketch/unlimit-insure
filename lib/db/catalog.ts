import { asc, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { insurers, productVersions, products, vehicleBrands, vehicleModels, type VersionStatus } from "@/lib/db/schema";
import type { Catalog, Product, ProductVersion } from "@/lib/types";

type VersionRow = typeof productVersions.$inferSelect;

export function toProductVersion(r: VersionRow): ProductVersion {
  return {
    id: r.id,
    productId: r.productId,
    version: r.version,
    effectiveFrom: r.effectiveFrom,
    effectiveUntil: r.effectiveUntil,
    coverage: r.coverage,
    pricing: r.pricing,
    eligibility: r.eligibility,
    benefits: r.benefits,
    suitableFor: r.suitableFor,
    source: {
      status: r.sourceStatus,
      documentName: r.sourceDocumentName,
      ...(r.sourcePage !== null && { page: r.sourcePage }),
      ...(r.verifiedBy !== null && { verifiedBy: r.verifiedBy }),
      ...(r.verifiedAt !== null && { verifiedAt: r.verifiedAt }),
      ...(r.sourceNote !== null && { note: r.sourceNote }),
    },
  };
}

/** Public catalogue: active insurers and products, published versions only. */
export async function loadCatalog(db: Database): Promise<Catalog> {
  const [insurerRows, brandRows, modelRows, productRows, versionRows] = await Promise.all([
    db.select().from(insurers).where(eq(insurers.active, true)).orderBy(asc(insurers.id)),
    db.select().from(vehicleBrands).orderBy(asc(vehicleBrands.name)),
    db.select().from(vehicleModels).orderBy(asc(vehicleModels.name)),
    db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.id)),
    db.select().from(productVersions).where(eq(productVersions.status, "published" satisfies VersionStatus)).orderBy(asc(productVersions.version)),
  ]);

  const activeInsurers = new Set(insurerRows.map((i) => i.id));
  const versionsByProduct = new Map<string, ProductVersion[]>();
  for (const v of versionRows) {
    const list = versionsByProduct.get(v.productId) ?? [];
    list.push(toProductVersion(v));
    versionsByProduct.set(v.productId, list);
  }

  const productList: Product[] = productRows
    .filter((p) => activeInsurers.has(p.insurerId))
    .map((p) => ({ id: p.id, insurerId: p.insurerId, name: p.name, summary: p.summary, versions: versionsByProduct.get(p.id) ?? [] }))
    .filter((p) => p.versions.length > 0);

  return {
    insurers: insurerRows.map((i) => ({
      id: i.id,
      name: i.name,
      shortName: i.shortName,
      accent: i.accent,
      ...(i.claimsHotline !== null && { claimsHotline: i.claimsHotline }),
    })),
    brands: brandRows.map((b) => ({ id: b.id, name: b.name, nameTh: b.nameTh })),
    models: modelRows.map((m) => ({
      id: m.id,
      brandId: m.brandId,
      name: m.name,
      bodyType: m.bodyType,
      powertrain: m.powertrain,
      newPrice: m.newPrice,
      yearFrom: m.yearFrom,
      yearTo: m.yearTo,
    })),
    products: productList,
  };
}

/** Insert a whole catalogue, all versions published. Used for the mock seed and tests. */
export async function seedCatalog(db: Database, catalog: Catalog): Promise<void> {
  if (catalog.insurers.length) {
    await db.insert(insurers).values(
      catalog.insurers.map((i) => ({ id: i.id, name: i.name, shortName: i.shortName, accent: i.accent, claimsHotline: i.claimsHotline ?? null })),
    );
  }
  if (catalog.brands.length) await db.insert(vehicleBrands).values(catalog.brands);
  if (catalog.models.length) await db.insert(vehicleModels).values(catalog.models);
  for (const p of catalog.products) {
    const type = p.versions[p.versions.length - 1]?.coverage.insuranceType ?? "type1";
    await db.insert(products).values({ id: p.id, insurerId: p.insurerId, name: p.name, summary: p.summary, insuranceType: type });
    for (const v of p.versions) {
      await db.insert(productVersions).values({
        id: v.id,
        productId: p.id,
        version: v.version,
        status: "published",
        effectiveFrom: v.effectiveFrom,
        effectiveUntil: v.effectiveUntil,
        coverage: v.coverage,
        pricing: v.pricing,
        eligibility: v.eligibility,
        benefits: v.benefits,
        suitableFor: v.suitableFor,
        sourceStatus: v.source.status,
        sourceDocumentName: v.source.documentName,
        sourcePage: v.source.page ?? null,
        sourceNote: v.source.note ?? null,
        verifiedBy: v.source.verifiedBy ?? null,
        verifiedAt: v.source.verifiedAt ?? null,
        publishedAt: new Date().toISOString(),
      });
    }
  }
}
