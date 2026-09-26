// Juega una ruta en el navegador eligiendo opciones por texto y captura momentos clave.
// Uso: node tools/route-shots.mjs [url]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173";
mkdirSync("playtest/route", { recursive: true });

const PREFS = [
  "Preguntar cómo lo sabe", "cómo supo", "qué hacen", "cómo lo sabía", "qué le pasó", "celular volteado",
  "desbloqueó", "silla vacía", "zoom", "No responder", "quién es V", "nombre del proyecto",
  "cajón", "monitor", "qué le contesta", "audífono", "de cerca", "Tengo preguntas", "Decirle que se vaya",
];
const CORRECT = [["El grupo de WhatsApp", "La foto de noche"], ["Un badge", "Commit de las"], ["Medio segundo", "El reflejo"]];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(url);
await page.waitForTimeout(300);
await page.locator(".start__btn", { hasText: "Nueva partida" }).click();

let claim = 0;
let shot = 0;
const snap = async (label) => page.screenshot({ path: `playtest/route/${String(shot++).padStart(2, "0")}-${label}.png` });
const seen = new Set();

for (let i = 0; i < 1200; i++) {
  await page.waitForTimeout(60);
  if (await page.isVisible(".start__actions")) break;
  if (await page.isVisible(".phone__form")) {
    await page.fill(".phone__input", "Nacho");
    await page.press(".phone__input", "Enter");
    continue;
  }
  if (await page.isVisible("#titlecard")) {
    await page.waitForTimeout(1000);
    await page.mouse.click(640, 360);
    continue;
  }
  if (await page.isVisible("#choices")) {
    await page.waitForTimeout(450);
    const texts = await page.locator(".choice").allTextContents();
    const isClaim = texts.some((t) => t.includes("No tengo nada"));
    const prefs = isClaim ? CORRECT[claim++] : PREFS;
    if (isClaim || texts.length > 2) await snap(`choices-${texts.length}`);
    const index = Math.max(0, texts.findIndex((t) => prefs.some((p) => t.includes(p))));
    await page.locator(".choice").nth(index).click();
    continue;
  }
  await page.keyboard.press("Space");
  await page.waitForTimeout(40);
  // Captura la primera línea de cada fondo nuevo, y las verdades rojas.
  const bg = await page.evaluate(() => [...document.querySelectorAll(".bg__layer")].find((l) => l.style.opacity === "1")?.style.backgroundImage ?? "");
  const red = await page.isVisible(".red-truth");
  const other = await page.isVisible(".bubble--other");
  const key = red ? `red-${i}` : other ? "other" : bg;
  if (!seen.has(key)) {
    seen.add(key);
    await page.waitForTimeout(250);
    await snap(red ? "red" : other ? "phone-other" : "scene");
  }
  if (await page.isVisible("#choices")) continue;
  await page.keyboard.press("Space");
}
console.log(`capturas: ${shot} · errores: ${errors.length ? errors.join(" | ") : "ninguno"}`);
await browser.close();
