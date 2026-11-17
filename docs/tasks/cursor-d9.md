# Cursor brief: D9 (design review of the X8 sub-model field)

Paste into Cursor. Role for this task: **designer** (layout, colour, type, responsive, accessibility). Don't change any wording; leave `TODO(copy)` notes instead (copy goes through Gemini, W9).

## Context
- X8 added an optional free-text field, "รุ่นย่อย / ขนาดเครื่องยนต์ (ไม่บังคับ)", after brand / model / year in the car selector.
- It went live without a design review (`39bea62`, 2026-11-17). The owner chose to deploy first.
- It appears on the homepage quick-quote card (`components/home/QuickQuote.tsx` → `components/insurance/VehicleSelector.tsx`). `/quote` now redirects to `/advisor`, so that is the only place customers see it.
- `/advisor` shows the car with the sub-model in the "สิ่งที่คุณเลือกไว้" summary card (`components/insurance/AdvisorContact.tsx`). Example: `Toyota Corolla Cross 2022 · 1.8 Hybrid Premium`.

## Check, at 390 px and 1440 px (also 768 px)
1. **Homepage quick-quote card.** Four fields plus the button in one row on desktop, stacked on mobile.
   - Alignment: the selects have icon tiles and the text input has none, so check label and baseline alignment.
   - Height: the hint text under the input makes that column taller. Does the button still line up with the fields (`lg:items-end`)?
   - Wrapping and overflow of the long Thai label.
   - Focus ring, tap target height (≥ 44 px) and placeholder contrast.
   - Both tabs: "ประกันรถยนต์" and "ประกันรถ EV".
2. **`/advisor?brand=toyota&model=toyota-corolla-cross&year=2022&trim=1.8%20Hybrid%20Premium&from=home`.** The summary card with a long sub-model (try 60 characters): wrapping, no overflow.
3. **Axe scan:** clean on both pages (`npm run e2e:a11y` against a local `npx wrangler dev`, or the live site).

## Deliver
- Small fixes on `design/d9-trim-field`, in Tailwind classes only. No logic and no text changes.
- Before/after screenshots at 390 and 1440 px.
- Run `npx tsc --noEmit && npm test && npx next build`, then push and ask Core to merge.
- If nothing needs fixing, report "D9: no changes" with the screenshots.
