// Product data import format (xlsx). Single definition used by the template builder,
// the validator and the admin preview. Sheet row 1 = these keys; data from row 2.

export type ColumnType = "text" | "id" | "int" | "money" | "percent" | "bool" | "date" | "enum" | "list" | "semicolonList" | "color";

export interface ColumnDef {
  key: string;
  label: string;
  type: ColumnType;
  required?: boolean;
  /** Allowed values for `enum` and `list`. */
  values?: readonly string[];
  hint?: string;
  example?: string;
}

export interface SheetDef {
  name: "insurers" | "vehicles" | "products";
  title: string;
  description: string;
  columns: ColumnDef[];
}

const BOOL_HINT = "Y หรือ N";
export const INSURANCE_TYPES = ["type1", "type2plus", "type3plus", "type3"] as const;
export const REPAIR_TYPES = ["dealer", "garage"] as const;
export const BODY_TYPES = ["sedan", "hatchback", "suv", "pickup", "mpv"] as const;
export const POWERTRAINS = ["ICE", "HEV", "PHEV", "EV"] as const;
export const PRICING_KINDS = ["percent", "fixed"] as const;

export const insurerSheet: SheetDef = {
  name: "insurers",
  title: "บริษัทประกัน",
  description: "หนึ่งแถวต่อหนึ่งบริษัท ถ้ามี insurer_id อยู่แล้วจะอัปเดตชื่อและข้อมูลติดต่อ",
  columns: [
    { key: "insurer_id", label: "รหัสบริษัท", type: "id", required: true, hint: "ตัวพิมพ์เล็ก a-z 0-9 และ - เท่านั้น", example: "ins-a" },
    { key: "name", label: "ชื่อบริษัท", type: "text", required: true, example: "บริษัทประกันตัวอย่าง A" },
    { key: "short_name", label: "ชื่อย่อ", type: "text", required: true, example: "ตัวอย่าง A" },
    { key: "accent", label: "สีประจำบริษัท", type: "color", hint: "รหัสสี เช่น #1016D1", example: "#1016D1" },
    { key: "claims_hotline", label: "เบอร์แจ้งเคลม", type: "text", example: "1234" },
  ],
};

export const vehicleSheet: SheetDef = {
  name: "vehicles",
  title: "รุ่นรถ",
  description: "หนึ่งแถวต่อหนึ่งรุ่น ถ้ามี model_id อยู่แล้วจะอัปเดต",
  columns: [
    { key: "brand_id", label: "รหัสยี่ห้อ", type: "id", required: true, example: "toyota" },
    { key: "brand_name", label: "ยี่ห้อ (อังกฤษ)", type: "text", required: true, example: "Toyota" },
    { key: "brand_name_th", label: "ยี่ห้อ (ไทย)", type: "text", required: true, example: "โตโยต้า" },
    { key: "model_id", label: "รหัสรุ่น", type: "id", required: true, example: "toyota-corolla-cross" },
    { key: "model_name", label: "ชื่อรุ่น", type: "text", required: true, example: "Corolla Cross" },
    { key: "body_type", label: "ประเภทตัวถัง", type: "enum", values: BODY_TYPES, required: true, example: "suv" },
    { key: "powertrain", label: "ระบบขับเคลื่อน", type: "enum", values: POWERTRAINS, required: true, example: "HEV" },
    { key: "new_price", label: "ราคารถใหม่ (บาท)", type: "money", required: true, example: "1050000" },
    { key: "year_from", label: "ปีเริ่ม", type: "int", required: true, example: "2020" },
    { key: "year_to", label: "ปีสุดท้าย", type: "int", required: true, example: "2026" },
  ],
};

