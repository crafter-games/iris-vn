import { playSfx } from "../audio/sfx";
import { parseMarkup, renderSegments } from "../engine/markup";
import { icon, type IconName } from "./icons";

// "other": alguien que no es el contacto del chat (p. ej. alguien en un grupo); la burbuja lleva su nombre.
export type Sender = "them" | "me" | "other" | "system";
export type BubbleData = { sender: Sender; text: string; name?: string; deleted?: boolean };
export type PhoneState = { open: boolean; chat?: string; logs?: Record<string, BubbleData[]>; log?: BubbleData[] };

type ChatInfo = {
  title: string;
  status: string;
  speaker: string; // quién es "them" en esta conversación, según el nombre del guion
  avatar: { letter: string } | { icon: IconName };
};

// Conversaciones del celular. Se cambia con el tag # chat:<id>.
export const CHATS: Record<string, ChatInfo> = {
  iris: { title: "Iris", status: "en línea", speaker: "Iris", avatar: { letter: "I" } },
  crafter: { title: "Crafter Station", status: "1.024 miembros", speaker: "", avatar: { icon: "users" } },
  desconocido: { title: "+51 9•• ••• 333", status: "número desconocido", speaker: "Número desconocido", avatar: { icon: "question" } },
  borrado: { title: "Cuenta eliminada", status: "", speaker: "", avatar: { icon: "user-minus" } },
};

const DEFAULT_CHAT = "iris";
const DELETED_TEXT = "Este mensaje fue eliminado";
const TYPING_MS_PER_CHAR = 28; // (tune)
const TYPING_MIN_MS = 700;
const TYPING_MAX_MS = 2200;

// Celular a pantalla completa para el prólogo y los interludios.
// Cada burbuja (o pensamiento) espera un avance, igual que una línea de la caja de texto.
export class Phone {
  private root: HTMLElement;
  private device: HTMLElement;
  private logEl: HTMLElement;
  private title: HTMLElement;
  private status: HTMLElement;
  private avatar: HTMLElement;
  private thought: HTMLElement;
  private form: HTMLFormElement;
  private input: HTMLInputElement;
  private resolveBubble: (() => void) | null = null;
  private skipTyping: (() => void) | null = null;
  private logs: Record<string, BubbleData[]> = {};
  chat = DEFAULT_CHAT;
  completedAt: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.device = root.querySelector(".phone__device")!;
    this.logEl = root.querySelector(".phone__log")!;
    this.title = root.querySelector(".phone__contact")!;
    this.status = root.querySelector(".phone__status")!;
    this.avatar = root.querySelector(".phone__avatar")!;
    this.thought = root.querySelector(".phone__thought")!;
    this.form = root.querySelector(".phone__form")!;
    this.input = root.querySelector(".phone__input")!;
    // Tocar el campo de texto no debe avanzar la historia.
    this.form.addEventListener("click", (event) => event.stopPropagation());
    this.renderHeader();
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

  // El remitente de una línea según la conversación abierta.
  senderFor(speaker: string | null, player: string): Sender {
    if (!speaker) return "system";
    if (speaker === player) return "me";
    return speaker === CHATS[this.chat]?.speaker ? "them" : "other";
  }

  get state(): PhoneState {
    const logs = Object.fromEntries(Object.entries(this.logs).map(([id, log]) => [id, log.map((b) => ({ ...b }))]));
    return { open: this.open, chat: this.chat, logs };
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
    this.logs = {};
    this.chat = DEFAULT_CHAT;
    this.logEl.replaceChildren();
    this.clearThought();
    this.renderHeader();
  }

  // Cambia de conversación: cada chat conserva su propio historial.
  switchChat(id: string) {
    if (!CHATS[id]) return console.warn(`chat desconocido: ${id}`);
    if (id === this.chat) return;
    this.chat = id;
    this.renderHeader();
    this.renderLog();
    if (this.open) {
      this.device.animate([{ transform: "translateX(6%)", opacity: 0.4 }, { transform: "none", opacity: 1 }], {
        duration: 260,
        easing: "cubic-bezier(.2,.8,.2,1)",
      });
      playSfx("whoosh");
    }
  }

