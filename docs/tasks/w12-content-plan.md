# Gemini brief: W12 (content plan from Search Console)

Written by Core on 2026-11-17, from the Search Console data in `docs/progress.md` (C10). The owner wants more LINE leads instead of display ads.

How this works: the owner pastes everything below the line into Gemini. The owner approves Gemini's answer. Cursor puts the approved text into `content/**` on a `copy/w12-*` branch. Core reviews and merges. Do it in three rounds (A, B, C) so each stays reviewable. **Do A first**: it changes the fewest words and those pages already show up in Google.

**For Core, after each merge:** request indexing for the changed and new URLs in Search Console, then compare clicks and CTR about 4 weeks later.

---

You are the Thai copywriter for **Unlimit Insure** (unlimitinsure.com), a small Thai motor-insurance broker website. The site does not sell online and shows no prices. Visitors pick their car, then message a human advisor on LINE (@unlimit.insure) for a real quote.

Tone:
- Plain, friendly, trustworthy Thai, in short sentences.
- No hype, and no "best/cheapest/no.1" claims.
- No prices, premiums, discounts, statistics, repair costs or theft rates.
- No promises that a claim will be paid. Coverage always "depends on the policy terms" (ขึ้นกับเงื่อนไขกรมธรรม์).
- Don't name or rank real insurers.
- Gender-neutral (no ครับ/ค่ะ).

Important: the site **no longer lets visitors compare plans on screen**. They talk to an advisor on LINE instead. Don't write "เปรียบเทียบแผนบนเว็บ" or anything that promises an on-site comparison or instant price. Writing that the advisor helps compare is fine.

## What Google data shows (last 3 months)
Total: 350 impressions, 2 clicks, average position 58.7. These are the searches people already find us for, and they never clicked:

| Search query | Impressions |
|---|---|
| ประกัน ชั้น 1 กับ 2+ ต่างกันอย่างไร | 51 |
| ประกันรถไฟฟ้า byd | 32 |
| ประกัน byd dolphin | 28 |
| ประกันรถ ev ต่างจากรถน้ำมันอย่างไร | 25 |
| รถ ev เคลมประกันต่างจากรถทั่วไปหรือไม่ | 21 |
| ประกัน รถไฟฟ้า byd | 21 |
| ประกันรถยนต์ไฟฟ้า byd | 15 |

These are the pages Google shows most:

| Page | Impressions | Clicks |
|---|---|---|
| BYD Dolphin page | 111 | 0 |
| Lab: type 1 vs 2+ | 77 | 0 |
| Lab: EV insurance | 51 | 0 |
| BYD Atto 3 page | 31 | 0 |
| Isuzu D-Max page | 22 | 0 |

## Round A: better Google titles and descriptions for the 5 pages above
The goal is more clicks from the same searches. Match the searcher's words and tell them what they'll get: a clear answer, plus a human advisor on LINE for their exact car.

Limits:
- Title ≤ 60 characters. " | Unlimit Insure" is added automatically, so don't include it.
- Description 70–155 characters for car pages. For Lab articles it's the article summary, so ≤ 140 characters.
- Don't change the meaning of the pages.

Current text:
1. BYD Dolphin page
   - Title: `ประกันรถ EV BYD Dolphin เปรียบเทียบความคุ้มครอง`
   - Description: `เปรียบเทียบประกันรถ EV BYD Dolphin ดูความคุ้มครองแบตเตอรี่ เครื่องชาร์จ และศูนย์ซ่อม ก่อนเลือกแผนที่ตรงกับการใช้รถไฟฟ้าของคุณ`
2. BYD Atto 3 page
   - Title: `ประกันรถ EV BYD Atto 3 เปรียบเทียบความคุ้มครอง`
   - Description: `เปรียบเทียบประกันรถ EV BYD Atto 3 ดูความคุ้มครองแบตเตอรี่ เครื่องชาร์จ และผู้โดยสาร ก่อนเลือกแผนที่ตรงกับการใช้รถไฟฟ้าของครอบครัว`
3. Isuzu D-Max page
   - Title: `ประกันรถกระบะ Isuzu D-Max เปรียบเทียบก่อนเลือก`
   - Description: `เปรียบเทียบประกันรถกระบะ Isuzu D-Max ดูประเภทการใช้รถ อุปกรณ์ติดตั้งเพิ่ม และความคุ้มครองบุคคลภายนอก ก่อนเลือกแผนที่ตรงกับการใช้งานจริง`
4. Lab article "type 1 vs 2+"
   - Title: `ประกันชั้น 1 กับ 2+ ต่างกันอย่างไร`
   - Summary: `สองชั้นนี้ต่างกันที่เรื่องสำคัญเรื่องเดียว คือการชนแบบไม่มีคู่กรณี มาดูว่าส่วนต่างของเบี้ยแลกกับอะไร และแบบไหนเข้ากับการใช้รถของคุณ`
