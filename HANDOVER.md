# Handover: Unlimit Insure

Handed over 2026-09-26 from the cloud PM session to the local agents (Core, Designer, Copywriter; see [`docs/agents.md`](docs/agents.md)). Everything needed to continue is in this repo. Nothing lives only in the old session.

## 1. What this is
A Thai motor-insurance decision and ownership platform: **Understand → Compare → Decide → Stay Protected**. Visitors pick their car and what matters to them, then see ranked plans with a transparent match, compare them, get jargon explained, and either talk to an advisor or (later) buy online and track the application. Product brief: [`PROJECT_MASTER.md`](PROJECT_MASTER.md). Owner: Dave (prefers minimal words, direct answers).

## 2. State at handover
| Item | State |
|---|---|
| Code | `main` on GitHub `gopantherth-sketch/unlimit-insure`, all work committed and pushed |
| Live URL | https://unlimit-insure.gopanther-th.workers.dev: serves an **older deploy** from before Phase 3 (exact commit not recorded). Latest `main` is **not deployed yet**: task C1 in `docs/agents.md`, steps in `docs/tasks/deploy-go-live.md` |
| Cloudflare | Account `94ae8d1f7781195ee6756040995a97fc`, Worker `unlimit-insure`, D1 `unlimit-insure` (`10bc6601-2379-4a44-b8ee-8ff48d897fcb`, APAC). Remote D1 has migration `0000` and the mock catalogue; `0001`–`0003` are pending. Dashboard Git build settings need fixing (C1) |
| Data | **All mock**: insurers, products, premiums and vehicle prices are placeholders (see `docs/data-inventory.md`). The site shows a "ต้นแบบ" (prototype) notice |
| Online purchase | Built and tested, **switched off** (`PURCHASE_ENABLED=false` in `wrangler.jsonc`, R2 binding commented out). "Select plan" goes to the advisor form |
| Staff alerts | Built (LINE Messaging API + Resend email), **parked** by the owner. Inactive until secrets are set |
| Tests | 42 unit tests (`npm test`), 5 e2e scripts (`tests/e2e/`), accessibility scan clean on 56–59 page views |
| Progress | [`docs/progress.md`](docs/progress.md): 21 done, 9 in progress, 30 to do, 1 blocked (61 tasks). The source of truth from now on |

## 3. What was built (by commit, oldest first)
- **V1 prototype on mock data:**
  - homepage, quote wizard (car → usage → priorities), ranked results with a transparent match, filters;
  - Smart Compare with a difference summary, plan detail, Explain dialogs (glossary), coverage simulator;
  - Insurance Lab articles with tools, advisor handoff, My Garage preview.
- **Move to Cloudflare Workers + D1:**
  - leads stored with a consent log;
  - admin for leads and product versions, with source verification;
  - legal page drafts.
- **Product data import:** xlsx template, validation, new versions created as drafts, and an owner-only verify-then-publish step.
- **Other content and analytics:**
  - anonymous funnel analytics (`event_counts`; no personal data);
  - claims guidance, car-model SEO pages;
  - a pre-launch verify list generated from content `verify` arrays (`npm run content:verify`).
- **Homepage restyle** to the selected mockup (`design/mockups/`, `design/mockup-spec.md`), with the owner's photos.
- **Multi-user admin:**
  - owner and staff roles, PBKDF2 passwords, forced password change;
  - lead assignment and a per-user activity log;
  - the env break-glass owner login is kept.
- **Phase 3 purchase (behind the flag):**
  - buy form with consents and disclosures; the quote is frozen as a snapshot;
  - private tracking link + phone last-4 check (signed cookie bound to the link); My Garage lookup (reference + phone);
  - document uploads to R2 (magic-byte sniffing, 10 MB cap), manual PromptPay QR / bank transfer with slip upload;
  - staff application admin: guarded status moves, messages, final premium with a reason, policy details and PDF, link reset, assignment;
  - owner payment settings.
- **Staff alerts, an accessibility pass** (contrast token, focusable scroll regions, headings, landmarks) **and a design polish** of the buy and tracking pages.
- **Launch safety:** `PURCHASE_ENABLED` flag, go-live runbook, agent briefs, a local agents setup script, and this handover.

## 4. Stack and map
Next.js 15 (App Router) on Cloudflare Workers via OpenNext (`@opennextjs/cloudflare` 1.20, wrangler 4) · D1 (SQLite) + Drizzle · TypeScript 5 strict (pinned; TS 7 broke the build) · Tailwind 3 · lucide-react · fonts: Prompt, IBM Plex Sans Thai, Allura.

