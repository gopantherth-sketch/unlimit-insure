import { B, launch } from "./_env.mjs";

// Public LINE-first journey: car details go to an advisor; mock products stay off the site.
const b = await launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
const step = (message) => console.log("✓", message);
const checkAdvisor = async (path) => {
  await p.goto(B + path);
  if (new URL(p.url()).pathname !== "/advisor") throw new Error(`${path} exposed public product data: ${p.url()}`);
};

await p.goto(B + "/");
const bar = p.getByRole("navigation", { name: "ติดต่อเรา" });
if ((await bar.getByRole("link", { name: /โทรหาเรา/ }).getAttribute("href")) !== "tel:+66914445542") throw new Error("mobile bar tel link");
if (!(await bar.getByRole("link", { name: /แอดไลน์/ }).getAttribute("href"))?.startsWith("https://line.me/R/ti/p/%40unlimit.insure")) throw new Error("mobile bar LINE link");
step("mobile contact bar: LINE + tel");
const homeText = await p.locator("main").innerText();
if (/890,000|850,000|930,000|ชั้น 1 ซ่อมศูนย์ Plus|อยู่ในความคุ้มครอง/.test(homeText)) throw new Error("mock plan data shown on home");
step("home has no mock plans or coverage verdicts");

const guide = p.locator('section[aria-labelledby="sim-title"]');
await guide.locator("label").filter({ hasText: "น้ำท่วม" }).click();
const guideText = await guide.innerText();
if (/890,000|850,000|930,000|2,000|อยู่ในความคุ้มครอง|วงเงินสูงสุด/.test(guideText)) throw new Error("mock coverage result shown in event guide");
const eventHref = await guide.getByRole("link", { name: /ถามเรื่องนี้ทาง LINE/ }).getAttribute("href");
if (!eventHref || !decodeURIComponent(eventHref).includes("น้ำท่วม")) throw new Error("event missing from LINE message");
step("event guide: no mock verdict; selected event in LINE message");

await p.getByRole("button", { name: "ให้ที่ปรึกษาช่วยดู" }).click();
await p.waitForURL(/\/advisor/);
const lineHref = await p.getByRole("link", { name: /ส่งข้อมูลทาง LINE/ }).getAttribute("href");
const message = decodeURIComponent(lineHref?.split("?")[1] ?? "");
if (!message.includes("Toyota Corolla Cross 2025")) throw new Error("advisor LINE message lacks car details: " + message);
if (message.includes("ชั้น 1 ซ่อมศูนย์ Plus")) throw new Error("mock plan in advisor LINE message");
if (await p.locator("main form").count()) throw new Error("advisor still has a form");
step("car details → advisor LINE message; no form or mock plan");

for (const path of ["/quote", "/quote/results", "/compare", "/plans/a-type1-dealer", "/buy/a-type1-dealer"]) {
  await checkAdvisor(path);
}
step("old product routes → advisor");

await p.goto(B + "/insurance/toyota/toyota-corolla-cross");
if (await p.getByRole("heading", { name: /ตัวอย่างแพ็กเกจ/ }).count()) throw new Error("mock product card on model page");
if (!(await p.getByRole("link", { name: /ถามประกันสำหรับ/ }).getAttribute("href"))?.startsWith("/advisor")) throw new Error("model page CTA does not reach advisor");
step("model page has guidance and advisor CTA, no mock plan cards");

await p.goto(B + "/lab/type1-vs-2plus");
if (!(await p.getByRole("heading", { name: "ถามเรื่องนี้กับที่ปรึกษา" }).count())) throw new Error("Lab still shows mock product comparison");
step("Lab tool shows advisor prompt");

await p.goto(B + "/garage");
if (!p.url().endsWith("/claims")) throw new Error("/garage should redirect to /claims");
step("/garage → /claims");

console.log(errs.length ? "PAGE ERRORS:\n" + errs.join("\n") : "no page errors");
await b.close();
if (errs.length) process.exit(1);
