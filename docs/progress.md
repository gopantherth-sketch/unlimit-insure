# Progress

Snapshot of the live tracker (https://claude.ai/artifact/F5LAtBAfu9GNHnhMJpGVoC) taken 2026-09-26 at handover. From now on **this file is the source of truth**: the core manager updates it with each merged change. The tracker page is no longer updated.

**C1 (go live on workers.dev), 2026-09-26:** deployed `59eb9a6` (version `aac6d9cb`). Remote D1 has migrations 0000–0003. Secrets `ADMIN_USERNAME`, `ADMIN_PASSWORD` (re-set by the owner in the dashboard; live version `35a0a23f`) and `SESSION_SECRET` set. Owner login confirmed; dashboard, leads, applications, products, analytics, users and settings open without errors. Both test leads marked ไม่สำเร็จ with note "test lead". Dashboard Git build settings confirmed correct; pushes to `main` auto-deploy. Live checks: all public pages 200, admin pages redirect to login, `/buy` → `/advisor` (purchase off), `e2e:journey` passes on the live URL (one test lead "ทดสอบ" stored). **C1 done.**

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
