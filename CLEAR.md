# Clear

Process: `D:\core-process\AGENTS.md`

Code:  UNL
Usually: —
Local: — · —
Live:  20261120-3c64097-1 · 2026-11-20

Nithi marks by number: `do: 3, 5 · later: 4 · drop: 2`. Only `do` is work.

Rows came from the old backlog in `docs/agents.md` (adopt 2026-11-18); its ID is first in each Item. Details and briefs: that table and `docs/tasks/`.

| # | Item | Where | Don't touch | Suggest | Status | Candidate |
|---|---|---|---|---|---|---|
| 1 | Release lock — deploys today via Cloudflare Workers Builds on push to `main` (OpenNext), or `npm run deploy` from the PC; no candidate or GO line | live |  | Structure: every merge to `main` goes live, so the GO line is skipped. Lever: rule (deploy only via a candidate) | done 11-18 | 20261118-afae7fa-1 |
| 2 | C2 · Workers Free 10 ms CPU limit vs 26–273 ms per page; risk of error 1102 under real traffic | live | | Owner decision O9 (Workers Paid $5/month) | done 11-18 | 20261118-62110f2-1 · all public pages 0 ms CPU (docs/cpu-proposal.md) |
| 3 | C10 · Search Console re-check around 2026-11-24: Pages report, `/advisor` and `/insurance/honda/honda-city` indexed | live | Do not "Validate fix" intended states | Waits for Google crawl | open | |
| 4 | C3 · Live QA on real phones (iOS Safari, Android Chrome) and live speed; not recorded yet | live | | Emulated 11-19 (Claude): iPhone 13 390, Pixel 7 412, 360 px on 9 public pages: no overflow, no page errors, axe clean (rows 20/22). Repeat loads 25–40 ms to first byte, largest paint ≤ 0.6 s; first visit ~1 s (new connection). Homepage 521 KB (hero 111 KB). Fixed: `.link-arrow` links 44 px tall on phones (were 20), hero eyebrow 13 px (was 11). Still open: Nithi on a real iPhone (Safari) and Android (Chrome) | open | |
| 5 | C11 · Route info@unlimitinsure.com (routing rule + test), then DNS / DMARC; copywriter switches `contact.email` | live |  | DMARC TXT still missing (Cloudflare change, needs Nithi yes) | done 11-20 · Claude | 20261120-59fbedb-1 |
| 6 | C8 · Payment slip guard: an old slip still passes after staff sends it back; require an upload after the last move to awaiting_payment (`lib/db/applications.ts`) + vitest cases | app |  | Must land before C6; purchase is off so no live impact | done 11-18 | 20261118-afae7fa-1 |
| 7 | C13 · Upgrade Next.js 15 to a supported major with matching `@opennextjs/cloudflare`; remove `--dangerouslyUseUnsupportedNextVersion` from `package.json` and the dashboard build command | app |  |  | done 11-18 | 20261118-df708c8-1 |
| 8 | C4 · Import real products (admin → นำเข้าข้อมูล); retire the mock catalogue, `CATALOG_FROM_CODE=false`, restore `force-dynamic` | app | | Blocked on owner data O4 | open | |
| 9 | C6 · Switch on online purchase (R2 bucket, `r2_buckets`, `PURCHASE_ENABLED=true`, payment account, `e2e:purchase`) | live | | Blocked on C4, C8, O5, O8; also update the privacy line "ไม่มีแบบฟอร์มเก็บข้อมูลส่วนบุคคล" in `content/legal.ts` (W10 review) | open | |
| 10 | C7 · Staff alerts via LINE (`lib/notify` ready; needs Messaging API token + `LINE_ALERT_TO`) | app | | Parked by owner | open | |
| 11 | C9 · Phase 4: renewal reminders and renewal compare | app | | Blocked on real policies | open | |
| 12 | C15 · Shop launch: `SHOW_SHOP` on, footer link, sitemap, indexing request, one real test order | live |  | Blocked on O12 (seller name, plain cloth photo, products entered in live admin), O13 (C14 shop build live hidden as `1da12df`, 11-18) | done 11-20 · Claude | 20261120-425fc45-1 |
| 13 | Y2 · Measure live CPU per page with `wrangler tail` (`/`, `/lab`, `/quote`, `/advisor`, one car page) | live |  |  | done 11-18 | 20261118-afae7fa-1 |
| 14 | Y5 · Run `e2e:journey` and `e2e:a11y` against `BASE_URL=https://unlimitinsure.com` | live |  |  | done 11-18 | 20261118-afae7fa-1 |
| 15 | Y6 · CPU proposal: what still renders per request, what can be prebuilt or cached, cold start of `/`; ranked, with expected savings | app | No behaviour change | fit: Cursor | done 11-18 | 20261118-afae7fa-1 |
| 16 | Y3 · CPU fixes from the approved parts of Y6 | app | | After 15 | done 11-18 | 20261118-62110f2-1 · all public pages 0 ms CPU (docs/cpu-proposal.md) |
| 17 | Y4 · Deploy runbook in `docs/deploy.md`: Next 15 flag, how to pick the Cloudflare account, untracked files that affect builds, rollback | app |  | Fold into row 1 | done 11-18 | 20261118-afae7fa-1 |
| 18 | D1 · Advisor portrait 4:5 `public/images/advisor.webp` — a real photo of the owner/advisor, no AI person | app | | Blocked on owner photo O7 | open | |
| 19 | D2 · Add the Phase 3 components to `design/design-system.md` | app | | | done 11-18 · Claude | |
| 20 | D9 · X8 trim-field review at 390 and 1440 px (homepage selector, trim on `/advisor`); axe clean | live | No wording changes | fit: Cursor · brief `docs/tasks/cursor-d9.md` | done 11-19 | 20261118-a3f739d-1 |
| 21 | D4 · Insurer logo strip stays hidden (`SHOW_PARTNER_LOGOS=false`) until licensed logos with permission | app | | Blocked on owner logos | open | |
| 22 | D10 · Shop design review: product card and page at 390/1440, variant/quantity picker, out of stock, admin Orders; axe clean | app |  | fit: Cursor · shop build is live hidden | done 11-19 | 20261119-c847c24-1 |
| 23 | W12 · Content plan from Search Console: three rounds, A first | live | | Owner pastes round A into Gemini (`docs/tasks/w12-content-plan.md`) | open | |
| 24 | W13 · Shop copy: `/shop` intro, SEO text, product names and descriptions (owner facts only), order message label | app |  | Gemini drafted, owner approved 11-19. Page, search and LINE text live; product text for live admin in `docs/tasks/gemini-w13.md` (owner enters) | done 11-19 · Claude · review: pass · Cursor (intro, steps 1–3, /shop SEO and ราคาสินค้า: match the brief) | 20261119-d3b846c-1 |
| 25 | W10 · Review the X5 copy edits (PR #4, merged) | live | | | done 11-19 · Claude | |
| 26 | W6 · SEO titles and descriptions final pass (`content/seo.ts`, `docs/seo-plan.md`) | live |  |  | done 11-18 | 20261118-afae7fa-1 |
| 27 | W4 · Turn `docs/verify-before-launch.md` into a question sheet grouped by reviewer | app |  |  | done 11-18 | 20261118-afae7fa-1 |
| 28 | W3 · Review the Phase 3 strings in `content/purchase.ts` | app |  |  | done 11-18 | 20261118-afae7fa-1 |
| 29 | W5 · Per-insurer claims guidance once real insurers are known | app | | Blocked on C4 | open | |
| 30 | W9/W11 · Gemini brief `docs/tasks/gemini-w9-w11.md` (trim-field text and related copy) | live | | Owner sends to Gemini; Cursor or Claude places it | done 11-19 | PR #9 `9f31ec2`, live 2026-11-17 |
| 31 | O9 · Owner: Workers Free vs Paid ($5/month) | live | | Unblocks row 2 | done 11-19 | Workers Paid: owner already pays $5/month (owner 11-19); the 10 ms Free CPU limit no longer applies |
| 32 | O10 · Owner: verify the info@unlimitinsure.com destination | live | | Unblocks row 5 | done 11-20 · Nithi (destination verified, rule exists, test email arrived) | |
| 33 | O7 · Owner: real advisor portrait (own photo) | app | | Unblocks row 18 | open | |
| 34 | O3 · Owner: consent to display from each named broker | live | | Needed for the verify list and C6 | open | |
| 35 | O8 · Owner: legal / licensed review of the verify list | live | | Launch sign-off, C6 | open | |
| 36 | O4 · Owner: real rate tables and quotation files from insurers | app | | Unblocks rows 8, 29 | open | |
| 37 | O5 · Owner: receiving account for premiums (name, PromptPay or bank) | live | | Unblocks row 9 | open | |
| 38 | O12 · Owner: shop details — seller, products, variants, prices, starting stock, own product photos | live | | 11-19: 2 products live in D1 (sponge 50 บาท, cloth 35 บาท, stock 50 each, published, approved W13 text, photos). Still needed: seller name, plain cloth photo (placeholder `microfiber-cloth` deleted 11-19) | open | |
| 39 | O13 · Owner: shop checks — accountant (DBD, VAT, receipts) and licensed reviewer | live | | Unblocks row 12 | open | |
| 40 | C16 · Shop products entered in admin (name, description, variants, prices, stock, photos in R2) instead of code in `content/shop.ts`; owner request 11-18 | app | Shop stays off (`SHOW_SHOP`) | Needs R2 for photos; after O12 | done 11-18 | 20261118-8bf853b-1 |
| 41 | Y7 · Answer the old journey redirects (`/quote`, `/quote/results`, `/compare`, `/plans/*`, `/buy/*`) in `lib/edge.ts` / `worker.ts` while no products are published (build-time flag in `wrangler.jsonc` vars, not a D1 read); keep car and sub-model params (`docs/cpu-proposal.md` #1) | app | No behaviour change | Live 22–37 ms CPU each → ~1 ms; `e2e:journey` checks the redirects; measure again with `wrangler tail` | done 11-18 | 20261118-b4e6a52-1 |
| 42 | Y8 · Prebuild `/advisor`: static shell, journey params resolved in `AdvisorContact` on the client, `noindex` for param variants via `X-Robots-Tag` in `worker.ts` (`docs/cpu-proposal.md` #2) | app | No behaviour change; LINE message text byte-identical | Live 39–238 ms CPU → ~3 ms; `e2e:journey` checks the LINE message | done 11-18 | 20261118-b4e6a52-1 |
| 43 | Y9 · Find why prebuilt pages doubled in CPU after Next 16 / OpenNext 1.20.16 (`/` 4–6 → 8–10 ms, `/lab` 2–3 → 5, car page 2–3 → 4–8; `docs/cpu-proposal.md` re-measure) and propose a fix, e.g. serve prebuilt HTML from static assets before the worker | app | No behaviour change | `/` is close to the 10 ms Free limit; measure with `wrangler tail --ip self` | done 11-18 | 20261118-62110f2-1 |
| 44 | C17 · Show sold out on `/shop` product cards: a product whose active variants all have stock 0 gets a "สินค้าหมด" badge on its card (same `/api/shop/stock` data as the product page; the list stays prebuilt-friendly) | app | Shop stays off (`SHOW_SHOP`) | Found in the D10 review (row 22); text from `content/shop.ts` | done 11-19 | 20261119-bb6cc09-1 |
| 45 | O14 · Owner: add DMARC TXT `_dmarc` = `v=DMARC1; p=none; rua=mailto:info@unlimitinsure.com` in Cloudflare DNS (not found on Cloudflare's nameserver 11-20) | live | | 11-20: added by Claude in Cloudflare DNS at Nithi’s request (earlier saves had not taken); both Cloudflare nameservers answer v=DMARC1; p=none; public resolvers follow once their cached "not found" expires | done 11-20 · Claude | |
| 46 | Shop link in the header menu (desktop + phone): ร้านค้า before เกี่ยวกับเรา, shown while SHOW_SHOP is on (Nithi 11-20: customers only had the footer link) | live |  |  | done 11-20 · Claude | 20261120-8f06b99-1 |
| 47 | C18 · Shop: more photos per product and drafts. Admin uploads up to 6 photos per product, picks the main one (cover on the card), removes any; the product page shows thumbnails to switch. Edits to a product on sale (text, photos, variants, prices) stay a draft until “เผยแพร่การแก้ไข”, or are discarded; customers only see the published version. Needs migration 0006 (two columns) on live before the deploy | app | Shop is live | Nithi 11-20: more photos; drafts (“customer sees only the published version”) | done 11-20 · Claude | 20261120-3c64097-1 |
Where: `mock` · `app` · `live`
Status: `open` · `do` · `built` · `help` · `done` · `later` · `drop`. Date and builder: `done 11-17 · Claude`. Fit is advisory: `fit: Cursor`.
Numbers are never reused. One line per row. At the start of a batch, `done` rows move to `DONE.md`.
