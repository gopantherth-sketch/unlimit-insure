# Deploy (Cloudflare Workers + D1)

Stack: Next.js 15 via OpenNext (`@opennextjs/cloudflare`) on Workers, Cloudflare D1 (SQLite) with Drizzle, admin password as a Worker secret. R2 (documents) is only needed once online purchase is switched on.

## Live

- Production: https://unlimit-insure.gopanther-th.workers.dev (account `94ae8d1f7781195ee6756040995a97fc`)
- D1 `unlimit-insure`: `10bc6601-2379-4a44-b8ee-8ff48d897fcb` (APAC), migration `0000_init` applied, MOCK catalogue seeded
- Admin secrets: set with `wrangler secret put` (see step 4 below)

## Go live now (helper checklist)

The Worker and D1 database already exist. Online purchase is **off** (`PURCHASE_ENABLED=false` in `wrangler.jsonc`), so no R2 bucket is needed: "select plan" buttons go to the advisor form and `/buy` redirects there.

Run in the project folder on the PC (after `git pull` and `npm install`):

1. `npm run db:migrate:remote` — applies `0001_event_counts`, `0002_admin_users`, `0003_applications`. Answer yes.
2. Secrets (type the values when prompted; never paste them in chat):
   - `npx wrangler secret put ADMIN_USERNAME`
   - `npx wrangler secret put ADMIN_PASSWORD` (12+ characters)
   - `npx wrangler secret put SESSION_SECRET` (random, 32+ characters; recommended)
