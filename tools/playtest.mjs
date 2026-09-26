// Playtest headless: recorre el guion con clics/teclas y guarda capturas en ./playtest/.
// Uso: pnpm build && pnpm preview (en otra terminal) && pnpm playtest [url]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173";
const viewports = [
  { name: "desktop", width: 1280, height: 720, every: 1 },
  { name: "mobile", width: 844, height: 390, every: 5 },
];
mkdirSync("playtest", { recursive: true });

const errors = [];
const browser = await chromium.launch();
for (const vp of viewports) {
  const page = await browser.newPage({ viewport: vp });
  page.on("pageerror", (e) => errors.push(`[${vp.name}] ${e.message}`));
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(`[${vp.name}] ${m.type()}: ${m.text()}`));
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `playtest/${vp.name}-00-start.png` });
  await page.click("#start");

  let n = 1;
  const shot = async (label) => {
    if (n % vp.every === 0 || label !== "line") {
      await page.screenshot({ path: `playtest/${vp.name}-${String(n).padStart(2, "0")}-${label}.png` });
    }
    n++;
  };

  let finished = false;
  for (let i = 0; i < 120 && !finished; i++) {
    await page.waitForTimeout(120);
    if (await page.isVisible("#start")) {
      finished = true;
    } else if (await page.isVisible(".phone__form")) {
      await page.fill(".phone__input", "Nacho");
      await shot("name-input");
      await page.press(".phone__input", "Enter");
    } else if (await page.isVisible("#titlecard")) {
      await page.waitForTimeout(1000);
      await shot("titlecard");
      await page.mouse.click(vp.width / 2, vp.height / 2);
    } else if (await page.isVisible("#choices")) {
      await page.waitForTimeout(400);
      await shot("choices");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
    } else if (await page.isVisible(".bubble--typing")) {
      await page.mouse.click(vp.width / 2, vp.height / 2); // salta el "escribiendo…"
    } else {
      await page.keyboard.press("Space"); // completa la línea (o nada si ya está completa)
      await page.waitForTimeout(60);
      await shot((await page.isVisible("#phone")) ? "phone" : "line");
      await page.keyboard.press("Space"); // avanza
    }
  }
  const last = await page.textContent(".textbox__body");
  console.log(`[${vp.name}] terminó: ${finished} · capturas: ${n - 1} · última línea: "${last}"`);
  await page.close();
}
await browser.close();
console.log(errors.length ? `ERRORES:\n${errors.join("\n")}` : "Sin errores ni warnings de consola.");
process.exit(errors.length ? 1 : 0);
