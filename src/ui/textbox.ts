import { parseMarkup, plainLength, renderSegments, type Segment } from "../engine/markup";

const CHARS_PER_SECOND = 40; // (tune)

// Caja de texto con efecto máquina de escribir.
// Primer avance: completa la línea. Segundo avance: pasa a la siguiente.
export class TextBox {
  private root: HTMLElement;
  private nameEl: HTMLElement;
  private bodyEl: HTMLElement;
  private cursorEl: HTMLElement;
  private typing = false;
  private segments: Segment[] = [];
  private resolveLine: (() => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.nameEl = root.querySelector(".textbox__name")!;
    this.bodyEl = root.querySelector(".textbox__body")!;
    this.cursorEl = root.querySelector(".textbox__cursor")!;
  }

  // `instant`: la línea aparece de golpe (Iris respondiendo "demasiado rápido").
  say(speaker: string | null, text: string, { instant = false } = {}): Promise<void> {
    this.root.hidden = false;
    this.nameEl.textContent = speaker ?? "";
    this.nameEl.hidden = !speaker;
    this.root.classList.toggle("textbox--narration", !speaker);
    this.segments = parseMarkup(text);
    this.cursorEl.hidden = true;
    this.typing = true;

    const total = plainLength(this.segments);
    if (instant) {
      this.finishTyping();
    } else {
      renderSegments(this.bodyEl, this.segments, 0);
      const start = performance.now();
      const tick = (now: number) => {
        if (!this.typing) return;
        const count = Math.floor(((now - start) / 1000) * CHARS_PER_SECOND);
        if (count >= total) return this.finishTyping();
        renderSegments(this.bodyEl, this.segments, count);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    return new Promise((resolve) => (this.resolveLine = resolve));
  }

  // Devuelve true si consumió el avance.
  advance(): boolean {
    if (!this.resolveLine) return false;
    if (this.typing) {
      this.finishTyping();
      return true;
    }
    const resolve = this.resolveLine;
    this.resolveLine = null;
    resolve();
    return true;
  }

  hide() {
    this.root.hidden = true;
  }

  private finishTyping() {
    this.typing = false;
    renderSegments(this.bodyEl, this.segments);
    this.cursorEl.hidden = false;
  }
}
