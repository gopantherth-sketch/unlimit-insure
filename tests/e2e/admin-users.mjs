import { B, FIX, ADMIN_USER, ADMIN_PASS, launch } from "./_env.mjs";
const b = await launch();
const errs = [];
const step = (m) => console.log("✓", m);
const page = async () => { const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); p.on("pageerror", (e) => errs.push(e.message)); return p; };
const login = async (p, u, pw) => {
  await p.goto(B + "/admin/login");
  await p.getByLabel("ชื่อผู้ใช้").fill(u); await p.getByLabel("รหัสผ่าน").fill(pw);
  const t = Date.now(); await p.getByRole("button", { name: "เข้าสู่ระบบ" }).click(); await p.waitForLoadState("networkidle");
  return Date.now() - t;
};
// customer lead
const c = await page();
const r = await c.request.post(B + "/api/leads", { data: { name: "ลูกค้าทดสอบ", phone: "0812345678", preferredChannel: "phone", consentContact: true, consentMarketing: false, context: {} } });
const ref = (await r.json()).reference; step("lead created " + ref);

// owner (env) creates staff
const o = await page();
await login(o, ADMIN_USER, ADMIN_PASS); step("env owner login → " + new URL(o.url()).pathname);
await o.goto(B + "/admin/users");
await o.getByLabel("ชื่อที่แสดง").fill("นก ทีมขาย"); await o.getByLabel(/ชื่อผู้ใช้/).fill("Nok.Sales");
await o.getByLabel(/รหัสผ่านชั่วคราว/).fill("temporary-pass-1");
await o.getByRole("button", { name: "เพิ่มผู้ใช้" }).click(); await o.waitForURL(/\/admin\/users\/.+ok=created/); step("staff created");
const staffUrl = o.url().split("?")[0];
await o.goto(B + "/admin/users");
await o.getByLabel("ชื่อที่แสดง").fill("x"); await o.getByLabel(/ชื่อผู้ใช้/).fill(ADMIN_USER); await o.getByLabel(/รหัสผ่านชั่วคราว/).fill("temporary-pass-1");
await o.getByRole("button", { name: "เพิ่มผู้ใช้" }).click(); await o.getByText("สงวนไว้").waitFor(); step("reserved username refused");

// staff login → forced password change
const s = await page();
const ms = await login(s, "nok.sales", "temporary-pass-1"); step(`staff login (${ms} ms) → ${new URL(s.url()).pathname}${new URL(s.url()).search}`);
await s.goto(B + "/admin/leads"); step("staff blocked until password change → " + new URL(s.url()).pathname);
await s.getByLabel("รหัสผ่านปัจจุบัน").fill("temporary-pass-1");
await s.getByLabel(/รหัสผ่านใหม่ \(/).fill("nok-new-password-1"); await s.getByLabel("ยืนยันรหัสผ่านใหม่").fill("nok-new-password-1");
await s.getByRole("button", { name: "เปลี่ยนรหัสผ่าน" }).click(); await s.waitForURL(/\/admin\?ok=password/); step("password changed, session kept");
step("staff nav has users link: " + (await s.getByRole("link", { name: "ผู้ใช้" }).count()));
await s.goto(B + "/admin/users"); step("staff → /admin/users redirected to " + new URL(s.url()).pathname + new URL(s.url()).search);

// staff assigns lead to self, changes status, adds note
await s.goto(B + "/admin/leads"); await s.getByRole("link", { name: ref }).click(); await s.waitForURL(/\/admin\/leads\/[^?]+$/);
await s.getByRole("combobox", { name: "ผู้รับผิดชอบ" }).selectOption({ label: "นก ทีมขาย" }); await s.getByRole("button", { name: "บันทึกผู้รับผิดชอบ" }).click();
await s.getByText("มอบหมายให้: นก ทีมขาย").waitFor();
await s.getByLabel("เปลี่ยนสถานะ").selectOption("contacted"); await s.getByRole("button", { name: "บันทึกสถานะ" }).click();
await s.getByText("สถานะ: new → contacted").waitFor();
await s.getByLabel("เพิ่มบันทึก").fill("โทรแล้ว ลูกค้าสนใจชั้น 1"); await s.getByRole("button", { name: "เพิ่มบันทึก" }).click();
await s.getByText("โทรแล้ว ลูกค้าสนใจชั้น 1").waitFor();
const acts = await s.locator("section", { hasText: "กิจกรรม" }).innerText();
step("activities by staff: " + (acts.match(/นก ทีมขาย ·/g) || []).length);
await s.goto(B + "/admin/leads?scope=mine"); step("my leads list shows it: " + (await s.getByRole("link", { name: ref }).count()));
await s.goto(B + "/admin/products/a-type1-dealer"); step("staff sees verify form: " + (await s.getByRole("button", { name: "ยืนยันว่าตรวจสอบแล้ว" }).count()));

// owner disables staff → staff session ends immediately
await o.goto(staffUrl); await o.getByRole("button", { name: "ปิดการใช้งานบัญชีนี้" }).click(); await o.waitForURL(/ok=disabled/); step("owner disabled staff");
await s.goto(B + "/admin/leads"); step("staff after disable → " + new URL(s.url()).pathname);
const s2 = await page(); await login(s2, "nok.sales", "nok-new-password-1"); step("disabled staff login → " + new URL(s2.url()).pathname + " " + (await s2.getByText("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง").count() ? "(invalid shown)" : ""));
// re-enable + reset → old session invalid
await o.goto(staffUrl); await o.getByRole("button", { name: "เปิดการใช้งานบัญชีนี้" }).click(); await o.waitForURL(/ok=enabled/);
const s3 = await page(); await login(s3, "nok.sales", "nok-new-password-1"); step("re-enabled staff login → " + new URL(s3.url()).pathname);
await o.goto(staffUrl); await o.getByLabel(/รหัสผ่านชั่วคราว/).fill("second-temp-pass"); await o.getByRole("button", { name: "ตั้งรหัสผ่านชั่วคราว" }).click(); await o.waitForURL(/ok=reset/);
await s3.goto(B + "/admin/leads"); step("staff after reset → " + new URL(s3.url()).pathname);
await o.goto(B + "/admin/users");
console.log(errs.length ? "PAGE ERRORS:\n" + errs.join("\n") : "no page errors");
await b.close();
