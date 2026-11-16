# Team: local agents and task split

Three Claude Code agents, Codex and Cursor work on the project, each in its own folder (a git worktree) and terminal:

| Agent | Brief | Folder | Owns | Git |
|---|---|---|---|---|
| **Core** (system core manager, project lead) | `.claude/agents/unlimit-core.md` | `unlimit-insure` (has `main`) | Code, data, database, admin, APIs, security, tests, deploys, Cloudflare, merging, `docs/progress.md` | Commits and pushes `main` |
| **Designer** | `.claude/agents/unlimit-designer.md` | `unlimit-insure-design` | Visuals, layout, colour, type, icons, images, responsive and accessibility polish | Branch `design/*`, pushed; Core merges |
| **Copywriter** | `.claude/agents/unlimit-copywriter.md` | `unlimit-insure-copy` | Every customer-facing word, SEO text, disclosures, the verify list | Branch `copy/*`, pushed; Core merges |
| **Codex** (engineer) | `AGENTS.md` (Codex reads it automatically) | `unlimit-insure-codex` | Engineering tasks Core assigns: fixes, tests, performance, tooling, live checks, second-opinion reviews | Branch `codex/*`, pushed; Core merges |
| **Cursor** (DevOps) | `AGENTS.md` (Cursor follows it too) | its own worktree | Build and deploy tooling; Cloudflare (Workers, caching, headers, Builds); performance and CPU; live checks after deploys | Branch `cursor/*`, pushed; Core merges |

**Boundaries**
- The designer never changes wording. It leaves `TODO(copy)` notes for the copywriter.
- The copywriter never changes layout or styles.
- Both hand logic changes to Core.
- Codex takes only tasks listed under **Codex** below (or assigned by Core). It never changes wording or visuals and never deploys; it reports to Core.
- Cursor takes the tasks under **Cursor** below (or assigned by Core). Deploys:
  - production deploys run only from `main`, after Core has merged; Cursor may run them when the owner asks;
  - a hotfix deploy from a branch needs the owner's yes in chat, and a PR opened at the same time that Core merges the same day.
- Core never changes wording or visuals without the owning agent, except for emergencies. If it has to, it notes this in the commit message.

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
- **Designer:** "Use the unlimit-designer agent brief in .claude/agents/unlimit-designer.md. Wait for tasks."
- **Copywriter:** "Use the unlimit-copywriter agent brief in .claude/agents/unlimit-copywriter.md. Wait for tasks."

## How work flows
1. The owner gives a request to Core, or straight to the designer or copywriter for small things.
2. Core splits it into tasks, one owner each, with the goal, the files involved and what "done" looks like. It pastes each task into that agent's window, or the owner does.
3. The designer and copywriter push branches and report back.
4. Core reviews, runs the checks, merges, deploys and updates `docs/progress.md`.

## Backlog (updated 2026-11-16)
Reconciled with the repo, `docs/progress.md` and the live site on 2026-11-16. The site is live on https://unlimitinsure.com (LINE-first; prices and online purchase off). Open rows are in priority order: CPU risk and the Search Console follow-up first, then the copy and design work on the live site, then the real-data work (C4, C6). Done rows sit at the bottom of each table with their dates. Status and history: `docs/progress.md`.

Status: **Done** · **In progress** · **To do** · **Blocked** (waiting on someone else).

