# Progress

Snapshot of the live tracker (https://claude.ai/artifact/F5LAtBAfu9GNHnhMJpGVoC) taken 2026-09-26 at handover. From now on **this file is the source of truth**: the core manager updates it with each merged change. The tracker page is no longer updated.

**C1 (go live on workers.dev), 2026-09-26:** deployed `59eb9a6` (version `aac6d9cb`). Remote D1 has migrations 0000–0003. Secrets `ADMIN_USERNAME`, `ADMIN_PASSWORD` (re-set by the owner in the dashboard; live version `35a0a23f`) and `SESSION_SECRET` set. Owner login confirmed; dashboard, leads, applications, products, analytics, users and settings open without errors. Both test leads marked ไม่สำเร็จ with note "test lead". Dashboard Git build settings confirmed correct; pushes to `main` auto-deploy. Live checks: all public pages 200, admin pages redirect to login, `/buy` → `/advisor` (purchase off), `e2e:journey` passes on the live URL (one test lead "ทดสอบ" stored). **C1 done.**

**Website-first launch, 2026-09-26 (owner decision):** back office parked (admin still works at `/admin`, nothing public links to it). Contact is LINE `@unlimit.insure`, phone 091-444-5542 and Facebook `Unlimit.th` (`content/contact.ts`): header, mobile sticky bar, footer, advisor page (no form; prefilled LINE message with car and plans). Prices and car values hidden (`SHOW_PRICES=false` in `lib/features.ts`), each replaced by "ขอราคาจริงทาง LINE"; price demo, My Garage and sign-in hidden (`SHOW_AFTER_PURCHASE=false`). LINE/call clicks counted as `contact_line` / `contact_call`. Minimal copy edits in `content/home.ts` and `content/faq.ts` by Core, for the copywriter to review. Broker licence still `[รอข้อมูล]`. Follow-up the same day: claims guide, SEO descriptions and car-model FAQs no longer mention on-site prices or My Garage (claims contact placeholders now show LINE/phone); partner-logo placeholders replaced on the homepage by a "ขอราคาจริงใน 3 ขั้นตอน" LINE band with QR (`SHOW_PARTNER_LOGOS=false`). Terms page still mentions estimated premiums (legal draft, for legal review).

**Stay on Workers Free (owner, 2026-09-26):** keep the budget low; monitor errors (1102) and upgrade only if they appear. To cut CPU: `CATALOG_FROM_CODE=true` (`lib/features.ts`) reads the plan catalogue from `lib/data` instead of D1, so `/`, `/insurance`, the 15 car-model pages and the 5 Lab articles are prebuilt, and `open-next.config.ts` serves prebuilt pages from static assets with cache interception. When real products are imported through admin (C4), set `CATALOG_FROM_CODE=false` and put `export const dynamic = "force-dynamic"` back on `app/(site)/page.tsx`, `insurance/page.tsx`, `insurance/[brandId]/[modelId]/page.tsx` and `lab/[slug]/page.tsx`.

**C5 (domain), 2026-09-26:** `unlimitinsure.com` (registered on this Cloudflare account) and `www.unlimitinsure.com` attached as Worker custom domains in `wrangler.jsonc`; `SITE_URL` defaults to `https://unlimitinsure.com` in production builds (canonical, sitemap, robots). workers.dev stays on.

**2026-10-09 follow-up:** (1) the other session's font/footer work landed as `d001116` (pushed straight to main; reviewed afterwards by Core: OK, Prompt 800 unused, typecheck clean). (2) HSTS raised to one year. Still open: info@unlimitinsure.com (destination verification, then routing rule + test; DevOps DMARC), delete old `D:\Unlimit Insure\repo` after closing the app.

**2026-10-12 SEO (Search Console):** merged `seo/indexing` (cloud session, `18106de`) as `4444129`. Changes:
- `/advisor` is indexed and in the sitemap; it stays noindex only when it carries journey params.
- Lab articles have canonical URLs.
- JSON-LD: WebSite and Organization on the homepage (name, URL and logo only), BreadcrumbList on Lab articles and car-model pages.

Local and live checks passed, and so did journey and a11y. Owner, in Search Console: submit the sitemap, request indexing for `/advisor`, the homepage and 2–3 Lab articles, then "Validate fix" on "Excluded by noindex".

**2026-11-16 backlog reconciled:** `docs/agents.md` now has "Backlog (updated 2026-11-16)": a Status column, done rows at the bottom of each table, open work re-ordered for the live LINE-first site (C2 CPU risk and the Search Console follow-up first). Checked against the repo, this file and the live site (HTTP check today: `/` 200, www and http → 301 apex, workers.dev 404, sitemap 28 URLs, robots and canonicals on the apex, HSTS 1 year, both broker licences in the footer). New rows: C10 Search Console follow-up, C11 info@ email routing, D7 (logo webp, done 2026-09-27), O9 Workers Free vs Paid, O10 info@ destination verification, O11 Search Console steps. Things that did not match the old backlog:
- C1 said "go live on workers.dev"; workers.dev is now off (`workers_dev: false`) and the site runs on unlimitinsure.com.
- D3, D5, D6, W7 and W8 were all done on 2026-09-27 (merged `design/*` / `copy/*` branches; those branches are deleted now), but the backlog still listed them as open.
- W1: no placeholder is left, but the verify item "each named broker consents to display" is still open for the second broker (นางสาววนาลี บุญเกิด, added `084b494`). The company question is answered (individual operator, 2026-09-27).
- W2: the site's email is the owner's Gmail address, not info@unlimitinsure.com; info@ waits for email routing.
- D1: the two Canva article images were never saved to `D:\Unlimit Insure` (no `article-repair.jpg` / `article-excess.jpg`); the real advisor portrait is still missing. **Owner change, 2026-11-16:** no Canva; Codex makes the two article graphics (new row D8, owner Codex, To do). D1 is now the advisor portrait only (from the owner).
- C2 vs the 2026-09-26 "Stay on Workers Free" decision: measurements show every page is 3–27× the Free CPU limit, so the plan choice is back with the owner (O9).
- C8 (old payment slip satisfies the guard) is still open in `lib/db/applications.ts`; D2, W3 and W4 not started.
- The Search Console steps from 2026-10-12 are not recorded as done (O11).
- The old `D:\Unlimit Insure\repo` folder (to delete, 2026-10-09 note) still exists.
- The owner table was headed "Owner (Dave)"; renamed "Owner (Nithi)".

**2026-11-16 branch review (cloud session branches):**
- `codex/onboarding` (`fa03243`: AGENTS.md Codex brief, Codex row and X1–X4 in `docs/agents.md`, `docs/tasks/codex-onboarding.md`): tsc, tests (46) and next build pass. Merged `--no-ff` as `2e99b99`, pushed, remote branch deleted.
- `design/article-images` (`da97c37`, D8): images 960 × 640 webp, 50 KB / 23 KB, no badges, plates or text. tsc, tests and next build pass; `e2e:journey` passes against `next dev`; `/lab` at 390 and 1440 px shows 5 photos, no broken images, no overflow. **Not merged:** `npm run cf:build` fails with "Next.js version 15.5.26 is not supported by the Next.js team", on the branch and on `main` (new row C12), so the Workers preview could not be built; and the designer's look is pending (the repair photo shows a whole technician, the D8 brief said hands at most). Live `/lab` not checked, as nothing was deployed.
- **No Canva (owner, 2026-11-16):** the owner no longer uses Canva. New graphics come from the owner's own photos or from Codex. `design/design-system.md` no longer says to export from Canva. The Canva notes in older entries are history. The unused `canva` ids in `components/brand/Photo.tsx` stay until `design/article-images` is merged, so that branch doesn't conflict; drop them after the merge.
- **PR #1 / C12, 2026-11-16:** merged `cursor/x4-cache-delivery` (head `d3cad08`, `cf:build` now runs `populateCache local`, Next 15 support flag on `cf:build` / `preview` / `deploy`) with `--no-ff` as `c06d641`. Pushed, branch deleted, PR #1 shows merged. Before the merge, on the branch: tsc, tests (46), next build and cf:build passed. Live version `603cc18f` (version 77, 100% of traffic, uploaded by Wrangler 16:35 UTC) came from `d3cad08`. Source for that is Cursor's report: its folder's HEAD and tracked tree matched `d3cad08`, and the only extra file was untracked. Wrangler stores no git SHA, so Core could not check this itself. Cursor changed the dashboard build command to `npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion`. The deploy command and branch are unchanged. "Workers Builds: unlimit-insure" on `c06d641`: **success**, 16:59 UTC. Live after the build: `/` 200, `/lab` `x-opennext-cache: HIT`. C12 and Y1 are done. The flag is a stop-gap; the Next.js upgrade is new row C13.
- **D8 merged, 2026-11-17:** the designer approved the two Lab photos, including the full technician in the repair photo. `design/article-images` (`da97c37`) was merged `--no-ff` as `3b7246f`. Follow-up `19def64` drops the unused `canva` ids from `components/brand/Photo.tsx`. Checks on the merged tree passed: tsc, tests (46), next build, cf:build, `e2e:journey` on `wrangler dev`, and axe on `/lab`, both new articles and `/` at 360 and 1280 px (0 violations, no overflow, no broken images). The full `e2e:a11y` script timed out at `/quote?…&step=use` waiting for "networkidle" (the page itself returned 200 in 0.3 s); this branch does not touch `/quote`, so that is a separate follow-up. Pushed, remote branch deleted. "Workers Builds: unlimit-insure" on `19def64`: **success**, 17:12 UTC. Live `/lab` at 390 and 1440 px: all 5 article photos load at 960 px, no overflow.
- **`e2e:a11y` timeout fixed, 2026-11-17:** the script timed out at `/quote?…&step=use` waiting for "networkidle", locally and on the live site. Cause: by the third page in the shared browser context, the `/?_rsc=…` prefetch is in Chrome's disk cache. Chrome serves it from there and starts its own background `stale-while-revalidate` request (RSC responses carry Next's default `s-maxage=31536000, stale-while-revalidate=2592000`). DevTools reports that request's response (200) but never its "loading finished", so Playwright never sees the network go idle. Users are not affected; the server answers in about 0.2 s. Fix in the test only: `tests/e2e/a11y.mjs` waits for `load`, then up to 5 s for idle without failing. Result on local `wrangler dev`: 54 pages scanned, all 200, 0 violations, no overflow, no errors.
- **Tester feedback → X8, 2026-11-17:** an optional free-text sub-model / engine size after "ปีรถ" (URL param `trim`, max 60 characters, added to LINE messages; not stored, not used for pricing). Split: Codex X8 (logic, `codex/x8-trim-field`), copywriter W9 (label, placeholder, hint), designer D9 (review at 390 / 1440 px + axe). Order: X5 first. `codex/x5-line-chat-journey` was cut before PRs #2 (X6, `fd53454`) and #3 (X7, `cc9b594`) merged on GitHub, and now conflicts with `main` in 11 files, so Codex rebases it and opens a PR; Core merges it; X8 then branches from `main`. X6 and X7 were added to the backlog as done (both Workers Builds passed).
- **X5 and X8 done by Core, 2026-11-17 (owner asked to implement them in this session):**
  - **X5:** the owner kept `main`'s direct car → `/advisor` flow over x5's three-step `/quote`. X5 now carries only the copy files, `SYSTEM.md`, `not-found` and the regenerated verify list. Core edited 6 sentences that claimed the site asks about usage and priorities (copywriter review: W10). Branch `codex/x5-rebase` (`a1e375e`), PR #4.
  - **X8:** optional sub-model / engine-size field (`trim`, cleaned, max 60, not stored). It shows on the homepage, and `/advisor` puts it in the summary and the LINE message. The `/quote`, `/quote/results` and `/compare` redirects keep it. Branch `codex/x8-trim-field` (`b47f870`), PR #5, stacked on #4.
  - **Checks on both branches:** tsc, tests (49 on X5, 56 on X8), cf:build, `e2e:journey`, `e2e:a11y` on local `wrangler dev` (54 pages, 0 violations).
  - **X5 merged and live:** with the owner's OK, merged as `b372b3f`. "Workers Builds: unlimit-insure" passed at 07:23 UTC. Live: `/`, `/advisor`, `/lab` and `/claims` return 200, `/quote` redirects (307) to `/advisor`, and unknown paths return 404.
  - **X8 merged and live:** the owner asked to deploy it before D9 and W9 ("Deploy X8 now"). Merged as `39bea62`. "Workers Builds: unlimit-insure" passed at 07:34 UTC.
    - The live homepage shows the field.
    - `/advisor?…&trim=1.8 Hybrid <b>Premium` gives the LINE message "…Toyota Corolla Cross 2022 · 1.8 Hybrid b Premium" (`<` `>` removed) and is noindex.
    - `/quote?…&trim=1.8` redirects (307) to `/advisor?…&trim=1.8`.
    - D9 and W9 will follow as small changes.
