# End-to-end checks

Browser scripts run against a running site. They print one ✓ line per check and end with `no page errors`.

Setup (once): `npx playwright install chromium`.

Start the site in another terminal:
- `npm run preview` (the Workers runtime on http://127.0.0.1:8787; closest to production); or
- `npm run dev` (http://localhost:3000; set `BASE_URL=http://localhost:3000`).

Set `ADMIN_USER` and `ADMIN_PASS` to the values in your `.dev.vars`.

| Script | Needs | Checks |
|---|---|---|
| `npm run e2e:journey` | — | Homepage car selection → advisor LINE message; mock product routes redirect to advisor |
| `npm run e2e:admin-users` | Empty `admin_users` table (`npx wrangler d1 execute unlimit-insure --local --command "UPDATE leads SET assigned_to=NULL; UPDATE applications SET assigned_to=NULL; DELETE FROM admin_users;"`) | Owner creates staff, forced password change, roles, disable, reset |
| `npm run e2e:import` | — | Product import template, example file, bad file, new version as draft |
| `npm run e2e:purchase` | `PURCHASE_ENABLED=true` and the R2 binding (see `docs/deploy.md`) | Buy → private link → phone check → uploads → staff moves → payment → policy issued → link reset |
| `npm run e2e:shop` | Local server only (it refuses other URLs); migrations 0004 and 0005 applied | Shop off: `/shop` and the stock API 404, not in the sitemap. Shop on: the new product on `/shop`, its page and LINE order message. Admin: add a product (bad SKU refused), photo upload (resized, served as WebP), second variant, publish, then off sale at the end; shop PromptPay, stock, new order with QR, paid takes stock, ship needs tracking, short stock refused, cancel returns stock |
| `npm run e2e:a11y -- [APP-REF]` | Optional reference of an application made with phone 0812345678 | axe accessibility scan, horizontal overflow, page errors at 360px and 1280px; writes `tests/e2e/a11y-report.json` |

Phone lookups are rate-limited (5 per 10 minutes per IP). Restart the local server if a run hits the limit.
