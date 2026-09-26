# Task (Core): deploy Unlimit Insure (go live)

Owner: Core (`.claude/agents/unlimit-core.md`). Do not delete any Cloudflare resource.

## Goal
Deploy the latest `main` of GitHub repo `gopantherth-sketch/unlimit-insure` to the existing Cloudflare Worker `unlimit-insure`, so the owner can open https://unlimit-insure.gopanther-th.workers.dev. The owner has not chosen a domain yet, so leave domains alone.

Online purchase is intentionally OFF (`PURCHASE_ENABLED=false` in `wrangler.jsonc`), so no R2 bucket is needed. Do not create one.

## Steps
0. Find the local clone of `gopantherth-sketch/unlimit-insure` on this PC; clone it if missing. Check `npx wrangler whoami` shows Cloudflare account `94ae8d1f7781195ee6756040995a97fc`, and run `npx wrangler login` if not.
   - On Windows, if account detection fails, clear any user-level token for this terminal only (PowerShell: `Remove-Item Env:CLOUDFLARE_API_TOKEN`).
1. `git pull origin main`, then `npm install`. Confirm the latest commit is `450bb03` or newer.
2. Apply the database migrations: `npm run db:migrate:remote`. It should apply `0001_event_counts`, `0002_admin_users` and `0003_applications`; answer yes. Do NOT run `db:seed:remote`.
3. Secrets. The owner types the values into the prompts. Never ask for them in chat, and never echo, log or save them.
   - `npx wrangler secret put ADMIN_USERNAME`
   - `npx wrangler secret put ADMIN_PASSWORD` (12+ characters)
   - `npx wrangler secret put SESSION_SECRET` (random, 32+ characters)
   - If `ADMIN_USERNAME` and `ADMIN_PASSWORD` already exist, ask the owner whether to keep them. Skip them if so; set `SESSION_SECRET` either way.
4. Deploy: `npm run deploy`.
   - If it fails, send the exact error text back and stop.
   - Separately, in the dashboard (Workers & Pages → unlimit-insure → Settings → Build), check the Git build settings: build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`, production branch `main`. Fix them if they differ.
5. Check the live site at https://unlimit-insure.gopanther-th.workers.dev:
   - the homepage loads;
   - the quote journey (pick a car, then the next steps) reaches the results;
   - "เลือกแผนนี้" or "เลือกแพ็กเกจ" opens the advisor form (`/advisor`), not `/buy`;
   - `/admin/login` loads and the owner can log in; `/admin/applications` and `/admin/settings` open without errors.
   - Optionally, send one test advisor request with name "ทดสอบ" and check it appears under `/admin/leads`.

## Report back to the owner
- Live URL.
- Deployed commit hash.
- Which migrations were applied.
- Which secrets were set (names only, never values).
- Result of each check in step 5.
- Any error text, verbatim.

Reference: `docs/deploy.md` → "Go live now".
