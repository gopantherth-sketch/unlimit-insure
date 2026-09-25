# Deploy (Cloudflare Workers + D1)

Stack: Next.js 15 via OpenNext (`@opennextjs/cloudflare`) on Workers, Cloudflare D1 (SQLite) with Drizzle, admin password as a Worker secret. R2 (documents) comes with the purchase flow.

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

## Notes

- Bundle: ~1.2 MiB gzip (Workers free limit 3 MiB).
- `seed/mock-catalog.sql` deletes and re-inserts catalogue tables. Do not run it against production once real products or quote snapshots exist.
- Admin sessions are signed with the admin password; changing it signs everyone out.
