# Unlimit Insure — Content Style Guide

Applies to all customer-facing copy in `content/`. Source of truth for positioning: `PROJECT_MASTER.md` §2, §40, §41.

## Positioning in one line

ประกันรถที่เข้าใจคุณ มากกว่าแค่ราคา — Understand → Compare → Decide → Stay Protected.
ก่อนซื้อเราอธิบาย หลังซื้อเรายังดูแล.

## Voice

- Thai-first. English only for product names (My Garage, Insurance Lab) or short eyebrows.
- Friendly-professional, like a knowledgeable friend. Not a call center, not a legal document.
- Talk to the reader as "คุณ". Refer to ourselves as "เรา". No ครับ/ค่ะ (gender-neutral brand voice).
- Short sentences. One idea per sentence. Paragraphs of 1–3 sentences.
- Explain trade-offs, not only price: "ถูกกว่า แต่..." / "ส่วนต่างนี้แลกกับ..."
- Non-pushy. The user decides. Never create urgency.

## Words to use

| Use | Why |
|---|---|
| โดยทั่วไป, มัก, อาจ | Coverage varies by policy; avoid absolute claims |
| ตามเงื่อนไขกรมธรรม์, เป็นไปตามเงื่อนไข | Standard caveat |
| ตัวอย่างเช่น | Prefix every illustrative number |
| แผนนี้ระบุความคุ้มครอง... | Factual, points to the policy |
| ลองเปรียบเทียบ, ลองดู, เลือกได้ | Invitations, not commands |
| ตรงกับสิ่งที่คุณต้องการ X จาก Y ข้อ | Transparent match logic (never %) |
| ที่ปรึกษา | Human advisor |

## Words and patterns to avoid

- Superlatives without proof: ถูกที่สุด, ดีที่สุด, อันดับ 1, คุ้มที่สุด, ครบที่สุด, "ที่สุด" in general.
- Fear selling: "ถ้าไม่มีประกัน คุณอาจหมดตัว", "อย่าเสี่ยง", disaster imagery as pressure.
- Promises about claims: "เคลมผ่านแน่นอน", "จ่ายเร็วใน X วัน", "อนุมัติทันที". Say instead: การพิจารณาเคลมเป็นไปตามเงื่อนไขกรมธรรม์และการพิจารณาของบริษัทประกัน.
- Statistics, customer counts, testimonials, reviews, star ratings.
- Real insurer names or logos in copy.
- Fake precision: "93% match", arbitrary scores.
- Urgency: "วันนี้วันสุดท้าย", "เหลือเวลาอีก...", "รีบเลย".
- Unexplained jargon. If a term is unavoidable, it must have a glossary entry.

## Numbers

- Arabic numerals with comma separators: 15,000 บาท. Never Thai digits.
- Round, illustrative numbers only, always introduced with "ตัวอย่างเช่น".
- Never state a real premium, limit or statutory amount in static copy. Real numbers come from verified product data in code.

## Regulatory and product facts

- Keep wording general ("โดยทั่วไป", "ตามที่กฎหมายกำหนด").
- Do not write statutory amounts (e.g. พ.ร.บ. limits), OIC rule details, or mandatory excess amounts in copy.
- Any factual claim a licensed person should confirm goes into that entry's `verify` array. `verify` is never rendered; it is the pre-launch review checklist.
- Content follows the workflow in PROJECT_MASTER §32: DRAFT → COMPLIANCE REVIEW → APPROVED → PUBLISHED.

## Disclaimer patterns

Use one short caveat, close to the claim. Do not stack legal text in primary UI.

- ขึ้นอยู่กับเงื่อนไขของแต่ละกรมธรรม์
- เป็นไปตามเงื่อนไขและข้อยกเว้นของกรมธรรม์ โปรดดูรายละเอียดก่อนตัดสินใจ
- อาจมีค่าเสียหายส่วนแรกตามเงื่อนไขกรมธรรม์
- ราคาเบื้องต้น อาจเปลี่ยนได้หลังยืนยันข้อมูล
- ตัวเลขในตัวอย่างนี้ใช้เพื่ออธิบายเท่านั้น
- เป็นไปตามเงื่อนไข (for feature labels such as ผ่อนชำระ)

## Writing Explain entries (`content/glossary.ts`)

Powers the "ⓘ อธิบายให้เข้าใจง่าย" buttons.

1. `term` — the Thai term as shown in the UI. `alias` — English or common alternative.
2. `short` — one line, ≤ 90 characters. What it is, in everyday words. No caveats here.
3. `explanation` — 2–4 short sentences. What it means for the driver, and how it affects price or choice.
4. `example` — a real-life moment ("คุณถอยรถชนเสา..."), starts with "ตัวอย่างเช่น", round numbers.
5. `caveat` — one sentence, only if coverage varies.
6. `verify` — any fact that depends on regulation or policy wording.

Test: could a first-time car owner read it once and explain it to a friend?

## Scenario copy (`content/scenarios.ts`)

- Whether a plan covers a scenario comes only from verified product rules in code. Copy never decides.
- `coveredText` and `notCoveredText` are generic: they describe what "covered" means and always remind that conditions/exclusions apply.
- `notCoveredText` suggests a next step (compare other plans, ask an advisor), never scares.

## Insurance Lab articles (`content/lab.ts`)

- 3–5 sections, short paragraphs, bullets for comparisons.
- Structure: the key idea → a side-by-side or example → how to decide → try it with your own car.
- The last section always connects back to comparing plans for the reader's car. No lead capture required.

## Plain strings only

No HTML, no markdown, no emoji inside content strings. Formatting belongs to components.
