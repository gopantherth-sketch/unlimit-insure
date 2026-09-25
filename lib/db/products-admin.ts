import { asc, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { insurers, productVersions, products, type VersionStatus } from "@/lib/db/schema";

export async function listProductsWithVersions(db: Database) {
  const [productRows, versionRows, insurerRows] = await Promise.all([
    db.select().from(products).orderBy(asc(products.id)),
    db.select().from(productVersions).orderBy(asc(productVersions.version)),
    db.select().from(insurers),
  ]);
  return productRows.map((p) => ({
    ...p,
    insurer: insurerRows.find((i) => i.id === p.insurerId) ?? null,
    versions: versionRows.filter((v) => v.productId === p.id),
  }));
}

export async function getProductWithVersions(db: Database, productId: string) {
  const all = await listProductsWithVersions(db);
  return all.find((p) => p.id === productId) ?? null;
}

export interface VerifyInput {
  versionId: string;
  documentName: string;
  page: number | null;
  verifiedBy: string;
}

/** Record who checked a version's facts against which document. */
export async function markVersionVerified(db: Database, input: VerifyInput): Promise<void> {
  await db
    .update(productVersions)
    .set({
      sourceStatus: "verified",
      sourceDocumentName: input.documentName,
      sourcePage: input.page,
      verifiedBy: input.verifiedBy,
      verifiedAt: new Date().toISOString().slice(0, 10),
      sourceNote: null,
    })
    .where(eq(productVersions.id, input.versionId));
}

export type PublishResult = "ok" | "not_found" | "not_verified";

/** Publishing requires verified sources, except mock data kept for the prototype. */
export async function setVersionStatus(db: Database, versionId: string, status: VersionStatus): Promise<PublishResult> {
  const [v] = await db.select().from(productVersions).where(eq(productVersions.id, versionId)).limit(1);
  if (!v) return "not_found";
  if (status === "published" && v.sourceStatus === "pending") return "not_verified";
  await db
    .update(productVersions)
    .set({ status, ...(status === "published" && { publishedAt: new Date().toISOString() }) })
    .where(eq(productVersions.id, versionId));
  return "ok";
}
