import { eq, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { insurers, productVersions, products, vehicleBrands, vehicleModels } from "@/lib/db/schema";
import type { ImportPlan } from "@/lib/import/validate";

export interface ImportSummary {
  insurersUpserted: number;
  brandsUpserted: number;
  modelsUpserted: number;
  productsCreated: number;
  productsUpdated: number;
  versionsCreated: number;
  /** Rows identical to an existing version (same start date and terms): not imported again. */
  versionsSkipped: { productId: string; effectiveFrom: string; existingVersion: number }[];
}

/** Key-order-independent JSON equality (stored JSON may come from other writers with different key order). */
function canonical(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.keys(v as object).sort().map((k) => [k, canonical((v as Record<string, unknown>)[k])]));
  }
  return v;
}
const same = (a: unknown, b: unknown) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

/**
 * Apply a validated plan. Insurers and vehicles are upserted. Every product row becomes a NEW draft
 * version with a pending source, so nothing reaches customers until an admin verifies and publishes it.
 * Published versions are never modified.
 */
export async function applyImport(db: Database, plan: ImportPlan): Promise<ImportSummary> {
  if (plan.errors.length > 0) throw new Error("Import plan has errors");
  const summary: ImportSummary = {
    insurersUpserted: 0,
    brandsUpserted: 0,
    modelsUpserted: 0,
    productsCreated: 0,
    productsUpdated: 0,
    versionsCreated: 0,
    versionsSkipped: [],
  };

  for (const i of plan.insurers) {
    await db
      .insert(insurers)
      .values(i)
      .onConflictDoUpdate({ target: insurers.id, set: { name: i.name, shortName: i.shortName, accent: i.accent, claimsHotline: i.claimsHotline } });
    summary.insurersUpserted++;
  }
  for (const b of plan.brands) {
    await db.insert(vehicleBrands).values(b).onConflictDoUpdate({ target: vehicleBrands.id, set: { name: b.name, nameTh: b.nameTh } });
    summary.brandsUpserted++;
  }
  for (const m of plan.models) {
    const { id: _id, ...rest } = m;
    await db.insert(vehicleModels).values(m).onConflictDoUpdate({ target: vehicleModels.id, set: rest });
    summary.modelsUpserted++;
  }

  for (const v of plan.versions) {
    const [existing] = await db.select().from(products).where(eq(products.id, v.productId)).limit(1);
    if (!existing) {
      await db.insert(products).values({ id: v.productId, insurerId: v.insurerId, name: v.productName, summary: v.productSummary, insuranceType: v.insuranceType });
      summary.productsCreated++;
    } else if (existing.name !== v.productName || existing.summary !== v.productSummary || existing.insuranceType !== v.insuranceType) {
      await db.update(products).set({ name: v.productName, summary: v.productSummary, insuranceType: v.insuranceType }).where(eq(products.id, v.productId));
      summary.productsUpdated++;
    }

    const versions = await db.select().from(productVersions).where(eq(productVersions.productId, v.productId));
    const duplicate = versions.find(
      (x) =>
        x.effectiveFrom === v.effectiveFrom &&
        x.effectiveUntil === v.effectiveUntil &&
        same(x.coverage, v.coverage) &&
        same(x.pricing, v.pricing) &&
        same(x.eligibility, v.eligibility) &&
        same(x.benefits, v.benefits),
    );
    if (duplicate) {
      summary.versionsSkipped.push({ productId: v.productId, effectiveFrom: v.effectiveFrom, existingVersion: duplicate.version });
      continue;
    }

    const [{ next } = { next: 1 }] = await db
      .select({ next: sql<number>`coalesce(max(${productVersions.version}), 0) + 1` })
      .from(productVersions)
      .where(eq(productVersions.productId, v.productId));
    const version = Number(next);
    await db.insert(productVersions).values({
      id: `${v.productId}-v${version}`,
      productId: v.productId,
      version,
      status: "draft",
      effectiveFrom: v.effectiveFrom,
      effectiveUntil: v.effectiveUntil,
      coverage: v.coverage,
      pricing: v.pricing,
      eligibility: v.eligibility,
      benefits: v.benefits,
      suitableFor: v.suitableFor,
      sourceStatus: "pending",
      sourceDocumentName: v.sourceDocumentName,
      sourcePage: v.sourcePage,
      sourceNote: v.sourceNote,
    });
    summary.versionsCreated++;
  }
  return summary;
}
