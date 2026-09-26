import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  // Product import rows and document uploads (10 MB max per file) go through server actions.
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default nextConfig;

// Gives `next dev` the local D1 binding from wrangler.jsonc.
initOpenNextCloudflareForDev();
