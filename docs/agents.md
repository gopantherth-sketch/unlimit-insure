# Team: local agents and task split

Three Claude Code agents run locally on the owner's PC, each in its own folder (a git worktree) and terminal:

| Agent | Brief | Folder | Owns | Git |
|---|---|---|---|---|
| **Core** (system core manager, project lead) | `.claude/agents/unlimit-core.md` | `unlimit-insure` (has `main`) | Code, data, database, admin, APIs, security, tests, deploys, Cloudflare, merging, `docs/progress.md` | Commits and pushes `main` |
| **Designer** | `.claude/agents/unlimit-designer.md` | `unlimit-insure-design` | Visuals, layout, colour, type, icons, images, responsive and accessibility polish | Branch `design/*`, pushed; Core merges |
| **Copywriter** | `.claude/agents/unlimit-copywriter.md` | `unlimit-insure-copy` | Every customer-facing word, SEO text, disclosures, the verify list | Branch `copy/*`, pushed; Core merges |

**Boundaries**
- The designer never changes wording. It leaves `TODO(copy)` notes for the copywriter.
- The copywriter never changes layout or styles.
- Both hand logic changes to Core.
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

## Backlog at handover (2026-09-26)
Order is priority. Status and history: `docs/progress.md`.

### Core
| # | Task | Blocked on |
|---|---|---|
| C1 | **Go live on workers.dev.** See `docs/tasks/deploy-go-live.md`: pull, `npm run db:migrate:remote` (0001–0003), secrets `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `SESSION_SECRET`, `npm run deploy`, fix the dashboard Git build settings, run the live checks. | Owner types the secrets |
| C2 | Check the Workers plan. Personal-account admin login hashes with PBKDF2 at 100k iterations; on the Free plan (10 ms CPU) it may fail with "exceeded CPU". If so, the options are Workers Paid or lowering iterations (stored per hash; see `lib/admin/password.ts`). The break-glass env login is unaffected. | C1 |
| C3 | Live QA: real phones (iOS Safari, Android Chrome), speed on the live URL, and `e2e:journey` / `e2e:a11y` against the live URL (`BASE_URL=...`). Hand visual issues to the designer. | C1 |
| C4 | Import real products when the owner sends rate tables and quotation files: admin → นำเข้าข้อมูล (template in `/templates/unlimit-product-import.xlsx`). The owner verifies and publishes each version. Retire the mock catalogue. | Owner data |
| C5 | Domain: add the custom domain in Workers → Domains & Routes, set the `NEXT_PUBLIC_SITE_URL` build variable, redeploy; check the sitemap, robots and canonical URLs. | Owner picks domain |
| C6 | Switch on online purchase: R2 bucket, uncomment `r2_buckets`, `PURCHASE_ENABLED=true`, owner enters the payment account in admin → ตั้งค่า, then run `e2e:purchase` locally first. | Real products, licence, account |
| C7 | Staff alerts via LINE (parked by the owner). The code is ready (`lib/notify`); it needs a LINE OA Messaging API token and `LINE_ALERT_TO` secrets. | Owner decision |
| C8 | Small fix: after staff sends a payment slip back (payment_submitted → awaiting_payment), the old slip still satisfies the "slip uploaded" guard. Require a slip uploaded after the last move to awaiting_payment (`lib/db/applications.ts` `moveApplication`). | — |
| C9 | Phase 4: renewal reminders and renewal compare (roadmap P4). | Real policies |

### Designer
| # | Task | Blocked on |
|---|---|---|
| D1 | Advisor and repair photos: the owner re-sends them as files (they were shown in chat only). Crop, compress to .webp ≤ 250 KB, place in `public/images/` for the slots in `design/photo-briefs.md` (advisor 4:5, article-repair 3:2). | Owner files |
| D2 | Update `design/design-system.md` with the Phase 3 components: purchase Timeline (compact on mobile), status card with badge, file picker, consent rows, buy-page summary and "documents to prepare". | — |
| D3 | Review the live site on phones after C1/C3 and fix visual issues. | C1 |
| D4 | Insurer logo strip: keep the neutral placeholders until the owner supplies licensed logos with permission; then design the tiles. | Owner logos |
| D5 | **Priority (website-first launch).** Polish the LINE-first look: `components/contact/ContactButtons.tsx` (LINE green is `#06803b` for AA contrast, don't go lighter), `components/layout/MobileContactBar.tsx`, `components/insurance/PriceOnRequest.tsx`, `components/insurance/AdvisorContact.tsx`, header and footer. Make the homepage more engaging now that the price demo and My Garage sections are hidden. Done = checked at 360 px and 1280 px, public-page axe scan clean. | — |

### Copywriter
| # | Task | Blocked on |
|---|---|---|
| W1 | Broker licence line (footer, purchase disclosures): replace `[สถานะนายหน้า/เลขที่ใบอนุญาต]` / `[รอข้อมูล]`. Needs:<br>- the current (renewed) licence numbers; the cards seen at handover expired 03/11/2563;<br>- consent from each named person;<br>- whether a company (juristic) broker licence exists.<br>Name and licence number only, never ID numbers. Update the verify items. | Owner |
| W2 | Contact placeholders (phone, LINE, email) in the footer and advisor pages once the owner supplies the real channels. | Owner |
| W3 | Review the Phase 3 strings the PM wrote in `content/purchase.ts`: `tracking.yourTurn`, `tracking.waiting`, `tracking.stepOf`, `prepareTitle`, `prepareBody`, plus the inline admin-facing messages if needed. | — |
| W4 | Turn the pre-launch checklist (`docs/verify-before-launch.md`, 140 items) into a question sheet grouped by reviewer: licensed broker, lawyer/DPO, owner. | — |
| W5 | Per-insurer claims guidance (roadmap P3.8) once real insurers are known. | C4 |
| W6 | SEO titles and descriptions final pass once the domain is chosen (`content/seo.ts`, `docs/seo-plan.md`). | C5 |
| W7 | **Priority (website-first launch).** Review Core's emergency copy edits for the LINE-first launch: `content/home.ts` (hero CTA, trust points, how-it-works, promises), `content/faq.ts`, `content/contact.ts` (button labels, prefilled LINE messages), and the no-price wording in `PriceOnRequest` / `AdvisorContact`. Remove any remaining "check prices / buy online / My Garage" promises (`content/home.ts` afterPoints, `content/seo.ts` descriptions such as "พร้อมเบี้ยโดยประมาณ"). Then `npm run content:verify`. | — |

### Owner (Dave)
| # | Needed | Unblocks |
|---|---|---|
| O1 | Type the secrets during C1 | Go live |
| O2 | Domain name | C5, W6 |
| O3 | Current broker licence details + consent; company licence answer | W1, C6 |
| O4 | Real rate tables and quotation files from insurers | C4, W5 |
| O5 | Receiving account for premiums (name, PromptPay or bank) | C6 |
| O6 | Contact channels (phone, LINE OA, email) | W2 |
| O7 | Advisor and repair photos as files | D1 |
| O8 | Legal / licensed review of the verify list | Launch sign-off |
