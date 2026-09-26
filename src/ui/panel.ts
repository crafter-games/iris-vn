// Panel superpuesto (historial, guardar, ajustes…). Bloquea el avance mientras está abierto.
export class Panel {
  static stack: Panel[] = [];

  readonly root: HTMLElement;
  readonly body: HTMLElement;
  private titleEl: HTMLElement;
  onClose: (() => void) | null = null;

  constructor(host: HTMLElement, className: string, title = "") {
    this.root = document.createElement("section");
    this.root.className = `panel ${className}`;
    this.root.hidden = true;
    this.root.innerHTML = `
      <div class="panel__card" role="dialog" aria-modal="true">
        <header class="panel__header">
          <h2 class="panel__title"></h2>
          <button class="panel__close" aria-label="Cerrar">✕</button>
        </header>
        <div class="panel__body"></div>
      </div>`;
    this.titleEl = this.root.querySelector(".panel__title")!;
    this.titleEl.textContent = title;
    this.body = this.root.querySelector(".panel__body")!;
    this.root.querySelector(".panel__close")!.addEventListener("click", () => this.close());
    // Clic fuera de la tarjeta cierra; ningún clic dentro llega al escenario.
    this.root.addEventListener("click", (event) => {
      event.stopPropagation();
      if (event.target === this.root) this.close();
    });
    this.root.addEventListener("wheel", (event) => event.stopPropagation());
    host.append(this.root);
  }

  static get anyOpen() {
    return Panel.stack.length > 0;
  }

  static closeTop() {
    Panel.stack[Panel.stack.length - 1]?.close();
  }

  get isOpen() {
    return !this.root.hidden;
  }

  set title(value: string) {
    this.titleEl.textContent = value;
  }

  open() {
    if (this.isOpen) return;
    this.root.hidden = false;
    Panel.stack.push(this);
    this.root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
  }

  close() {
    if (!this.isOpen) return;
    this.root.hidden = true;
    Panel.stack = Panel.stack.filter((p) => p !== this);
    this.onClose?.();
  }
}

export function button(label: string, onClick: () => void, className = "btn") {
  const el = document.createElement("button");
  el.className = className;
  el.textContent = label;
  el.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  return el;
}
