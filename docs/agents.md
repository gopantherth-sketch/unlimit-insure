# Team: who does what

**Owner decision, 2026-11-17:** to save Claude quota, Claude is Core only. Later the same day the owner moved copywriting and generated graphics from Gemini to **Gemini**. The designer and copywriter roles moved off Claude, and Codex is retired (ChatGPT cancelled).

| Role | Who | Folder | Owns | Git |
|---|---|---|---|---|
| **Core** (project lead) | Claude Code, brief `.claude/agents/unlimit-core.md` | `unlimit-insure` (has `main`) | Code, data, database, admin, APIs, security, tests, merging, deploys, Cloudflare, `docs/progress.md`, SVG diagrams/icons/infographics | Commits and pushes `main` |
| **Copywriter** | **Gemini** drafts; **Cursor** applies | Gemini: chat only. Cursor: `unlimit-insure-copy` | Every customer-facing word (Thai and English), SEO text, disclosures, LINE prefilled messages, the verify list. The owner approves the wording. | Gemini can't edit the repo. Cursor puts the approved text into `content/**` on `copy/*`, pushes; Core merges |
| **Designer** | **Cursor** | `unlimit-insure-design` | Layout, colour, type, responsive and accessibility polish | Branch `design/*`, pushed; Core merges |
| **DevOps** | **Cursor**, brief `AGENTS.md` | its own worktree | Build and deploy tooling; Cloudflare (Workers, caching, headers, Builds); performance and CPU; live checks | Branch `cursor/*`, pushed; Core merges |
| ~~Codex~~ | Retired 2026-11-17 | — | Open tasks moved: X2 → Core (C8), X3 → Cursor (Y5), X4 → Cursor (Y6) | — |

**Images (all projects)**
- Generated images → **Gemini** (owner, 2026-11-17: Gemini was not good at graphics).
- Diagrams, icons, infographics → **Claude** (Core), as SVG in the repo.
- Real cars, places and people → the **owner's photos**.
- Never Canva or Codex.

**Boundaries**
- The designer never changes wording. It leaves `TODO(copy)` notes for the copywriter.
- The copywriter never changes layout or styles. When Cursor applies copy, it changes `content/**` text only, exactly as approved.
- Cursor keeps design, copy and DevOps work on separate branches (`design/*`, `copy/*`, `cursor/*`), one role per branch.
- Logic changes go to Core.
- Cursor deploys:
  - production deploys run only from `main`, after Core has merged; Cursor may run them when the owner asks;
  - a hotfix deploy from a branch needs the owner's yes in chat, and a PR opened at the same time that Core merges the same day.
- Core never changes wording or visuals itself, except in emergencies or when the owner asks it directly. If it does, it says so in the commit message and adds a review row for the copywriter or designer.

## Setup (Windows, once)
In the `unlimit-insure` folder, run:

```
powershell -ExecutionPolicy Bypass -File scripts\setup-local-agents.ps1
```

The script:
- pulls `main` and runs `npm install`;
- creates the two worktrees next to the project, detached at `origin/main`, and runs `npm install` in each;
- opens three windows running `claude remote-control`, each showing its first message in yellow. Send that message into the session in the window.

Run it again to reopen the windows. Each agent can run on its own too: open `claude` in its folder and send the first message.

First messages:
- **Core:** "Use the unlimit-core agent brief in .claude/agents/unlimit-core.md. Read HANDOVER.md and docs/progress.md, then tell me the top 3 next steps."
- The designer and copywriter windows are no longer used (2026-11-17). Keep the two worktrees: Cursor uses them for `design/*` and `copy/*` branches. The `.claude/agents/unlimit-designer.md` and `unlimit-copywriter.md` briefs still hold the house rules (tone, design system) for Cursor and Gemini to follow.

## How work flows
1. The owner gives a request to Core.
2. Core splits it into tasks with one owner each. Each task gets the goal, the files and what "done" looks like, and Core writes a paste-ready brief in `docs/tasks/`.
3. Copy: the owner pastes the brief into Gemini, approves the text, then hands it to Cursor, who applies it on `copy/*`.
4. Design and DevOps: Cursor works on `design/*` or `cursor/*` and reports back.
5. Core reviews, runs the checks, merges, deploys and updates `docs/progress.md`.