```
app/(site)/        public pages: home, quote, quote/results, compare, plans/[id], advisor, lab, claims,
                   insurance/[brand]/[model], garage, buy/[productId], track/[reference], privacy, terms
app/admin/         login, account, (app)/: dashboard, leads, applications, products, import, analytics,
                   users, settings; documents/[docId] (staff file download)
app/api/           leads (intake + consent), events (anonymous analytics)
components/        home, layout, brand, ui, quote, insurance, lab, buy, track, admin
content/           ALL customer-facing Thai copy, typed by content/types.ts (copywriter's area)
lib/               engine (quote.ts, match.ts, compare.ts, scenarios.ts, coverageFields.ts), params/journey,
                   db/ (schema + data access), applications/ (status machine, tokens, files, validation),
                   admin/ (password, session), payment/ (PromptPay EMV + QR), notify/ (alerts),
                   server/ (auth, catalog, storage, origin, features, track-auth), import/
migrations/        0000_init … 0003_applications (drizzle-kit)
seed/              mock catalogue SQL (never run on production once real data exists)
scripts/           build-seed, build-import-template, build-verify-list, setup-local-agents.ps1
tests/e2e/         browser checks (see tests/e2e/README.md)
design/            mockups, mockup spec, design system, photo briefs, logo
docs/              progress, agents, deploy, roadmap, data inventory, content style guide, SEO plan,
                   verify-before-launch, tasks/
```

## 5. Run and check locally
```bash
npm install
cp .dev.vars.example .dev.vars          # set ADMIN_PASSWORD (12+ chars)
npm run db:migrate:local && npm run db:seed:build && npm run db:seed:local
npm run dev                             # http://localhost:3000
npx tsc --noEmit && npm test && npx next build
npm run preview                         # Workers runtime, http://127.0.0.1:8787
npx playwright install chromium         # once; then the e2e scripts in tests/e2e/README.md
```

## 6. Key decisions (don't reopen without the owner)
- **Honesty:**
  - no fake reviews, stats, awards or insurer logos;
  - no invented contact, licence or insurer details (`[รอข้อมูล]` placeholders);
  - regulatory claims go into `verify` arrays.
- **Payment and access:**
  - payment is manual (PromptPay/transfer + slip, staff confirms), no card gateway yet;
  - customers have no login yet: private link + phone check. The multi-car My Garage waits for real login (OTP/LINE later);
  - buying is "customer online, staff check": staff move every step and each move has guards (required documents, slip, policy file and number; reasons for needs-info, reject, cancel and slip send-back).
- **Launch order:**
  - go live first on workers.dev with the advisor flow and purchase off; the domain later;
  - LINE alerts parked until after go-live.
- **Admin access:** the env break-glass owner (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) is always an owner and is not stored in D1.
- **Photos:** go through `components/brand/Photo.tsx` slots, `unoptimized` (Workers has no image optimiser).

## 7. Security rules
- **Secrets:** the owner types them into `wrangler secret put`. Never put them in chat, logs, commits or reports.
- **Personal data:**
  - never commit ID cards, licence card images or national ID numbers;
  - the owner shared two broker licence cards in chat at handover; they were **not** saved anywhere, and they showed national IDs and an expiry of 03/11/2563.
- **Customer documents:** live only in private R2; downloads go through the signed cookie (customer) or the admin session (staff), with `no-store`, `nosniff` and a sandbox CSP.
- **Tokens:** URL tokens are 32 random bytes, and only their SHA-256 is stored. Resetting the link revokes every browser.
- **Rate limits:** phone lookups and checks are rate-limited per isolate (in-memory, best effort).

## 8. Gotchas learned
- **React 19:** forms reset after every action, so return typed values in the action state and use them as `defaultValue` (see `LookupForm`, `BuyForm`).
- **Cookies in tests:** production cookies are `secure`. Playwright's `request` context on plain http drops them; fetch inside the page instead (see `tests/e2e/purchase.mjs`).
- **Upload size:** the server action body limit is `12mb` in `next.config.ts` (uploads are 10 MB).
- **Import numbers:** dedupe compares canonical sorted JSON; percentages use `fromPercent` (`toFixed(10)`) to avoid float drift.
- **Local builds and data:**
  - don't run two builds in the same folder at once (`.next`/`.open-next`); that's why each agent has its own worktree;
  - after changing `database_id`, local D1 is empty: re-run `db:migrate:local` and `db:seed:local`.
- **Windows:** `better-sqlite3` is pinned to 12.x (prebuilt). If wrangler can't detect the account, clear a user-level `CLOUDFLARE_API_TOKEN` for that terminal.
- **Workers Free CPU:** PBKDF2 at 100k iterations may exceed 10 ms on personal-account login (task C2).

## 9. Next steps
Work down the backlog in [`docs/agents.md`](docs/agents.md):
1. **C1:** go live on workers.dev. The owner reviews it.
2. **Owner inputs:**
   - domain (O2);
   - broker licence and consent (O3), then W1;
   - real rate tables (O4), then C4;
   - contact channels (O6), then W2;
   - photos (O7), then D1.
3. **C3:** live QA on real phones, then D3.
4. Legal review of the verify list (W4, O8), then launch sign-off.
5. **C6:** switch on purchase once products, licence and account are confirmed. Then Phase 4 renewals (C9).
