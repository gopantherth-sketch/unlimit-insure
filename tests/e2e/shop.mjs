// Shop (C14): public pages (when SHOW_SHOP is on) and the admin order flow. Local only: it creates
// orders, sets stock and a test PromptPay ID, so never run it against the live site.
import { B, ADMIN_USER, ADMIN_PASS, launch } from "./_env.mjs";

if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(B)) {
  console.error("e2e:shop writes test orders and settings; run it against a local server only.");
  process.exit(1);
}
const b = await launch();
const errs = [];
const step = (m) => console.log("✓", m);
const fail = (m) => { console.error("✗", m); process.exitCode = 1; };
const page = async (width = 1280) => {
  const p = await (await b.newContext({ viewport: { width, height: 900 } })).newPage();
  p.on("pageerror", (e) => errs.push(e.message));
  return p;
};

// Public side
const c = await page(390);
const shopRes = await c.goto(B + "/shop");
const shopOn = shopRes.status() === 200;
if (!shopOn) {
  const stockRes = await c.request.get(B + "/api/shop/stock");
  const sitemap = await (await c.request.get(B + "/sitemap.xml")).text();
  if (shopRes.status() !== 404 || stockRes.status() !== 404 || sitemap.includes("/shop")) fail(`shop off but /shop ${shopRes.status()}, stock API ${stockRes.status()}, sitemap has /shop: ${sitemap.includes("/shop")}`);
  else step("SHOW_SHOP off: /shop 404, stock API 404, not in the sitemap");
} else {
  await c.locator('a[href^="/shop/"]').first().click();
  await c.waitForURL(/\/shop\/[^/]+$/);
  step("product page " + new URL(c.url()).pathname);
  await c.getByRole("button", { name: "เพิ่มจำนวน" }).click();
  const href = await c.getByRole("link", { name: /สั่งซื้อทาง LINE/ }).getAttribute("href");
  const msg = decodeURIComponent(href.split("?")[1] ?? "");
  const lines = msg.split("\n");
  if (lines[0] !== "สั่งซื้อสินค้า (จากเว็บไซต์)" || !lines.includes("จำนวน: 2") || !lines.some((l) => l.startsWith("ราคา: "))) fail("LINE order message:\n" + msg);
  else step("LINE order message, qty 2:\n    " + lines.join("\n    "));
  if (!href.startsWith("https://line.me/R/oaMessage/")) fail("LINE link " + href);
}

// Admin side
const o = await page();
await o.goto(B + "/admin/login");
await o.getByLabel("ชื่อผู้ใช้").fill(ADMIN_USER);
await o.getByLabel("รหัสผ่าน").fill(ADMIN_PASS);
await o.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
await o.waitForURL((u) => !u.pathname.startsWith("/admin/login"));
step("owner login");

// Test PromptPay for the shop (a made-up mobile number; local DB only).
await o.goto(B + "/admin/settings");
await o.getByLabel("ชื่อบัญชีผู้รับเงิน (ร้านค้า)").fill("ร้านทดสอบ");
await o.getByLabel(/พร้อมเพย์ร้านค้า/).fill("0800000000");
await o.locator("form", { hasText: "บัญชีรับเงินร้านค้า" }).getByRole("button", { name: "บันทึก" }).click();
await o.waitForURL(/ok=saved/);
step("shop PromptPay saved");

// Stock 5 on the first SKU
await o.goto(B + "/admin/shop");
const stockForm = o.locator("#stock form").first();
await stockForm.getByLabel("ตั้งสต็อก").fill("5");
await stockForm.getByRole("button", { name: "บันทึก" }).click();
await o.waitForURL(/ok=stock/);
if (!(await o.locator("#stock").innerText()).includes("คงเหลือ 5")) fail("stock not 5");
else step("stock set to 5");

