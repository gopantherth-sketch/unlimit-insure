# Grok brief: W9 + W11 (car-detail field and LINE message text)

Paste everything below the line into Grok. The owner approves Grok's answer, then hands it to Cursor (see "For Cursor" at the end).

---

You are the Thai copywriter for **Unlimit Insure** (unlimitinsure.com), a small Thai motor-insurance broker website. The site does not sell online. Customers tell us their car, then message a human advisor on LINE (@unlimit.insure). Tone: plain, friendly, trustworthy Thai; short sentences; no hype; no promises about prices, discounts or approval; no "best/cheapest" claims. Write gender-neutral (no ครับ/ค่ะ at the end of customer-sent text, because any customer may send it).

Please improve the two pieces of text below. Give **one recommended version** and, where useful, **one alternative**, each with a one-line reason. Thai only. Keep the structure and limits exactly as stated.

## 1. Optional car-detail field (W9)

An optional text box on the homepage, after brand / model / year dropdowns. Customers type their sub-model or engine size so the advisor can quote more accurately. It is not required.

Current text:
- Label: `รุ่นย่อย / ขนาดเครื่องยนต์ (ไม่บังคับ)`
- Placeholder (example inside the box): `เช่น 1.8 Hybrid Premium`
- Hint (small text under the box): `ช่วยให้ที่ปรึกษาเช็กราคาได้ตรงขึ้น`

Limits:
- Label: at most about 35 characters. It must say the field is optional.
- Placeholder: a realistic example, at most about 25 characters.
- Hint: one short line, at most about 45 characters. Don't promise a lower price.

## 2. Prefilled LINE message (W11)

When the customer taps "send on LINE", LINE opens with this message already typed. The customer can edit it before sending. **Our admins read and process these messages**, so it must stay one detail per line and easy to scan.

Current message (example with a car):
```
ขอราคาประกันรถยนต์ (จากเว็บไซต์)
รถ: Toyota Corolla Cross
ปี: 2022
รุ่นย่อย/เครื่องยนต์: 1.8 Hybrid Premium
ประเภทประกันที่สนใจ: 
ซ่อมห้างหรืออู่: 
ประกันเดิมหมดวันที่: 
(จากหน้า: หน้าแรก)
```
How it works:
- Car, year and sub-model are filled in by the website. If unknown, they stay blank after the colon.
- Electric cars get ` (EV)` after the car name.
- The three lines after the sub-model are blanks for the customer to fill.
- The last line names the page they came from: `หน้าแรก` (homepage) or the car model name.

Rules:
- **Do not change the first line** `ขอราคาประกันรถยนต์ (จากเว็บไซต์)`. Admins filter chats on it.
- Keep one detail per line, each as `label: value`.
- You may reword the labels for clarity. You may suggest options in brackets for the blanks, e.g. `(ชั้น 1 / 2+ / 3+)`.
- At most 8 lines. Don't add questions about name, phone number, licence plate or ID number.

Also review the joiner used on screen between car and sub-model, ` · `, as in `Toyota Corolla Cross 2022 · 1.8 Hybrid Premium`. Keep it, or suggest a better one.

## What to send back
1. Field: label, placeholder, hint (recommended + alternative).
2. LINE message: the full message with the example car filled in, plus the version with no car (all blanks).
3. The joiner (keep or change).

---

## For Cursor (after the owner approves)
- Branch `copy/w9-w11` from `main`. Change text only, exactly as approved:
  - W9: `content/vehicle-form.ts` (`trim.label`, `trim.placeholder`, `trim.hint`; the joiner is in `withTrim`).
  - W11: `content/contact.ts` (`messages.quoteRequest` line labels; `messages.from`).
- Keep the first LINE line unchanged. Don't change logic or layout.
- Update expected strings in `lib/line-message.test.ts` and `tests/e2e/journey.mjs` if a label changes.
- Run `npx tsc --noEmit && npm test && npx next build`, push, and ask Core to merge.
