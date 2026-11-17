> **Superseded 2026-11-17:** the copywriter role moved to Gemini. Use `docs/tasks/gemini-w9-w11.md`.

# UNL W9: text for the sub-model / engine-size field (copywriter)

Send to the copywriter now (in parallel with X5):

```
UNL W9: text for a new optional field in the car selector (task X8, Codex builds it).

The customer picks brand, model and year, and can now also type a sub-model or engine size (free text, optional). It is added to the LINE message to the advisor, e.g. "Toyota Corolla Cross 2022 · 1.8 Hybrid Premium". It is not used for prices.

Owner's draft:
- label: "รุ่นย่อย / ขนาดเครื่องยนต์ (ไม่บังคับ)"
- placeholder: "เช่น 1.8 Hybrid Premium"
- hint: "ช่วยให้ที่ปรึกษาเช็กราคาได้ตรงขึ้น"

Please:
1. Send Core the final label, placeholder and hint. The field sits in a row next to ยี่ห้อ / รุ่นรถ / ปีรถ, so keep the label short on a phone.
2. Confirm the joiner between the car and the sub-model in the LINE message (" · " in the draft).
3. Don't edit files yet. Once X8 is merged, change the new content/ keys on branch copy/x8-trim-text, run npm run content:verify, and push for Core to merge.
```
