/* Verification screenshots — serves the repo root on a local port, then
   captures desktop/tablet/mobile full-page shots, the open mobile menu,
   a graph hover state, and a reduced-motion pass. Fails (exit 1) on page
   console errors or horizontal overflow.
   Usage: npm run shots   (CHROME_PATH env var overrides the browser binary) */

import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.env.SHOTS_DIR || path.join(root, 'shots');
fs.mkdirSync(outDir, { recursive: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const errors = [];
const failedUrls = [];
let failed = false;

async function newPage(width, height, reducedMotion = false) {
  const page = await browser.newPage();
  page.on('console', m => {
    // /_vercel/* analytics scripts 404 locally by design — ignore their load errors
    if (m.type() !== 'error') return;
    const url = m.location()?.url || '';
    if (url.includes('/_vercel/') || (m.text().startsWith('Failed to load resource') && url === '')) {
      if (url === '') failedUrls.push('(resource error, see 404 list)');
      return;
    }
    errors.push(`[console:${width}w] ${m.text()}`);
  });
  page.on('response', r => {
    if (r.status() >= 400 && !r.url().includes('/_vercel/')) errors.push(`[${r.status()}:${width}w] ${r.url()}`);
  });
  page.on('pageerror', e => errors.push(`[pageerror:${width}w] ${e.message}`));
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  if (reducedMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(base + '/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) { failed = true; console.error(`FAIL horizontal overflow at ${label}: +${overflow}px`); }
}

// full-page shots at three widths — scroll through first so all reveals fire
for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  const page = await newPage(w, h);
  await page.evaluate(async () => {
    const step = window.innerHeight * .7;
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise(r => setTimeout(r, 1200)); // reveals + text-generate settle
  });
  await checkOverflow(page, `${w}w`);
  await page.screenshot({ path: path.join(outDir, `full-${w}.png`), fullPage: true });
  await page.close();
}

// mobile menu open
{
  const page = await newPage(390, 844);
  await page.click('#menu-btn');
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
  await page.screenshot({ path: path.join(outDir, 'mobile-menu.png') });
  await page.close();
}

// graph hover state (desktop) — move mouse over the canvas centre
{
  const page = await newPage(1440, 900);
  await page.evaluate(() => new Promise(r => setTimeout(r, 2000)));
  const box = await (await page.$('#graph')).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
  await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
  await page.screenshot({ path: path.join(outDir, 'graph-hover.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.close();
}

// reduced motion — graph must render a static frame, content fully visible
{
  const page = await newPage(1440, 900, true);
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));
  await checkOverflow(page, 'reduced-motion');
  await page.screenshot({ path: path.join(outDir, 'reduced-motion.png') });
  await page.close();
}

await browser.close();
server.close();

if (errors.length) { failed = true; console.error('FAIL console/page errors:\n' + errors.join('\n')); }
console.log(failed ? 'FAILED — see above' : 'OK — shots in ' + outDir);
process.exit(failed ? 1 : 0);