- **Advisor LINE message for admins, 2026-11-17 (owner request, recommended format):** PR #6, merged as `2006483`. "Workers Builds: unlimit-insure" passed at 08:00 UTC.
  - **Format:** one detail per line under a fixed first line "ขอราคาประกันรถยนต์ (จากเว็บไซต์)" (for tagging in LINE OA Manager).
  - **Details:** car (with " (EV)" for electric models), year, sub-model, and three blanks for the customer (type of cover, dealer or garage repair, current policy end date).
  - **Source page:** shown on the last line, from an allow-listed `from` param (`home`, `model`). Model-page links leave the year blank, because that page picks a default year.
  - **Checks:** tsc, 62 tests, cf:build, `e2e:journey`, `e2e:a11y` (54 pages, 0 violations). Live `/advisor` messages checked with and without a car.
  - **Copy review:** W11.
- **Team change, 2026-11-17 (owner decision, via CORE):** to save Claude quota, Claude is Core only.
  - **Copywriter:** Grok drafts all customer-facing text and the owner approves it. Cursor applies it in `content/**` on `copy/*`.
  - **Designer:** Cursor, on `design/*`.
  - **Images:** generated images come from Grok, SVG diagrams and icons from Core, real photos from the owner. Never Canva or Codex.
  - **Codex:** retired (ChatGPT cancelled). X1 dropped; X2 → Core C8; X3 → Cursor Y5; X4 → Cursor Y6.
  - **Briefs:** `docs/tasks/gemini-w9-w11.md` (was `grok-w9-w11.md`) (W9 and W11) and `docs/tasks/cursor-d9.md` (D9). The old Claude brief `docs/tasks/w9-trim-text.md` is superseded.
