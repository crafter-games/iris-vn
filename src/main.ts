import "./style.css";
import storyJson from "../story/main.ink";
import { playSfx, unlockAudio } from "./audio/sfx";
import { Script } from "./engine/script";
import { parseTags, type Tag } from "./engine/tags";
import { wait } from "./engine/wait";
import { Background } from "./stage/background";
import { Character } from "./stage/character";
import { Effects } from "./stage/effects";
import { Choices } from "./ui/choices";
import { Phone } from "./ui/phone";
import { TextBox } from "./ui/textbox";

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;

const stage = $("#stage");
const start = $("#start");
const titlecard = $("#titlecard");
const textbox = new TextBox($("#textbox"));
const choices = new Choices($("#choices"));
const phone = new Phone($("#phone"));
const background = new Background($(".bg"));
const iris = new Character($<HTMLImageElement>("#iris"));
const effects = new Effects($("#scene"), $("#flash"), $<HTMLCanvasElement>("#fx-glass"));

let resolveTitlecard: (() => void) | null = null;

function advance() {
  if (resolveTitlecard) {
    const resolve = resolveTitlecard;
    resolveTitlecard = null;
    return resolve();
  }
  if (choices.active || phone.asking) return;
  if (phone.open) phone.advance();
  else textbox.advance();
}

stage.addEventListener("click", advance);
window.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.repeat) return;
  if (choices.active) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") choices.move(1);
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") choices.move(-1);
    else if (event.key === "Enter" || event.key === " ") choices.confirm();
    else return;
  } else if (event.key === "Enter" || event.key === " ") {
    advance();
  } else return;
  event.preventDefault();
});

// Título a mitad de escena: aparece tras el "dodon" y espera un avance.
async function showTitlecard() {
  textbox.hide();
  titlecard.hidden = false;
  titlecard.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: "ease-out" });
  await wait(900);
  await new Promise<void>((resolve) => (resolveTitlecard = resolve));
  await titlecard.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).finished;
  titlecard.hidden = true;
}

type LineOptions = { instant: boolean; input: string | null };

// Aplica las etiquetas de presentación antes de mostrar la línea.
async function applyTags(tags: Tag[]): Promise<LineOptions> {
  const options: LineOptions = { instant: false, input: null };
  for (const { key, value } of tags) {
    switch (key) {
      case "bg":
        await background.show(value);
        break;
      case "iris":
        await iris.show(value);
        break;
      case "sfx":
        playSfx(value);
        if (value === "dodon") iris.punch();
        break;
      case "shake":
        effects.shake(Number(value) || 8);
        break;
      case "flash":
        effects.flash(value || "white");
        break;
      case "glass":
        playSfx("glass_shatter");
        effects.glass();
        break;
      case "phone":
        if (value === "open") {
          textbox.hide();
          phone.show();
        } else phone.hide();
        break;
      case "delete":
        phone.deleteLast();
        break;
      case "pause":
        textbox.hide();
        await wait(Number(value) || 800);
        break;
      case "titlecard":
        await showTitlecard();
        break;
      case "instant":
        options.instant = true;
        break;
      case "input":
        options.input = value;
        break;
      case "bgm":
      case "corruption":
      case "clue":
        // M3/M5: música por capas, nivel de corrupción y cuaderno de pistas.
        break;
      default:
        console.warn(`tag desconocido: #${key}:${value}`);
    }
  }
  return options;
}

async function run() {
  const script = new Script(storyJson);
  for (;;) {
    const step = script.next();
    if (step.kind === "line") {
      const options = await applyTags(parseTags(step.tags));
      const red = step.text.includes("[[r]]");
      if (red) {
        effects.flash("white");
        playSfx("red_truth");
      }

      if (phone.open) {
        const player = String(script.getVar("nombre"));
        const sender = step.speaker === "Iris" ? "them" : step.speaker === player ? "me" : "system";
        if (options.input) {
          await phone.say("system", step.text, { wait: false });
          const value = await phone.ask("Tu nombre");
          playSfx("ui_click");
          script.setVar(options.input, value);
        } else {
          await phone.say(sender, step.text, { instant: options.instant });
        }
      } else {
        await textbox.say(step.speaker, step.text, { instant: options.instant });
      }
    } else if (step.kind === "choices") {
      script.choose(await choices.pick(step.options));
      playSfx("ui_click");
    } else {
      textbox.hide();
      iris.hide();
      phone.hide();
      start.hidden = false;
      return;
    }
  }
}

start.addEventListener("click", (event) => {
  event.stopPropagation();
  unlockAudio();
  start.hidden = true;
  run();
});
