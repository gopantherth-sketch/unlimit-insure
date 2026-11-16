import { B, launch } from "./_env.mjs";
// Customer journey (LINE-first launch): prices hidden, contact through LINE and phone, no lead form.
const b = await launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
const step = (m) => console.log("✓", m);
const noPrice = async (where) => {
  const t = await p.locator("main").innerText();
  const hit = t.match(/.{0,50}(บาท \/ ปี|เบี้ยโดยประมาณ|มูลค่ารถโดยประมาณ\s*[\d,]+).{0,30}/);
  if (hit) throw new Error("price shown on " + where + ": " + hit[0]);
  step("no prices on " + where);
};
await p.goto(B + "/");
if ((await p.locator("main").innerText()).includes("ตัวอย่างเปรียบเทียบแพ็กเกจ")) throw new Error("sample packages on home");
const bar = p.getByRole("navigation", { name: "ติดต่อเรา" });
if ((await bar.getByRole("link", { name: /โทรหาเรา/ }).getAttribute("href")) !== "tel:+66914445542") throw new Error("mobile bar tel link");
if (!(await bar.getByRole("link", { name: /แอดไลน์/ }).getAttribute("href"))?.startsWith("https://line.me/R/ti/p/%40unlimit.insure")) throw new Error("mobile bar LINE link");
step("mobile contact bar: LINE + tel");
await noPrice("home");
await p.getByRole("button", { name: /เริ่มเลือกแผน/ }).click();
await p.waitForURL(/step=use/); step("hero → usage step");
await p.getByText("รถครอบครัว").click();
await p.getByRole("button", { name: "ถัดไป" }).click();
await p.waitForURL(/step=needs/);
if ((await p.getByRole("navigation", { name: "ขั้นตอน" }).getByRole("listitem").count()) !== 3) throw new Error("package steps remain in journey");
const checked = await p.locator('input[name="priorities"]:checked').count(); step(`needs step, ${checked} priorities preselected from usage`);
await p.getByText("ไม่มีค่าเสียหายส่วนแรก").first().click();
await p.getByRole("button", { name: /ดูแพ็กเกจ/ }).click();
await p.waitForURL(/\/advisor/); step("needs → advisor");
const lineHref = await p.getByRole("link", { name: /ส่งข้อมูลทาง LINE/ }).getAttribute("href");
const msg = decodeURIComponent(lineHref.split("?")[1] ?? "");
if (!msg.includes("สิ่งที่สำคัญ")) throw new Error("advisor LINE message lacks needs: " + msg);
step("advisor LINE message: " + msg.slice(0, 80));
if ((await p.locator("main form").count()) !== 0) throw new Error("advisor still has a form");
step("advisor has no form (no data stored)");
const contextUrl = new URL(p.url());
for (const legacy of ["/quote/results", "/compare", "/plans/a-type1-dealer"]) {
  await p.goto(B + legacy + contextUrl.search);
  await p.waitForURL(/\/advisor/);
  if (!p.url().includes("brand=toyota")) throw new Error("lost car context from " + legacy);
}
step("legacy package URLs → advisor with car context");
await p.goto(B + "/garage"); if (!p.url().endsWith("/claims")) throw new Error("/garage should redirect to /claims");
step("/garage → /claims");
console.log(errs.length ? "PAGE ERRORS:\n" + errs.join("\n") : "no page errors");
await b.close();
if (errs.length) process.exit(1);