### Core
| # | Task | Status | Blocked on / note |
|---|---|---|---|
| C2 | Workers plan. Measured 2026-09-26 on **Workers Free** (10 ms CPU limit): live pages use 26–273 ms CPU (`/` 273 ms cold, `/quote/results` 62, `/lab` 51, `/quote` 43, `/advisor` 37, `/compare` 32, `/admin/login` 26), so real traffic risks error 1102 (exceeded CPU). Lowering PBKDF2 iterations would not fix it (~14 ms). Recommendation: Workers Paid ($5/month). No code change needed. Until then, watch for 1102 errors. | Blocked | **Owner: Workers Paid decision (O9)** |
| C10 | Search Console follow-up after the SEO merge `4444129` (2026-10-12): once the owner has done O11, check the Pages report: `/advisor`, the homepage and the Lab articles indexed, "Excluded by noindex" fixed, sitemap read (28 URLs live on 2026-11-16). | Blocked | Owner steps (O11) |
| C3 | Live QA: real phones (iOS Safari, Android Chrome), speed on the live URL, and `e2e:journey` / `e2e:a11y` against `BASE_URL=https://unlimitinsure.com`. Hand visual issues to the designer. Last live checks: journey + a11y passed on the live site 2026-10-12 (SEO merge); HTTP spot check 2026-11-16 (pages 200, www/http → 301 apex, HSTS 1 year, workers.dev off). Real-device and live speed tests not recorded yet. | In progress | — |
| C11 | Email: route info@unlimitinsure.com once the destination is verified (routing rule + test), then DNS records / DMARC (Cloudflare review U6). Then the copywriter switches `contact.email` from the current Gmail address. | Blocked | O10 |
| C8 | Small fix: after staff sends a payment slip back (payment_submitted → awaiting_payment), the old slip still satisfies the "slip uploaded" guard. Require a slip uploaded after the last move to awaiting_payment (`lib/db/applications.ts` `moveApplication`). Still open in code on 2026-11-16; purchase is off, so no live impact yet. Must be fixed before C6. | To do | — |
| C13 | Upgrade Next.js 15 to a supported major with a matching `@opennextjs/cloudflare` release, then remove `--dangerouslyUseUnsupportedNextVersion` from `package.json` and the dashboard build command. C12 used that flag as a stop-gap. | To do | — |
| C4 | Import real products when the owner sends rate tables and quotation files: admin → นำเข้าข้อมูล (template in `/templates/unlimit-product-import.xlsx`). The owner verifies and publishes each version. Retire the mock catalogue; then set `CATALOG_FROM_CODE=false` and restore `force-dynamic` (see progress.md, "Stay on Workers Free"). | Blocked | Owner data (O4) |
| C6 | Switch on online purchase: R2 bucket, uncomment `r2_buckets`, `PURCHASE_ENABLED=true`, owner enters the payment account in admin → ตั้งค่า, then run `e2e:purchase` locally first. | Blocked | C4, C8, O5, O8 |
| C7 | Staff alerts via LINE (parked by the owner). The code is ready (`lib/notify`); it needs a LINE OA Messaging API token and `LINE_ALERT_TO` secrets. | Blocked | Owner decision |
| C9 | Phase 4: renewal reminders and renewal compare (roadmap P4). | Blocked | Real policies |
| **Done** | | | |
| C1 | Go live. Deployed 2026-09-26 (`59eb9a6`), migrations 0000–0003, secrets set, owner login confirmed, `main` auto-deploys. workers.dev is now off (`workers_dev: false`, returns 404); the site runs on unlimitinsure.com. | Done 2026-09-26 | — |
| C5 | Domain. `unlimitinsure.com` and `www.unlimitinsure.com` are Worker custom domains (`wrangler.jsonc`); `worker.ts` 301-redirects www and http to https://unlimitinsure.com (2026-09-27). Sitemap, robots and canonicals use the apex (checked live 2026-11-16). | Done 2026-09-26 | — |
| C12 | Deploy build fixed. `cf:build` and the Cloudflare Git build stopped at "Next.js version 15.5.26 is not supported"; Git builds failed from at least `2e99b99` until 2026-11-16 (last success before that: `29200b5`, 2026-10-12). Fix (stop-gap): PR #1 adds `--dangerouslyUseUnsupportedNextVersion` to `cf:build` / `preview` / `deploy` (merged `c06d641`), and Cursor added it to the dashboard build command. "Workers Builds: unlimit-insure" passed on `c06d641`. Real fix: C13. | Done 2026-11-16 | — |

### Codex
Set up 2026-11-16. Worktree: `git worktree add ../unlimit-insure-codex origin/main` (detached), then `npm install` there and open Codex in that folder. First message: `docs/tasks/codex-onboarding.md`.

