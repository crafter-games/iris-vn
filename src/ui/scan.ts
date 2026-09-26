import { playSfx } from "../audio/sfx";
import { wait } from "../engine/wait";

export type ScanRow = { label: string; value: string; alert?: boolean };

const ROW_MS = 420; // (tune) pausa entre filas

// Pantalla falsa de "Eco analizando tu perfil": filas que aparecen una a una.
export class Scan {
  private root: HTMLElement;
  private list: HTMLElement;
  private bar: HTMLElement;
  private title: HTMLElement;
  private resolve: (() => void) | null = null;
  private skip = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.list = root.querySelector(".scan__rows")!;
    this.bar = root.querySelector(".scan__bar i")!;
    this.title = root.querySelector(".scan__title")!;
  }

  get open() {
    return !this.root.hidden;
  }

  async run(title: string, rows: ScanRow[], { fast = false } = {}) {
    this.skip = fast;
    this.title.textContent = title;
    this.list.replaceChildren();
    this.bar.style.width = "0%";
    this.root.hidden = false;
    this.root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    for (const [i, row] of rows.entries()) {
      const li = document.createElement("li");
      li.className = row.alert ? "scan__row scan__row--alert" : "scan__row";
      const label = document.createElement("span");
      label.textContent = row.label;
      const dots = document.createElement("span");
      dots.className = "scan__dots";
      const value = document.createElement("strong");
      value.textContent = row.value;
      li.append(label, dots, value);
      this.list.append(li);
      this.bar.style.width = `${Math.round(((i + 1) / rows.length) * 100)}%`;
      playSfx(row.alert ? "stinger" : "typing");
      if (!this.skip) await wait(row.alert ? ROW_MS * 2 : ROW_MS);
    }
    await new Promise<void>((resolve) => (this.resolve = resolve));
    await this.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).finished;
    this.root.hidden = true;
  }

  // Primer avance: termina de mostrar todo. Segundo: cierra.
  advance() {
    if (!this.resolve) {
      this.skip = true;
      return;
    }
    const resolve = this.resolve;
    this.resolve = null;
    resolve();
  }

  reset() {
    this.resolve = null;
    this.root.hidden = true;
  }
}
