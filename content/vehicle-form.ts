// Car selector text (X8). Final text W9, drafted by Gemini and approved by the owner on 2026-11-17.
// The label and placeholder are short so they fit one line in the desktop column.

export const vehicleForm = {
  /** Optional free-text sub-model / engine size, after "ปีรถ". Not used for pricing or matching. */
  trim: {
    label: "รุ่นย่อย (ไม่บังคับ)",
    placeholder: "เช่น 1.8 Sport",
    hint: "ช่วยให้ที่ปรึกษาเช็กราคาได้ตรงรุ่นขึ้น",
  },
  /** Car text in summaries and LINE messages, e.g. "Toyota Corolla Cross 2022 · 1.8 Hybrid Premium". */
  withTrim: (car: string, trim?: string | null) => (trim ? `${car} · ${trim}` : car),
};
