# W14: content round D from Search Console

Claude drafted this plan on 2026-11-23, at Nithi's request, after rounds A, B and C of W12 went live (row 23). The data covers the last 3 months, up to 11-20: 452 impressions, 2 clicks, average position 56.8. Rounds B and C went live on 11-20 and 11-21, so this data does not include them yet.

The rules are the same as in W12 (`docs/tasks/w12-content-plan.md`):
- No prices, statistics, rankings of insurers or promises about claims.
- No promise of comparing plans on the site.
- Coverage always "ขึ้นกับเงื่อนไขกรมธรรม์".
- Every fact goes into `verify` for the licensed review (O8).
- Nithi approves the wording with the GO.

## What the data shows (new since W12)

| Theme | Searches (impressions) | Page that shows |
|---|---|---|
| Excess | ค่า excess 10, ค่าเสียหายส่วนแรก คือ 6, ค่าเสียหายส่วนแรกคืออะไร 4, excess คือ 3, ค่า excess ประกัน 3, ค่า excess คือ 1 (27) | `/lab/what-is-excess`: 30 impressions, 0 clicks |
| What type 1 / type 2 / 2+ covers | ประกันชั้น 1 คือ 7, ประกัน ชั้น 1 กับ 2 6, ประกันรถชั้น 2 บวก 3, ชั้น 1 2, ประกัน ชั้นสอง 2, 2+ ประกัน 2, ประกัน ชั้น 2 คือ อะไร 1 (23) | `/lab/type1-vs-2plus` (compares the types but does not explain each one) |
| MG EV | ประกันรถไฟฟ้า mg 7 | `/insurance/mg/mg-4`: 11 impressions, 1 click (one of the site's 2 clicks) |
| Both cars have type 1: who pays | รถทั้งสองคันมีประกันชั้น 1 เหมือนกัน ใครเป็นคนจ่ายก่อน 3 | none |
| SUV insurance | ประกันรถยนต์ suv 8, ประกันรถยนต์ suv ออนไลน์ 1 | none |

Queries in other languages (Indonesian "asuransi", German, French) are ignored: the site serves Thai drivers.

Also found: 12 model pages still say "เปรียบเทียบความคุ้มครอง" in their Google title, which promises a comparison the site no longer offers. They are Yaris Ativ, Corolla Cross, Fortuner, Hilux Revo, City, Civic, HR-V, Mazda 2, CX-5, Sealion 6, MG ZS EV and MG4. W12 round A fixed this only for Dolphin, Atto 3 and D-Max.

## Round D1: Google titles and descriptions (small, do first)
1. **`/lab/what-is-excess`:** use the searchers' words: "ค่า excess", "ค่าเสียหายส่วนแรก คืออะไร".
2. **The 12 model pages above:** replace "เปรียบเทียบ…" in `seoTitle` and `seoDescription` with the W12 round A pattern, e.g. "ประกันรถไฟฟ้า BYD Dolphin เช็กความคุ้มครอง…" plus the LINE advisor line. For MG ZS EV and MG4, put "ประกันรถไฟฟ้า MG" first.

Limits: title ≤ 60 characters, description 70–155 characters, Lab summary ≤ 140 characters. Page meaning stays the same.

## Round D2: two new Lab articles
1. **"ประกันชั้น 1, 2+ และ 3+ คุ้มครองอะไรบ้าง"** (slug `insurance-types`): one plain section per type, then links to "ชั้น 1 กับ 2+ ต่างกันอย่างไร" and to an advisor on LINE. Covers the type 1 and type 2 searches without repeating the comparison article.
2. **"รถชนกัน มีประกันชั้น 1 ทั้งคู่ ใครจ่าย"** (slug `both-type1-who-pays`): in general terms, the insurer of the party at fault pays the other side; what to do at the scene; what if fault is unclear. This topic needs careful licensed review, and every rule goes into `verify`.

## Not in this round
- **An SUV article (9 impressions):** too thin for now. Recheck in round E.
- **New model pages:** the data shows no new model demand beyond the pages we have.

## How it is built
- Claude writes the text in `content/models.ts` and `content/lab.ts`, adds the `verify` items and runs `npm run content:verify`, tests and build.
- Nithi approves the wording with the GO line.
- After deploy: request indexing in Search Console. Compare clicks about 4 weeks later, together with W12.