- **Gemini replaces Grok, 2026-11-17 (owner):** first generated images (Grok was not good at graphics), then copywriting too. Gemini drafts all customer-facing text and generated images; the owner approves; Cursor applies copy on `copy/*`. The brief was renamed to `docs/tasks/gemini-w9-w11.md`. The Grok lines above are history.
- Playwright's bundled headless shell is missing on this PC; e2e ran with `CHROMIUM` set to an installed Playwright Chromium.

**Cloudflare review (Dev Report 2026-09-27), code items done:** `worker.ts` wraps the OpenNext handler: http and www → 301 `https://unlimitinsure.com` (U1/U4), security headers HSTS (1 day; raise to 1 year after a week), nosniff, X-Frame-Options DENY, Referrer-Policy (U5), shared-cacheable HTML → `s-maxage=300, stale-while-revalidate` (U3); `public/_headers` caches `/_next/static/*` for a year. `workers_dev: false` (the workers.dev address is off; use unlimitinsure.com). Local preview needs `DISABLE_CANONICAL_REDIRECT=1` in `.dev.vars`. Open: U6 email DNS records (owner Q1), optional dashboard "Always Use HTTPS", U2 plan choice.

**Marketing images, 2026-09-27:** Facebook cover and LINE OA cover uploaded by the owner; LINE rich menu skipped for now (image + button actions ready in `design/marketing/`). Site share image `public/og-image.jpg` live.

