/* Verification pass: serves the repository, walks the opening scene and every
   section at three widths, and fails on console errors, dead local links or
   horizontal overflow. Writes shots/ for a visual once-over.
   Usage: npm run shots   (CHROME_PATH overrides the browser binary) */

import { chromium } from 'playwright-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.env.SHOTS_DIR || path.join(root, 'shots');
fs.mkdirSync(outDir, { recursive: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end('not found'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const problems = [];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox'] });

for (const [name, width, height, opts] of [
  ['desktop', 1440, 900, {}],
  ['tablet', 834, 1112, {}],
  ['mobile', 390, 844, {}],
  ['still', 1440, 900, { reducedMotion: 'reduce' }]
]) {
  const page = await browser.newPage({ viewport: { width, height }, ...opts });
  page.on('pageerror', e => problems.push(`${name}: ${e.message}`));
  page.on('console', m => m.type() === 'error' && problems.push(`${name}: ${m.text()}`));
  page.on('response', r => r.status() >= 400 && problems.push(`${name}: ${r.status()} ${r.url()}`));
  await page.goto(origin, { waitUntil: 'networkidle' });

  const range = await page.evaluate(() => document.querySelector('#journey').offsetHeight - window.innerHeight);
  for (const step of [0, .35, .6, .85, 1]) {
    await page.evaluate(y => window.scrollTo(0, y), range * step);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, `${name}-scene-${String(step).replace('.', '')}.png`) });
  }
  for (const id of ['about', 'work', 'experience', 'toolkit', 'contact']) {
    await page.evaluate(s => document.querySelector(s).scrollIntoView(), `#${id}`);
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(outDir, `${name}-${id}.png`) });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) problems.push(`${name}: ${overflow}px of horizontal overflow`);

  for (const href of await page.$$eval('a[href^="#"]', as => as.map(a => a.getAttribute('href'))))
    if (href !== '#' && !(await page.$(href))) problems.push(`${name}: dangling anchor ${href}`);

  await page.close();
}

await browser.close();
server.close();
console.log(problems.length ? problems.join('\n') : `ok — shots in ${path.relative(root, outDir)}/`);
process.exit(problems.length ? 1 : 0);
