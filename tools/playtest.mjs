// Playtest headless: recorre el guion y prueba los sistemas de VN. Capturas en ./playtest/.
// Uso: pnpm build && pnpm preview (en otra terminal) && pnpm playtest [url]
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:4173";
mkdirSync("playtest", { recursive: true });

const errors = [];
const failures = [];
const check = (ok, label) => {
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) failures.push(label);
};

const browser = await chromium.launch();

async function openPage(vp) {
  const context = await browser.newContext({ viewport: vp });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(`[${vp.name}] ${e.message}`));
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(`[${vp.name}] ${m.type()}: ${m.text()}`));
  await page.goto(url);
  await page.waitForTimeout(400);
  return { context, page };
}

const startButton = (page, label) => page.locator(".start__btn", { hasText: label });

// Avanza un paso de la historia. Devuelve lo que había en pantalla.
async function step(page, vp) {
  await page.waitForTimeout(100);
  if (await page.isVisible(".start__actions")) return "start";
  if (await page.isVisible(".phone__form")) {
    await page.fill(".phone__input", "Nacho");
    await page.press(".phone__input", "Enter");
    return "input";
  }
  if (await page.isVisible("#titlecard")) {
    await page.waitForTimeout(1000);
    await page.mouse.click(vp.width / 2, vp.height / 2);
    return "titlecard";
  }
  if (await page.isVisible("#choices")) {
    await page.waitForTimeout(350);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    return "choices";
  }
  if (await page.isVisible(".bubble--typing")) {
    await page.mouse.click(vp.width / 2, vp.height / 2);
    return "typing";
  }
  await page.keyboard.press("Space"); // completa la línea
  await page.waitForTimeout(40);
  if (await page.isVisible("#choices")) return "line";
  await page.keyboard.press("Space"); // avanza
  return "line";
}

// 1) Recorrido completo en escritorio y móvil.
for (const vp of [
  { name: "desktop", width: 1280, height: 720 },
  { name: "mobile", width: 844, height: 390 },
]) {
  const { context, page } = await openPage(vp);
  await page.screenshot({ path: `playtest/${vp.name}-00-start.png` });
  await startButton(page, "Nueva partida").click();
  let finished = false;
  let shots = 1;
  for (let i = 0; i < 150 && !finished; i++) {
    const what = await step(page, vp);
    finished = what === "start";
    if (what === "line" && i % (vp.name === "desktop" ? 3 : 8) === 0) {
      await page.screenshot({ path: `playtest/${vp.name}-${String(shots++).padStart(2, "0")}.png` });
    }
  }
  check(finished, `[${vp.name}] recorrido completo hasta el final`);
  await context.close();
}

// 2) Sistemas: autoguardado, historial, cuaderno, guardar/cargar, skip, ajustes.
{
  const vp = { name: "systems", width: 1280, height: 720 };
  const { context, page } = await openPage(vp);
  await startButton(page, "Nueva partida").click();

  // Llega a la primera elección (autoguardado) y la toma.
  for (let i = 0; i < 40 && (await step(page, vp)) !== "choices"; i++);
  const auto = await page.evaluate(() => localStorage.getItem("iris.save.auto"));
  check(auto !== null, "autoguardado al llegar a una elección");

  for (let i = 0; i < 6; i++) await step(page, vp);
  await page.waitForTimeout(3000); // deja pasar el toast de la pista

  await page.keyboard.press("n");
  await page.waitForTimeout(250);
  await page.screenshot({ path: "playtest/systems-notebook.png" });
  const found = await page.locator(".clue:not(.clue--missing)").count();
  check(found >= 2, `cuaderno con pistas encontradas (${found})`);
  await page.keyboard.press("Escape");

  // Ya fuera del celular: historial.
  for (let i = 0; i < 30 && !(await page.isVisible("#textbox")); i++) await step(page, vp);
  await step(page, vp);
  await page.keyboard.press("l");
  await page.waitForTimeout(250);
  await page.screenshot({ path: "playtest/systems-backlog.png" });
  const entries = await page.locator(".backlog__item").count();
  check(entries > 5, `historial con entradas (${entries})`);
  await page.keyboard.press("Escape");

  // Guardar en la ranura 1 desde la barra rápida.
  await page.click("#btn-save");
  await page.waitForTimeout(200);
  await page.locator(".slot").first().click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: "playtest/systems-save.png" });
  await page.keyboard.press("Escape");
  const savedLine = await page.evaluate(() => JSON.parse(localStorage.getItem("iris.save.1") ?? "{}").excerpt);

  for (let i = 0; i < 4; i++) await step(page, vp);

  // Recargar la página y cargar desde el inicio.
  await page.reload();
  await page.waitForTimeout(400);
  check(await startButton(page, "Continuar").isVisible(), "inicio ofrece Continuar tras guardar");
  await startButton(page, "Cargar").click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: "playtest/systems-load.png" });
  await page.locator(".slot", { hasText: "Ranura 1" }).click();
  await page.waitForTimeout(600);
  await page.keyboard.press("Space"); // completa la línea restaurada
  const loadedLine = await page.textContent(".textbox__body");
  check(loadedLine === savedLine, `cargar vuelve a la misma línea ("${loadedLine?.slice(0, 40)}…" vs guardada "${savedLine?.slice(0, 40)}…")`);

  // Quick save / quick load.
  await page.keyboard.press("F5");
  const quickLine = await page.textContent(".textbox__body");
  for (let i = 0; i < 3; i++) await step(page, vp);
  await page.keyboard.press("F9");
  await page.waitForTimeout(600);
  await page.keyboard.press("Space");
  check((await page.textContent(".textbox__body")) === quickLine, "F5/F9 guardado y carga rápida");

  // Skip: una partida nueva salta el texto ya leído y se detiene en el nombre.
  await page.keyboard.press("Escape");
  await page.locator(".menu__item", { hasText: "Volver al título" }).click();
  await startButton(page, "Nueva partida").click();
  await page.waitForTimeout(300);
  await page.click("#btn-menu-corner");
  await page.keyboard.press("Escape");
  const t0 = Date.now();
  await page.keyboard.down("Control");
  await page.waitForSelector(".phone__form:not([hidden])", { timeout: 8000 }).catch(() => {});
  await page.keyboard.up("Control");
  check(await page.isVisible(".phone__form"), `skip (Ctrl) llega a la entrada de nombre en ${Date.now() - t0} ms`);

  // Ajustes.
  await page.fill(".phone__input", "Nacho");
  await page.press(".phone__input", "Enter");
  await page.keyboard.press("Escape");
  await page.locator(".menu__item", { hasText: "Ajustes" }).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: "playtest/systems-settings.png" });
  check(await page.isVisible(".settings"), "panel de ajustes");
  await context.close();
}

await browser.close();
if (errors.length) console.log(`ERRORES DE CONSOLA:\n${errors.join("\n")}`);
else console.log("Sin errores ni warnings de consola.");
process.exit(errors.length || failures.length ? 1 : 0);
