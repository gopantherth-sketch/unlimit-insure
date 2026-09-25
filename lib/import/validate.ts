import {
  importSheets,
  insurerSheet,
  productSheet,
  vehicleSheet,
  type ColumnDef,
  type SheetDef,
} from "@/lib/import/columns";
import type {
  BodyType,
  Coverage,
  Eligibility,
  InsuranceType,
  Powertrain,
  PricingRule,
  RepairType,
  VehicleBrand,
  VehicleModel,
} from "@/lib/types";

export type CellValue = string | number | boolean | null;
export type RawRow = Record<string, CellValue>;
export type RawWorkbook = Partial<Record<SheetDef["name"], RawRow[]>>;

export interface ImportIssue {
  sheet: SheetDef["name"];
  /** Spreadsheet row number (header is row 1). */
  row: number;
  column?: string;
  message: string;
}

export interface InsurerIn {
  id: string;
  name: string;
  shortName: string;
  accent: string;
  claimsHotline: string | null;
}

export interface VersionIn {
  row: number;
  productId: string;
  insurerId: string;
  productName: string;
  productSummary: string;
  insuranceType: InsuranceType;
  effectiveFrom: string;
  effectiveUntil: string;
  coverage: Coverage;
  pricing: PricingRule;
  eligibility: Eligibility;
  benefits: string[];
  suitableFor: string[];
  sourceDocumentName: string;
  sourcePage: number | null;
  sourceNote: string | null;
}

export interface ImportPlan {
  insurers: InsurerIn[];
  brands: VehicleBrand[];
  models: VehicleModel[];
  versions: VersionIn[];
  errors: ImportIssue[];
  warnings: ImportIssue[];
}

export interface ImportContext {
  /** Insurer ids already in the database. */
  existingInsurerIds: string[];
}

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_ACCENT = "#4C5A7E";
export const MAX_ROWS_PER_SHEET = 2000;

type Parsed = string | number | boolean | string[] | null;

function parseCell(col: ColumnDef, raw: CellValue): { value: Parsed } | { error: string } {
  const empty = raw === null || raw === undefined || (typeof raw === "string" && raw.trim() === "");
  if (empty) return col.required ? { error: "ต้องกรอก" } : { value: null };
  const s = typeof raw === "string" ? raw.trim() : String(raw);

  switch (col.type) {
    case "text":
      return s.length > 500 ? { error: "ยาวเกิน 500 ตัวอักษร" } : { value: s };
    case "id":
      return ID_RE.test(s) ? { value: s } : { error: "ใช้ได้เฉพาะ a-z 0-9 และ - (ขึ้นต้นด้วยตัวอักษรหรือตัวเลข)" };
    case "color":
      return COLOR_RE.test(s) ? { value: s.toUpperCase() } : { error: "ต้องเป็นรหัสสี เช่น #1016D1" };
    case "int":
    case "money": {
      const n = typeof raw === "number" ? raw : Number(s.replace(/,/g, ""));
      if (!Number.isFinite(n) || !Number.isInteger(n)) return { error: "ต้องเป็นจำนวนเต็ม" };
      if (n < 0) return { error: "ต้องไม่ติดลบ" };
      if (col.type === "money" && n > 1_000_000_000) return { error: "ตัวเลขสูงเกินไป" };
      return { value: n };
    }
    case "percent": {
      const n = typeof raw === "number" ? raw : Number(s.replace(/%/g, ""));
      return Number.isFinite(n) && n >= 0 ? { value: n } : { error: "ต้องเป็นตัวเลข เช่น 1.85" };
    }
    case "bool": {
      if (typeof raw === "boolean") return { value: raw };
      const v = s.toLowerCase();
      if (["y", "yes", "true", "1", "ใช่", "มี"].includes(v)) return { value: true };
      if (["n", "no", "false", "0", "ไม่", "ไม่มี"].includes(v)) return { value: false };
      return { error: "ต้องเป็น Y หรือ N" };
    }
    case "date": {
      const d = s.slice(0, 10);
      if (!DATE_RE.test(d) || Number.isNaN(new Date(`${d}T00:00:00Z`).getTime())) return { error: "ต้องเป็นวันที่ YYYY-MM-DD" };
      return { value: d };
    }
    case "enum":
      return col.values?.includes(s) ? { value: s } : { error: `ต้องเป็นหนึ่งใน ${col.values?.join(", ")}` };
    case "list": {
      const items = s.split(",").map((x) => x.trim()).filter(Boolean);
      const bad = items.filter((x) => !col.values?.includes(x));
      return bad.length ? { error: `ค่าไม่ถูกต้อง: ${bad.join(", ")}` } : { value: items };
    }
    case "semicolonList":
      return { value: s.split(";").map((x) => x.trim()).filter(Boolean) };
  }
}

