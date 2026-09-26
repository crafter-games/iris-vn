// Menú de elecciones: clic/tap, o flechas + Enter.
// El teclado no confirma durante los primeros ms: evita elegir sin querer al pasar texto rápido.
const KEY_GUARD_MS = 400; // (tune)

export class Choices {
  private root: HTMLElement;
  private buttons: HTMLButtonElement[] = [];
  private focused = 0;
  private shownAt = 0;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  get active() {
    return this.buttons.length > 0;
  }

  // `phone`: las opciones se muestran como respuestas rápidas dentro del celular.
  pick(options: { index: number; text: string }[], { phone = false } = {}): Promise<number> {
    return new Promise((resolve) => {
      this.root.replaceChildren();
      this.root.classList.toggle("choices--phone", phone);
      this.buttons = options.map((option, i) => {
        const button = document.createElement("button");
        button.className = "choice";
        button.textContent = option.text;
        button.style.animationDelay = `${i * 60}ms`;
        button.addEventListener("pointerenter", () => this.focus(i));
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          this.close();
          resolve(option.index);
        });
        return button;
      });
      this.root.append(...this.buttons);
      this.root.hidden = false;
      this.shownAt = performance.now();
      this.focus(0);
    });
  }

  move(delta: number) {
    if (!this.active) return;
    this.focus((this.focused + delta + this.buttons.length) % this.buttons.length);
  }

  confirm() {
    if (performance.now() - this.shownAt < KEY_GUARD_MS) return;
    this.buttons[this.focused]?.click();
  }

  private focus(i: number) {
    this.focused = i;
    this.buttons[i]?.focus({ preventScroll: true });
  }

  cancel() {
    this.close();
  }

  private close() {
    this.buttons = [];
    this.root.replaceChildren();
    this.root.hidden = true;
  }
}
