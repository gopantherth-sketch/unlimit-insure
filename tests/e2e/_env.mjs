// Shared settings for the end-to-end scripts. Override with env vars:
//   BASE_URL   default http://127.0.0.1:8787 (npm run preview) — use http://localhost:3000 for npm run dev
//   ADMIN_USER / ADMIN_PASS  must match ADMIN_USERNAME / ADMIN_PASSWORD in .dev.vars
//   CHROMIUM   optional path to a Chromium binary (otherwise Playwright's own; run `npx playwright install chromium` once)
import { chromium } from "playwright";

export const B = (process.env.BASE_URL ?? "http://127.0.0.1:8787").replace(/\/$/, "");
export const ADMIN_USER = process.env.ADMIN_USER ?? "admin";
export const ADMIN_PASS = process.env.ADMIN_PASS ?? "local-dev-password-123";
const here = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
export const FIX = here + "fixtures/";
export const launch = () => chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
