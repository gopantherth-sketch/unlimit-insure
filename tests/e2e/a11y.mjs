import { B, FIX, ADMIN_USER, ADMIN_PASS, launch } from "./_env.mjs";
import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
const axe = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const J = "brand=toyota&model=toyota-corolla-cross&year=2022";
const pub = ["/", "/quote", `/quote?${J}&step=use`, `/quote/results?${J}&usage=commute`, `/compare?${J}&plans=a-type1-dealer,b-type3plus`, `/plans/a-type1-dealer?${J}`,
  `/buy/a-type1-dealer?${J}`, "/advisor", "/garage", "/claims", "/lab", "/lab/type1-vs-2plus", "/insurance", "/insurance/toyota/toyota-corolla-cross", "/privacy", "/terms", "/track/APP-0000000000", "/admin/login"];
const ref = process.argv[2];
const b = await launch();
const out = [];
async function scan(ctx, path, width) {
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  let bytes = 0; p.on("response", async (r) => { const l = Number(r.headers()["content-length"] || 0); bytes += l; });
  const t = Date.now();
  const res = await p.goto(B + path, { waitUntil: "networkidle" });
  const ms = Date.now() - t;
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await p.addScriptTag({ content: axe });
  const r = await p.evaluate(async () => (await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] })).violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, sample: v.nodes.slice(0, 2).map((x) => x.target.join(" ")).join(" ; ") })));
  out.push({ path, width, status: res.status(), ms, overflow, errs: errs.slice(0, 3), violations: r });
  await p.close();
}
const mobile = await b.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
const desk = await b.newContext({ viewport: { width: 1280, height: 900 } });
for (const path of pub) { await scan(mobile, path, 360); await scan(desk, path, 1280); }
// Customer tracking page and admin application detail need an application created with phone 0812345678
// (run purchase.mjs first with PURCHASE_ENABLED=true). Without a reference they are skipped.
let appPath = null;
if (ref) {
  const g = await mobile.newPage(); await g.goto(B + "/garage");
  await g.getByLabel("เลขอ้างอิงใบสมัคร").fill(ref); await g.getByLabel("เบอร์โทรที่ใช้สมัคร").fill("0812345678");
  await g.getByRole("button", { name: "ค้นหาใบสมัคร" }).click(); await g.waitForURL(/track/); await g.close();
  await scan(mobile, `/track/${ref}`, 360);
}
const o = await desk.newPage(); await o.goto(B + "/admin/login"); await o.getByLabel("ชื่อผู้ใช้").fill(ADMIN_USER); await o.getByLabel("รหัสผ่าน").fill(ADMIN_PASS);
await o.getByRole("button", { name: "เข้าสู่ระบบ" }).click(); await o.waitForURL(/\/admin$/);
if (ref) { await o.goto(B + "/admin/applications"); await o.getByRole("link", { name: ref }).click(); await o.waitForURL(/applications\/.+/); appPath = new URL(o.url()).pathname; }
await o.goto(B + "/admin/leads"); const firstLead = o.locator("tbody a").first(); let leadPath = null;
if (await firstLead.count()) { await firstLead.click(); await o.waitForURL(/leads\/.+/); leadPath = new URL(o.url()).pathname; }
await o.close();
const mobAdmin = await b.newContext({ viewport: { width: 360, height: 800 }, storageState: await desk.storageState() });
for (const path of ["/admin", "/admin/leads", leadPath, "/admin/applications", appPath, "/admin/products", "/admin/import", "/admin/analytics", "/admin/users", "/admin/settings", "/admin/account"].filter(Boolean)) { await scan(desk, path, 1280); await scan(mobAdmin, path, 360); }
writeFileSync(new URL("./a11y-report.json", import.meta.url), JSON.stringify(out, null, 1));
const agg = {};
for (const r of out) for (const v of r.violations) { const k = `${v.impact} ${v.id}`; (agg[k] ??= new Set()).add(`${r.path}@${r.width}`); }
console.log("pages scanned:", out.length);
console.log("non-200:", out.filter((r) => r.status !== 200).map((r) => `${r.path} ${r.status}`).join(", ") || "none");
console.log("overflow:", out.filter((r) => r.overflow > 0).map((r) => `${r.path}@${r.width} +${r.overflow}px`).join(", ") || "none");
console.log("errors:", out.filter((r) => r.errs.length).map((r) => `${r.path}: ${r.errs[0]}`).join("\n") || "none");
console.log("slowest:", out.sort((a, b) => b.ms - a.ms).slice(0, 4).map((r) => `${r.path}@${r.width} ${r.ms}ms`).join(", "));
for (const [k, s] of Object.entries(agg)) console.log(k, "→", [...s].slice(0, 6).join(", "), s.size > 6 ? `(+${s.size - 6})` : "");
await b.close();
