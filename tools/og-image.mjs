/* One-off generator for assets/og.png (1200x630 social card).
   Usage: npm run og   (CHROME_PATH env var overrides the browser binary) */

import puppeteer from 'puppeteer';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const fontsDir = path.join(root, 'assets', 'fonts');
const fontUrl = (f) => 'file://' + path.join(fontsDir, f);

const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<style>
  @font-face{font-family:'Space Grotesk';src:url('${fontUrl('SpaceGrotesk.woff2')}') format('woff2');font-weight:300 700}
  @font-face{font-family:'Inter';src:url('${fontUrl('Inter.woff2')}') format('woff2');font-weight:100 900}
  @font-face{font-family:'JetBrains Mono';src:url('${fontUrl('JetBrainsMono.woff2')}') format('woff2');font-weight:100 800}
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1200px;height:630px;background:#060809;color:#edf1f7;font-family:'Inter',sans-serif;position:relative;overflow:hidden}
  .grid{position:absolute;inset:0;background-image:radial-gradient(rgba(168,179,194,.08) 1.5px,transparent 1.5px);background-size:34px 34px;
    -webkit-mask-image:linear-gradient(135deg,#000 30%,transparent 85%)}
  .mesh{position:absolute;inset:0;background:
    radial-gradient(560px 400px at 78% 22%,rgba(34,211,238,.14),transparent 70%),
    radial-gradient(500px 420px at 12% 88%,rgba(99,102,241,.10),transparent 70%)}
  .wrap{position:absolute;inset:0;padding:84px 90px;display:flex;flex-direction:column;justify-content:space-between}
  .eyebrow{font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:#22d3ee}
  .eyebrow i{font-style:normal;color:#67e8f9;margin-right:12px}
  h1{font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:128px;line-height:.95;letter-spacing:-.045em}
  h1 em{font-style:normal;color:#22d3ee;text-shadow:0 0 60px rgba(34,211,238,.4)}
  .sub{font-size:26px;color:#a8b3c2;max-width:640px;line-height:1.45}
  .sub strong{color:#edf1f7;font-weight:500}
  .foot{display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:18px;letter-spacing:.04em;color:#7d8a9b}
  .foot b{color:#22d3ee;font-weight:400}
  .rule{position:absolute;left:90px;right:90px;bottom:150px;height:1px;background:#1c222b}
</style></head>
<body>
  <div class="grid"></div>
  <div class="mesh"></div>
  <div class="wrap">
    <div>
      <div class="eyebrow" style="margin-bottom:42px"><i>&gt;</i>Senior Product Manager &middot; AI &amp; Agentic Product</div>
      <h1>James <em>Finnie</em></h1>
    </div>
    <div class="sub">Building <strong>AI-native products and deep context systems</strong> &mdash; prototype-first, agents in the loop.</div>
    <div class="rule"></div>
    <div class="foot"><span><b>james-finnie.com</b></span><span>Toronto, Canada</span></div>
  </div>
</body></html>`;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
// load via file:// so the local @font-face urls are allowed to resolve
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'og-')), 'og.html');
fs.writeFileSync(tmp, html);
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
const out = path.join(root, 'assets', 'og.png');
await page.screenshot({ path: out });
await browser.close();
fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
console.log('wrote', out);
