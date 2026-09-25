// Builds the xlsx import template (empty) and an example workbook (MOCK catalogue).
// Usage: npm run import:template
import ExcelJS from "exceljs";
import { mockCatalog } from "@/lib/data";
import { importSheets, type SheetDef } from "@/lib/import/columns";
import { catalogToWorkbook } from "@/lib/import/export";
import type { RawRow } from "@/lib/import/validate";

const BRAND = "FF1016D1";

function readme(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet("README");
  ws.columns = [{ width: 28 }, { width: 34 }, { width: 16 }, { width: 10 }, { width: 60 }];
  const lines = [
    ["Unlimit Insure — แม่แบบนำเข้าข้อมูลแพ็กเกจ"],
    [],
    ["วิธีใช้"],
    ["1. กรอกชีต insurers (บริษัท), vehicles (รุ่นรถ) และ products (หนึ่งแถว = หนึ่งเวอร์ชันของแพ็กเกจ)"],
    ["2. แถวที่ 1 ของแต่ละชีตเป็นชื่อคอลัมน์ ห้ามแก้ กรอกข้อมูลตั้งแต่แถวที่ 2"],
    ["3. อัปโหลดที่หน้า ผู้ดูแล → นำเข้าข้อมูล ระบบจะตรวจทุกแถวก่อนนำเข้า"],
    ["4. แพ็กเกจที่นำเข้าเป็นฉบับร่างเสมอ ต้องตรวจกับเอกสารอ้างอิงและกดเผยแพร่ก่อนแสดงบนเว็บ"],
    ["5. เพิ่มเวอร์ชันใหม่ของแพ็กเกจเดิม: ใช้ product_id เดิม และวันที่มีผลใหม่ ห้ามแก้เวอร์ชันที่เผยแพร่แล้ว"],
    [],
    ["ชีต", "คอลัมน์", "ชนิด", "จำเป็น", "คำอธิบาย"],
  ];
  for (const l of lines) ws.addRow(l);
  ws.getRow(1).font = { bold: true, size: 14, color: { argb: BRAND } };
  ws.getRow(3).font = { bold: true };
  ws.getRow(lines.length).font = { bold: true };
  for (const s of importSheets) {
    for (const c of s.columns) {
      ws.addRow([s.name, c.key, c.type, c.required ? "ใช่" : "", [c.label, c.hint, c.values ? `ค่า: ${c.values.join(", ")}` : ""].filter(Boolean).join(" — ")]);
    }
  }
}

function sheet(wb: ExcelJS.Workbook, def: SheetDef, rows: RawRow[]) {
  const ws = wb.addWorksheet(def.name, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = def.columns.map((c) => ({ header: c.key, key: c.key, width: Math.max(14, Math.min(40, c.key.length + 4)) }));
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
  def.columns.forEach((c, i) => {
    const cell = header.getCell(i + 1);
    cell.note = [c.label, c.required ? "(จำเป็น)" : "", c.hint ?? "", c.example ? `ตัวอย่าง: ${c.example}` : ""].filter(Boolean).join("\n");
  });
  for (const r of rows) ws.addRow(def.columns.map((c) => r[c.key] ?? null));
  const last = Math.max(rows.length + 1, 500);
  def.columns.forEach((c, i) => {
    const list = c.type === "bool" ? ["Y", "N"] : c.type === "enum" ? [...(c.values ?? [])] : null;
    if (!list) return;
    const col = ws.getColumn(i + 1).letter;
    for (let r = 2; r <= last; r++) {
      ws.getCell(`${col}${r}`).dataValidation = {
        type: "list",
        allowBlank: !c.required,
        formulae: [`"${list.join(",")}"`],
        showErrorMessage: true,
        errorTitle: c.label,
        error: `เลือกจาก: ${list.join(", ")}`,
      };
    }
  });
}

async function build(path: string, data: Partial<Record<SheetDef["name"], RawRow[]>>) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Unlimit Insure";
  readme(wb);
  for (const def of importSheets) sheet(wb, def, data[def.name] ?? []);
  await wb.xlsx.writeFile(path);
  console.log("wrote", path);
}

async function main() {
  await build("public/templates/unlimit-product-import.xlsx", {});
  await build("docs/examples/product-import-example.xlsx", catalogToWorkbook(mockCatalog));
}

main();
