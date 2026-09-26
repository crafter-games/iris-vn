import { settings, updateSettings, type Settings } from "../engine/settings";
import { Panel } from "./panel";

type NumberKey = { [K in keyof Settings]: Settings[K] extends number ? K : never }[keyof Settings];

const pct = (v: number) => `${Math.round(v * 100)} %`;

const SLIDERS: { key: NumberKey; label: string; min: number; max: number; step: number; format: (v: number) => string }[] = [
  { key: "textSpeed", label: "Velocidad del texto", min: 0, max: 120, step: 5, format: (v) => (v === 0 ? "Instantáneo" : `${v} car/s`) },
  { key: "autoDelay", label: "Pausa del modo auto", min: 400, max: 4000, step: 100, format: (v) => `${(v / 1000).toFixed(1)} s` },
  { key: "master", label: "Volumen general", min: 0, max: 1, step: 0.05, format: pct },
  { key: "music", label: "Música", min: 0, max: 1, step: 0.05, format: pct },
  { key: "sfx", label: "Efectos", min: 0, max: 1, step: 0.05, format: pct },
  { key: "ui", label: "Interfaz", min: 0, max: 1, step: 0.05, format: pct },
];

export class SettingsPanel {
  private panel: Panel;

  constructor(host: HTMLElement) {
    this.panel = new Panel(host, "panel--settings", "Ajustes");
  }

  open() {
    const form = document.createElement("div");
    form.className = "settings";
    for (const s of SLIDERS) {
      const row = document.createElement("label");
      row.className = "settings__row";
      const name = document.createElement("span");
      name.textContent = s.label;
      const input = document.createElement("input");
      input.type = "range";
      Object.assign(input, { min: s.min, max: s.max, step: s.step, value: settings[s.key] });
      const output = document.createElement("output");
      output.textContent = s.format(settings[s.key]);
      input.addEventListener("input", () => {
        const value = Number(input.value);
        output.textContent = s.format(value);
        updateSettings({ [s.key]: value });
      });
      row.append(name, input, output);
      form.append(row);
    }

    const skip = document.createElement("label");
    skip.className = "settings__row settings__row--check";
    const skipName = document.createElement("span");
    skipName.textContent = "Saltar también texto no leído";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = settings.skipUnread;
    check.addEventListener("change", () => updateSettings({ skipUnread: check.checked }));
    skip.append(skipName, check);
    form.append(skip);

    if (document.fullscreenEnabled) {
      const full = document.createElement("button");
      full.className = "btn";
      const label = () => (document.fullscreenElement ? "Salir de pantalla completa" : "Pantalla completa");
      full.textContent = label();
      full.addEventListener("click", async () => {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen().catch(() => {});
        full.textContent = label();
      });
      form.append(full);
    }

    this.panel.body.replaceChildren(form);
    this.panel.open();
  }
}