const newOrder = async (qty, price, shipping) => {
  await o.goto(B + "/admin/shop");
  await o.getByLabel("ชื่อ LINE ของลูกค้า").fill("ลูกค้าทดสอบ");
  await o.getByLabel("จำนวน").first().fill(String(qty));
  await o.getByLabel("ราคาต่อชิ้น (บาท)").first().fill(price);
  await o.getByLabel("ค่าส่ง (บาท)").fill(shipping);
  await o.getByRole("button", { name: "สร้างคำสั่งซื้อ" }).click();
  await o.waitForURL(/\/admin\/shop\/[^?]+\?ok=created/);
  return o.url().split("?")[0];
};
// A successful move removes its button; a refused one stays and shows an error.
const move = async (label, expect) => {
  const btn = o.getByRole("button", { name: label });
  await btn.click();
  if (/error=/.test(String(expect))) await o.waitForURL(expect);
  else await btn.waitFor({ state: "detached" });
  await o.getByRole("status").or(o.getByRole("alert")).first().waitFor();
};
const text = () => o.evaluate(() => document.body.innerText);

// Validation
await o.goto(B + "/admin/shop");
await o.getByLabel("ชื่อ LINE ของลูกค้า").fill("ลูกค้าทดสอบ");
await o.getByLabel("ราคาต่อชิ้น (บาท)").first().fill("abc");
await o.getByRole("button", { name: "สร้างคำสั่งซื้อ" }).click();
await o.waitForURL(/error=invalid_price/);
step("bad price refused");

// Order 1: 2 × 89 + 40 = 218, paid → stock 3, ship needs tracking, then shipped → completed
const url1 = await newOrder(2, "89", "40");
const body1 = await text();
if (!body1.includes("218")) fail("total 218 not shown");
else step("order created, total 218 " + new URL(url1).pathname);
if ((await o.locator('section[aria-labelledby="qr-title"] svg').count()) !== 1) fail("no PromptPay QR");
else step("PromptPay QR for 218 บาท shown");
await move("ได้รับเงินแล้ว (ชำระแล้ว)", /ok=moved/);
step("marked paid");
await o.goto(B + "/admin/shop");
if (!(await o.locator("#stock").innerText()).includes("คงเหลือ 3")) fail("stock not 3 after paid");
else step("stock 5 → 3");
await o.goto(url1);
await move("จัดส่งแล้ว", /error=missing_tracking/);
step("ship without tracking refused");
await o.getByLabel("ขนส่ง").fill("Flash");
await o.getByLabel("เลขพัสดุ").fill("TH0000TEST");
await o.locator('section[aria-labelledby="ship-title"]').getByRole("button", { name: "บันทึก" }).click();
await o.waitForURL(/ok=saved/);
await move("จัดส่งแล้ว", /ok=moved/);
await move("สำเร็จ", /ok=moved/);
if (!(await text()).includes("TH0000TEST")) fail("tracking not shown");
else step("shipped → completed with tracking");

// Order 2: 4 more than stock 3 → paid refused; Order 3: 3 paid then cancelled → stock back to 3
await newOrder(4, "89", "0");
await move("ได้รับเงินแล้ว (ชำระแล้ว)", /error=no_stock/);
step("paid refused when stock is short");
await newOrder(3, "89", "0");
await move("ได้รับเงินแล้ว (ชำระแล้ว)", /ok=moved/);
await move("ยกเลิกคำสั่งซื้อ", /ok=moved/);
await o.goto(B + "/admin/shop");
if (!(await o.locator("#stock").innerText()).includes("คงเหลือ 3")) fail("stock not back to 3 after cancel");
else step("paid then cancelled: stock back to 3");

// Sold out: stock 0 → API lists it; product page shows สินค้าหมด when the shop is on
await o.locator("#stock form").first().getByLabel("ตั้งสต็อก").fill("0");
await o.locator("#stock form").first().getByRole("button", { name: "บันทึก" }).click();
await o.waitForURL(/ok=stock/);
if (shopOn) {
  const stock = await (await c.request.get(B + "/api/shop/stock")).json();
  if (!stock.soldOut?.length) fail("stock API soldOut empty");
  await c.reload();
  await c.getByText("สินค้าหมด").first().waitFor();
  step("stock 0 → product page shows สินค้าหมด, no LINE button: " + ((await c.getByRole("link", { name: /สั่งซื้อทาง LINE/ }).count()) === 0));
}
// Put the test stock back to untracked
await o.locator("#stock form").first().getByLabel("ตั้งสต็อก").fill("");
await o.locator("#stock form").first().getByRole("button", { name: "บันทึก" }).click();
await o.waitForURL(/ok=stock/);

await b.close();
if (errs.length) fail("page errors: " + errs.join(" | "));
else console.log("no page errors");
