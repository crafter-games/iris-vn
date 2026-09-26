const CHARS_PER_SECOND = 40; // (tune)

// Caja de texto con efecto máquina de escribir.
// Primer avance: completa la línea. Segundo avance: pasa a la siguiente.
export class TextBox {
  private root: HTMLElement;
  private nameEl: HTMLElement;
  private bodyEl: HTMLElement;
  private cursorEl: HTMLElement;
  private typing = false;
  private full = "";
  private resolveLine: (() => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.nameEl = root.querySelector(".textbox__name")!;
    this.bodyEl = root.querySelector(".textbox__body")!;
    this.cursorEl = root.querySelector(".textbox__cursor")!;
  }

  say(speaker: string | null, text: string): Promise<void> {
    this.root.hidden = false;
    this.nameEl.textContent = speaker ?? "";
    this.nameEl.hidden = !speaker;
    this.root.classList.toggle("textbox--narration", !speaker);
    this.full = text;
    this.bodyEl.textContent = "";
    this.cursorEl.hidden = true;
    this.typing = true;

    const start = performance.now();
    const tick = (now: number) => {
      if (!this.typing) return;
      const count = Math.floor(((now - start) / 1000) * CHARS_PER_SECOND);
      if (count >= this.full.length) return this.finishTyping();
      this.bodyEl.textContent = this.full.slice(0, count);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

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
    this.bodyEl.textContent = this.full;
    this.cursorEl.hidden = false;
  }
}
