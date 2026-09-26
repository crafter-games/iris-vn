// Renderiza tools/og.html a public/og.jpg (1200×630) para Open Graph / Twitter.
// Uso: node tools/og.mjs
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(resolve("tools/og.html")).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
await page.screenshot({ path: "public/og.jpg", type: "jpeg", quality: 88 });
await browser.close();
console.log("public/og.jpg listo");
