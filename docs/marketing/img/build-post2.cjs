// UNL FB Post 2 (both-type1-who-pays) image · CONTENT-UNL chat · 2026-11-26 · approved by Nithi 11-26 (Nithi posts).
// Base: post2-base.jpg (AI background, Nithi via Gemini). Adds Thai headline, short answer, scene checklist, footer, logo.
// Text only from WEEK-1-FB-2026-11-24.md "Post 2" (same as the live Lab article). Run: node build-post2.cjs
const p = require("D:/Digital Namecard/template/node_modules/puppeteer");
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const b64 = f => fs.readFileSync(path.join(dir, f)).toString("base64");
const bg = "data:image/jpeg;base64," + b64("post2-base.jpg");
const logo = "data:image/png;base64," + fs.readFileSync(path.join(dir, "../../../public/brand/unlimit-logo-full.png")).toString("base64");

const steps = [
  "แจ้งบริษัทประกันของตัวเอง แล้วรอเจ้าหน้าที่",
  "ถ่ายรูปรถทั้งสองคันและป้ายทะเบียน ถ้าปลอดภัยพอ",
  "ไม่ควรตกลงจ่ายหรือรับเงินกันเอง",
];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;position:relative;overflow:hidden;font-family:'IBM Plex Sans Thai',sans-serif;
 background:url(${bg}) center/cover no-repeat}
.logo{position:absolute;right:56px;top:52px;height:104px}
h1{position:absolute;left:86px;top:96px;font-size:64px;line-height:1.28;font-weight:700;color:#14143a;letter-spacing:-.5px}
.ans{position:absolute;left:89px;top:282px;font-size:34px;font-weight:700;color:#1A1AD6}
.card{position:absolute;left:89px;top:362px;padding:22px 30px 20px;border-radius:22px;
 background:rgba(255,255,255,.72);box-shadow:0 8px 28px rgba(26,26,214,.08)}
.card .h{font-size:24px;font-weight:700;color:#14143a;margin-bottom:8px}
.card li{list-style:none;font-size:24px;line-height:1.75;color:#2b2f4a;padding-left:38px;position:relative}
.card li:before{content:"";position:absolute;left:0;top:11px;width:24px;height:24px;border-radius:50%;background:#1A1AD6}
.card li:after{content:"";position:absolute;left:8px;top:16px;width:6px;height:11px;border:solid #fff;border-width:0 3px 3px 0;transform:rotate(45deg)}
.foot{position:absolute;left:89px;bottom:46px;font-size:21px;color:#5a5f78}
</style></head><body>
<img class="logo" src="${logo}">
<h1>รถชนกัน มีประกันชั้น 1 ทั้งคู่<br>ใครจ่าย</h1>
<div class="ans">คำตอบสั้น: ดูว่าใครเป็นฝ่ายผิด</div>
<div class="card"><div class="h">ที่จุดเกิดเหตุ</div><ul>${steps.map(s => `<li>${s}</li>`).join("")}</ul></div>
<div class="foot">เป็นไปตามเงื่อนไขและข้อยกเว้นของกรมธรรม์</div>
</body></html>`;

(async () => {
  const br = await p.launch();
  const pg = await br.newPage();
  await pg.setViewport({ width: 1080, height: 1080 });
  await pg.setContent(html, { waitUntil: "networkidle0" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(dir, "post2-1080-preview.png") });
  await br.close();
  console.log("saved post2-1080-preview.png");
})();
