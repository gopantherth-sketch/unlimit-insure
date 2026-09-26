import { B, FIX, ADMIN_USER, ADMIN_PASS, launch } from "./_env.mjs";
const b = await launch();
const errs = [];
const step = (m) => console.log("✓", m);
const fail = (m) => { console.log("✗", m); process.exitCode = 1; };
const page = async (w = 390) => { const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage(); p.on("pageerror", (e) => errs.push(e.message)); return p; };

// Owner sets payment settings
const o = await page(1280);
await o.goto(B + "/admin/login");
await o.getByLabel("ชื่อผู้ใช้").fill(ADMIN_USER); await o.getByLabel("รหัสผ่าน").fill(ADMIN_PASS);
await o.getByRole("button", { name: "เข้าสู่ระบบ" }).click(); await o.waitForURL(/\/admin$/);
await o.goto(B + "/admin/settings");
await o.getByLabel(/พร้อมเพย์/).fill("12345");
await o.getByLabel("ชื่อบัญชีผู้รับเงิน").fill("บริษัท ทดสอบ จำกัด");
await o.getByRole("button", { name: "บันทึก" }).click(); await o.getByText(/พร้อมเพย์ต้องเป็น/).waitFor(); step("invalid PromptPay refused");
await o.getByLabel(/พร้อมเพย์/).fill("0812345678");
await o.getByLabel("ชื่อบัญชีผู้รับเงิน").fill("บริษัท ทดสอบ จำกัด");
await o.getByRole("button", { name: "บันทึก" }).click(); await o.getByText("พร้อมรับชำระ").waitFor(); step("payment settings saved");