**Photos (pending on owner), 2026-09-27:** (1) advisor portrait 4:5: must be a REAL photo of the owner/advisor (no AI person); until then the LineChatPreview graphic stays. (2) `article-repair` and (3) `article-excess` (3:2): AI images generated in the owner's Canva (Uploads, files `AaDhKopJUjzbVJXtACIaYA-…jpg` workshop and `AaDhKo441NDD2O-…jpg` dent, 1536×1024, no logos/plates); owner to download them to `D:\Unlimit Insure` as `article-repair.jpg` / `article-excess.jpg`, then Core/designer convert to .webp ≤250 KB and replace the Lab placeholder tiles.

**Vehicle list, 2026-09-27:** 16 brands / 125 models (current + discontinued 2015–2023) in `lib/data/vehicles.ts`, live on the site via `CATALOG_FROM_CODE`. Model names/years reviewed; `newPrice` unverified (spot check: 3 of 5 discontinued prices not on the cited archive page) and must be verified before prices are switched on. Remote D1 catalogue tables were deliberately NOT reseeded (owner: skip for now), so admin → แพ็กเกจ still shows the old 15-model sample; `seed/mock-catalog.sql` matches the code if a resync is wanted (0 applications/snapshots at the time; D1 export taken first).

**Google Search Console, 2026-09-27:** domain property `unlimitinsure.com` verified under gopanther.th@gmail.com via a DNS TXT record (`google-site-verification=…` on the apex; do NOT remove it). Sitemap `https://unlimitinsure.com/sitemap.xml` submitted: Success, 27 pages discovered.