## Backlog (updated 2026-11-17)
Reconciled with the repo, `docs/progress.md` and the live site on 2026-11-16. The site is live on https://unlimitinsure.com (LINE-first; prices and online purchase off). Open rows are in priority order: CPU risk and the Search Console follow-up first, then the copy and design work on the live site, then the real-data work (C4, C6). Done rows sit at the bottom of each table with their dates. Status and history: `docs/progress.md`.

Status: **Done** · **In progress** · **To do** · **Blocked** (waiting on someone else).

### Core
| # | Task | Status | Blocked on / note |
|---|---|---|---|
| C2 | Workers plan. Measured 2026-09-26 on **Workers Free** (10 ms CPU limit): live pages use 26–273 ms CPU (`/` 273 ms cold, `/quote/results` 62, `/lab` 51, `/quote` 43, `/advisor` 37, `/compare` 32, `/admin/login` 26), so real traffic risks error 1102 (exceeded CPU). Lowering PBKDF2 iterations would not fix it (~14 ms). Recommendation: Workers Paid ($5/month). No code change needed. Until then, watch for 1102 errors. | Blocked | **Owner: Workers Paid decision (O9)** |
| C10 | Search Console follow-up after the SEO merge `4444129` (2026-10-12). **Reviewed 2026-11-17** (progress.md):<br>- 41 pages indexed, 33 not; 31 of the 33 are intended (noindex journey URLs, `/plans` canonicals, redirects, a font file).<br>- The homepage and Lab articles are indexed; the sitemap was read 2026-11-13 (Success).<br>- Fixed the same day: `/quote` dropped from the sitemap (`829fa9a`, 27 URLs), and the hidden-product redirects made permanent 308 (`6fe828b`).<br>- Left to do: around **2026-11-24**, re-check the Pages report and confirm `/advisor` and `/insurance/honda/honda-city` are indexed (both were "Discovered, currently not indexed"; indexing requested 2026-11-17).<br>- Do not "Validate fix" the intended states. | In progress | Google crawl |
| C3 | Live QA: real phones (iOS Safari, Android Chrome), speed on the live URL, and `e2e:journey` / `e2e:a11y` against `BASE_URL=https://unlimitinsure.com`. Hand visual issues to the designer. Last live checks: journey + a11y passed on the live site 2026-10-12 (SEO merge); HTTP spot check 2026-11-16 (pages 200, www/http → 301 apex, HSTS 1 year, workers.dev off). Real-device and live speed tests not recorded yet. | In progress | — |
| C11 | Email: route info@unlimitinsure.com once the destination is verified (routing rule + test), then DNS records / DMARC (Cloudflare review U6). Then the copywriter switches `contact.email` from the current Gmail address. | Blocked | O10 |
| C8 | Small fix: after staff sends a payment slip back (payment_submitted → awaiting_payment), the old slip still satisfies the "slip uploaded" guard. Require a slip uploaded after the last move to awaiting_payment (`lib/db/applications.ts` `moveApplication`). Still open in code on 2026-11-16; purchase is off, so no live impact yet. Must be fixed before C6. Back with Core since Codex retired (2026-11-17, was X2). Add vitest cases in `lib/applications/applications.test.ts` for first payment, slip sent back without a new upload (refused), with a new upload (allowed). | To do | — |
| C13 | Upgrade Next.js 15 to a supported major with a matching `@opennextjs/cloudflare` release, then remove `--dangerouslyUseUnsupportedNextVersion` from `package.json` and the dashboard build command. C12 used that flag as a stop-gap. | To do | — |
| C4 | Import real products when the owner sends rate tables and quotation files: admin → นำเข้าข้อมูล (template in `/templates/unlimit-product-import.xlsx`). The owner verifies and publishes each version. Retire the mock catalogue; then set `CATALOG_FROM_CODE=false` and restore `force-dynamic` (see progress.md, "Stay on Workers Free"). | Blocked | Owner data (O4) |
| C6 | Switch on online purchase: R2 bucket, uncomment `r2_buckets`, `PURCHASE_ENABLED=true`, owner enters the payment account in admin → ตั้งค่า, then run `e2e:purchase` locally first. | Blocked | C4, C8, O5, O8 |
| C7 | Staff alerts via LINE (parked by the owner). The code is ready (`lib/notify`); it needs a LINE OA Messaging API token and `LINE_ALERT_TO` secrets. | Blocked | Owner decision |
| C9 | Phase 4: renewal reminders and renewal compare (roadmap P4). | Blocked | Real policies |
| **Done** | | | |
| C1 | Go live. Deployed 2026-09-26 (`59eb9a6`), migrations 0000–0003, secrets set, owner login confirmed, `main` auto-deploys. workers.dev is now off (`workers_dev: false`, returns 404); the site runs on unlimitinsure.com. | Done 2026-09-26 | — |
| C5 | Domain. `unlimitinsure.com` and `www.unlimitinsure.com` are Worker custom domains (`wrangler.jsonc`); `worker.ts` 301-redirects www and http to https://unlimitinsure.com (2026-09-27). Sitemap, robots and canonicals use the apex (checked live 2026-11-16). | Done 2026-09-26 | — |
| C12 | Deploy build fixed. `cf:build` and the Cloudflare Git build stopped at "Next.js version 15.5.26 is not supported"; Git builds failed from at least `2e99b99` until 2026-11-16 (last success before that: `29200b5`, 2026-10-12). Fix (stop-gap): PR #1 adds `--dangerouslyUseUnsupportedNextVersion` to `cf:build` / `preview` / `deploy` (merged `c06d641`), and Cursor added it to the dashboard build command. "Workers Builds: unlimit-insure" passed on `c06d641`. Real fix: C13. | Done 2026-11-16 | — |

