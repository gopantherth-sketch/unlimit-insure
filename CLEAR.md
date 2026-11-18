# Clear

Process: `D:\core-process\AGENTS.md`

Code:  UNL
Usually: —
Local: — · —
Live:  20261118-df708c8-1 · 2026-11-18

Nithi marks by number: `do: 3, 5 · later: 4 · drop: 2`. Only `do` is work.

Rows came from the old backlog in `docs/agents.md` (adopt 2026-11-18); its ID is first in each Item. Details and briefs: that table and `docs/tasks/`.

| # | Item | Where | Don't touch | Suggest | Status | Candidate |
|---|---|---|---|---|---|---|
| 1 | Release lock — deploys today via Cloudflare Workers Builds on push to `main` (OpenNext), or `npm run deploy` from the PC; no candidate or GO line | live |  | Structure: every merge to `main` goes live, so the GO line is skipped. Lever: rule (deploy only via a candidate) | done 11-18 | 20261118-afae7fa-1 |
| 2 | C2 · Workers Free 10 ms CPU limit vs 26–273 ms per page; risk of error 1102 under real traffic | live | | Owner decision O9 (Workers Paid $5/month) | open | |
| 3 | C10 · Search Console re-check around 2026-11-24: Pages report, `/advisor` and `/insurance/honda/honda-city` indexed | live | Do not "Validate fix" intended states | Waits for Google crawl | open | |
| 4 | C3 · Live QA on real phones (iOS Safari, Android Chrome) and live speed; not recorded yet | live | | | open | |
| 5 | C11 · Route info@unlimitinsure.com (routing rule + test), then DNS / DMARC; copywriter switches `contact.email` | live | | Blocked on O10 | open | |
| 6 | C8 · Payment slip guard: an old slip still passes after staff sends it back; require an upload after the last move to awaiting_payment (`lib/db/applications.ts`) + vitest cases | app |  | Must land before C6; purchase is off so no live impact | done 11-18 | 20261118-afae7fa-1 |
| 7 | C13 · Upgrade Next.js 15 to a supported major with matching `@opennextjs/cloudflare`; remove `--dangerouslyUseUnsupportedNextVersion` from `package.json` and the dashboard build command | app |  |  | done 11-18 | 20261118-df708c8-1 |
| 8 | C4 · Import real products (admin → นำเข้าข้อมูล); retire the mock catalogue, `CATALOG_FROM_CODE=false`, restore `force-dynamic` | app | | Blocked on owner data O4 | open | |
| 9 | C6 · Switch on online purchase (R2 bucket, `r2_buckets`, `PURCHASE_ENABLED=true`, payment account, `e2e:purchase`) | live | | Blocked on C4, C8, O5, O8 | open | |
| 10 | C7 · Staff alerts via LINE (`lib/notify` ready; needs Messaging API token + `LINE_ALERT_TO`) | app | | Parked by owner | open | |
| 11 | C9 · Phase 4: renewal reminders and renewal compare | app | | Blocked on real policies | open | |
| 12 | C15 · Shop launch: `SHOW_SHOP` on, footer link, sitemap, indexing request, one real test order | live | | Blocked on W13, D10, O12, O13 (C14 shop build live hidden as `1da12df`, 11-18) | open | |
| 13 | Y2 · Measure live CPU per page with `wrangler tail` (`/`, `/lab`, `/quote`, `/advisor`, one car page) | live |  |  | done 11-18 | 20261118-afae7fa-1 |
| 14 | Y5 · Run `e2e:journey` and `e2e:a11y` against `BASE_URL=https://unlimitinsure.com` | live |  |  | done 11-18 | 20261118-afae7fa-1 |
| 15 | Y6 · CPU proposal: what still renders per request, what can be prebuilt or cached, cold start of `/`; ranked, with expected savings | app | No behaviour change | fit: Cursor | done 11-18 | 20261118-afae7fa-1 |
| 16 | Y3 · CPU fixes from the approved parts of Y6 | app | | After 15 | open | |
| 17 | Y4 · Deploy runbook in `docs/deploy.md`: Next 15 flag, how to pick the Cloudflare account, untracked files that affect builds, rollback | app |  | Fold into row 1 | done 11-18 | 20261118-afae7fa-1 |
| 18 | D1 · Advisor portrait 4:5 `public/images/advisor.webp` — a real photo of the owner/advisor, no AI person | app | | Blocked on owner photo O7 | open | |
| 19 | D2 · Add the Phase 3 components to `design/design-system.md` | app | | | open | |
| 20 | D9 · X8 trim-field review at 390 and 1440 px (homepage selector, trim on `/advisor`); axe clean | live | No wording changes | fit: Cursor · brief `docs/tasks/cursor-d9.md` | open | |
| 21 | D4 · Insurer logo strip stays hidden (`SHOW_PARTNER_LOGOS=false`) until licensed logos with permission | app | | Blocked on owner logos | open | |
| 22 | D10 · Shop design review: product card and page at 390/1440, variant/quantity picker, out of stock, admin Orders; axe clean | app | | fit: Cursor · shop build is live hidden | open | |
| 23 | W12 · Content plan from Search Console: three rounds, A first | live | | Owner pastes round A into Gemini (`docs/tasks/w12-content-plan.md`) | open | |
| 24 | W13 · Shop copy: `/shop` intro, SEO text, product names and descriptions (owner facts only), order message label | app | | Gemini drafts; blocked on O12 | open | |
| 25 | W10 · Review the X5 copy edits (PR #4, merged) | live | | | open | |
| 26 | W6 · SEO titles and descriptions final pass (`content/seo.ts`, `docs/seo-plan.md`) | live |  |  | done 11-18 | 20261118-afae7fa-1 |
| 27 | W4 · Turn `docs/verify-before-launch.md` into a question sheet grouped by reviewer | app |  |  | done 11-18 | 20261118-afae7fa-1 |
| 28 | W3 · Review the Phase 3 strings in `content/purchase.ts` | app |  |  | done 11-18 | 20261118-afae7fa-1 |
| 29 | W5 · Per-insurer claims guidance once real insurers are known | app | | Blocked on C4 | open | |
| 30 | W9/W11 · Gemini brief `docs/tasks/gemini-w9-w11.md` (trim-field text and related copy) | live | | Owner sends to Gemini; Cursor or Claude places it | open | |
| 31 | O9 · Owner: Workers Free vs Paid ($5/month) | live | | Unblocks row 2 | open | |
| 32 | O10 · Owner: verify the info@unlimitinsure.com destination | live | | Unblocks row 5 | open | |
| 33 | O7 · Owner: real advisor portrait (own photo) | app | | Unblocks row 18 | open | |
| 34 | O3 · Owner: consent to display from each named broker | live | | Needed for the verify list and C6 | open | |
| 35 | O8 · Owner: legal / licensed review of the verify list | live | | Launch sign-off, C6 | open | |
| 36 | O4 · Owner: real rate tables and quotation files from insurers | app | | Unblocks rows 8, 29 | open | |
| 37 | O5 · Owner: receiving account for premiums (name, PromptPay or bank) | live | | Unblocks row 9 | open | |
| 38 | O12 · Owner: shop details — seller, products, variants, prices, starting stock, own product photos | live | | Unblocks rows 12, 24 | open | |
| 39 | O13 · Owner: shop checks — accountant (DBD, VAT, receipts) and licensed reviewer | live | | Unblocks row 12 | open | |
| 40 | C16 · Shop products entered in admin (name, description, variants, prices, stock, photos in R2) instead of code in `content/shop.ts`; owner request 11-18 | app | Shop stays off (`SHOW_SHOP`) | Needs R2 for photos; after O12 | done 11-18 | 20261118-8bf853b-1 |
| 41 | Y7 · Answer the old journey redirects (`/quote`, `/quote/results`, `/compare`, `/plans/*`, `/buy/*`) in `lib/edge.ts` / `worker.ts` while no products are published (build-time flag in `wrangler.jsonc` vars, not a D1 read); keep car and sub-model params (`docs/cpu-proposal.md` #1) | app | No behaviour change | Live 22–37 ms CPU each → ~1 ms; `e2e:journey` checks the redirects; measure again with `wrangler tail` | built 11-18 · Claude | |
| 42 | Y8 · Prebuild `/advisor`: static shell, journey params resolved in `AdvisorContact` on the client, `noindex` for param variants via `X-Robots-Tag` in `worker.ts` (`docs/cpu-proposal.md` #2) | app | No behaviour change; LINE message text byte-identical | Live 39–238 ms CPU → ~3 ms; `e2e:journey` checks the LINE message | built 11-18 · Claude | |
Where: `mock` · `app` · `live`
Status: `open` · `do` · `built` · `help` · `done` · `later` · `drop`. Date and builder: `done 11-17 · Claude`. Fit is advisory: `fit: Cursor`.
Numbers are never reused. One line per row. At the start of a batch, `done` rows move to `DONE.md`.
