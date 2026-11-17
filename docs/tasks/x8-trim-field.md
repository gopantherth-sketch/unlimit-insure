# UNL X8: optional sub-model / engine-size field (Codex)

Send to Codex **after the X5 PR is merged** (see `docs/tasks/x5-rebase.md`):

```
UNL X8: optional sub-model / engine size in the car selector. Follow AGENTS.md. Tester feedback 2026-11-17.

Branch: git fetch origin && git checkout -b codex/x8-trim-field origin/main

1. Field: in components/insurance/VehicleSelector.tsx, add an optional free-text input after "ปีรถ".
   - It appears wherever the selector is used: the homepage QuickQuote and /quote (QuoteWizard).
   - /advisor has no selector. Carry the value there through the URL and show it with the car.
   - Label, placeholder and hint come from new keys in content/ (not inline). Fill them with the owner's draft for now:
     label "รุ่นย่อย / ขนาดเครื่องยนต์ (ไม่บังคับ)"
     placeholder "เช่น 1.8 Hybrid Premium"
     hint "ช่วยให้ที่ปรึกษาเช็กราคาได้ตรงขึ้น"
     The copywriter (W9) replaces them later.
   - No layout or style changes beyond what the field needs; the designer reviews (D9).
2. URL param `trim` in lib/params.ts, in parsing and in buildQuery:
   - trim whitespace; max 60 characters;
   - plain text only: strip control characters and < >;
   - empty means absent.
3. LINE messages: every prefilled message that names the car shows "<car> · <trim>", e.g. "Toyota Corolla Cross 2022 · 1.8 Hybrid Premium":
   - contact.messages.plan and contact.messages.plans;
   - the vehicleLabel uses behind plans/[productId], compare, ResultsView and AdvisorContact;
   - InsuranceCard passes no car today; add it.
4. Never store it server-side, never use it for pricing or matching. Pages carrying it stay noindex like the other journey params.
5. Tests:
   - vitest for parsing (trimming, 60-character cap, unsafe characters, empty) and for the message text;
   - update tests/e2e/journey.mjs to fill the field and check the LINE message.
6. Checks: tsc, npm test, next build, cf:build, wrangler dev + e2e:journey and e2e:a11y. Push and open a PR "X8: optional sub-model / engine size".
7. Report (AGENTS.md format) with the PR link. Core sends it to the designer (D9) before merging.
```
