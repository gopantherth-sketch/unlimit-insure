// UNL FB Post 1 (insurance-types) image · CONTENT chat · 2026-11-26 · DRAFT for Nithi to approve (nothing posted).
// Base: post1-base.jpg (AI background, Nithi via Grok/Gemini). Adds Thai headline, 4 level labels, footer, logo.
// Text only from WEEK-1-FB-2026-11-24.md "Post 1". Run: node build-post1.cjs
const p = require("D:/Digital Namecard/template/node_modules/puppeteer");
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const b64 = f => fs.readFileSync(path.join(dir, f)).toString("base64");
const bg = "data:image/jpeg;base64," + b64("post1-base.jpg");
const logo = "data:image/png;base64," + fs.readFileSync(path.join(dir, "../../../public/brand/unlimit-logo-full.png")).toString("base64");

// bar centres / tops measured on the 1080 canvas
const bars = [
  { x: 140, top: 464, label: "1", dark: false },
  { x: 258, top: 538, label: "2+", dark: false },
  { x: 377, top: 611, label: "3+", dark: true },
  { x: 495, top: 685, label: "3", dark: true },
];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;position:relative;overflow:hidden;font-family:'IBM Plex Sans Thai',sans-serif;
 background:url(${bg}) center/cover no-repeat}
.logo{position:absolute;right:56px;top:52px;height:104px}
.eyebrow{position:absolute;left:89px;top:96px;font-size:26px;font-weight:500;color:#1A1AD6;letter-spacing:.2px}
h1{position:absolute;left:86px;top:96px;font-size:68px;line-height:1.28;font-weight:700;color:#14143a;letter-spacing:-.5px}
.bar{position:absolute;width:100px;transform:translateX(-50%);text-align:center}
.bar .t{display:block;font-size:20px;font-weight:500;line-height:1}
.bar .n{display:block;font-size:46px;font-weight:700;line-height:1.15}
.foot{position:absolute;left:89px;bottom:46px;font-size:21px;color:#5a5f78}
</style></head><body>
<img class="logo" src="${logo}">
<h1>ประกันชั้น 1, 2+, 3+ และ 3<br>ต่างกันตรงไหน</h1>
${bars.map(b => `<div class="bar" style="left:${b.x}px;top:${b.top + 22}px;color:${b.dark ? "#1A1AD6" : "#fff"}"><span class="t">ชั้น</span><span class="n">${b.label}</span></div>`).join("")}
<div class="foot">ความคุ้มครองจริงขึ้นกับเงื่อนไขของแต่ละกรมธรรม์</div>
</body></html>`;

(async () => {
  const br = await p.launch();
  const pg = await br.newPage();
  await pg.setViewport({ width: 1080, height: 1080 });
  await pg.setContent(html, { waitUntil: "networkidle0" });
  await pg.evaluate(() => document.fonts.ready);
  await pg.screenshot({ path: path.join(dir, "post1-1080-preview.png") });
  await br.close();
  console.log("saved post1-1080-preview.png");
})();