3. Deploy, either way:
   - Dashboard → Workers & Pages → unlimit-insure → Settings → Build: build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`, branch `main`, then retry the latest build; or
   - from the PC: `npm run deploy`.
4. Check on the live URL: homepage loads; quote journey reaches results; "เลือกแผนนี้" opens the advisor form; submit a test advisor request; log in at `/admin/login` and see the lead; delete nothing.
5. Report back: live URL, which checks passed, any error text.

## Switch on online purchase (later)

Only when real products are imported and verified, the broker licence wording is confirmed and the receiving account is known.

1. Enable R2 on the account (dashboard → R2), then `npx wrangler r2 bucket create unlimit-insure-docs`.
2. In `wrangler.jsonc`: uncomment `r2_buckets` and set `"PURCHASE_ENABLED": "true"` (PM commits this).
3. Owner: admin → ตั้งค่า → enter the receiving account and PromptPay ID.
4. Deploy. Buttons switch from the advisor form to the online application.

## Admin accounts

- **Break-glass owner**: `ADMIN_USERNAME` / `ADMIN_PASSWORD` secrets. Always an owner, not stored in D1, so the team can't be locked out. Use it to create personal accounts, then keep it for emergencies. Rotating `ADMIN_PASSWORD` ends its sessions.
- **Personal accounts**: `/admin/users` (owners only). Roles: **owner** (manage users, verify and publish products) and **staff** (leads, import drafts). New and reset passwords are temporary; the user must set their own at next login. Disabling a user or resetting their password ends their sessions immediately.
- **Signing key**: sessions are signed with `SESSION_SECRET` (optional secret, 32+ characters) or, if unset, `ADMIN_PASSWORD`. Setting `SESSION_SECRET` means rotating the break-glass password no longer signs out personal accounts. `npx wrangler secret put SESSION_SECRET`.
- **Passwords** are PBKDF2-SHA256, 100,000 iterations (the Workers maximum), per-user salt. On the Workers Free plan (10 ms CPU per request) a personal-account login can exceed the CPU limit; if logins fail with "exceeded CPU", move to Workers Paid or ask the PM to lower the iteration count (stored per hash, so existing passwords keep working). The break-glass login doesn't hash and is unaffected.

## Automatic deploys from GitHub

The Worker is connected to `gopantherth-sketch/unlimit-insure`. In the dashboard (Workers & Pages → unlimit-insure → Settings → Build) set:

- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Production branch: `main`

Git builds do **not** apply D1 migrations. Pending as of this commit: `0001_event_counts`, `0002_admin_users`, `0003_applications` — run `npm run db:migrate:remote` (applies whatever is pending). When a change adds a file under `migrations/`, run `npm run db:migrate:remote` before (or right after) the push that needs it.

## Local

```bash
npm install
cp .dev.vars.example .dev.vars        # set ADMIN_PASSWORD (12+ chars)
npm run db:migrate:local              # creates local D1 under .wrangler/
npm run db:seed:build && npm run db:seed:local   # MOCK catalogue
npm run dev                           # http://localhost:3000, local D1 binding
npm run preview                       # production build in the Workers runtime (http://localhost:8787)
```

## First production deploy

1. Create the database: `npx wrangler d1 create unlimit-insure` and put the printed `database_id` into `wrangler.jsonc`.
2. Apply migrations: `npm run db:migrate:remote`.
3. Load the catalogue: mock for a preview (`npm run db:seed:remote`) or the real import once verified data exists.
4. Document storage: only when switching on online purchase (see above).
5. Secrets: `npx wrangler secret put ADMIN_USERNAME` and `npx wrangler secret put ADMIN_PASSWORD`. Optional `SESSION_SECRET` (32+ chars) signs admin and customer-tracking cookies; without it `ADMIN_PASSWORD` is used, so rotating the password also logs customers out of their tracking pages (their private link + phone check still works).
6. Deploy: `npm run deploy`, or connect the GitHub repo in the dashboard (Workers & Pages → Create → Import a repository) with build command `npx opennextjs-cloudflare build` and deploy command `npx opennextjs-cloudflare deploy`.
7. Staff alerts (optional, later; either or both). Messages contain only the reference and an admin link.
   - LINE: create a LINE Official Account with Messaging API enabled (LINE Developers console), then `npx wrangler secret put LINE_CHANNEL_ACCESS_TOKEN` and `npx wrangler secret put LINE_ALERT_TO` (comma-separated user or group IDs; add the bot to the team group to get its group ID).
   - Email: a Resend account with a verified sending domain, then secrets `RESEND_API_KEY`, `ALERT_EMAIL_FROM` (e.g. `alerts@<domain>`) and `ALERT_EMAIL_TO` (comma-separated).
   - Check in admin → ตั้งค่า → ส่งข้อความทดสอบ.
8. Payment details: log in as owner → ตั้งค่า → enter the receiving account name and PromptPay ID (or bank + account). Until then customers see "ทีมงานจะแจ้งช่องทางชำระเงินให้คุณ".
9. Domain: Workers → unlimit-insure → Settings → Domains & Routes → add the custom domain. Then set `NEXT_PUBLIC_SITE_URL=https://<domain>` as a build variable and redeploy (sitemap, robots, canonical URLs).

## Schema changes

Edit `lib/db/schema.ts` → `npm run db:generate` → review the SQL in `migrations/` → `db:migrate:local` → test → `db:migrate:remote` before deploying code that needs it.

## Windows notes

- `npm install` needs no Python or Visual Studio: `better-sqlite3` is pinned to 12.x, which downloads a prebuilt binary. If a future version falls back to `node-gyp`, use `npm install --ignore-scripts` then `npm rebuild esbuild workerd` (better-sqlite3 is only used by tests and seed scripts).
- If a user-level `CLOUDFLARE_API_TOKEN` is set on the PC with other permissions, `wrangler login` and account detection fail. Clear it for the terminal session only: PowerShell `Remove-Item Env:CLOUDFLARE_API_TOKEN`.

## Notes

- Bundle: ~1.2 MiB gzip (Workers free limit 3 MiB).
- `seed/mock-catalog.sql` deletes and re-inserts catalogue tables. Do not run it against production once real products, quote snapshots or applications exist.
- Customer documents live only in R2 (`applications/<id>/<doc>`); D1 holds metadata. Nothing is public: customers download through a signed cookie, staff through the admin session.
- Admin sessions are signed with the admin password; changing it signs everyone out.
