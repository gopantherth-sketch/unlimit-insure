import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Prebuilt pages (○/● in `next build`) are served from Workers static assets, and cache interception
// answers them before the Next.js server loads. Keeps CPU per request low on the Workers Free plan.
// No revalidation: prebuilt pages change only with a deploy.
// `build` writes `.open-next/cache`. This cache reads `ASSETS` at `cdn-cgi/_next_cache`.
// `populateCache` (in `cf:build`, and already in `preview` / `deploy`) copies the entries across.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
