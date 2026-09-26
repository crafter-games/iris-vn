import { ALL_SLOTS, MANUAL_SLOTS, loadSlot, type SaveData } from "../engine/save";
import { Panel } from "./panel";

const SLOT_LABEL: Record<string, string> = { auto: "Auto", quick: "Rápido" };
const dateFormat = new Intl.DateTimeFormat("es-PE", { dateStyle: "short", timeStyle: "short" });

// Pantalla de ranuras. En modo "save" solo se escriben las 6 manuales; en "load" se ven todas.
export class SaveMenu {
  private panel: Panel;
  onSave: (slot: string) => void = () => {};
  onLoad: (data: SaveData) => void = () => {};

  constructor(host: HTMLElement) {
    this.panel = new Panel(host, "panel--saves");
  }

  open(mode: "save" | "load") {
    this.panel.title = mode === "save" ? "Guardar partida" : "Cargar partida";
    const grid = document.createElement("div");
    grid.className = "slots";
    const slots = mode === "save" ? MANUAL_SLOTS : ALL_SLOTS;
    for (const slot of slots) grid.append(this.card(slot, mode));
    this.panel.body.replaceChildren(grid);
    this.panel.open();
  }

  close() {
    this.panel.close();
  }

  private card(slot: string, mode: "save" | "load") {
    const data = loadSlot(slot);
    const el = document.createElement("button");
    el.className = "slot";
    el.disabled = mode === "load" && !data;
    const label = document.createElement("span");
    label.className = "slot__label";
    label.textContent = SLOT_LABEL[slot] ?? `Ranura ${slot}`;
    el.append(label);

    if (data) {
      if (data.scene.bg && data.scene.bg !== "black") {
        const url = `${import.meta.env.BASE_URL}bg/bg_${data.scene.bg}.jpg`;
        el.style.backgroundImage = `linear-gradient(rgb(14 16 22 / 0.2), rgb(14 16 22 / 0.95) 75%), url("${url}")`;
      }
      el.append(span("slot__chapter", data.chapter), span("slot__excerpt", data.excerpt), span("slot__date", dateFormat.format(data.date)));
    } else {
      el.classList.add("slot--empty");
      el.append(span("slot__excerpt", "Vacía"));
    }

    el.addEventListener("click", (event) => {
      event.stopPropagation();
      if (mode === "load" && data) {
        this.close();
        this.onLoad(data);
      } else if (mode === "save") {
        // Sobrescribir pide un segundo clic.
        if (data && !el.classList.contains("slot--confirm")) {
          el.classList.add("slot--confirm");
          label.textContent = "¿Sobrescribir? Clic otra vez";
          return;
        }
        this.onSave(slot);
        this.open("save");
      }
    });
    return el;
  }
}

function span(className: string, text: string) {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}
