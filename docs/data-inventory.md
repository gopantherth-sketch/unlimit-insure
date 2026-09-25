# Data Inventory

Status as of prototype v0.1. Everything below "Mock" must be replaced before launch.

| Data | Source | Format | Quality | Missing / next step |
| --- | --- | --- | --- | --- |
| Logo | Provided by owner | PNG 1000×1000, transparent | Good | Vector (SVG/AI) master; mark extracted to `public/brand/unlimit-mark.png` |
| Design reference | Provided mock (blue/white) | Image | Good | Final photography |
| Product strategy | `PROJECT_MASTER.md` | Markdown | Good | — |
| Customer-facing copy | Content workstream (`content/*.ts`) | Typed TS | Draft | Compliance review; items in `docs/verify-before-launch.md` |
| Vehicle catalogue | **Mock** `lib/data/vehicles.ts` (15 models) | TS | Placeholder prices | Vehicle data source: brand, model, generation, sub-model, year, engine, powertrain, market value |
| Vehicle valuation | **Mock** 10%/yr depreciation, floor 35% | Code | Placeholder | Insurer/market valuation tables |
| Insurers | **Mock** 3 fictional (`lib/data/insurers.ts`) | TS | Placeholder | Authorised insurer list, logos + usage permission, claims hotlines |
| Products & coverage | **Mock** 7 products (`lib/data/products.ts`) | TS | Placeholder | Insurer brochures / coverage tables / policy wording per product version |
| Rates / premiums | **Mock** % of sum insured or fixed by body type | Code | Placeholder | Rate source: Excel tables, broker portal, insurer API? (§45 Q5–6) |
| Eligibility rules | **Mock** max age / powertrain | TS | Placeholder | Per-product underwriting rules |
| Source references | All `status: "mock"` | TS | — | Document name, page, verifier, date per fact |
| Coverage simulator rules | Derived from coverage booleans | Code | Simplified | Rules verified against policy wording incl. exclusions |
| Leads | Not stored | — | — | CRM/DB, consent log, retention policy |
| Sales / payment / issuance flow | Unknown | — | — | Owner to document (§30) |

## Suggested normalisation (when real data arrives)

1. One row per **product version** with effective dates; never edit a published version — create a new one.
2. Coverage facts as typed columns (see `Coverage` in `lib/types.ts`), each with a `SourceReference` (document, page, verified by/at).
3. Rates in a separate table keyed by product version × vehicle segment/value band × age; keep the raw imported sheet as a source document.
4. Vehicle master keyed by brand/model/sub-model/year with powertrain and value; map insurer vehicle codes onto it.
5. Quote snapshots stored at quote-save and purchase time (`QuoteSnapshot`).
