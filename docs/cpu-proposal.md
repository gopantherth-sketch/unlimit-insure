# CPU per request: measurement and proposal (Y2 + Y6, 2026-11-18)

Context: Workers Free gives 10 ms of CPU per request. Over that, a request can fail with "exceeded CPU" (rarely at first, more often as traffic grows).

## Y2 · Live measurement

Method:
- `wrangler tail unlimit-insure --format json --ip self`. Read-only, own requests only; no visitor data was captured.
- 3 rounds against https://unlimitinsure.com on 2026-11-18, about 18:00 Bangkok time.
- Each figure is CPU / wall time in ms, as reported by the Workers runtime.

| Page | Status | Round 1 | Round 2 | Round 3 | Over 10 ms CPU? |
|---|---|---|---|---|---|
| `/` | 200 | 6 / 14 | 4 / 11 | 5 / 14 | no |
| `/lab` | 200 | 3 / 10 | 2 / 10 | 3 / 11 | no |
| `/insurance/toyota/toyota-corolla-cross` | 200 | 3 / 9 | 2 / 8 | 2 / 7 | no |
| `/quote` (redirect) | 308 | 31 / 32 | 22 / 26 | 26 / 28 | **yes** |
| `/quote/results` (redirect) | 308 | 37 / 39 | 28 / 30 | 32 / 33 | **yes** |
| `/advisor` | 200 | 54 / 58 | 238 / 248 | 39 / 42 | **yes** |

Prebuilt pages (served from the static-assets cache) stay at 2–6 ms. The pages that render on each request use 22–238 ms.

## Y6 · Proposal, ranked (no behaviour change)

1. **Answer the old journey redirects at the edge.** `/quote`, `/quote/results`, `/compare`, `/plans/*` and `/buy/*` currently boot Next.js, read the catalogue from D1 and then return a 308. This costs 22–37 ms just to say "go to /advisor".
   - Fix: while the catalogue has no published products (and `PURCHASE_ENABLED=false`), `lib/edge.ts` returns the same 308 in `worker.ts`, keeping the car and sub-model parameters (`withJourney`).
   - Use a build-time flag rather than a D1 read, for example `JOURNEY_REDIRECTS=1` in `wrangler.jsonc` vars, removed when products are imported.
   - Expected: about 1 ms, so roughly −25 to −35 ms per redirect.
   - Test: `e2e:journey` already checks that these redirects keep the car and sub-model.
2. **Prebuild `/advisor`.** It is dynamic only because it reads `searchParams` (car, plan picks, `from`) and the public catalogue.
   - Fix: render a static shell and resolve the parameters in the client component `AdvisorContact`, using the catalogue names already built into the page or a small static JSON. The `noindex` for parameter variants then moves to a `<meta>` set on the client, or to a header in `worker.ts`: an `X-Robots-Tag` header when the query string is not empty (cheap at the edge).
   - Expected: like `/lab`, about 3 ms, so −35 to −235 ms. The 238 ms run looks like a cold isolate plus a D1 round-trip.
   - Risk: the LINE message text must stay byte-identical. `e2e:journey` checks it.
3. **Cold start of `/`.** It is already prebuilt (4–6 ms). The worker bundle is 1.67 MB gzip. Trimming server-only dependencies from the public bundle would lower cold-start wall time but not CPU per request. Low priority.
4. **Admin and the stock API stay dynamic.** They are low-traffic and staff-only. `/api/shop/stock` (once the shop is on) is one small D1 read.

**Built 2026-11-18:** #1 as CLEAR row 41, #2 as row 42.

Order: 1, then 2, each as its own CLEAR row with "No behaviour change". Measure again with the same `wrangler tail` method after each deploy.

Note: this was measured on the live Next 15 build. The Next 16 upgrade (row 7, branch `core/c13-next16`) should be measured again after its GO deploy.

## Re-measure after 20261118-b4e6a52-1 (Next 16 + rows 41/42)

Same method, 3 rounds, CPU / wall ms:

| Page | Round 1 | Round 2 | Round 3 | Before |
|---|---|---|---|---|
| `/` | 10 / 22 | 8 / 19 | 10 / 22 | 4–6 |
| `/lab` | 5 / 14 | 5 / 15 | 5 / 13 | 2–3 |
| `/insurance/toyota/toyota-corolla-cross` | 4 / 11 | 4 / 11 | 8 / 15 | 2–3 |
| `/quote` (edge 308) | 0 / 0 | 0 / 0 | 0 / 0 | 22–31 |
| `/quote/results` (edge 308) | 0 / 1 | 0 / 0 | 0 / 0 | 28–37 |
| `/advisor` (with and without params) | 4–6 / 10–18 | | | 39–238 |

Rows 41/42 worked as planned. Prebuilt pages roughly doubled (`/` now 8–10 ms, close to the 10 ms limit). That is likely the Next 16 / OpenNext 1.20.16 runtime, not rows 41/42, and is worth its own row.
