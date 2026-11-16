# X4: Workers CPU proposal

Basis: `origin/main` at `da4341b`, local OpenNext 1.20.6 build on 2026-11-16. This is an investigation; no runtime behavior changed. The production CPU figures below are the earlier `wrangler tail` samples recorded in `docs/progress.md`, not new measurements.

## What still runs per request

| Route | Build output | Current work |
| --- | --- | --- |
| `/`, `/insurance`, 15 model pages, `/lab`, 5 articles, `/claims`, `/privacy`, `/terms` | Static or prebuilt | Should be served from prerendered cache; local `/` instead reaches the server fallback (evidence below). |
| `/quote`, `/quote/results`, `/compare`, `/plans/[productId]`, `/advisor`, `/buy/[productId]`, `/track/[reference]`, admin and API routes | Dynamic | Next.js runs per request. `/quote` explicitly sets `force-dynamic`; `/advisor` reads URL search parameters. X5 removes the public results/compare/plan flow if Core merges it. |

`CATALOG_FROM_CODE=true` makes `getCatalog()` use a code constant, not D1. React `cache()` only deduplicates within a request. It does not remove rendering cost when a prerendered page misses its cache.

## Evidence

- `npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion` passed and generated 37 static pages, including the home page and model and article routes. The ordinary `cf:build` remains blocked by OpenNext's Next.js 15.5.26 support check (C12).
- The build contains 31 files under `.open-next/cache/<build-id>/`, including `index.cache`; it contains **zero** files under `.open-next/assets/cdn-cgi/_next_cache/`. `wrangler.jsonc` binds `ASSETS` to `.open-next/assets`. The configured static-assets incremental cache reads `ASSETS` at `cdn-cgi/_next_cache/<build-id>/<key>.cache`.
- Local `npx wrangler dev` returned `/` 200 with `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=86400`, but logged `StaticAssetsIncrementalCache: Failed to set to read-only cache key=/index type=cache`. This is consistent with a cache miss followed by a server render. Local `/advisor?brand=toyota` returned `no-store, must-revalidate, no-cache, max-age=0, private`.
- `worker.ts` imports the OpenNext Worker entry; that entry loads `server-functions/default/handler.mjs` only after its middleware returns no response. A cache hit at middleware level could avoid loading the server bundle on a static route. Local `/` took 485 ms wall time on one request; this is **not** a CPU measurement.
- Prior production samples in `docs/progress.md`: `/` 273 ms CPU cold, `/quote/results` 62 ms, `/lab` 51 ms, `/quote` 43 ms, `/advisor` 37 ms, `/compare` 32 ms, `/admin/login` 26 ms. These are single historical observations, not current percentiles.

## Ranked actions for Core

1. **Fix and prove prerendered cache delivery.** Trace why the 31 `.open-next/cache` entries are absent from the configured `ASSETS` directory. Test a supported OpenNext cache/deploy configuration or copy path in an isolated branch, then confirm `/` and `/lab` are served by middleware without the read-only-cache error or server import. Expected saving: **highest for static pages**, because a verified hit would avoid most Next.js rendering work and the server bundle's cold load. Exact CPU reduction requires production tail measurements. Preserve canonical redirects, security headers, and the private/no-store response behavior.
2. **After X5 merge, make the public quote shell static if needed.** `/quote` is dynamic because the server reads `searchParams` to choose a reserved height and explicitly sets `force-dynamic`, although its vehicle catalogue is code-backed and the wizard already handles browser state. Move the step-height decision to the client or a static shell, then remove `force-dynamic`; test deep links, loading shift, and the LINE message. Expected saving: **up to the route's server-render portion** of the historical 43 ms sample on each wizard navigation. A working static cache is required for the full benefit.
3. **Keep `/advisor`, admin, tracking, and APIs dynamic; measure before further refactors.** Advisor URL context and private customer/admin data need per-request handling. X5 removes public sample-plan routes rather than optimizing them. If these still exceed the account's CPU budget, Core should revisit the Workers plan decision recorded in C2. Expected saving from this step: **none by itself**; it avoids spending work on routes X5 retires and targets remaining risk with evidence.

## Acceptance measurements

For a candidate cache fix, compare before/after cold and warm CPU via Core's production or isolated preview observability for `/`, `/lab`, one model page, `/quote`, `/advisor`, and `/admin/login`; record p50/p95 over enough requests to separate cold starts from warm traffic. Check HTML status, cache headers, canonical redirects, no-store routes, and `e2e:journey`/`e2e:a11y`. Local wall time and `Cache-Control` alone do not prove that Workers CPU falls below the project's recorded 10 ms budget.