function parseSheet(def: SheetDef, rows: RawRow[] | undefined, errors: ImportIssue[]): { row: number; v: Record<string, Parsed> }[] {
  if (!rows) return [];
  if (rows.length > MAX_ROWS_PER_SHEET) {
    errors.push({ sheet: def.name, row: 1, message: `เกิน ${MAX_ROWS_PER_SHEET} แถว กรุณาแบ่งไฟล์` });
    return [];
  }
  const out: { row: number; v: Record<string, Parsed> }[] = [];
  rows.forEach((raw, i) => {
    const row = i + 2;
    if (Object.values(raw).every((x) => x === null || (typeof x === "string" && x.trim() === ""))) return;
    const v: Record<string, Parsed> = {};
    let ok = true;
    for (const col of def.columns) {
      const r = parseCell(col, raw[col.key] ?? null);
      if ("error" in r) {
        errors.push({ sheet: def.name, row, column: col.key, message: r.error });
        ok = false;
      } else v[col.key] = r.value;
    }
    if (ok) out.push({ row, v });
  });
  return out;
}

/** Headers present in a sheet that the format does not define, and required headers that are missing. */
export function checkHeaders(def: SheetDef, headers: string[]): ImportIssue[] {
  const known = new Set(def.columns.map((c) => c.key));
  const present = new Set(headers);
  const issues: ImportIssue[] = [];
  for (const c of def.columns) if (c.required && !present.has(c.key)) issues.push({ sheet: def.name, row: 1, column: c.key, message: "ไม่มีคอลัมน์นี้ในแถวหัวตาราง" });
  for (const h of headers) if (h && !known.has(h)) issues.push({ sheet: def.name, row: 1, column: h, message: "คอลัมน์ที่ไม่รู้จัก จะถูกข้าม" });
  return issues;
}

const str = (x: Parsed | undefined) => (typeof x === "string" ? x : "");
const num = (x: Parsed | undefined) => (typeof x === "number" ? x : 0);
const bool = (x: Parsed | undefined) => x === true;
/** 1.45 → 0.0145 without binary float noise (1.45 / 100 = 0.014499999…). */
const fromPercent = (p: number) => Number((p / 100).toFixed(10));
const list = (x: Parsed | undefined) => (Array.isArray(x) ? x : []);