**C2 (Workers plan), 2026-09-26:** account is on **Workers Free** (10 ms CPU per request). Measured with `wrangler tail` on the live site: `/` 273 ms (cold start), `/quote/results` 62, `/lab` 51, `/quote` 43, `/advisor` 37, `/compare` 32, `/admin/login` 26 ms CPU; all returned OK today, but every page is 3–27× the Free limit, so real traffic risks error 1102 (exceeded CPU). PBKDF2 at 100k iterations adds ~14 ms (measured locally), which is small next to page rendering, so lowering iterations would not fix this. Recommendation: Workers Paid ($5/month, up to 5 min CPU). Owner decision; no code change needed.

Totals: 21 done · 9 in progress · 30 to do · 1 blocked · 61 tasks.

Owners: **Core** = system core manager (code, data, deploy) · **Designer** · **Copy** = copywriter · **Business** = owner · **Legal** = licensed reviewer. (Tracker used PM → Core, Content → Copy.)

## Phase 0 — Prototype foundation
11/11 done

| # | Task | Owner | Status | Note |
|---|---|---|---|---|
| P0.1 | Product master and V1 scope agreed | Business | Done |  |
| P0.2 | Next.js + TypeScript project, design tokens, logo mark | Core | Done |  |
| P0.3 | Homepage in the blue/white direction | Core | Done |  |
| P0.4 | Quote journey: My Car, usage, priorities | Core | Done |  |
| P0.5 | Results with transparent match and filters | Core | Done |  |
| P0.6 | Smart Compare with difference summary | Core | Done |  |
| P0.7 | Plan detail, Explain dialogs, coverage simulator | Core | Done |  |
| P0.8 | Insurance Lab: 5 articles with tools | Core | Done |  |
| P0.9 | Advisor handoff form (not stored yet) | Core | Done |  |
| P0.10 | Thai copy: glossary, Lab, FAQ, scenarios, homepage | Copy | Done |  |
| P0.11 | Push code to GitHub repo unlimit-insure | Business | Done | Pushed to gopantherth-sketch/unlimit-insure (main) |

