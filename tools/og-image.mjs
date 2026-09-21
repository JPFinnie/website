/* Generates assets/og.jpg (1200x630 social card) from the site's own fonts
   and artwork, so the card and the page stay in step.
   Usage: npm run og    (CHROME_PATH overrides the browser binary) */

import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const asset = f => 'file://' + path.join(root, 'assets', f);
// Fonts go in as data URIs: Chromium will not fetch file:// fonts reliably,
// and a silent fallback to a system face would ship the wrong card.
const fontData = f => 'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'assets', 'fonts', f)).toString('base64');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Space Grotesk';src:url('${fontData('SpaceGrotesk.woff2')}') format('woff2');font-weight:300 700}
@font-face{font-family:Inter;src:url('${fontData('Inter.woff2')}') format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:#14151b;color:#fff;font-family:Inter,sans-serif}
.art{position:absolute;inset:0;background:url('${asset('studio-world.png')}') center 62%/cover no-repeat}
.scrim{position:absolute;inset:0;background:linear-gradient(100deg,#0b0e14f7 0%,#0b0e14e8 42%,#0b0e1480 100%)}
.body{position:relative;padding:86px 84px;height:100%;display:flex;flex-direction:column;justify-content:center}
.rule{width:64px;height:4px;background:#ff6635;margin-bottom:26px}
.kicker{font-size:22px;letter-spacing:.17em;text-transform:uppercase;color:#ff9a76;font-weight:500}
h1{font-family:'Space Grotesk',sans-serif;font-size:104px;font-weight:400;letter-spacing:-.042em;line-height:1;margin:26px 0 30px}
.line{font-size:36px;line-height:1.35;color:#e3e6ec;letter-spacing:-.012em}
.meta{font-size:26px;color:#9ba0ab;margin-top:14px}
.url{position:absolute;left:84px;bottom:56px;font-size:26px;color:#b8bcc6;letter-spacing:.02em}
</style></head><body>
<div class="art"></div><div class="scrim"></div>
<div class="body">
  <div class="rule"></div>
  <div class="kicker">Product Manager &middot; AI Agents, Fintech &amp; Growth</div>
  <h1>James Finnie</h1>
  <div class="line">I build the thing before I pitch it.</div>
  <div class="meta">Toronto, ON</div>
</div>
<div class="url">james-finnie.com</div>
</body></html>`;

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox', '--allow-file-access-from-files']
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// The card is written to disk and loaded over file://: a document created with
// setContent() sits on about:blank, and Chromium refuses its file:// fonts and art.
const scratch = path.join(root, 'tools', '.og-card.html');
fs.writeFileSync(scratch, html);
await page.goto('file://' + scratch, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(250);
const out = path.join(root, 'assets', 'og.jpg');
await page.screenshot({ path: out, type: 'jpeg', quality: 88 });
await browser.close();
fs.unlinkSync(scratch);
console.log(`wrote ${path.relative(root, out)} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