export function validateWorkbook(wb: RawWorkbook, ctx: ImportContext): ImportPlan {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];

  const insurerRows = parseSheet(insurerSheet, wb.insurers, errors);
  const vehicleRows = parseSheet(vehicleSheet, wb.vehicles, errors);
  const productRows = parseSheet(productSheet, wb.products, errors);

  const insurers: InsurerIn[] = [];
  const seenInsurer = new Set<string>();
  for (const { row, v } of insurerRows) {
    const id = str(v.insurer_id);
    if (seenInsurer.has(id)) {
      errors.push({ sheet: "insurers", row, column: "insurer_id", message: "รหัสซ้ำในไฟล์" });
      continue;
    }
    seenInsurer.add(id);
    insurers.push({ id, name: str(v.name), shortName: str(v.short_name), accent: str(v.accent) || DEFAULT_ACCENT, claimsHotline: str(v.claims_hotline) || null });
  }

  const brands = new Map<string, VehicleBrand>();
  const models: VehicleModel[] = [];
  const seenModel = new Set<string>();
  for (const { row, v } of vehicleRows) {
    const modelId = str(v.model_id);
    if (seenModel.has(modelId)) {
      errors.push({ sheet: "vehicles", row, column: "model_id", message: "รหัสซ้ำในไฟล์" });
      continue;
    }
    const yearFrom = num(v.year_from);
    const yearTo = num(v.year_to);
    if (yearFrom < 1990 || yearTo > 2100 || yearTo < yearFrom) {
      errors.push({ sheet: "vehicles", row, column: "year_to", message: "ช่วงปีไม่ถูกต้อง" });
      continue;
    }
    seenModel.add(modelId);
    const brandId = str(v.brand_id);
    const prev = brands.get(brandId);
    if (prev && (prev.name !== str(v.brand_name) || prev.nameTh !== str(v.brand_name_th))) {
      warnings.push({ sheet: "vehicles", row, column: "brand_name", message: "ชื่อยี่ห้อไม่ตรงกับแถวก่อนหน้า ใช้ค่าจากแถวแรก" });
    }
    if (!prev) brands.set(brandId, { id: brandId, name: str(v.brand_name), nameTh: str(v.brand_name_th) });
    models.push({
      id: modelId,
      brandId,
      name: str(v.model_name),
      bodyType: str(v.body_type) as BodyType,
      powertrain: str(v.powertrain) as Powertrain,
      newPrice: num(v.new_price),
      yearFrom,
      yearTo,
    });
  }

  const knownInsurers = new Set([...ctx.existingInsurerIds, ...insurers.map((i) => i.id)]);
  const versions: VersionIn[] = [];
  const seenVersion = new Set<string>();
  const productInsurer = new Map<string, string>();

  for (const { row, v } of productRows) {
    const rowErrors: ImportIssue[] = [];
    const err = (column: string, message: string) => rowErrors.push({ sheet: "products", row, column, message });

    const productId = str(v.product_id);
    const insurerId = str(v.insurer_id);
    const insuranceType = str(v.insurance_type) as InsuranceType;
    const effectiveFrom = str(v.effective_from);
    const effectiveUntil = str(v.effective_until);

    if (!knownInsurers.has(insurerId)) err("insurer_id", "ไม่พบบริษัทนี้ ในชีต insurers หรือในระบบ");
    const prevInsurer = productInsurer.get(productId);
    if (prevInsurer && prevInsurer !== insurerId) err("insurer_id", "แพ็กเกจเดียวกันต้องเป็นของบริษัทเดียวกัน");
    productInsurer.set(productId, insurerId);
    if (effectiveUntil < effectiveFrom) err("effective_until", "ต้องไม่ก่อนวันที่มีผล");
    const key = `${productId}@${effectiveFrom}`;
    if (seenVersion.has(key)) err("effective_from", "มีเวอร์ชันของแพ็กเกจนี้ที่เริ่มวันเดียวกันในไฟล์แล้ว");
    seenVersion.add(key);

    let pricing: PricingRule | null = null;
    if (v.pricing_kind === "percent") {
      const rate = v.rate_percent;
      const si = v.sum_insured_percent;
      const min = v.min_premium;
      if (typeof rate !== "number" || rate <= 0 || rate > 20) err("rate_percent", "ต้องระบุ มากกว่า 0 และไม่เกิน 20");
      if (typeof si !== "number" || si < 50 || si > 130) err("sum_insured_percent", "ต้องระบุ ระหว่าง 50 ถึง 130");
      if (typeof min !== "number") err("min_premium", "ต้องระบุเมื่อคิดเบี้ยแบบ percent");
      if (typeof rate === "number" && typeof si === "number" && typeof min === "number") {
        pricing = { kind: "percentOfValue", rate: fromPercent(rate), minPremium: min, sumInsuredRatio: fromPercent(si) };
      }
    } else {
      const bodies = ["sedan", "hatchback", "suv", "pickup", "mpv"] as const;
      const missing = bodies.filter((b) => typeof v[`premium_${b}`] !== "number");
      missing.forEach((b) => err(`premium_${b}`, "ต้องระบุเมื่อคิดเบี้ยแบบ fixed"));
      if (typeof v.fixed_sum_insured !== "number") err("fixed_sum_insured", "ต้องระบุเมื่อคิดเบี้ยแบบ fixed (0 สำหรับชั้น 3)");
      if (missing.length === 0 && typeof v.fixed_sum_insured === "number") {
        pricing = {
          kind: "fixed",
          sumInsured: v.fixed_sum_insured,
          premiumByBody: {
            sedan: num(v.premium_sedan),
            hatchback: num(v.premium_hatchback),
            suv: num(v.premium_suv),
            pickup: num(v.premium_pickup),
            mpv: num(v.premium_mpv),
          },
        };
      }
    }

    const coverage: Coverage = {
      insuranceType,
      repairType: str(v.repair_type) as RepairType,
      excess: num(v.excess),
      collisionWithCounterparty: bool(v.collision_with_counterparty),
      collisionNoCounterparty: bool(v.collision_no_counterparty),
      fireTheft: bool(v.fire_theft),
      flood: bool(v.flood),
      thirdPartyBodilyPerPerson: num(v.tp_bodily_per_person),
      thirdPartyBodilyPerAccident: num(v.tp_bodily_per_accident),
      thirdPartyProperty: num(v.tp_property),
      personalAccidentPerPerson: num(v.pa_per_person),
      medicalPerPerson: num(v.medical_per_person),
      bailBond: num(v.bail_bond),
      coveredSeats: num(v.covered_seats),
      roadsideAssistance: bool(v.roadside),
      replacementCarDays: num(v.replacement_car_days),
      evBattery: bool(v.ev_battery),
      evCharger: bool(v.ev_charger),
    };

    if (coverage.thirdPartyBodilyPerAccident < coverage.thirdPartyBodilyPerPerson) {
      err("tp_bodily_per_accident", "ต่อครั้งต้องไม่น้อยกว่าต่อคน");
    }
    // Plausibility checks: flag, don't block. A licensed person confirms against the source document.
    const warn = (column: string, message: string) => warnings.push({ sheet: "products", row, column, message });
    if (insuranceType !== "type1" && coverage.collisionNoCounterparty) warn("collision_no_counterparty", "ปกติชั้นนี้ไม่คุ้มครองการชนแบบไม่มีคู่กรณี ตรวจสอบกับเอกสาร");
    if (insuranceType === "type3" && (coverage.collisionWithCounterparty || coverage.fireTheft)) warn("insurance_type", "ชั้น 3 ปกติไม่คุ้มครองตัวรถ ตรวจสอบกับเอกสาร");
    if ((coverage.evBattery || coverage.evCharger) && !list(v.powertrains).includes("EV")) warn("powertrains", "มีความคุ้มครอง EV แต่ไม่ได้จำกัดเฉพาะรถ EV");

    if (rowErrors.length || !pricing) {
      errors.push(...rowErrors);
      continue;
    }

    const eligibility: Eligibility = {
      ...(typeof v.max_age_years === "number" && { maxAgeYears: v.max_age_years }),
      ...(typeof v.min_year === "number" && { minYear: v.min_year }),
      ...(list(v.powertrains).length > 0 && { powertrains: list(v.powertrains) as Powertrain[] }),
      ...(list(v.body_types).length > 0 && { bodyTypes: list(v.body_types) as BodyType[] }),
    };

    versions.push({
      row,
      productId,
      insurerId,
      productName: str(v.product_name),
      productSummary: str(v.product_summary),
      insuranceType,
      effectiveFrom,
      effectiveUntil,
      coverage,
      pricing,
      eligibility,
      benefits: list(v.benefits),
      suitableFor: list(v.suitable_for),
      sourceDocumentName: str(v.source_document),
      sourcePage: typeof v.source_page === "number" ? v.source_page : null,
      sourceNote: str(v.source_note) || null,
    });
  }

  return { insurers, brands: [...brands.values()], models, versions, errors, warnings };
}

/** Convert a sheet's rows (first row = headers) into keyed rows. */
export function rowsFromSheet(data: CellValue[][]): { headers: string[]; rows: RawRow[] } {
  const [header = [], ...body] = data;
  const headers = header.map((h) => (typeof h === "string" ? h.trim() : String(h ?? "")));
  const rows = body.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? null])));
  return { headers, rows };
}

export const sheetNames = importSheets.map((s) => s.name);
