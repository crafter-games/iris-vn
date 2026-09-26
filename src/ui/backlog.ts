import { parseMarkup, renderSegments } from "../engine/markup";
import { Panel } from "./panel";

export type Entry = { speaker: string | null; text: string };

const MAX_ENTRIES = 200;

// Historial de lo leído.
export class Backlog {
  entries: Entry[] = [];
  private panel: Panel;

  constructor(host: HTMLElement) {
    this.panel = new Panel(host, "panel--backlog", "Historial");
  }

  get isOpen() {
    return this.panel.isOpen;
  }

  add(entry: Entry) {
    this.entries.push(entry);
    if (this.entries.length > MAX_ENTRIES) this.entries.shift();
  }

  restore(entries: Entry[]) {
    this.entries = entries.slice(-MAX_ENTRIES);
  }

  open() {
    const list = document.createElement("ol");
    list.className = "backlog";
    for (const entry of this.entries) {
      const item = document.createElement("li");
      item.className = entry.speaker ? "backlog__item" : "backlog__item backlog__item--narration";
      if (entry.speaker) {
        const name = document.createElement("span");
        name.className = "backlog__name";
        name.textContent = entry.speaker;
        item.append(name);
      }
      const text = document.createElement("p");
      renderSegments(text, parseMarkup(entry.text));
      item.append(text);
      list.append(item);
    }
    if (!this.entries.length) list.innerHTML = `<li class="backlog__empty">Todavía no hay nada que recordar.</li>`;
    this.panel.body.replaceChildren(list);
    this.panel.open();
    this.panel.body.scrollTop = this.panel.body.scrollHeight;
  }

  close() {
    this.panel.close();
  }
}