## Phase 1 — Business data and compliance intake
0/13 done

| # | Task | Owner | Status | Note |
|---|---|---|---|---|
| P1.1 | Confirm legal entity, broker/agent licence number | Business | To do | Shown in the trust strip and footer |
| P1.2 | List authorised insurers and get logo usage permission | Business | To do |  |
| P1.3 | Provide 3–10 real quotations | Business | To do | Fill /templates/unlimit-product-import.xlsx from them, or send the files and we fill it |
| P1.4 | Provide rate tables (Excel / broker portal / API access) | Business | To do | Decides how pricing is imported |
| P1.5 | Provide brochures and policy wording per product | Business | To do | Source documents for verified coverage |
| P1.6 | Document current sales, payment and policy issuance flow | Business | To do | Who receives money, who issues receipts |
| P1.7 | Choose vehicle data source (models, sub-models, values) | Business | To do |  |
| P1.8 | Supply car and lifestyle photography | Business | To do | Hero and lifestyle band slots are ready |
| P1.9 | Review copy claims in verify-before-launch.md | Legal | To do | 124 items in docs/verify-before-launch.md (generated from content) |
| P1.10 | PDPA review: privacy notice, consent wording, retention | Legal | To do |  |
| P1.11 | OIC rules for online sales and required disclosures | Legal | To do |  |
| P1.12 | Revise copy after legal review | Copy | To do |  |
| P1.13 | Normalise real data into the product model | Core | To do | After quotations and rate tables arrive |

## Phase 2 — V1 production launch
5/16 done

| # | Task | Owner | Status | Note |
|---|---|---|---|---|
| P2.1 | Database schema on Cloudflare D1: product versions, sources, leads, consents, snapshots | Core | Done | Drizzle + D1; migrations in repo |
| P2.2 | Product import pipeline from rate tables and documents | Core | Done | Template at /templates/unlimit-product-import.xlsx; upload at /admin/import; rows become drafts pending verification |
| P2.3 | Replace mock catalogue with verified products | Core | To do |  |
| P2.4 | Admin: products and versions, with source verification | Core | Done | Verify against document, publish gate (only verified sources), draft/retire |
| P2.5 | Admin: leads and quotes list | Core | In progress | Leads list, detail, status, notes done. Saved quotes list comes with quote saving. |
| P2.6 | Store leads with consent log; notify advisors (LINE / email) | Core | In progress | Alerts built for leads, applications, documents, payments (LINE OA + Resend email). Switch on by adding secrets; test button in admin → ตั้งค่า. |
| P2.7 | Real vehicle data and valuation | Core | To do |  |
| P2.8 | Privacy policy and terms pages | Copy | Blocked | Drafts live at /privacy and /terms. Waiting for legal review (P1.10, P1.11). |
| P2.9 | Replace placeholder logos and imagery | Core | To do |  |
| P2.10 | SEO: metadata, sitemap, Lab articles per car model | Copy | Done | Metadata, robots, sitemap, 15 car-model pages at /insurance (draft copy) |
| P2.11 | Analytics and funnel events (no personal data) | Core | In progress | Built: anonymous counters + /admin/analytics. Migration 0001 applied on remote D1; deployed 2026-09-26 (C1). |
| P2.12 | Hosting on Cloudflare Workers + D1, domain, backups, monitoring | Core | In progress | Live: unlimit-insure.gopanther-th.workers.dev (D1 APAC), `main` @ 59eb9a6 deployed 2026-09-26; migrations 0000–0003 applied; admin and session secrets set; owner login confirmed; Git builds from `main` auto-deploy. Pending: custom domain (C5), backups, monitoring. |
| P2.13 | QA: mobile devices, accessibility, performance | Core | In progress | Automated pass done: 59 page scans (360px + 1280px), 0 accessibility violations, no overflow, no errors. Real-device and live-site speed test after deploy. |
| P2.14 | Compliance sign-off before launch | Legal | To do |  |
| P2.15 | Soft launch and first-week review | Business | To do |  |
| P2.16 | Multi-user admin: owner/staff accounts, lead assignment, per-user activity log | Core | Done | Migrations 0001 + 0002 applied on remote D1; deployed 2026-09-26. Break-glass ADMIN_USERNAME login kept. |