  // Restaura el celular de una partida guardada, sin animaciones ni sonidos.
  restore(state: PhoneState) {
    this.reset();
    if (!state.open) return;
    this.logs = state.logs ?? { [DEFAULT_CHAT]: state.log ?? [] };
    this.chat = state.chat && CHATS[state.chat] ? state.chat : DEFAULT_CHAT;
    this.root.hidden = false;
    this.renderHeader();
    this.renderLog();
  }

  reset() {
    this.skipTyping?.();
    this.resolveBubble = null;
    this.completedAt = null;
    this.form.hidden = true;
    this.form.onsubmit = null;
    this.hide();
  }

  async say(sender: Sender, text: string, { instant = false, wait = true, name = "" } = {}) {
    this.completedAt = null;
    this.thought.classList.add("phone__thought--dim");
    if ((sender === "them" || sender === "other") && !instant) await this.typingIndicator(text.length);
    this.append({ sender, text, name: sender === "other" ? name : undefined });
    if (sender === "them" || sender === "other") playSfx("msg_received");
    if (sender === "me") playSfx("msg_sent");
    this.completedAt = performance.now();
    if (wait) await this.waitAdvance();
  }

  // Narración con el celular abierto: un pensamiento fuera del teléfono, no una burbuja.
  async think(text: string) {
    this.completedAt = null;
    this.thought.classList.remove("phone__thought--dim");
    renderSegments(this.thought, parseMarkup(text));
    this.thought.animate([{ opacity: 0, transform: "translateY(1cqh)" }, { opacity: 1, transform: "none" }], { duration: 260 });
    this.completedAt = performance.now();
    await this.waitAdvance();
  }

  // Borra el último mensaje recibido en el chat abierto: "Este mensaje fue eliminado".
  deleteLast() {
    const log = this.currentLog();
    const index = log.findLastIndex((b) => (b.sender === "them" || b.sender === "other") && !b.deleted);
    if (index < 0) return;
    log[index].deleted = true;
    const el = this.logEl.children[index] as HTMLElement;
    playSfx("msg_deleted");
    el.animate([{ filter: "none" }, { filter: "blur(2px) hue-rotate(90deg)" }, { filter: "none" }], { duration: 240 });
    el.replaceWith(this.bubbleEl(log[index]));
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
        const value = this.input.value.replace(/[:[\]{}#<>|~]/g, "").replace(/\s+/g, " ").trim();
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

  private waitAdvance() {
    return new Promise<void>((resolve) => (this.resolveBubble = resolve));
  }

  private clearThought() {
    this.thought.replaceChildren();
  }

  private currentLog() {
    return (this.logs[this.chat] ??= []);
  }

  private renderHeader() {
    const info = CHATS[this.chat];
    this.title.textContent = info.title;
    this.status.textContent = info.status;
    this.avatar.replaceChildren("letter" in info.avatar ? info.avatar.letter : icon(info.avatar.icon));
    this.avatar.classList.toggle("phone__avatar--icon", !("letter" in info.avatar));
  }

  private renderLog() {
    this.logEl.replaceChildren(...this.currentLog().map((b) => this.bubbleEl(b)));
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private append(bubble: BubbleData) {
    this.currentLog().push({ ...bubble });
    this.logEl.append(this.bubbleEl(bubble));
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private bubbleEl(bubble: BubbleData) {
    const el = document.createElement("div");
    el.className = `bubble bubble--${bubble.sender}${bubble.deleted ? " bubble--deleted" : ""}`;
    if (bubble.deleted) {
      el.append(icon("prohibit"), DELETED_TEXT);
      return el;
    }
    if (bubble.sender === "other" && bubble.name) {
      const name = document.createElement("span");
      name.className = "bubble__name";
      name.textContent = bubble.name;
      el.append(name);
    }
    const text = document.createElement("span");
    renderSegments(text, parseMarkup(bubble.text));
    el.append(text);
    return el;
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
        this.status.textContent = CHATS[this.chat].status;
        resolve();
      };
      const timer = setTimeout(done, ms);
      this.skipTyping = done;
    });
  }
}
