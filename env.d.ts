// Secrets set with `wrangler secret put` (production) or `.dev.vars` (local). Not in wrangler.jsonc.
interface CloudflareEnv {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
}
