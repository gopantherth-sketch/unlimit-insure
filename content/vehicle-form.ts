// Car selector text (X8, 2026-11-17). Owner's draft until the copywriter's W9 text arrives.

export const vehicleForm = {
  /** Optional free-text sub-model / engine size, after "ปีรถ". Not used for pricing or matching. */
  trim: {
    label: "รุ่นย่อย / ขนาดเครื่องยนต์ (ไม่บังคับ)",
    placeholder: "เช่น 1.8 Hybrid Premium",
    hint: "ช่วยให้ที่ปรึกษาเช็กราคาได้ตรงขึ้น",
  },
  /** Car text in summaries and LINE messages, e.g. "Toyota Corolla Cross 2022 · 1.8 Hybrid Premium". */
  withTrim: (car: string, trim?: string | null) => (trim ? `${car} · ${trim}` : car),
};
