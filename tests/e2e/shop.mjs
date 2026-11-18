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


// Admin side.
// Every admin form is a server action that answers with a redirect. On `wrangler dev` the RSC payload
// for that redirect is fetched from SITE_URL (the live site, which has another build), so the page
// renders with the wrong chunks. In production the site fetches itself, so this only affects local
// runs. `submit` therefore follows the redirect with a plain page load from the local server, and
// page errors during that hand-over are not counted.
const o = await page();
const submit = async (button) => {
  const before = errs.length;
  const [res] = await Promise.all([o.waitForResponse((r) => r.request().method() === "POST" && new URL(r.url()).origin === B), button.click()]);
  const to = (res.headers()["x-action-redirect"] ?? "").split(";")[0];
  if (!to) throw new Error("no redirect from " + res.url());
  // Let the app finish its own (broken locally) navigation first, then load the page ourselves.
  await o.waitForURL((u) => u.href.startsWith(B + to.split("#")[0]), { timeout: 10000 }).catch(() => {});
  await o.waitForLoadState("load");
  await o.goto(B + to).catch(() => o.goto(B + to));
  errs.length = before;
  return to;
};
const text = () => o.evaluate(() => document.body.innerText);
const stockText = () => o.locator("#stock").innerText();

await o.goto(B + "/admin/login");
await o.getByLabel("ชื่อผู้ใช้").fill(ADMIN_USER);
await o.getByLabel("รหัสผ่าน").fill(ADMIN_PASS);
await submit(o.getByRole("button", { name: "เข้าสู่ระบบ" }));
step("owner login → " + new URL(o.url()).pathname);

// Test PromptPay for the shop (a made-up mobile number; local DB only).
await o.goto(B + "/admin/settings");
await o.getByLabel("ชื่อบัญชีผู้รับเงิน (ร้านค้า)").fill("ร้านทดสอบ");
await o.getByLabel(/พร้อมเพย์ร้านค้า/).fill("0800000000");
if (!/ok=saved/.test(await submit(o.locator("form", { hasText: "บัญชีรับเงินร้านค้า" }).getByRole("button", { name: "บันทึก" })))) fail("shop PromptPay not saved");
else step("shop PromptPay saved");

const setStock = async (v) => {
  await o.goto(B + "/admin/shop");
  const f = o.locator("#stock form").first();
  await f.getByLabel("ตั้งสต็อก").fill(v);
  return submit(f.getByRole("button", { name: "บันทึก" }));
};
await setStock("5");
if (!(await stockText()).includes("คงเหลือ 5")) fail("stock not 5");
else step("stock set to 5");

const newOrder = async (qty, price, shipping) => {
  await o.goto(B + "/admin/shop");
  await o.getByLabel("ชื่อ LINE ของลูกค้า").fill("ลูกค้าทดสอบ");
  await o.getByLabel("จำนวน").first().fill(String(qty));
  await o.getByLabel("ราคาต่อชิ้น (บาท)").first().fill(price);
  await o.getByLabel("ค่าส่ง (บาท)").fill(shipping);
  const to = await submit(o.getByRole("button", { name: "สร้างคำสั่งซื้อ" }));
  if (!/\/admin\/shop\/[^?]+\?ok=created/.test(to)) throw new Error("order not created: " + to);
  return B + to.split("?")[0];
};
const move = (label) => submit(o.getByRole("button", { name: label }));

// Validation
await o.goto(B + "/admin/shop");
await o.getByLabel("ชื่อ LINE ของลูกค้า").fill("ลูกค้าทดสอบ");
await o.getByLabel("ราคาต่อชิ้น (บาท)").first().fill("abc");
if (!/error=invalid_price/.test(await submit(o.getByRole("button", { name: "สร้างคำสั่งซื้อ" })))) fail("bad price accepted");
else step("bad price refused");

// Order 1: 2 × 89 + 40 = 218, paid → stock 3, ship needs tracking, then shipped → completed
const url1 = await newOrder(2, "89", "40");
if (!(await text()).includes("218")) fail("total 218 not shown");
else step("order created, total 218 " + new URL(url1).pathname);
if ((await o.locator('section[aria-labelledby="qr-title"] svg').count()) !== 1) fail("no PromptPay QR");
else step("PromptPay QR for 218 บาท shown");
if (!/ok=moved/.test(await move("ได้รับเงินแล้ว (ชำระแล้ว)"))) fail("not marked paid");
else step("marked paid");
await o.goto(B + "/admin/shop");
if (!(await stockText()).includes("คงเหลือ 3")) fail("stock not 3 after paid");
else step("stock 5 → 3");
await o.goto(url1);
if (!/error=missing_tracking/.test(await move("จัดส่งแล้ว"))) fail("shipped without tracking");
else step("ship without tracking refused");
await o.getByLabel("ขนส่ง").fill("Flash");
await o.getByLabel("เลขพัสดุ").fill("TH0000TEST");
await submit(o.locator('section[aria-labelledby="ship-title"]').getByRole("button", { name: "บันทึก" }));
const shipped = await move("จัดส่งแล้ว");
const done = await move("สำเร็จ");
if (!/ok=moved/.test(shipped + done) || !(await text()).includes("TH0000TEST") || !(await text()).includes("สำเร็จ")) fail("not completed with tracking");
else step("shipped → completed with tracking");

// Order 2: 4 more than stock 3 → paid refused; Order 3: 3 paid then cancelled → stock back to 3
await newOrder(4, "89", "0");
if (!/error=no_stock/.test(await move("ได้รับเงินแล้ว (ชำระแล้ว)"))) fail("paid accepted with short stock");
else step("paid refused when stock is short");
await newOrder(3, "89", "0");
await move("ได้รับเงินแล้ว (ชำระแล้ว)");
await o.goto(B + "/admin/shop");
const mid = await stockText();
await o.goBack();
await move("ยกเลิกคำสั่งซื้อ");
await o.goto(B + "/admin/shop");
if (!mid.includes("คงเหลือ 0") || !(await stockText()).includes("คงเหลือ 3")) fail("stock not 0 → 3 around cancel");
else step("paid then cancelled: stock 0 → back to 3");

// Sold out: stock 0 → API lists it; product page shows สินค้าหมด when the shop is on
await setStock("0");
if (shopOn) {
  const stock = await (await c.request.get(B + "/api/shop/stock")).json();
  if (!stock.soldOut?.length) fail("stock API soldOut empty");
  await c.reload();
  await c.getByText("สินค้าหมด").first().waitFor();
  step("stock 0 → product page shows สินค้าหมด, no LINE button: " + ((await c.getByRole("link", { name: /สั่งซื้อทาง LINE/ }).count()) === 0));
}
// Put the test stock back to untracked
await setStock("");

await b.close();
if (errs.length) fail("page errors: " + errs.join(" | "));
else console.log("no page errors");