## Phase 3 — V2 purchase and My Garage
5/9 done

| # | Task | Owner | Status | Note |
|---|---|---|---|---|
| P3.1 | Customer access: private link + phone last-4 (OTP / LINE login later) | Core | In progress | Private link + phone check and My Garage lookup (reference + phone) built. Real login deferred. |
| P3.2 | Purchase flow: customer, vehicle, documents, review | Core | Done | /buy/[plan]: form, consents, disclosures, commercial-use block. Tested end to end locally. |
| P3.3 | Secure document upload and storage | Core | Done | R2 bucket unlimit-insure-docs (created when purchase is switched on, task C6). Type sniffing, 10 MB cap, private downloads only. |
| P3.4 | Payment integration (PromptPay / card / instalments) | Core | In progress | Manual PromptPay QR / bank transfer + slip upload, staff confirms. Card/instalments later. Owner sets account in admin → ตั้งค่า. |
| P3.5 | Insurer submission and application status timeline | Core | Done | Manual staff steps with guarded status moves; customer timeline shows who acts at each step. |
| P3.6 | Quote snapshot at purchase | Core | Done | Snapshot frozen at submit; final premium change shown to customer with reason before payment. |
| P3.7 | My Garage: policies, documents, coverage view | Core | In progress | Per-application tracking page with policy, documents, renewal days. Multi-car garage needs login. |
| P3.8 | Claims guidance content per insurer | Copy | In progress | Generic claims guidance live at /claims (draft). Per-insurer details need real insurer data. |
| P3.9 | Purchase flow copy and required disclosures | Copy | Done | content/purchase.ts. 12 items added to verify-before-launch list (140 total). |

## Phase 4 — V3 renewal and retention
0/7 done

| # | Task | Owner | Status | Note |
|---|---|---|---|---|
| P4.1 | Renewal reminders at 60/30/15/7 days | Core | To do |  |
| P4.2 | Renewal Intelligence: current vs offers, what changed | Core | To do |  |
| P4.3 | Claims support flow and contacts | Core | To do |  |
| P4.4 | Policy health status (complete / needs attention) | Core | To do | No numeric score without a transparent formula |
| P4.5 | Advisor CRM: pipeline, notes, next actions | Core | To do |  |
| P4.6 | Insurer / broker API integrations | Core | To do |  |
| P4.7 | LINE OA messaging automation | Core | To do |  |

## Phase 5 — V4 expansion
0/5 done

| # | Task | Owner | Status | Note |
|---|---|---|---|---|
| P5.1 | Multi-vehicle household in My Garage | Core | To do |  |
| P5.2 | Motorcycle insurance | Core | To do |  |
| P5.3 | Travel insurance | Core | To do |  |
| P5.4 | Health insurance | Core | To do |  |
| P5.5 | Advanced personalisation | Core | To do |  |
- **W9 + W11 live, 2026-11-17:** Gemini drafted the text and the owner approved it. Core applied it because the Cursor branch was not pushed (owner: "You do it"). PR #9, merged as `9f31ec2`. "Workers Builds" passed at 15:05 UTC.
  - **Live homepage:** the field shows "รุ่นย่อย (ไม่บังคับ)" with the example "เช่น 1.8 Sport".
  - **Live LINE message:** reads "ปีรถ: …" and has the bracketed options.
  - **Checks before the merge:** tsc, 62 tests, cf:build, `e2e:journey`, `e2e:a11y` (54 pages, 0 violations).
  - **Layout:** the hint wraps to two lines at 1024 px; that is for D9.
