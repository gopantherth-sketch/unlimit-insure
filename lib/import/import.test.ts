import readXlsxFile from "read-excel-file/node";
import { beforeEach, describe, expect, it } from "vitest";
import { mockCatalog } from "@/lib/data";
import { loadCatalog } from "@/lib/db/catalog";
import { applyImport } from "@/lib/db/import";
import { listProductsWithVersions, markVersionVerified, setVersionStatus } from "@/lib/db/products-admin";
import { createTestDb } from "@/lib/db/testing";
import { catalogToWorkbook } from "@/lib/import/export";
import { checkHeaders, rowsFromSheet, validateWorkbook, type CellValue, type RawRow, type RawWorkbook } from "@/lib/import/validate";
import { importSheets, productSheet } from "@/lib/import/columns";

const byId = <T extends { id: string }>(xs: T[]) => [...xs].sort((a, b) => a.id.localeCompare(b.id));

/** Same conversion the admin upload does in the browser. */
async function readWorkbook(path: string): Promise<RawWorkbook> {
  const sheets = await readXlsxFile(path);
  const wb: RawWorkbook = {};
  for (const def of importSheets) {
    const s = sheets.find((x) => x.sheet === def.name);
    if (!s) continue;
    const data = s.data.map((r) => r.map((c) => (c instanceof Date ? c.toISOString().slice(0, 10) : (c as CellValue))));
    const { headers, rows } = rowsFromSheet(data);
    expect(checkHeaders(def, headers).filter((i) => i.message !== "คอลัมน์ที่ไม่รู้จัก จะถูกข้าม")).toEqual([]);
    wb[def.name] = rows;
  }
  return wb;
}

let db: ReturnType<typeof createTestDb>["db"];
beforeEach(() => {
  db = createTestDb().db;
});

describe("import", () => {
  it("round-trips the example workbook into drafts, then publishes to the same catalogue", async () => {
    const wb = await readWorkbook("docs/examples/product-import-example.xlsx");
    const plan = validateWorkbook(wb, { existingInsurerIds: [] });
    expect(plan.errors).toEqual([]);
    expect(plan.versions).toHaveLength(mockCatalog.products.flatMap((p) => p.versions).length);

    const summary = await applyImport(db, plan);
    expect(summary.versionsCreated).toBe(plan.versions.length);
    expect((await loadCatalog(db)).products).toHaveLength(0); // drafts are not public

    for (const p of await listProductsWithVersions(db)) {
      for (const v of p.versions) {
        expect(await setVersionStatus(db, v.id, "published")).toBe("not_verified");
        await markVersionVerified(db, { versionId: v.id, documentName: v.sourceDocumentName, page: null, verifiedBy: "test" });
        expect(await setVersionStatus(db, v.id, "published")).toBe("ok");
      }
    }
    const c = await loadCatalog(db);
    expect(byId(c.models)).toEqual(byId(mockCatalog.models));
    const strip = (cat: typeof c) =>
      byId(cat.products).map((p) => ({ ...p, versions: p.versions.map(({ id: _id, source: _s, ...rest }) => rest) }));
    expect(strip(c)).toEqual(strip(mockCatalog));
  });

  it("skips rows identical to an existing version and appends new versions", async () => {
    const wb = catalogToWorkbook(mockCatalog);
    await applyImport(db, validateWorkbook(wb, { existingInsurerIds: [] }));
    const again = await applyImport(db, validateWorkbook(wb, { existingInsurerIds: [] }));
    expect(again.versionsCreated).toBe(0);
    expect(again.versionsSkipped.length).toBeGreaterThan(0);

    const next: RawRow = { ...wb.products[0]!, effective_from: "2028-01-01", effective_until: "2028-12-31", excess: 1000 };
    const res = await applyImport(db, validateWorkbook({ products: [next] }, { existingInsurerIds: ["ins-a", "ins-b", "ins-c"] }));
    expect(res.versionsCreated).toBe(1);
    const p = (await listProductsWithVersions(db)).find((x) => x.id === next.product_id);
    expect(p?.versions.map((v) => v.version)).toEqual([1, 2, 3]);
    expect(p?.versions[2]).toMatchObject({ status: "draft", sourceStatus: "pending" });
  });

  it("recognises an unchanged catalogue seeded by other code as duplicates", async () => {
    const { seedCatalog } = await import("@/lib/db/catalog");
    await seedCatalog(db, mockCatalog);
    const res = await applyImport(db, validateWorkbook(catalogToWorkbook(mockCatalog), { existingInsurerIds: [] }));
    expect(res.versionsCreated).toBe(0);
    expect(res.versionsSkipped).toHaveLength(mockCatalog.products.flatMap((p) => p.versions).length);
  });

  it("reports row-level errors in Thai with column names", () => {
    const row = { ...catalogToWorkbook(mockCatalog).products[0]! };
    const plan = validateWorkbook(
      {
        products: [
          { ...row, insurer_id: "nope", flood: "maybe", effective_until: "2020-01-01", rate_percent: 50 },
          { ...row, pricing_kind: "fixed", premium_suv: null },
        ],
      },
      { existingInsurerIds: [] },
    );
    const cols = plan.errors.map((e) => `${e.row}:${e.column}`);
    expect(cols).toEqual(expect.arrayContaining(["2:flood"]));
    expect(plan.versions).toHaveLength(0);
    const second = validateWorkbook({ products: [{ ...row, insurer_id: "nope", effective_until: "2020-01-01", rate_percent: 50 }] }, { existingInsurerIds: [] });
    expect(second.errors.map((e) => e.column).sort()).toEqual(["effective_until", "insurer_id", "rate_percent"]);
    const fixed = validateWorkbook({ products: [{ ...row, pricing_kind: "fixed", rate_percent: null }] }, { existingInsurerIds: ["ins-a"] });
    expect(fixed.errors.map((e) => e.column)).toContain("premium_suv");
  });

  it("flags implausible coverage as warnings, not errors", () => {
    const row = catalogToWorkbook(mockCatalog).products.find((r) => r.insurance_type === "type2plus")!;
    const plan = validateWorkbook({ products: [{ ...row, collision_no_counterparty: "Y" }] }, { existingInsurerIds: ["ins-a"] });
    expect(plan.errors).toEqual([]);
    expect(plan.warnings.map((w) => w.column)).toEqual(["collision_no_counterparty"]);
  });

  it("template has every column in order", async () => {
    const sheets = await readXlsxFile("public/templates/unlimit-product-import.xlsx");
    const products = sheets.find((s) => s.sheet === "products")!;
    expect(products.data[0]).toEqual(productSheet.columns.map((c) => c.key));
  });
});
