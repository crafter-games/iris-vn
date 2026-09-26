import { playSfx } from "../audio/sfx";
import { parseMarkup, renderSegments } from "../engine/markup";

export type Sender = "them" | "me" | "system";
export type BubbleData = { sender: Sender; text: string; deleted?: boolean };
export type PhoneState = { open: boolean; log: BubbleData[] };

const DELETED_TEXT = "🚫 Este mensaje fue eliminado";
const TYPING_MS_PER_CHAR = 28; // (tune)
const TYPING_MIN_MS = 700;
const TYPING_MAX_MS = 2200;

// Chat de celular a pantalla completa para el prólogo y los interludios.
// Cada burbuja espera un avance, igual que una línea de la caja de texto.
export class Phone {
  private root: HTMLElement;
  private logEl: HTMLElement;
  private status: HTMLElement;
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private resolveBubble: (() => void) | null = null;
  private skipTyping: (() => void) | null = null;
  private log: BubbleData[] = [];
  completedAt: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.logEl = root.querySelector(".phone__log")!;
    this.status = root.querySelector(".phone__status")!;
    this.form = root.querySelector(".phone__form")!;
    this.input = root.querySelector(".phone__input")!;
    // Tocar el campo de texto no debe avanzar la historia.
    this.form.addEventListener("click", (event) => event.stopPropagation());
  }

  get open() {
    return !this.root.hidden;
  }

  get asking() {
    return !this.form.hidden;
  }

  get waiting() {
    return this.resolveBubble !== null;
  }

  get state(): PhoneState {
    return { open: this.open, log: this.log.map((b) => ({ ...b })) };
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
    this.log = [];
    this.logEl.replaceChildren();
  }

  // Restaura el chat de una partida guardada, sin animaciones ni sonidos.
  restore(state: PhoneState) {
    this.reset();
    if (!state.open) return;
    this.root.hidden = false;
    state.log.forEach((b) => this.append(b));
  }

  reset() {
    this.skipTyping?.();
    this.resolveBubble = null;
    this.completedAt = null;
    this.form.hidden = true;
    this.form.onsubmit = null;
    this.hide();
  }

  async say(sender: Sender, text: string, { instant = false, wait = true } = {}) {
    this.completedAt = null;
    if (sender === "them" && !instant) await this.typingIndicator(text.length);
    this.append({ sender, text });
    if (sender === "them") playSfx("msg_received");
    if (sender === "me") playSfx("msg_sent");
    this.completedAt = performance.now();
    if (wait) await new Promise<void>((resolve) => (this.resolveBubble = resolve));
  }

  // Borra el último mensaje de ella: "Este mensaje fue eliminado".
  deleteLast() {
    const index = this.log.findLastIndex((b) => b.sender === "them" && !b.deleted);
    if (index < 0) return;
    this.log[index].deleted = true;
    const el = this.logEl.children[index] as HTMLElement;
    playSfx("msg_deleted");
    el.animate([{ filter: "none" }, { filter: "blur(2px) hue-rotate(90deg)" }, { filter: "none" }], { duration: 240 });
    el.classList.add("bubble--deleted");
    el.textContent = DELETED_TEXT;
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
          this.input.animate([{ transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "none" }], {
            duration: 160,
          });
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

  private append(bubble: BubbleData) {
    this.log.push({ ...bubble });
    const el = document.createElement("div");
    el.className = `bubble bubble--${bubble.sender}${bubble.deleted ? " bubble--deleted" : ""}`;
    if (bubble.deleted) el.textContent = DELETED_TEXT;
    else renderSegments(el, parseMarkup(bubble.text));
    this.logEl.append(el);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private typingIndicator(length: number) {
    const ms = Math.min(TYPING_MAX_MS, Math.max(TYPING_MIN_MS, length * TYPING_MS_PER_CHAR));
    const dots = document.createElement("div");
    dots.className = "bubble bubble--them bubble--typing";
    dots.innerHTML = "<i></i><i></i><i></i>";
    this.logEl.append(dots);
    this.logEl.scrollTop = this.logEl.scrollHeight;
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
