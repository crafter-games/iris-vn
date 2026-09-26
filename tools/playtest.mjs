// Playtest headless: recorre el guion con clics y guarda capturas en ./playtest/.
// Uso: pnpm build && pnpm preview (en otra terminal) && node tools/playtest.mjs [url]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173";
const viewports = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 844, height: 390 },
];
mkdirSync("playtest", { recursive: true });

const errors = [];
const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: vp });
  page.on("pageerror", (e) => errors.push(`[${vp.name}] ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`[${vp.name}] ${m.text()}`));
  await page.goto(url);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `playtest/${vp.name}-0-title.png` });

  await page.click("#title");
  await page.waitForTimeout(700);
  await page.screenshot({ path: `playtest/${vp.name}-1-typing.png` });

  let shots = 2;
  for (let i = 0; i < 40; i++) {
    if (await page.isVisible("#choices")) {
      await page.screenshot({ path: `playtest/${vp.name}-${shots++}-choices.png` });
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      continue;
    }
    if (await page.isVisible("#title")) break;
    await page.keyboard.press("Space"); // completa la línea
    const speaker = await page.textContent(".textbox__name");
    if (speaker === "Iris" && shots < 4) {
      await page.screenshot({ path: `playtest/${vp.name}-${shots++}-iris.png` });
    }
    await page.keyboard.press("Space"); // avanza
    await page.waitForTimeout(30);
  }
  const lastLine = await page.textContent(".textbox__body");
  console.log(`[${vp.name}] terminó en el título: ${await page.isVisible("#title")} · última línea: "${lastLine}"`);
  await page.close();
}
await browser.close();
console.log(errors.length ? `ERRORES:\n${errors.join("\n")}` : "Sin errores de consola.");
process.exit(errors.length ? 1 : 0);
