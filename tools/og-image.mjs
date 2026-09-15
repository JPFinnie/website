/* Regenerate the existing 1200 × 630 social preview. Usage: npm run og. */
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontURL = (name) =>
  pathToFileURL(path.join(root, "assets", "fonts", name)).href;
const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><style>
@font-face{font-family:Space;src:url('${fontURL("SpaceGrotesk.woff2")}');font-weight:300 700}
@font-face{font-family:Inter;src:url('${fontURL("Inter.woff2")}');font-weight:100 900}
*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:#f5f5f5;color:#1b1e1d;padding:48px 65px;font-family:Inter,Arial,sans-serif}
header{display:flex;align-items:center;gap:24px;border-bottom:1px solid #d8dad7;padding-bottom:27px;font-size:18px}.mark{font-family:Space,sans-serif;font-size:52px;letter-spacing:-6px;font-weight:700;line-height:1}.mark span{color:#dc431c}.city{margin-left:auto;color:#5e625f;font-size:16px}
h1{font-family:Space,Arial,sans-serif;font-weight:500;font-size:94px;line-height:1.08;letter-spacing:-6.8px;margin-top:55px}em{font-family:Georgia,serif;font-weight:400;color:#dc431c;letter-spacing:-6px}
footer{display:flex;justify-content:space-between;align-items:end;margin-top:49px;color:#5e625f;font-size:17px}footer span:last-child{color:#1b1e1d}
</style></head><body><header><span class="mark">jf<span>.</span></span><span>James Finnie<br>Senior Product Manager</span><span class="city">Toronto, Canada</span></header><h1>Product judgement.<br>Builder’s <em>instinct.</em></h1><footer><span>AI · Investing · Connected systems</span><span>james-finnie.com ↗</span></footer></body></html>`;
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-og-"));
const file = path.join(tempDir, "og.html");
fs.writeFileSync(file, html);
let browser;
try {
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    pipe: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      ...JSON.parse(process.env.CHROME_ARGS || "[]"),
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, "assets", "og.png") });
  console.log("Updated assets/og.png (1200 × 630).");
} finally {
  if (browser) await browser.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
}
