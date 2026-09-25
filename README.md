# Unlimit Insure

Motor insurance decision and ownership platform. **Understand → Compare → Decide → Stay Protected.**
Source of truth: [`PROJECT_MASTER.md`](PROJECT_MASTER.md).

## Status

V1 on **mock data**, running on Cloudflare Workers + D1. Every insurer, product, premium and vehicle price is a placeholder (see [`docs/data-inventory.md`](docs/data-inventory.md)).
Leads and consent are stored in D1; the admin manages leads and product versions.

| V1 scope (§35) | State |
| --- | --- |
| Blue/white homepage | Done |
| Vehicle selection (My Car) | Done |
| Anonymous exploration (no phone until advisor/buy) | Done |
| Result cards + transparent match ("ตรง X จาก Y ข้อ") | Done |
| Smart Compare + difference summary | Done |
| Package detail + verified-source panel | Done |
| Explain This (glossary dialogs) | Done |
| Advisor handoff with journey context | Done (no CRM yet) |
| Coverage simulator | Done (rule-based, mock rules) |
| Insurance Lab (5 articles + tools) | Done |
| Admin: leads, product versions, source verification | Done (V1) |
| Privacy policy / terms | Draft, pending legal review |
| My Garage | Static preview only (V2) |

## Run

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrate:local && npm run db:seed:build && npm run db:seed:local
npm run dev        # http://localhost:3000
npm test           # engine + database tests (vitest)
npm run typecheck
npm run preview    # Workers runtime
```

Node 20+. Deployment: [`docs/deploy.md`](docs/deploy.md).

## Architecture

Next.js 15 (App Router) on Cloudflare Workers (OpenNext) · Cloudflare D1 + Drizzle · TypeScript strict · Tailwind CSS 3 · lucide-react · IBM Plex Sans Thai.

```
app/                 routes
  page.tsx           homepage (§7 architecture)
  quote/             wizard: car → usage → priorities
  quote/results/     ranked plans, filters, compare selection
  compare/           compare table, difference summary, simulator
  plans/[productId]/ package detail
  advisor/           advisor handoff form
  (site)/            public site (header/footer layout); privacy/, terms/
  admin/             login + (app)/ dashboard, leads, products (signed-cookie session)
  api/leads/         lead intake → D1 with consent log
  lab/               Insurance Lab index + articles with tools
  garage/            My Garage preview
components/
  home/              homepage sections
  insurance/         reusable product components (card, compare table, explain, source…)
  quote/             journey components
  lab/               Lab tools
  ui/ layout/ brand/
content/             Thai copy, typed by content/types.ts (glossary, lab, faq, scenarios, home)
lib/
  types.ts           domain model (versioned products, source refs, quote snapshots)
  data/              MOCK catalogue: vehicles, insurers, products
  vehicle.ts         resolve selection, estimated value
  quote.ts           active version, eligibility, pricing, snapshots
  match.ts           transparent priority matching + ranking
  coverageFields.ts  single definition of every coverage attribute (labels, display, comparison)
  compare.ts         difference summary, best-value detection
  scenarios.ts       coverage simulator rules
  params.ts          journey state in URL (no personal data)
  db/                Drizzle schema, D1 client, catalogue/leads/admin repositories, tests
  server/            request-scoped catalogue, admin auth
migrations/          D1 SQL migrations (drizzle-kit)
seed/                generated MOCK catalogue SQL
  leads.ts           advisor payload + validation
```

Key rules implemented:
- Journey state lives in the URL; personal data is requested only on the advisor form, with explicit consent.
- Ranking = priorities met, then premium. Commission is not an input.
- Product versions carry effective dates and a `SourceReference`; the UI shows mock/pending/verified status.
- `snapshotQuote()` freezes a quote for purchase (§28).
- Coverage fields are defined once in `lib/coverageFields.ts` and drive cards, tables, detail pages and summaries.

## Known missing data

Roadmap and live tracker: [`docs/roadmap.md`](docs/roadmap.md).

See [`docs/data-inventory.md`](docs/data-inventory.md) and [`docs/verify-before-launch.md`](docs/verify-before-launch.md). Highest value next inputs: real quotations/rate tables, insurer list + logos, broker licence details, car photography, current sales/payment/issuance workflow.