| # | Task | Status | Blocked on |
|---|---|---|---|
| X1 | **Onboarding check.** Read `AGENTS.md`, `HANDOVER.md`, `docs/progress.md` and this file. Set up locally (`npm install`, `.dev.vars` from the example: the owner types the password, local D1 migrate + seed). Run `npx tsc --noEmit`, `npm test`, `npx next build`, `npm run cf:build`, then `npx wrangler dev` with `npm run e2e:journey`. Report results and anything in the docs that is unclear or out of date. No code changes. | To do | — |
| X2 | **C8: payment-slip guard.** After staff sends a slip back (`payment_submitted` → `awaiting_payment`), the old slip still passes the "slip uploaded" check. Change `moveApplication` in `lib/db/applications.ts`: moving to `payment_submitted` needs a `payment_slip` uploaded **after** the latest move into `awaiting_payment`. Add vitest cases in `lib/applications/applications.test.ts`: first payment, slip sent back without a new upload (refused), with a new upload (allowed). Purchase stays off. Branch `codex/x2-slip-guard`. | To do | — |
| X3 | **Live checks.** Run `e2e:journey` and `e2e:a11y` against `BASE_URL=https://unlimitinsure.com`. These create one test advisor lead, so tell the owner and mark it ไม่สำเร็จ "test lead" afterwards via Core. Record page timings. Report failures with exact output; send visual findings to the designer via Core. Feeds C3. | To do | — |
| X4 | **CPU budget (Workers Free).** C2 measured 26–273 ms CPU per page against a 10 ms limit. Investigate without changing behaviour: which routes still render per request with `CATALOG_FROM_CODE=true`, what more can be prebuilt or cached (`open-next.config.ts`, `worker.ts` cache headers), and the cold-start cost of `/`. Deliver a short ranked proposal with expected savings in `docs/tasks/x4-cpu-proposal.md` on branch `codex/x4-cpu`. Core decides what to implement. | To do | — |

### Cursor
DevOps engineer, added 2026-11-16. Brief: `AGENTS.md` plus the Cursor rows in the team table and boundaries above. Branch `cursor/*`; Core merges.

| # | Task | Status | Blocked on / note |
|---|---|---|---|
| Y2 | **Live CPU per page.** Measure with `wrangler tail` on `/`, `/lab`, `/quote`, `/advisor` and one car-model page, then update C2 and X4 with the numbers. | To do | — |
| Y3 | **CPU fixes.** Implement the parts of Codex's X4 proposal (`codex/x4-cpu`) that Core approves. | To do | X4 proposal, Core approval |
| Y4 | **Deploy runbook.** Update `docs/deploy.md`. It must cover: the Next 15 support flag (C12), the Cloudflare account id (how to select it, not the id itself), untracked files that affect builds, and rollback with `wrangler rollback`. | To do | — |
| **Done** | | | |
| Y1 | Deploys unblocked. PR #1 (`cursor/x4-cache-delivery`, head `d3cad08`) merged `--no-ff` as `c06d641`; the dashboard build command now has the Next 15 flag; the Cloudflare Git build passed on `c06d641` (C12). | Done 2026-11-16 | — |

### Designer
| # | Task | Status | Blocked on / note |
|---|---|---|---|
| D1 | Advisor portrait 4:5 (`public/images/advisor.webp`, 640 × 800): must be a **real photo of the owner/advisor** (no AI person). Until then the LineChatPreview graphic stays on `/advisor` and the homepage. Crop, compress to .webp ≤ 250 KB. The article images moved to D8 (owner, 2026-11-16: no Canva). | Blocked | Owner photo (O7) |
| D8 | Lab article graphics `article-repair.webp` (dealer-vs-garage) and `article-excess.webp` (what-is-excess), 3:2, 960 × 640, .webp ≤ 250 KB in `public/images/`. They replace the designed placeholder tiles on `/lab`; add the two `Photo.tsx` slots and the `cardMeta` photo keys in `app/(site)/lab/page.tsx`. Owner sent the two images on 2026-11-16; prepared on branch `design/article-images` (`da97c37`, cloud session). Reviewed 2026-11-16: 960 × 640 webp, 50 KB / 23 KB, no badges, plates or text; tsc, tests, next build and `e2e:journey` (on `next dev`) pass. **Not merged:** `cf:build` fails (C12), and the designer's look is pending (the repair photo shows a whole technician; the D8 brief said hands at most). | Blocked | C12, designer ok |
| D2 | Update `design/design-system.md` with the Phase 3 components: purchase Timeline (compact on mobile), status card with badge, file picker, consent rows, buy-page summary and "documents to prepare". Not started (no change since D6). | To do | — |
| D4 | Insurer logo strip: keep the neutral placeholders (hidden, `SHOW_PARTNER_LOGOS=false`) until the owner supplies licensed logos with permission; then design the tiles. | Blocked | Owner logos |
| **Done** | | | |
| D5 | LINE-first look polished (`design/line-first-polish`, merged `4a4dae9`). | Done 2026-09-27 | — |
| D6 | Full visual review of the live site (`design/visual-review`, merged `8badc5c`, follow-ups `71b19ef`). | Done 2026-09-27 | — |
| D3 | Review the live site on phones and fix visual issues: covered by D6 (390 px / 1440 px on the live site). Real-device checks stay under C3. | Done 2026-09-27 | — |
| D7 | Logo mark as a 7.6 KB webp (`design/logo-webp`, merged `920ad3b`). Not in the handover list. | Done 2026-09-27 | — |

