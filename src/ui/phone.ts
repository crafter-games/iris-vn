import { playSfx } from "../audio/sfx";
import { parseMarkup, renderSegments } from "../engine/markup";

export type Sender = "them" | "me" | "system";

const TYPING_MS_PER_CHAR = 28; // (tune)
const TYPING_MIN_MS = 700;
const TYPING_MAX_MS = 2200;

// Chat de celular a pantalla completa para el prólogo y los interludios.
// Cada burbuja espera un avance, igual que una línea de la caja de texto.
export class Phone {
  private root: HTMLElement;
  private log: HTMLElement;
  private status: HTMLElement;
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private resolveBubble: (() => void) | null = null;
  private skipTyping: (() => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.log = root.querySelector(".phone__log")!;
    this.status = root.querySelector(".phone__status")!;
    this.form = root.querySelector(".phone__form")!;
    this.input = root.querySelector(".phone__input")!;
    // Tocar el campo de texto no debe avanzar la historia.
    this.form.addEventListener("click", (event) => event.stopPropagation());
  }

  get open() {
    return !this.root.hidden;
  }

  show() {
    this.root.hidden = false;
    this.root.animate([{ opacity: 0, transform: "translateY(4%)" }, { opacity: 1, transform: "none" }], {
      duration: 320,
      easing: "cubic-bezier(.2,.8,.2,1)",
    });
  }

  hide() {
    this.root.hidden = true;
    this.log.replaceChildren();
  }

  async say(sender: Sender, text: string, { instant = false, wait = true } = {}) {
    if (sender === "them" && !instant) await this.typingIndicator(text.length);
    const bubble = document.createElement("div");
    bubble.className = `bubble bubble--${sender}`;
    renderSegments(bubble, parseMarkup(text));
    this.log.append(bubble);
    this.log.scrollTop = this.log.scrollHeight;
    if (sender === "them") playSfx("msg_received");
    if (sender === "me") playSfx("msg_sent");
    if (wait) await new Promise<void>((resolve) => (this.resolveBubble = resolve));
  }

  // Borra el último mensaje de ella: "Este mensaje fue eliminado".
  deleteLast() {
    const bubbles = this.log.querySelectorAll<HTMLElement>(".bubble--them");
    const last = bubbles[bubbles.length - 1];
    if (!last) return;
    playSfx("msg_deleted");
    last.animate([{ filter: "none" }, { filter: "blur(2px) hue-rotate(90deg)" }, { filter: "none" }], { duration: 240 });
    last.classList.add("bubble--deleted");
    last.textContent = "🚫 Este mensaje fue eliminado";
  }

  // Pide un texto (p. ej. el nombre del jugador). Devuelve el valor saneado.
  ask(placeholder: string, maxLength = 12): Promise<string> {
    this.form.hidden = false;
    this.input.value = "";
    this.input.placeholder = placeholder;
    this.input.maxLength = maxLength;
    this.input.focus();
    return new Promise((resolve) => {
      this.form.onsubmit = (event) => {
        event.preventDefault();
        const value = this.input.value.replace(/\s+/g, " ").trim();
        if (!value) {
          this.input.animate([{ transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "none" }], { duration: 160 });
          return;
        }
        this.form.hidden = true;
        this.input.blur();
        resolve(value);
      };
    });
  }

  // Devuelve true si consumió el avance.
  advance(): boolean {
    if (this.skipTyping) {
      this.skipTyping();
      return true;
    }
    if (!this.resolveBubble) return false;
    const resolve = this.resolveBubble;
    this.resolveBubble = null;
    resolve();
    return true;
  }

  get asking() {
    return !this.form.hidden;
  }

  private typingIndicator(length: number) {
    const ms = Math.min(TYPING_MAX_MS, Math.max(TYPING_MIN_MS, length * TYPING_MS_PER_CHAR));
    const dots = document.createElement("div");
    dots.className = "bubble bubble--them bubble--typing";
    dots.innerHTML = "<i></i><i></i><i></i>";
    this.log.append(dots);
    this.log.scrollTop = this.log.scrollHeight;
    this.status.textContent = "escribiendo…";
    return new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timer);
        this.skipTyping = null;
        dots.remove();
        this.status.textContent = "en línea";
        resolve();
      };
      const timer = setTimeout(done, ms);
      this.skipTyping = done;
    });
  }
}
