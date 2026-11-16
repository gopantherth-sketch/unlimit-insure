# Cursor handoff: verify and fix prebuilt cache delivery

Read `docs/tasks/x4-cpu-proposal.md` on `origin/codex/x4-cpu` first. Implement this as one new task branch from the latest `origin/main`; do not deploy or change wording/visuals.

## Reproduction (local only)

1. Build with `npx opennextjs-cloudflare build --dangerouslyUseUnsupportedNextVersion` while C12 is unresolved.
2. Confirm `.open-next/cache/<build-id>/index.cache` exists, but `.open-next/assets/cdn-cgi/_next_cache/<build-id>/index.cache` does not. The `ASSETS` binding in `wrangler.jsonc` points at `.open-next/assets`.
3. Start `npx wrangler dev` with `DISABLE_CANONICAL_REDIRECT=1` in `.dev.vars`, request `/`, and capture `StaticAssetsIncrementalCache: Failed to set to read-only cache key=/index type=cache`. The page returns 200, so status alone does not reveal the miss.

## Implementation target

Determine whether this is an OpenNext build packaging issue, adapter configuration issue, or an intended deploy-time copy. Make the smallest supported change that lets the configured cache read the prebuilt `/`, `/lab`, and model-page entries. Do not suppress the read-only-cache error without proving cache hits. Preserve canonical redirects, security headers, and private/no-store handling for `/advisor` and admin routes.

## Acceptance

- Inspect the built artifact and prove the cache entries are reachable through `ASSETS` at the URL used by `static-assets-incremental-cache.js`.
- Local requests to `/`, `/lab`, and one model page return 200 without the read-only-cache miss; `/advisor?brand=toyota` stays private/no-store.
- `npx tsc --noEmit`, `npm test`, `npx next build`, and local `e2e:journey` pass. Record whether standard `npm run cf:build` remains blocked by C12; use the override only as a diagnostic until Core resolves that separate issue.
- Report local evidence and any remaining uncertainty. Production CPU reduction needs Core's post-merge measurements; local wall time is not CPU time.

X5's LINE-first branch (`origin/codex/x5-line-chat-journey`) is separate and unmerged. Recheck route behavior after Core decides its merge order; do not optimize the old public results/compare/plan screens if X5 replaces them.