### Copywriter
| # | Task | Status | Blocked on / note |
|---|---|---|---|
| W6 | SEO titles and descriptions final pass (`content/seo.ts`, `docs/seo-plan.md`). Unblocked: the domain is unlimitinsure.com. Build on the 2026-10-12 SEO merge `4444129` (`/advisor` indexed, canonicals on Lab articles, JSON-LD). | To do | — |
| W4 | Turn the pre-launch checklist (`docs/verify-before-launch.md`) into a question sheet grouped by reviewer: licensed broker, lawyer/DPO, owner. Feeds O8. | To do | — |
| W3 | Review the Phase 3 strings in `content/purchase.ts`: `tracking.yourTurn`, `tracking.waiting`, `tracking.stepOf`, `prepareTitle`, `prepareBody`, plus inline admin-facing messages if needed. Purchase is off, so before C6. | To do | — |
| W5 | Per-insurer claims guidance (roadmap P3.8) once real insurers are known. | Blocked | C4 |
| **Done** | | | |
| W1 | Broker licence line. Footer, terms and purchase disclosures show both brokers from `content/contact.ts`: Nithi Apaisuwan 6204049613 (operator; 2026-09-27) and นางสาววนาลี บุญเกิด 6204049618 (`084b494`, 2026-10-09); both on the live site 2026-11-16, no placeholder left. Company answer: no company yet, individual operator (owner, 2026-09-27). Still open as verify items, not copy: consent to display from each named broker and name spelling (O3). | Done 2026-10-09 | — |
| W2 | Contact channels: LINE `@unlimit.insure`, phone 091-444-5542, Facebook `Unlimit.th` and email in `content/contact.ts` (2026-09-26/27). Except info@unlimitinsure.com: the site shows the owner's Gmail address until email routing works (C11, O10). | Done 2026-09-27 | — |
| W7 | Review of Core's LINE-first copy edits (`copy/line-first-review`, merged `90c9ab6`). | Done 2026-09-27 | — |
| W8 | Live-site copy review on a phone (`copy/live-review`, merged `76e55f3`, follow-up `5487c4f`). | Done 2026-09-27 | — |

### Owner (Nithi)
| # | Needed | Status | Unblocks |
|---|---|---|---|
| O9 | Workers Free vs Paid ($5/month) | To do | C2 |
| O11 | Search Console, after the 2026-10-12 SEO merge: submit the sitemap, request indexing for `/advisor`, the homepage and 2–3 Lab articles, then "Validate fix" on "Excluded by noindex". Not recorded as done. | To do | C10 |
| O10 | info@unlimitinsure.com destination verification | To do | C11 |
| O7 | Real advisor portrait (no AI person). The article images no longer need the owner: Codex makes them (D8). | To do | D1 |
| O3 | Consent to display from each named broker (recorded for Nithi; needed for นางสาววนาลี บุญเกิด); confirm name spelling. Licence numbers and the company answer are in. | In progress | Verify list, C6 |
| O8 | Legal / licensed review of the verify list | To do | Launch sign-off, C6 |
| O4 | Real rate tables and quotation files from insurers | To do | C4, W5 |
| O5 | Receiving account for premiums (name, PromptPay or bank) | To do | C6 |
| **Done** | | | |
| O1 | Secrets typed during C1 | Done 2026-09-26 | Go live |
| O2 | Domain: unlimitinsure.com | Done 2026-09-26 | C5, W6 |
| O6 | Contact channels (LINE, phone, Facebook, contact email); except info@unlimitinsure.com (O10) | Done 2026-09-27 | W2 |