### Codex (retired 2026-11-17)
ChatGPT was cancelled on 2026-11-17, so Codex takes no new work. Its open rows moved:
- X1 (onboarding): dropped.
- X2 (slip guard): Core, C8.
- X3 (live checks): Cursor, Y5.
- X4 (CPU proposal): Cursor, Y6.

The `codex/*` branch names below are history.

| # | Task | Status | Blocked on |
|---|---|---|---|
| X5 | **Rebase `codex/x5-line-chat-journey` onto `main`.** The branch (4 commits, last `8c02e47`, no PR yet) was cut before X6 and X7 merged. It now conflicts with `main` in 11 files: `advisor`, `compare`, `insurance`, `lab/[slug]`, home `page.tsx`, `quote/results`, `QuickQuote`, `AdvisorContact`, `Footer`, `Header`, and `LabTool.tsx` (deleted on x5, changed on main). Rebase it, keep only what X6/X7 do not already cover, list what you dropped and why, then open a PR. **Merge before X8** (both change `QuickQuote`, `QuoteWizard`, `AdvisorContact` and `tests/e2e/journey.mjs`). Brief: `docs/tasks/x5-rebase.md`. **2026-11-17:** done by Core instead of Codex. The owner kept `main`'s direct car → `/advisor` flow, so X5 shrank to copy + `SYSTEM.md` + the regenerated verify list. Branch `codex/x5-rebase` (`a1e375e`), [PR #4](https://github.com/gopantherth-sketch/unlimit-insure/pull/4); the PR lists what was dropped. All checks pass. Merged 2026-11-17 as `b372b3f` (owner OK); Workers Build success 07:23 UTC; live `/`, `/advisor`, `/lab`, `/claims` 200, `/quote` → `/advisor`. | Done 2026-11-17 | — |
| X8 | **Optional sub-model / engine size (tester feedback 2026-11-17).** Branch `codex/x8-trim-field`, cut from `main` **after X5 is merged**. In detail:<br>- An optional free-text field after "ปีรถ" in `components/insurance/VehicleSelector.tsx`, so it shows wherever the selector is used: homepage `QuickQuote` and `/quote` (`QuoteWizard`). `/advisor` has no selector; it shows the car from the URL, so carry the value there and show it with the car.<br>- URL param `trim` in `lib/params.ts` (parse + `buildQuery`): trimmed, max 60 characters, plain text only (strip control characters and angle brackets), empty → absent.<br>- Add it to every LINE prefilled message that names the car, e.g. "Toyota Corolla Cross 2022 · 1.8 Hybrid Premium": `contact.messages.plan` / `plans`, the `vehicleLabel` calls behind `plans/[productId]`, `compare`, `ResultsView`, `AdvisorContact`. `InsuranceCard` passes no car today; add it.<br>- Not stored server-side; not used for pricing or matching. Pages carrying it stay noindex like the other journey params.<br>- Label, placeholder and hint come from `content/` (new keys), filled with the owner's draft until the copywriter's W9 text arrives.<br>- Tests: vitest for parsing (trim, 60-character cap, unsafe characters, empty) and for the message text; update `tests/e2e/journey.mjs`.<br>- Checks: tsc, test, next build, cf:build, `e2e:journey`, and `e2e:a11y` (UI change).<br>Designer D9 reviews before Core merges. Brief: `docs/tasks/x8-trim-field.md`. **2026-11-17:** done by Core. Branch `codex/x8-trim-field` (`b47f870`), [PR #5](https://github.com/gopantherth-sketch/unlimit-insure/pull/5), now based on `main` (PR #4 merged). Because `/quote` redirects to `/advisor`, the field shows on the homepage only. `/advisor` shows "car · trim" in the summary and the LINE message, and the `/quote`, `/quote/results` and `/compare` redirects keep it. Not done: `/plans/[id]` redirects to bare `/advisor`. The ResultsView, compare and InsuranceCard messages are unreachable while public products are off. Checks: tsc, 56 tests, cf:build, `e2e:journey`, `e2e:a11y` (54 pages, 0 violations). Merged 2026-11-17 as `39bea62` before D9/W9 (owner: deploy now); Workers Build success 07:34 UTC; live field on `/`, LINE message with "car · trim" (sanitised) and noindex on `/advisor`, `/quote` redirect keeps `trim`. | Done 2026-11-17 | D9 / W9 follow as small changes |
| **Done** | | | |
| X6 | Mock coverage verdicts replaced with an event guide (`components/home/ScenarioGuide.tsx`, `content/scenario-guide.ts`). PR #2, merged on GitHub as `fd53454`; Workers Build passed. Not in this table before 2026-11-17. | Done 2026-11-17 | — |
| X7 | Public product data gated behind the advisor flow (`lib/public-catalog.ts` + test). PR #3, merged on GitHub as `cc9b594`; Workers Build passed. Not in this table before 2026-11-17. | Done 2026-11-17 | — |

### Cursor
DevOps engineer, added 2026-11-16; also designer and copy-applier from 2026-11-17 (see the Designer and Copywriter tables). Brief: `AGENTS.md` plus the team table and boundaries above. Branch `cursor/*`; Core merges.

| # | Task | Status | Blocked on / note |
|---|---|---|---|
| Y2 | **Live CPU per page.** Measure with `wrangler tail` on `/`, `/lab`, `/quote`, `/advisor` and one car-model page, then update C2 and Y6 with the numbers. | To do | — |
| Y5 | **Live checks** (was Codex X3). Run `e2e:journey` and `e2e:a11y` against `BASE_URL=https://unlimitinsure.com`. Admin credentials come from the owner and are never written to chat or files. Record page timings and report failures with the exact output. Feeds C3. | To do | — |
| Y6 | **CPU proposal** (was Codex X4). C2 measured 26–273 ms CPU per page against a 10 ms limit. Investigate without changing behaviour:<br>- which routes still render per request with `CATALOG_FROM_CODE=true`;<br>- what more can be prebuilt or cached (`open-next.config.ts`, `worker.ts` cache headers);<br>- the cold-start cost of `/`.<br>Deliver a short ranked proposal with expected savings in `docs/tasks/y6-cpu-proposal.md` on `cursor/y6-cpu`. Core decides what to implement. | To do | — |
| Y3 | **CPU fixes.** Implement the parts of the Y6 proposal that Core approves. | To do | Y6 proposal, Core approval |
| Y4 | **Deploy runbook.** Update `docs/deploy.md`. It must cover: the Next 15 support flag (C12), the Cloudflare account id (how to select it, not the id itself), untracked files that affect builds, and rollback with `wrangler rollback`. | To do | — |
| **Done** | | | |
| Y1 | Deploys unblocked. PR #1 (`cursor/x4-cache-delivery`, head `d3cad08`) merged `--no-ff` as `c06d641`; the dashboard build command now has the Next 15 flag; the Cloudflare Git build passed on `c06d641` (C12). | Done 2026-11-16 | — |

### Designer (Cursor, from 2026-11-17)
Images follow the image rule in the team section: generated images from Gemini, SVG diagrams/icons from Core, real photos from the owner.

| # | Task | Status | Blocked on / note |
|---|---|---|---|
| D1 | Advisor portrait 4:5 (`public/images/advisor.webp`, 640 × 800): must be a **real photo of the owner/advisor** (no AI person). Until then the LineChatPreview graphic stays on `/advisor` and the homepage. Crop, compress to .webp ≤ 250 KB (Cursor). | Blocked | Owner photo (O7) |
| D2 | Update `design/design-system.md` with the Phase 3 components: purchase Timeline (compact on mobile), status card with badge, file picker, consent rows, buy-page summary and "documents to prepare". Not started (no change since D6). | To do | — |
| D9 | **X8 review (Cursor).** Brief: `docs/tasks/cursor-d9.md`. Live since `39bea62` (owner chose to deploy before review), check two things at 390 px and 1440 px:<br>- the selector row with four fields on the homepage `QuickQuote` (`/quote` now redirects to `/advisor`);<br>- the trim text on `/advisor`.<br>Axe scan clean, no overflow. Send findings to Core; no wording changes. | To do | — |
| D4 | Insurer logo strip: keep the neutral placeholders (hidden, `SHOW_PARTNER_LOGOS=false`) until the owner supplies licensed logos with permission; then design the tiles. | Blocked | Owner logos |
| **Done** | | | |
| D5 | LINE-first look polished (`design/line-first-polish`, merged `4a4dae9`). | Done 2026-09-27 | — |
| D6 | Full visual review of the live site (`design/visual-review`, merged `8badc5c`, follow-ups `71b19ef`). | Done 2026-09-27 | — |
| D3 | Review the live site on phones and fix visual issues: covered by D6 (390 px / 1440 px on the live site). Real-device checks stay under C3. | Done 2026-09-27 | — |
| D7 | Logo mark as a 7.6 KB webp (`design/logo-webp`, merged `920ad3b`). Not in the handover list. | Done 2026-09-27 | — |
| D8 | Lab article photos `article-repair.webp` (dealer-vs-garage) and `article-excess.webp` (what-is-excess), 960 × 640 webp, 50 KB / 23 KB, replacing the placeholder tiles on `/lab`. Designer approved (including the full technician in the repair photo); `design/article-images` merged as `3b7246f`, live and checked 2026-11-17. | Done 2026-11-17 | — |

### Copywriter (Gemini drafts, owner approves, Cursor applies, from 2026-11-17)
Core writes a paste-ready brief in `docs/tasks/` for each row. The owner gets the text from Gemini and approves it. Cursor puts it into `content/**` on `copy/*`, and Core merges.

| # | Task | Status | Blocked on / note |
|---|---|---|---|
| W12 | **Content plan from Search Console (2026-11-17).** More LINE leads instead of ads. Three rounds, A first:<br>- A: better Google titles and descriptions for the 5 pages with impressions but no clicks (BYD Dolphin, BYD Atto 3, Isuzu D-Max, Lab type 1 vs 2+, Lab EV).<br>- B: two new Lab articles, EV claims and a BYD EV guide.<br>- C: four new EV model pages (BYD Seal, Sealion 7, Tesla Model Y, ORA Good Cat).<br>Brief: `docs/tasks/w12-content-plan.md`. Gemini drafts, the owner approves, Cursor applies on `copy/w12-a`/`-b`/`-c`, Core merges, then requests indexing. | To do | Owner pastes round A into Gemini |
| W10 | **Review Core's X5 copy edits** ([PR #4](https://github.com/gopantherth-sketch/unlimit-insure/pull/4)). The x5 copy said the site asks about usage and priorities, but under the direct flow it asks only for the car. Core edited 6 sentences in `content/faq.ts`, `lab.ts`, `legal.ts`, `models.ts` and `seo.ts`, plus `SYSTEM.md`. Check the wording on `copy/x5-review` (live since `b372b3f`). | To do | — |
| W6 | SEO titles and descriptions final pass (`content/seo.ts`, `docs/seo-plan.md`). Unblocked: the domain is unlimitinsure.com. Build on the 2026-10-12 SEO merge `4444129` (`/advisor` indexed, canonicals on Lab articles, JSON-LD). | To do | — |
| W4 | Turn the pre-launch checklist (`docs/verify-before-launch.md`) into a question sheet grouped by reviewer: licensed broker, lawyer/DPO, owner. Feeds O8. | To do | — |
| W3 | Review the Phase 3 strings in `content/purchase.ts`: `tracking.yourTurn`, `tracking.waiting`, `tracking.stepOf`, `prepareTitle`, `prepareBody`, plus inline admin-facing messages if needed. Purchase is off, so before C6. | To do | — |
| W5 | Per-insurer claims guidance (roadmap P3.8) once real insurers are known. | Blocked | C4 |
| **Done** | | | |
| W9 | Sub-model field text: label "รุ่นย่อย (ไม่บังคับ)", placeholder "เช่น 1.8 Sport", hint "ช่วยให้ที่ปรึกษาเช็กราคาได้ตรงรุ่นขึ้น". Gemini drafted it and the owner approved it. Core applied it because Cursor's branch was never pushed. [PR #9](https://github.com/gopantherth-sketch/unlimit-insure/pull/9), merged `9f31ec2`, live. It fits on one line at 1440 and 1280 px; the hint wraps at 1024 px (D9). | Done 2026-11-17 | — |
| W11 | Advisor LINE message labels: "ปีรถ:", plus options in brackets for type of cover, repair type and current policy end date; first line unchanged. Gemini drafted them and the owner approved them; Core applied them in PR #9 (`9f31ec2`), live and checked. | Done 2026-11-17 | — |
| W1 | Broker licence line. Footer, terms and purchase disclosures show both brokers from `content/contact.ts`: Nithi Apaisuwan 6204049613 (operator; 2026-09-27) and นางสาววนาลี บุญเกิด 6204049618 (`084b494`, 2026-10-09); both on the live site 2026-11-16, no placeholder left. Company answer: no company yet, individual operator (owner, 2026-09-27). Still open as verify items, not copy: consent to display from each named broker and name spelling (O3). | Done 2026-10-09 | — |
| W2 | Contact channels: LINE `@unlimit.insure`, phone 091-444-5542, Facebook `Unlimit.th` and email in `content/contact.ts` (2026-09-26/27). Except info@unlimitinsure.com: the site shows the owner's Gmail address until email routing works (C11, O10). | Done 2026-09-27 | — |
| W7 | Review of Core's LINE-first copy edits (`copy/line-first-review`, merged `90c9ab6`). | Done 2026-09-27 | — |
| W8 | Live-site copy review on a phone (`copy/live-review`, merged `76e55f3`, follow-up `5487c4f`). | Done 2026-09-27 | — |

### Owner (Nithi)
| # | Needed | Status | Unblocks |
|---|---|---|---|
| O9 | Workers Free vs Paid ($5/month) | To do | C2 |
| O10 | info@unlimitinsure.com destination verification | To do | C11 |
| O7 | Real advisor portrait (no AI person). Real people, cars and places always come from the owner's photos. | To do | D1 |
| O3 | Consent to display from each named broker (recorded for Nithi; needed for นางสาววนาลี บุญเกิด); confirm name spelling. Licence numbers and the company answer are in. | In progress | Verify list, C6 |
| O8 | Legal / licensed review of the verify list | To do | Launch sign-off, C6 |
| O4 | Real rate tables and quotation files from insurers | To do | C4, W5 |
| O5 | Receiving account for premiums (name, PromptPay or bank) | To do | C6 |
| **Done** | | | |
| O11 | Search Console steps after the 2026-10-12 SEO merge, done on 2026-11-17 from the owner account by Core, at the owner's request in chat:<br>- The sitemap was already submitted (2026-09-27).<br>- Indexing requested for `/advisor`, `/insurance/honda/honda-city`, `/lab/dealer-vs-garage` and `/lab/what-is-excess`; the homepage was already indexed.<br>- "Validate fix" dropped: the noindex, canonical and redirect states are intended. | Done 2026-11-17 | C10 |
| O1 | Secrets typed during C1 | Done 2026-09-26 | Go live |
| O2 | Domain: unlimitinsure.com | Done 2026-09-26 | C5, W6 |
| O6 | Contact channels (LINE, phone, Facebook, contact email); except info@unlimitinsure.com (O10) | Done 2026-09-27 | W2 |
