/* Responsive and interaction verification for the static portfolio.
   Usage: npm run shots (optional CHROME_PATH, CHROME_ARGS, SHOTS_DIR). */
import puppeteer from "puppeteer";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.env.SHOTS_DIR || path.join(root, "shots");
fs.mkdirSync(outDir, { recursive: true });
const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".json": "application/json",
};
const security = JSON.parse(
  fs.readFileSync(path.join(root, "vercel.json"), "utf8"),
).headers.find((rule) => rule.source === "/(.*)").headers;
const headers = Object.fromEntries(
  security.map(({ key, value }) => [key, value]),
);
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(
    new URL(req.url, "http://localhost").pathname,
  );
  const file = path.resolve(
    root,
    "." + (urlPath === "/" ? "/index.html" : urlPath),
  );
  if (
    !file.startsWith(root + path.sep) ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  ) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, {
    ...headers,
    "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
  });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const errors = [];
let browser;

async function openPage(width, height, options = {}) {
  const page = await browser.newPage();
  page.on("pageerror", (error) => errors.push(`[${width}px] ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error")
      errors.push(`[${width}px] ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  if (options.noJS) await page.setJavaScriptEnabled(false);
  if (options.reduced)
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
  await page.goto(base, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function checkLayout(page, label) {
  const state = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    missing: [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.src),
    brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
      .map((link) => link.getAttribute("href").slice(1))
      .filter((id) => id && !document.getElementById(id)),
    headings: document.querySelectorAll("h1").length,
    headingVisible:
      document.querySelector("h1").getBoundingClientRect().height > 0,
  }));
  assert.ok(
    state.overflow <= 1,
    `${label}: horizontal overflow (${state.overflow}px)`,
  );
  assert.deepEqual(state.missing, [], `${label}: missing images`);
  assert.deepEqual(state.brokenAnchors, [], `${label}: broken section links`);
  assert.equal(state.headings, 1, `${label}: expected one main heading`);
  assert.equal(state.headingVisible, true, `${label}: heading is hidden`);
}

try {
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      ...JSON.parse(process.env.CHROME_ARGS || "[]"),
    ],
    pipe: true,
  });
  for (const [width, height] of [
    [1440, 1000],
    [1024, 900],
    [768, 1024],
    [390, 844],
    [320, 740],
  ]) {
    const page = await openPage(width, height);
    await page.evaluate(async () => {
      for (
        let y = 0;
        y < document.documentElement.scrollHeight;
        y += innerHeight
      ) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    );
    await checkLayout(page, `${width}px`);
    await page.screenshot({
      path: path.join(outDir, `full-${width}.png`),
      fullPage: true,
    });
    await page.screenshot({ path: path.join(outDir, `hero-${width}.png`) });
    await page.close();
    console.log(`PASS layout ${width}px`);
  }

  const mobile = await openPage(390, 844);
  await mobile.click("#menu-btn");
  assert.equal(
    await mobile.$eval("#menu-btn", (button) =>
      button.getAttribute("aria-expanded"),
    ),
    "true",
  );
  assert.equal(
    await mobile.$eval("#navigation", (nav) => getComputedStyle(nav).display),
    "flex",
  );
  await mobile.screenshot({ path: path.join(outDir, "mobile-menu.png") });
  await mobile.keyboard.press("Escape");
  assert.equal(
    await mobile.$eval("#menu-btn", (button) =>
      button.getAttribute("aria-expanded"),
    ),
    "false",
  );
  assert.equal(
    await mobile.evaluate(() => document.activeElement.id),
    "menu-btn",
  );
  await mobile.click("#menu-btn");
  await mobile.click('#navigation a[href="#projects"]');
  assert.equal(new URL(mobile.url()).hash, "#projects");
  assert.equal(
    await mobile.$eval("#menu-btn", (button) =>
      button.getAttribute("aria-expanded"),
    ),
    "false",
  );
  await mobile.goto(base + "/#capabilities", { waitUntil: "networkidle0" });
  assert.equal(
    await mobile.$eval("#capabilities", (details) => details.open),
    true,
  );
  await mobile.click("#capabilities summary");
  assert.equal(
    await mobile.$eval("#capabilities", (details) => details.open),
    false,
  );
  await mobile.focus("#capabilities summary");
  await mobile.keyboard.press("Enter");
  assert.equal(
    await mobile.$eval("#capabilities", (details) => details.open),
    true,
  );
  await mobile.close();
  console.log(
    "PASS mobile navigation, Escape focus return, section links, and keyboard disclosures",
  );

  const reduced = await openPage(1440, 1000, { reduced: true });
  assert.equal(
    await reduced.$eval(
      "h1",
      (heading) => getComputedStyle(heading).animationName,
    ),
    "none",
  );
  await reduced.screenshot({ path: path.join(outDir, "reduced-motion.png") });
  await reduced.close();
  const noJS = await openPage(390, 844, { noJS: true });
  assert.equal(
    await noJS.$eval("h1", (heading) => getComputedStyle(heading).opacity),
    "1",
  );
  assert.notEqual(
    await noJS.$eval("#navigation", (nav) => getComputedStyle(nav).display),
    "none",
  );
  await noJS.click('#navigation a[href="#projects"]');
  assert.equal(new URL(noJS.url()).hash, "#projects");
  await noJS.close();
  console.log("PASS reduced motion and navigation without JavaScript");

  const zoomed = await openPage(768, 1024);
  await zoomed.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  assert.ok(
    await zoomed.evaluate(
      () => document.documentElement.scrollWidth - innerWidth <= 1,
    ),
    "200% text: horizontal overflow",
  );
  await zoomed.screenshot({
    path: path.join(outDir, "text-200.png"),
    fullPage: true,
  });
  await zoomed.close();
  console.log("PASS 200% text enlargement");
  assert.deepEqual(errors, [], "Browser errors or failed resources");
  console.log(
    `PASS browser errors and production CSP; screenshots in ${outDir}`,
  );
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
