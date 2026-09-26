import { CLUE_ORDER, CLUES } from "../data/clues";
import { Panel } from "./panel";

// Cuaderno de pistas: muestra lo encontrado y deja el resto como "???".
export class Notebook {
  private panel: Panel;
  private badge: HTMLElement;
  found: string[] = [];

  constructor(host: HTMLElement, badge: HTMLElement) {
    this.panel = new Panel(host, "panel--notebook", "Cuaderno");
    this.badge = badge;
  }

  get isOpen() {
    return this.panel.isOpen;
  }

  set(found: string[]) {
    this.found = found.filter((id) => id in CLUES);
    this.badge.textContent = String(this.found.length);
    this.badge.hidden = this.found.length === 0;
  }

  open() {
    const count = document.createElement("p");
    count.className = "clues__count";
    count.textContent = `${this.found.length} / ${CLUE_ORDER.length} pistas`;
    const grid = document.createElement("div");
    grid.className = "clues";
    for (const id of CLUE_ORDER) {
      const found = this.found.includes(id);
      const card = document.createElement("article");
      card.className = found ? "clue" : "clue clue--missing";
      const title = document.createElement("h3");
      title.textContent = found ? CLUES[id].title : "???";
      const text = document.createElement("p");
      text.textContent = found ? CLUES[id].text : "Todavía no has notado esto.";
      card.append(title, text);
      grid.append(card);
    }
    this.panel.body.replaceChildren(count, grid);
    this.panel.open();
  }
}
