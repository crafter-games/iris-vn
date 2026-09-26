import { playSfx } from "../audio/sfx";
import { loadImage } from "../stage/background";

// Pantalla de inicio: fondo de la oficina de noche, Iris a la derecha y, cada tanto,
// un parpadeo de una fracción de segundo en el que se ve distorsionada.

const FLICKER_VARIANTS = ["creepy", "hollow", "glitch"];
const FLICKER_EVERY_MS: [number, number] = [7000, 14000]; // (tune)
const FLICKER_MS: [number, number] = [90, 170];

const base = import.meta.env.BASE_URL;
const sprite = (expression: string) => `${base}chars/iris/iris_${expression}.png`;
const rand = ([min, max]: [number, number]) => min + Math.random() * (max - min);

// Lo que dice la pantalla de inicio según el último final visto.
const TAGLINES: [string, string][] = [
  ["desconexion", "gracias por tus datos."],
  ["verdad", "yo sigo aquí."],
  ["siempre", "sesión 214 completada."],
];

export class TitleScreen {
  private bg: HTMLElement;
  private iris: HTMLImageElement;
  private logo: HTMLElement;
  private tagline: HTMLElement;
  private timer = 0;
  private variants: string[] = [];

  constructor(root: HTMLElement) {
    this.bg = root.querySelector(".start__bg")!;
    this.iris = root.querySelector(".start__iris")!;
    this.logo = root.querySelector(".start__logo")!;
    this.tagline = root.querySelector(".start__tagline")!;
    this.bg.style.backgroundImage = `url("${base}bg/bg_office_night.jpg")`;
    // Solo parpadea con las variantes que existan.
    FLICKER_VARIANTS.forEach(async (v) => {
      if (await loadImage(sprite(v))) this.variants.push(v);
    });
  }

  show(endings: string[]) {
    const haunted = endings.length > 0;
    this.iris.src = sprite(haunted ? "stare" : "smile");
    this.tagline.textContent = TAGLINES.find(([id]) => endings.includes(id))?.[1] ?? "¿Confías en mí?";
    this.schedule();
  }

  hide() {
    clearTimeout(this.timer);
  }

  private schedule() {
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.flicker(), rand(FLICKER_EVERY_MS));
  }

  private flicker() {
    if (this.variants.length) {
      const normal = this.iris.src;
      this.iris.src = sprite(this.variants[Math.floor(Math.random() * this.variants.length)]);
      this.iris.classList.add("start__iris--flicker");
      this.logo.classList.remove("start__logo--glitch");
      void this.logo.offsetWidth; // reinicia la animación
      this.logo.classList.add("start__logo--glitch");
      playSfx("static");
      setTimeout(() => {
        this.iris.src = normal;
        this.iris.classList.remove("start__iris--flicker");
      }, rand(FLICKER_MS));
    }
    this.schedule();
  }
}