// Customer: results → buy
const c = await page();
await c.goto(B + "/quote/results?brand=toyota&model=toyota-corolla-cross&year=2022&usage=commute");
await c.getByRole("link", { name: /เลือกแพ็กเกจ|เลือกแผน/ }).first().click();
await c.waitForURL(/\/buy\//); step("results card → " + new URL(c.url()).pathname);
await c.getByRole("button", { name: "ส่งใบสมัคร" }).click();
await c.waitForTimeout(800);
step("empty submit errors: " + (await c.locator("[aria-invalid=true]").count()));
await c.getByLabel("ชื่อ-นามสกุล").fill("สมชาย ทดสอบ");
await c.getByLabel("เบอร์โทรศัพท์").fill("081-234-5678");
await c.getByLabel("ที่อยู่").fill("99 ถนนทดสอบ แขวงทดสอบ เขตทดสอบ กรุงเทพฯ 10110");
await c.getByLabel("เลขทะเบียนรถ").fill("1กข 1234");
await c.getByLabel("จังหวัด").selectOption("กรุงเทพมหานคร");
await c.getByText("ใช่ ใช้เชิงพาณิชย์").click();
if (await c.getByText(/รถที่ใช้เชิงพาณิชย์ยังสมัครออนไลน์ไม่ได้/).isVisible()) step("commercial use blocked"); else fail("commercial block not shown");
await c.getByText("ไม่ใช่ ใช้ส่วนตัว").click();
for (const id of ["consentData", "consentInsurer", "consentTruthful"]) await c.locator("#" + id).check();
await c.getByRole("button", { name: "ส่งใบสมัคร" }).click();
await c.waitForURL(/\/track\/APP-/, { timeout: 15000 });
const u = new URL(c.url()); const ref = u.pathname.split("/").pop(); const token = u.searchParams.get("t");
step("application created " + ref + ", private link shown: " + (await c.locator("#private-link").count()));

// Another browser: link without phone → phone check; wrong then right
const x = await page();
await x.goto(`${B}/track/${ref}?t=${token}`);
await x.getByLabel("เบอร์โทร 4 ตัวท้าย").fill("0000"); await x.getByRole("button", { name: "ดูใบสมัคร" }).click();
await x.waitForURL(/error=phone/); step("wrong last-4 refused");
await x.getByLabel("เบอร์โทร 4 ตัวท้าย").fill("5678"); await x.getByRole("button", { name: "ดูใบสมัคร" }).click();
await x.waitForURL(new RegExp(`/track/${ref}$`)); step("last-4 ok → access");
const y = await page();
await y.goto(`${B}/track/${ref}`); step("no cookie → " + ((await y.getByText(/ลิงก์/).count()) > 0 ? "no access page" : "??"));
await y.goto(`${B}/track/${ref}?t=wrongtoken`); step("bad token → phone form (expect 0): " + (await y.getByLabel("เบอร์โทร 4 ตัวท้าย").count()));

// Garage lookup
const g = await page();
await g.goto(B + "/garage");
await g.getByLabel("เลขอ้างอิงใบสมัคร").fill(ref); await g.getByLabel("เบอร์โทรที่ใช้สมัคร").fill("0899999999");
await g.getByRole("button", { name: "ค้นหาใบสมัคร" }).click(); await g.getByText(/ไม่พบใบสมัคร/).waitFor(); step("garage wrong phone refused");
await g.getByLabel("เบอร์โทรที่ใช้สมัคร").fill("0812345678");
await g.getByRole("button", { name: "ค้นหาใบสมัคร" }).click(); await g.waitForURL(new RegExp(`/track/${ref}$`)); step("garage lookup → track");

// Uploads
const upload = async (kind, file) => {
  const form = c.locator("form").filter({ has: c.locator('input[type=file]') }).first();
  if (kind) await form.locator("select[name=kind]").selectOption(kind);
  await form.locator("input[type=file]").setInputFiles(FIX + file);
  await form.getByRole("button", { name: /อัปโหลด/ }).click();
  await c.waitForTimeout(1500);
};
await c.goto(`${B}/track/${ref}`);
await upload("registration", "t.txt");
if ((await c.getByText(/รองรับเฉพาะ/).count()) > 0) step("text file refused"); else fail("text file not refused");
if (await c.getByRole("button", { name: "ส่งใบสมัครให้ตรวจ" }).isDisabled()) step("submit disabled until docs complete");
await upload("registration", "t.png"); await upload("driving_license", "t.png"); await upload("id_card", "t.pdf");
await c.reload();
step("uploaded files listed: " + (await c.locator("#uploaded-title + ul li").count()));
const fetchIn = (pg, href) => pg.evaluate(async (h) => { const r = await fetch(h); return `${r.status} ${r.headers.get("content-type")} ${r.headers.get("content-security-policy") ? "csp" : ""}`; }, href);
step("customer download " + (await fetchIn(c, await c.locator("#uploaded-title + ul a").first().getAttribute("href"))));
const dlOther = await y.request.get(B + (await c.locator("#uploaded-title + ul a").first().getAttribute("href")));
step(`download without access → ${dlOther.status()}`);
await c.getByRole("button", { name: "ส่งใบสมัครให้ตรวจ" }).click(); await c.waitForURL(/ok=submitted/); step("sent for review");

// Staff: list, request info
await o.goto(B + "/admin/applications?view=todo");
await o.getByRole("link", { name: ref }).click(); await o.waitForURL(/\/admin\/applications\/.+/);
const adminUrl = o.url().split("?")[0];
step("admin detail docs: " + (await o.getByRole("link", { name: "เปิด" }).count()));
step("admin doc " + (await fetchIn(o, await o.getByRole("link", { name: "เปิด" }).first().getAttribute("href"))));
await o.getByLabel("เปลี่ยนสถานะ").selectOption("needs_info");
await o.getByRole("button", { name: "บันทึกสถานะ" }).click(); await o.waitForURL(/error=missing_reason/); step("needs_info without message refused");
await o.getByLabel("เปลี่ยนสถานะ").selectOption("needs_info");
await o.getByLabel("ข้อความถึงลูกค้า").fill("กรุณาอัปโหลดรูปถ่ายรถด้านหน้า");
await o.getByRole("button", { name: "บันทึกสถานะ" }).click(); await o.waitForURL(/ok=moved/); step("needs_info sent");

await c.goto(`${B}/track/${ref}`);
if ((await c.getByText("กรุณาอัปโหลดรูปถ่ายรถด้านหน้า").count()) > 0) step("customer sees staff message"); else fail("message not visible");
await upload("vehicle_photo", "t.png");
await c.getByRole("button", { name: "ส่งใบสมัครให้ตรวจ" }).click(); await c.waitForURL(/ok=submitted/); step("resubmitted");

// Staff: final premium + awaiting payment
await o.goto(adminUrl);
await o.getByLabel("เบี้ย (บาท)").fill("19,900"); await o.getByLabel(/เหตุผล/).fill("บริษัทประกันยืนยันตามอายุผู้ขับ");
await o.getByRole("button", { name: "บันทึกเบี้ย" }).click(); await o.waitForURL(/ok=premium/); step("final premium set");
await o.getByLabel("เปลี่ยนสถานะ").selectOption("awaiting_payment");
await o.getByRole("button", { name: "บันทึกสถานะ" }).click(); await o.waitForURL(/ok=moved/); step("awaiting payment");

// Customer pays
await c.goto(`${B}/track/${ref}`);
step("price change notice: " + ((await c.getByText(/เบี้ยประกันเปลี่ยนจาก/).count()) > 0) + ", QR: " + (await c.locator('[role=img][aria-label^="QR"] svg').count()));
if ((await c.getByText("19,900").count()) === 0) fail("new amount not shown");
await upload(null, "t.png");
await c.getByRole("button", { name: "แจ้งชำระเงินแล้ว" }).click(); await c.waitForURL(/ok=paid/); step("payment notified");

// Staff: to insurer, policy, issue
await o.goto(adminUrl);
await o.getByLabel("เปลี่ยนสถานะ").selectOption("sent_to_insurer");
await o.getByRole("button", { name: "บันทึกสถานะ" }).click(); await o.waitForURL(/ok=moved/); step("sent to insurer");
await o.getByLabel("เปลี่ยนสถานะ").selectOption("policy_issued");
await o.getByRole("button", { name: "บันทึกสถานะ" }).click(); await o.waitForURL(/error=missing_policy/); step("issue without policy refused");
await o.getByLabel("เลขกรมธรรม์").fill("POL-TEST-0001");
await o.getByLabel("วันสิ้นสุด").fill("2027-12-31");
await o.getByRole("button", { name: "บันทึกข้อมูลกรมธรรม์" }).click(); await o.waitForURL(/ok=policy/); step("policy details saved");
const sf = o.locator("form").filter({ hasText: "อัปโหลดเอกสาร" });
await sf.locator("input[type=file]").setInputFiles(FIX + "t.pdf"); await sf.getByRole("button", { name: "อัปโหลด" }).click();
await o.getByText("อัปโหลดแล้ว").waitFor(); step("policy PDF uploaded");
await o.reload();
await o.getByLabel("เปลี่ยนสถานะ").selectOption("policy_issued");
await o.getByRole("button", { name: "บันทึกสถานะ" }).click(); await o.waitForURL(/ok=moved/); step("policy issued");

await c.goto(`${B}/track/${ref}`);
step("customer sees policy: " + ((await c.getByText("POL-TEST-0001").count()) > 0));

// Reset link revokes access
await o.goto(adminUrl);
await o.getByRole("button", { name: "สร้างลิงก์ใหม่" }).click();
await o.locator("#private-link").waitFor(); const newUrl = await o.locator("#private-link").inputValue(); step("new link: " + newUrl.replace(/t=.*/, "t=…"));
await c.goto(`${B}/track/${ref}`); step("old cookie after reset → " + ((await c.getByText("POL-TEST-0001").count()) > 0 ? "STILL ACCESS" : "revoked"));
await c.goto(`${B}/track/${ref}?t=${token}`); step("old token after reset → phone form: " + (await c.getByLabel("เบอร์โทร 4 ตัวท้าย").count()));
await c.goto(newUrl.replace(/^https?:\/\/[^/]+/, B)); step("new token → phone form: " + (await c.getByLabel("เบอร์โทร 4 ตัวท้าย").count()));

// Access control on admin doc route
const anon = await page();
const an = await anon.request.get(B + "/admin/documents/" + "00000000-0000-0000-0000-000000000000", { maxRedirects: 0 });
step("admin doc anon → " + an.status());

console.log(errs.length ? "PAGE ERRORS:\n" + errs.join("\n") : "no page errors");
await b.close();