- **C10 / O11, Search Console review, 2026-11-17 (read only; nothing clicked in Search Console):** property `sc-domain:unlimitinsure.com`, read from the owner's Google account.
  - **Pages:** 41 indexed, 33 not indexed. Reasons, all with validation "Not started":
    - Excluded by noindex (19, Website): `/advisor?brand=…&plans=…`, `/compare?…` and `/quote/results?…` journey URLs, last crawled 8–20 Oct. **Expected:** noindex on purpose; live `/advisor?…` returns `noindex, follow` with canonical `/advisor`.
    - Alternate page with proper canonical tag (7, Website): `/plans/<id>?brand=…&model=…&year=2025` (BYD Dolphin, Corolla Cross), crawled 17–18 Oct. **Expected:** these now 307 to `/advisor`.
    - Page with redirect (4, Website): `https://www.`, `http://www.`, `http://` home, `/quote/results`. **Expected** (301 to apex; `/quote/results` 307).
    - Discovered, currently not indexed (2, Google): **`/advisor`** and `/insurance/honda/honda-city`, never crawled. **Needs the owner:** request indexing.
    - Crawled, currently not indexed (1, Google): `http://unlimitinsure.com/_next/static/media/…woff2` (a font file, Oct 1). **Expected**, harmless.
  - URL inspection: `/` is on Google (indexed).
  - **Sitemaps:** `https://unlimitinsure.com/sitemap.xml`, submitted 2026-09-27, last read 2026-11-13, Success, 28 pages discovered. The "submit sitemap" step in O11 is already done.
  - **Performance, last 3 months (web):** 2 clicks, 350 impressions, CTR 0.6%, average position 58.7. The clicks came from `/insurance/mg/mg-4` and `/insurance/toyota/toyota-corolla-cross`. Top pages by impressions: `/insurance/byd/byd-dolphin` (111), `/lab/type1-vs-2plus` (77), `/lab/ev-insurance` (51), `/insurance/byd/byd-atto-3` (31), `/insurance/isuzu/isuzu-d-max` (22). Top queries (39 in all, 0 clicks each): "ประกัน ชั้น 1 กับ 2+ ต่างกันอย่างไร" (51), "ประกันรถไฟฟ้า byd" (32), "ประกัน byd dolphin" (28), "ประกันรถ ev ต่างจากรถน้ำมันอย่างไร" (25), plus Indonesian "asuransi mobil byd …" queries.
  - **Repo and live check (curl):** www and http 301 to the apex (`worker.ts` → `lib/edge.ts`). `/quote`, `/compare`, `/plans/*`, `/buy/*` 307 to `/advisor` (Next `redirect()` in the page files). Robots disallows `/admin` and `/api` only. Canonicals are correct. 27 of 28 sitemap URLs return 200.
  - **Needs a code fix (not made; waiting for the owner's OK):**
    1. `app/sitemap.ts` hardcodes `/quote`, which redirects to `/advisor` while products are hidden. Leave it out while there are no products, as `/garage` is gated today.
    2. Optional: if products stay hidden for long, make the hidden-product redirects permanent (`permanentRedirect`, 308) so Google drops the old `/plans`, `/compare` and `/quote` URLs sooner.
  - **Owner steps (O11, updated):** sitemap already submitted, nothing to do there. Request indexing for `/advisor` (not indexed yet), `/insurance/honda/honda-city`, and 2–3 Lab articles that aren't showing yet (e.g. `/lab/dealer-vs-garage`, `/lab/flood-cover`). Do **not** click "Validate fix" on noindex, alternate canonical or redirect: those states are intended, so validation would fail or prove nothing.
