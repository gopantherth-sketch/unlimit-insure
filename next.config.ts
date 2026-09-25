import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
  // Product import sends parsed spreadsheet rows to a server action.
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};

export default nextConfig;

// Gives `next dev` the local D1 binding from wrangler.jsonc.
initOpenNextCloudflareForDev();