export const productSheet: SheetDef = {
  name: "products",
  title: "แพ็กเกจ (หนึ่งแถว = หนึ่งเวอร์ชัน)",
  description:
    "หนึ่งแถวต่อหนึ่งเวอร์ชันของแพ็กเกจ นำเข้าเป็นฉบับร่าง (draft) และสถานะแหล่งข้อมูล 'รอตรวจสอบ' เสมอ ต้องตรวจสอบกับเอกสารและกดเผยแพร่ในหน้าผู้ดูแลก่อนแสดงบนเว็บ",
  columns: [
    { key: "insurer_id", label: "รหัสบริษัท", type: "id", required: true, example: "ins-a" },
    { key: "product_id", label: "รหัสแพ็กเกจ", type: "id", required: true, hint: "ใช้รหัสเดิมเมื่อเพิ่มเวอร์ชันใหม่ของแพ็กเกจเดิม", example: "a-type1-dealer" },
    { key: "product_name", label: "ชื่อแพ็กเกจ", type: "text", required: true, example: "ชั้น 1 ซ่อมศูนย์ Plus" },
    { key: "product_summary", label: "สรุปสั้น", type: "text", required: true, example: "ชั้น 1 ซ่อมศูนย์ ไม่มีค่าเสียหายส่วนแรก" },
    { key: "insurance_type", label: "ประเภทประกัน", type: "enum", values: INSURANCE_TYPES, required: true, example: "type1" },
    { key: "effective_from", label: "มีผลตั้งแต่", type: "date", required: true, hint: "YYYY-MM-DD", example: "2026-10-01" },
    { key: "effective_until", label: "มีผลถึง", type: "date", required: true, hint: "YYYY-MM-DD", example: "2027-03-31" },
    { key: "repair_type", label: "การซ่อม", type: "enum", values: REPAIR_TYPES, required: true, example: "dealer" },
    { key: "excess", label: "ค่าเสียหายส่วนแรก (บาท)", type: "money", required: true, hint: "0 ถ้าไม่มี", example: "0" },
    { key: "collision_with_counterparty", label: "ชนมีคู่กรณี", type: "bool", required: true, hint: BOOL_HINT, example: "Y" },
    { key: "collision_no_counterparty", label: "ชนไม่มีคู่กรณี", type: "bool", required: true, hint: BOOL_HINT, example: "Y" },
    { key: "fire_theft", label: "รถหาย/ไฟไหม้", type: "bool", required: true, hint: BOOL_HINT, example: "Y" },
    { key: "flood", label: "น้ำท่วม", type: "bool", required: true, hint: BOOL_HINT, example: "Y" },
    { key: "tp_bodily_per_person", label: "ชีวิต/ร่างกายบุคคลภายนอก ต่อคน", type: "money", required: true, example: "1000000" },
    { key: "tp_bodily_per_accident", label: "ชีวิต/ร่างกายบุคคลภายนอก ต่อครั้ง", type: "money", required: true, example: "10000000" },
    { key: "tp_property", label: "ทรัพย์สินบุคคลภายนอก", type: "money", required: true, example: "1000000" },
    { key: "pa_per_person", label: "อุบัติเหตุส่วนบุคคล ต่อคน (ร.ย.01)", type: "money", required: true, example: "100000" },
    { key: "medical_per_person", label: "ค่ารักษาพยาบาล ต่อคน (ร.ย.02)", type: "money", required: true, example: "100000" },
    { key: "bail_bond", label: "ประกันตัวผู้ขับขี่ (ร.ย.03)", type: "money", required: true, example: "300000" },
    { key: "covered_seats", label: "จำนวนที่นั่งที่คุ้มครอง", type: "int", required: true, example: "5" },
    { key: "roadside", label: "ช่วยเหลือฉุกเฉิน 24 ชม.", type: "bool", required: true, hint: BOOL_HINT, example: "Y" },
    { key: "replacement_car_days", label: "รถใช้ระหว่างซ่อม (วัน)", type: "int", required: true, hint: "0 ถ้าไม่มี", example: "0" },
    { key: "ev_battery", label: "คุ้มครองแบตเตอรี่ EV", type: "bool", required: true, hint: BOOL_HINT, example: "N" },
    { key: "ev_charger", label: "คุ้มครองเครื่องชาร์จ EV", type: "bool", required: true, hint: BOOL_HINT, example: "N" },
    {
      key: "pricing_kind",
      label: "วิธีคิดเบี้ย",
      type: "enum",
      values: PRICING_KINDS,
      required: true,
      hint: "percent = % ของทุนประกัน, fixed = เบี้ยคงที่ตามประเภทตัวถัง",
      example: "percent",
    },
    { key: "rate_percent", label: "อัตราเบี้ย (% ของทุน)", type: "percent", hint: "ใช้เมื่อ percent เช่น 1.85", example: "1.85" },
    { key: "min_premium", label: "เบี้ยขั้นต่ำ (บาท)", type: "money", hint: "ใช้เมื่อ percent", example: "13000" },
    { key: "sum_insured_percent", label: "ทุนประกัน (% ของมูลค่ารถ)", type: "percent", hint: "ใช้เมื่อ percent เช่น 100", example: "100" },
    { key: "fixed_sum_insured", label: "ทุนประกันคงที่ (บาท)", type: "money", hint: "ใช้เมื่อ fixed", example: "" },
    { key: "premium_sedan", label: "เบี้ย เก๋ง", type: "money", hint: "ใช้เมื่อ fixed", example: "" },
    { key: "premium_hatchback", label: "เบี้ย แฮทช์แบ็ก", type: "money", hint: "ใช้เมื่อ fixed", example: "" },
    { key: "premium_suv", label: "เบี้ย SUV", type: "money", hint: "ใช้เมื่อ fixed", example: "" },
    { key: "premium_pickup", label: "เบี้ย กระบะ", type: "money", hint: "ใช้เมื่อ fixed", example: "" },
    { key: "premium_mpv", label: "เบี้ย MPV", type: "money", hint: "ใช้เมื่อ fixed", example: "" },
    { key: "max_age_years", label: "อายุรถสูงสุด (ปี)", type: "int", hint: "ว่างได้", example: "5" },
    { key: "min_year", label: "ปีรถต่ำสุด", type: "int", hint: "ว่างได้", example: "" },
    { key: "powertrains", label: "รับเฉพาะระบบขับเคลื่อน", type: "list", values: POWERTRAINS, hint: "คั่นด้วย , เช่น EV หรือว่าง = ทุกแบบ", example: "" },
    { key: "body_types", label: "รับเฉพาะตัวถัง", type: "list", values: BODY_TYPES, hint: "คั่นด้วย , หรือว่าง = ทุกแบบ", example: "" },
    { key: "benefits", label: "สิทธิประโยชน์", type: "semicolonList", hint: "คั่นด้วย ;", example: "บริการช่วยเหลือฉุกเฉิน 24 ชั่วโมง" },
    { key: "suitable_for", label: "เหมาะกับใคร", type: "semicolonList", hint: "คั่นด้วย ;", example: "รถใหม่ที่ต้องการซ่อมศูนย์" },
    { key: "source_document", label: "เอกสารอ้างอิง", type: "text", required: true, hint: "ชื่อไฟล์โบรชัวร์/ใบเสนอราคา", example: "Insurer_A_Type1_2026Q4.pdf" },
    { key: "source_page", label: "หน้า", type: "int", example: "3" },
    { key: "source_note", label: "หมายเหตุ", type: "text", example: "" },
  ],
};

export const importSheets: SheetDef[] = [insurerSheet, vehicleSheet, productSheet];
