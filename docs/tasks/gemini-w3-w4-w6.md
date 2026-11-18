# Gemini briefs: W6, W4, W3 (CLEAR rows 26, 27, 28)

Three separate briefs. Paste one at a time into Gemini, each with the text below its line. Nithi approves Gemini's answer. Then Cursor or Claude places it in the repo (see "Placing it" under each brief).

Rules for all three (from `CLAUDE.md` and CORE):
- Insurance wording needs a licensed broker's review before it goes live (O8). Gemini's draft is not final.
- No prices, premiums, coverage amounts or percentages.
- No "best / cheapest / guaranteed / approved" claims. No statistics, reviews or insurer names.
- Unknown facts stay `[รอข้อมูล]`.
- This is copy only. Nobody posts ads or publishes anything outside the website.

Shared intro for Gemini (put this first in every brief):

> You are the Thai copywriter for **Unlimit Insure** (unlimitinsure.com), a small Thai motor-insurance broker website. The site does not sell online today. Customers tell us their car, then message a human advisor on LINE (@unlimit.insure). Tone: plain, friendly and trustworthy Thai, with short sentences and no hype. Don't promise prices, discounts or approval, and don't use "best" or "cheapest". Use gender-neutral wording. Answer in Thai, with a one-line English reason per change.

---

## W6 · SEO titles and descriptions, final pass (row 26)

> Below are the search-result title and description for each page of the site. The site adds " | Unlimit Insure" after every title.
>
> Limits:
> - Title: 60 characters at most, including the suffix, so about 44 for your part.
> - Description: 70 to 155 characters.
> - Each title and description must be different from the others.
> - Put the main search phrase near the start, for example ประกันรถยนต์, ต่อประกันรถ or ประกันรถ EV, where it fits the page.
> - No superlatives, numbers or claims we can't prove.
>
> `/quote/results` and `/compare` are old pages that now send visitors to the advisor. Keep their text short and honest, and don't target new keywords with them.
>
> `/shop` stays `[รอข้อมูล]` until the products are known. Skip it.
>
> For each page give: the recommended title, the recommended description, and one alternative title.
>
> [paste `content/seo.ts` here, the part from `"/":` to the closing `};`]

Placing it: replace the strings in `content/seo.ts` and keep its comment limits. Then check `docs/seo-plan.md` for any keyword list it should match. Checks: `npx tsc --noEmit && npm test`.

---

## W4 · Pre-launch question sheet by reviewer (row 27)

> Below is our pre-launch checklist: statements on the site that must be confirmed before launch. Turn it into a **question sheet** for three reviewers:
> 1. **Licensed broker**: insurance facts, coverage explanations, claims steps, and the purchase and tracking text.
> 2. **Lawyer / DPO**: privacy policy, terms, consent, and how long we keep data.
> 3. **Owner**: business facts such as licence number, company name, address, opening hours, LINE and phone.
>
> For each item write one yes/no or fill-in question in Thai. Keep the checklist's own item number so we can match the answers back. Questions must be neutral: don't suggest the answer and don't add new claims. If an item fits two reviewers, put it under the first and add "(ถามซ้ำ: ทนาย)" or a similar tag. End each reviewer section with a blank line for "ข้อเสนอแก้ไขอื่น ๆ".
>
> Output: three Markdown tables, one per reviewer, with the columns `#`, `หัวข้อ`, `คำถาม`, `คำตอบ (ใช่ / ไม่ใช่ / แก้เป็น…)`.
>
> [paste all of `docs/verify-before-launch.md` here]

Placing it: save the answer as `docs/verify-question-sheet.md`. Nithi sends each table to its reviewer; the answers feed O8. Changes to the site's text happen afterwards, as their own rows.

---

## W3 · Purchase-tracking strings (row 28)

> These short texts appear on the customer's private tracking page after they apply for a policy. (Online applying is switched off today; this is preparation.) The page shows a list of steps, and the current step is highlighted.
>
> Improve each one. Give one recommended version and one alternative, each with a one-line reason. Keep `{n}` and `{total}` exactly as they are, because the site fills them in.
>
> | Key | Where it shows | Current text |
> |---|---|---|
> | `tracking.yourTurn` | Badge on a step where the customer must act | ถึงขั้นตอนของคุณ |
> | `tracking.waiting` | Badge when our team is working and the customer can wait | ตอนนี้คุณไม่ต้องทำอะไร |
> | `tracking.stepOf` | Small counter above the step | ขั้นที่ {n} จาก {total} |
> | `prepareTitle` | Heading of the box on the application form that lists the documents | เตรียมเอกสารไว้ได้เลย |
> | `prepareBody` | Text under that heading | หลังส่งใบสมัคร อัปโหลดรูปถ่ายหรือไฟล์ PDF ของเอกสารเหล่านี้ในหน้าติดตามสถานะ |
>
> Limits:
> - Badges: about 20 characters at most.
> - `prepareBody`: one or two short sentences.
> - Don't promise how long anything takes or that the policy will be approved.

Placing it: update the keys in `content/purchase.ts`. Purchase stays off (`PURCHASE_ENABLED=false`). Checks: `npx tsc --noEmit && npm test`. A licensed review is needed before C6 switches purchase on.
