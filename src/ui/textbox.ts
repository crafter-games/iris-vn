import { parseMarkup, plainLength, renderSegments, type Segment } from "../engine/markup";
import { settings } from "../engine/settings";

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
  // Momento en que la línea terminó de escribirse (para el modo auto); null mientras escribe.
  completedAt: number | null = null;
  length = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.nameEl = root.querySelector(".textbox__name")!;
    this.bodyEl = root.querySelector(".textbox__body")!;
    this.cursorEl = root.querySelector(".textbox__cursor")!;
  }

  // `instant`: la línea aparece de golpe (Iris respondiendo "demasiado rápido").
  // `blip`: sonido de voz, se llama cada dos letras visibles mientras se escribe.
  say(speaker: string | null, text: string, { instant = false, blip = () => {} } = {}): Promise<void> {
    this.root.hidden = false;
    this.nameEl.textContent = speaker ?? "";
    this.nameEl.hidden = !speaker;
    this.root.classList.toggle("textbox--narration", !speaker);
    this.segments = parseMarkup(text);
    this.cursorEl.hidden = true;
    this.typing = true;
    this.completedAt = null;

    const total = plainLength(this.segments);
    this.length = total;
    if (instant || settings.textSpeed <= 0) {
      this.finishTyping();
    } else {
      renderSegments(this.bodyEl, this.segments, 0);
      const plain = this.segments.map((s) => s.text).join("");
      let shown = 0;
      const start = performance.now();
      const tick = (now: number) => {
        if (!this.typing) return;
        const count = Math.floor(((now - start) / 1000) * settings.textSpeed);
        if (count >= total) return this.finishTyping();
        for (; shown < count; shown++) if (shown % 2 === 0 && /[\p{L}\p{N}]/u.test(plain[shown])) blip();
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

  get waiting() {
    return this.resolveLine !== null;
  }

  hide() {
    this.root.hidden = true;
  }

  // Abandona la línea en curso (al cargar una partida).
  reset() {
    this.typing = false;
    this.resolveLine = null;
    this.completedAt = null;
    this.hide();
  }

  private finishTyping() {
    this.typing = false;
    this.completedAt = performance.now();
    renderSegments(this.bodyEl, this.segments);
    this.cursorEl.hidden = false;
  }
}
