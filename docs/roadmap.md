# Production Roadmap

Live tracker: https://claude.ai/artifact/F5LAtBAfu9GNHnhMJpGVoC (status is updated there; this file is the plan snapshot).

Owners: **PM** = Claude (structure, code) · **Content** = copy agent · **Business** = owner · **Legal** = licensed reviewer.

## Phase 0 — Prototype foundation
_Done · Sep 2026_

Prove the product idea end to end on mock data.

**Exit criteria**
- Homepage and quote journey run end to end on mock data
- Engine unit tests and production build pass
- Design system, data inventory and pre-launch list written

| # | Task | Owner |
|---|---|---|
| P0.1 | Product master and V1 scope agreed | Business |
| P0.2 | Next.js + TypeScript project, design tokens, logo mark | PM |
| P0.3 | Homepage in the blue/white direction | PM |
| P0.4 | Quote journey: My Car, usage, priorities | PM |
| P0.5 | Results with transparent match and filters | PM |
| P0.6 | Smart Compare with difference summary | PM |
| P0.7 | Plan detail, Explain dialogs, coverage simulator | PM |
| P0.8 | Insurance Lab: 5 articles with tools | PM |
| P0.9 | Advisor handoff form (not stored yet) | PM |
| P0.10 | Thai copy: glossary, Lab, FAQ, scenarios, homepage | Content |
| P0.11 | Push code to GitHub repo unlimit-insure — Waiting on an empty repo gopantherth-sketch/unlimit-insure, or GitHub access that allows repo creation | Business |

## Phase 1 — Business data and compliance intake
_Target: 2–3 weeks_

Collect the real data and approvals the product depends on. Nothing real launches without it.

**Exit criteria**
- Legal entity and broker licence confirmed and shown on site
- Authorised insurers, products and rate source documented
- Every item in verify-before-launch.md answered by a licensed person
- Current sales, payment and issuance workflow written down

| # | Task | Owner |
|---|---|---|
| P1.1 | Confirm legal entity, broker/agent licence number — Shown in the trust strip and footer | Business |
| P1.2 | List authorised insurers and get logo usage permission | Business |
| P1.3 | Provide 3–10 real quotations — Used to calibrate pricing and the data model | Business |
| P1.4 | Provide rate tables (Excel / broker portal / API access) — Decides how pricing is imported | Business |
| P1.5 | Provide brochures and policy wording per product — Source documents for verified coverage | Business |
| P1.6 | Document current sales, payment and policy issuance flow — Who receives money, who issues receipts | Business |
| P1.7 | Choose vehicle data source (models, sub-models, values) | Business |
| P1.8 | Supply car and lifestyle photography — Hero and lifestyle band slots are ready | Business |
| P1.9 | Review copy claims in verify-before-launch.md | Legal |
| P1.10 | PDPA review: privacy notice, consent wording, retention | Legal |
| P1.11 | OIC rules for online sales and required disclosures | Legal |
| P1.12 | Revise copy after legal review | Content |
| P1.13 | Normalise real data into the product model — After quotations and rate tables arrive | PM |

## Phase 2 — V1 production launch
_Target: 4–6 weeks after Phase 1 data_

Ship the exploration, compare and advisor experience on real, verified data.

**Exit criteria**
- All plans shown come from verified sources with dates
- Leads are stored with consent and reach an advisor
- Admin can publish product versions and see leads
- Legal sign-off, privacy policy and terms published
- Mobile performance and accessibility checks pass

| # | Task | Owner |
|---|---|---|
| P2.1 | PostgreSQL schema: product versions, rates, sources, snapshots — Task 7 in the project master | PM |
| P2.2 | Product import pipeline from rate tables and documents | PM |
| P2.3 | Replace mock catalogue with verified products | PM |
| P2.4 | Admin: products and versions, with source verification | PM |
| P2.5 | Admin: leads and quotes list | PM |
| P2.6 | Store leads with consent log; notify advisors (LINE / email) | PM |
| P2.7 | Real vehicle data and valuation | PM |
| P2.8 | Privacy policy and terms pages — Legal-approved text | Content |
| P2.9 | Replace placeholder logos and imagery | PM |
| P2.10 | SEO: metadata, sitemap, Lab articles per car model | Content |
| P2.11 | Analytics and funnel events (no personal data) | PM |
| P2.12 | Hosting, domain, SSL, backups, monitoring | PM |
| P2.13 | QA: mobile devices, accessibility, performance | PM |
| P2.14 | Compliance sign-off before launch | Legal |
| P2.15 | Soft launch and first-week review | Business |

## Phase 3 — V2 purchase and My Garage
_Target: after V1 launch_

Let customers buy online where supported and manage their policy afterwards.

**Exit criteria**
- A customer can buy, pay and track status to policy issued
- Quote snapshot stored at purchase and never changes
- My Garage shows policy, documents and renewal date

| # | Task | Owner |
|---|---|---|
| P3.1 | Customer login: phone OTP, later LINE / Google | PM |
| P3.2 | Purchase flow: customer, vehicle, documents, review | PM |
| P3.3 | Secure document upload and storage | PM |
| P3.4 | Payment integration (PromptPay / card / instalments) — Depends on Phase 1 payment flow | PM |
| P3.5 | Insurer submission and application status timeline — Mark manual vs automated steps | PM |
| P3.6 | Quote snapshot at purchase | PM |
| P3.7 | My Garage: policies, documents, coverage view | PM |
| P3.8 | Claims guidance content per insurer | Content |
| P3.9 | Purchase flow copy and required disclosures | Content |

## Phase 4 — V3 renewal and retention
_Target: before first renewals_

Keep customers protected: renewal comparison, claims help and advisor CRM.

**Exit criteria**
- Renewal reminders run at 60/30/15/7 days
- Renewal compare shows what changed, not only price
- Advisors see full customer history

| # | Task | Owner |
|---|---|---|
| P4.1 | Renewal reminders at 60/30/15/7 days | PM |
| P4.2 | Renewal Intelligence: current vs offers, what changed | PM |
| P4.3 | Claims support flow and contacts | PM |
| P4.4 | Policy health status (complete / needs attention) — No numeric score without a transparent formula | PM |
| P4.5 | Advisor CRM: pipeline, notes, next actions | PM |
| P4.6 | Insurer / broker API integrations | PM |
| P4.7 | LINE OA messaging automation | PM |

## Phase 5 — V4 expansion
_Later_

Grow beyond single-car motor insurance once motor is excellent.

**Exit criteria**
- Motor conversion and retention targets met first

| # | Task | Owner |
|---|---|---|
| P5.1 | Multi-vehicle household in My Garage | PM |
| P5.2 | Motorcycle insurance | PM |
| P5.3 | Travel insurance | PM |
| P5.4 | Health insurance | PM |
| P5.5 | Advanced personalisation | PM |
