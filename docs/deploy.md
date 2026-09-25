# Deploy (Cloudflare Workers + D1)

Stack: Next.js 15 via OpenNext (`@opennextjs/cloudflare`) on Workers, Cloudflare D1 (SQLite) with Drizzle, admin password as a Worker secret. R2 (documents) comes with the purchase flow.

## Live

- Production: https://unlimit-insure.gopanther-th.workers.dev (account `94ae8d1f7781195ee6756040995a97fc`)
- D1 `unlimit-insure`: `10bc6601-2379-4a44-b8ee-8ff48d897fcb` (APAC), migration `0000_init` applied, MOCK catalogue seeded
- Admin secrets: set with `wrangler secret put` (see step 4 below)

## Automatic deploys from GitHub

The Worker is connected to `gopantherth-sketch/unlimit-insure`. In the dashboard (Workers & Pages → unlimit-insure → Settings → Build) set:

- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Production branch: `main`

Git builds do **not** apply D1 migrations. When a change adds a file under `migrations/`, run `npm run db:migrate:remote` before (or right after) the push that needs it.

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
4. Secrets: `npx wrangler secret put ADMIN_USERNAME` and `npx wrangler secret put ADMIN_PASSWORD`.
5. Deploy: `npm run deploy`, or connect the GitHub repo in the dashboard (Workers & Pages → Create → Import a repository) with build command `npx opennextjs-cloudflare build` and deploy command `npx opennextjs-cloudflare deploy`.
6. Domain: Workers → unlimit-insure → Settings → Domains & Routes → add the custom domain. Then set `NEXT_PUBLIC_SITE_URL=https://<domain>` as a build variable and redeploy (sitemap, robots, canonical URLs).

## Schema changes

Edit `lib/db/schema.ts` → `npm run db:generate` → review the SQL in `migrations/` → `db:migrate:local` → test → `db:migrate:remote` before deploying code that needs it.

## Windows notes

- `npm install` needs no Python or Visual Studio: `better-sqlite3` is pinned to 12.x, which downloads a prebuilt binary. If a future version falls back to `node-gyp`, use `npm install --ignore-scripts` then `npm rebuild esbuild workerd` (better-sqlite3 is only used by tests and seed scripts).
- If a user-level `CLOUDFLARE_API_TOKEN` is set on the PC with other permissions, `wrangler login` and account detection fail. Clear it for the terminal session only: PowerShell `Remove-Item Env:CLOUDFLARE_API_TOKEN`.

## Notes

- Bundle: ~1.2 MiB gzip (Workers free limit 3 MiB).
- `seed/mock-catalog.sql` deletes and re-inserts catalogue tables. Do not run it against production once real products or quote snapshots exist.
- Admin sessions are signed with the admin password; changing it signs everyone out.