5. Lab article "EV insurance"
   - Title: `ประกันรถ EV ต่างจากรถน้ำมันอย่างไร`
   - Summary: `รถไฟฟ้ามีจุดที่ต้องดูเพิ่ม เช่น แบตเตอรี่และเครื่องชาร์จ มาดูว่าควรอ่านอะไรในกรมธรรม์ก่อนเลือก`

For each page, give one recommended title and description, one alternative, and a one-line reason.

## Round B: two new Lab articles
Each article has:
- `title` (≤ 60 characters);
- `summary` (≤ 140 characters);
- 3–5 sections, each with a `heading` and 1–3 short paragraphs;
- a closing paragraph inviting the reader to ask an advisor on LINE about their own car.

Reading time is about 3–4 minutes. Use illustrative examples only, never real figures.

1. **EV claims:** answers "รถ ev เคลมประกันต่างจากรถทั่วไปหรือไม่". Cover:
   - what's the same and what's different when claiming for an EV (battery inspection, repair at a shop with EV tools, parts lead time);
   - what to do right after an accident with an EV, safely;
   - what to check in the policy beforehand.
   Stay general. No claims about specific insurers or BYD service centres.
2. **BYD EV insurance guide:** answers "ประกันรถไฟฟ้า byd". A short guide for owners of BYD Dolphin, Atto 3, Seal, Sealion 7 and M6:
   - what to look at when choosing cover for an EV from this brand (battery cover and depreciation, home charger, repair location, type 1 vs 2+ for an EV);
   - then point readers to the model pages (we have Dolphin and Atto 3).
   Don't say anything about official BYD insurance offers or warranties, because we can't verify them.

## Round C: four new car-model pages
These are EV models people buy that have no page yet: **BYD Seal**, **BYD Sealion 7**, **Tesla Model Y**, **ORA Good Cat**. Use the same structure as our existing model pages:
- `h1`;
- `seoTitle` ≤ 60 characters;
- `seoDescription` 70–155 characters;
- `intro` (2–3 sentences, ending with an invitation to ask an advisor on LINE for this car);
- 3 `considerations`, each with a title and a 1–2 sentence body;
- 2 `faq` items, each with a question and an answer.

Ground each page only in the body type and in the fact that it is an electric car. No model-specific prices, specs, ratings or statistics.

## Output format
Give plain text grouped by round, then by page, using the exact field names above (title, summary, seoTitle, seoDescription, h1, intro, considerations, faq, sections/heading/body). That way the text can be copied into the site's content files as is. Add no commentary inside the fields.

---

## For Cursor (after the owner approves)
- **Round A:**
  - `content/models.ts`: `seoTitle` and `seoDescription` for `byd-dolphin`, `byd-atto-3` and `isuzu-d-max`.
  - `content/lab.ts`: `title` and `summary` for `type1-vs-2plus` and `ev-insurance`. Changing `title` also changes the article's H1, so check that it reads well on the page.
- **Round B:** two new entries in `content/lab.ts`.
  - `slug`: `ev-claims` and `byd-ev-insurance`.
  - `tool`: pick an existing `LabToolId` that fits, such as `evCoverage`; ask Core if none fits.
  - `relatedTerms`: existing glossary keys only.
  - `readMinutes`: 3–4.
  - New articles appear in `/lab` and the sitemap automatically.
  - On `/lab` their cards show the designed placeholder tile, because no photo is set.
  - Core adds the category tag in `cardMeta` (`app/(site)/lab/page.tsx`) when it merges. Suggested tags: `EV` for both.
  - Photos can follow later from Gemini (generated images) or the owner.
- **Round C:** four new entries in `content/models.ts` with `modelId`: `byd-seal-ev`, `byd-sealion-7-ev`, `tesla-model-y-ev` and `gwm-ora-good-cat-ev`. These ids already exist in `lib/data/vehicles.ts`. The page and sitemap entry follow from the content entry.
- Text only, exactly as approved. Run `npx tsc --noEmit && npm test && npx next build`, push `copy/w12-a` (then `-b`, `-c`), and ask Core to merge.

---

## Status (2026-11-20)
- **Round A:** live since 11-17 (`aac0f30`, Gemini wording, owner approved). Compare clicks and CTR around 2026-12-15.
- **Round B:** written by Claude at the owner's request on 11-20 (no Gemini step): `ev-claims` and `byd-ev-insurance` in `content/lab.ts`, tag "EV" on `/lab`, placeholder tile until a photo exists. Their `verify` items are in `docs/verify-before-launch.md` for the licensed review (O8). Owner approves the wording before the deploy. After the deploy, request indexing for `/lab/ev-claims` and `/lab/byd-ev-insurance`.
- **Round C:** written by Claude at the owner's request on 11-21 (no Gemini step): `byd-seal-ev`, `byd-sealion-7-ev`, `tesla-model-y-ev`, `gwm-ora-good-cat-ev` in `content/models.ts`, pages under `/insurance/<brand>/<model>` and in the sitemap. Owner approves the wording with the GO. After the deploy, request indexing for the 4 pages.
