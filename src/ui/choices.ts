// Menú de elecciones: clic/tap, o flechas + Enter.
export class Choices {
  private root: HTMLElement;
  private buttons: HTMLButtonElement[] = [];
  private focused = 0;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  get active() {
    return this.buttons.length > 0;
  }

  pick(options: { index: number; text: string }[]): Promise<number> {
    return new Promise((resolve) => {
      this.root.replaceChildren();
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
      this.focus(0);
    });
  }

  move(delta: number) {
    if (!this.active) return;
    this.focus((this.focused + delta + this.buttons.length) % this.buttons.length);
  }

  confirm() {
    this.buttons[this.focused]?.click();
  }

  private focus(i: number) {
    this.focused = i;
    this.buttons[i]?.focus({ preventScroll: true });
  }

  private close() {
    this.buttons = [];
    this.root.replaceChildren();
    this.root.hidden = true;
  }
}
