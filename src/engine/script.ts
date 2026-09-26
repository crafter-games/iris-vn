import { InkList, Story } from "inkjs";
import { city, device } from "./visitor";

export type Step =
  | { kind: "line"; id: string; speaker: string | null; text: string; tags: string[] }
  | { kind: "choices"; options: { index: number; text: string; tags: string[] }[] }
  | { kind: "end" };

// "Iris: hola" → hablante "Iris". Sin prefijo → narración.
const SPEAKER = /^([^:\n]{1,24}):\s+(.+)$/s;

// Envuelve el runtime de Ink y lo expone como una secuencia de pasos para el motor.
export class Script {
  private story: Story;
  // Estado de Ink justo antes del paso actual: guardar aquí permite cargar en la misma línea.
  checkpoint: string;

  constructor(json: string) {
    this.story = new Story(json);
    this.story.BindExternalFunction("hora_actual", () =>
      new Intl.DateTimeFormat("es-PE", { hour: "numeric", minute: "2-digit" }).format(new Date()),
    );
    this.story.BindExternalFunction("ciudad", city);
    this.story.BindExternalFunction("dispositivo", device);
    this.checkpoint = this.story.state.ToJson();
  }

  // Tags de líneas vacías (p. ej. "- # iris:hide"): se aplican con la siguiente línea con texto.
  private pendingTags: string[] = [];

  next(): Step {
    if (this.story.canContinue) {
      if (!this.pendingTags.length) this.checkpoint = this.story.state.ToJson();
      const id = this.story.state.currentPathString ?? "";
      const raw = this.story.Continue()?.trim() ?? "";
      const tags = [...this.pendingTags, ...(this.story.currentTags ?? [])];
      this.pendingTags = [];
      if (!raw) {
        this.pendingTags = tags;
        return this.next();
      }
      const match = raw.match(SPEAKER);
      return match
        ? { kind: "line", id, speaker: match[1].trim(), text: match[2].trim(), tags }
        : { kind: "line", id, speaker: null, text: raw, tags };
    }
    this.checkpoint = this.story.state.ToJson();
    const choices = this.story.currentChoices;
    if (choices.length) {
      return { kind: "choices", options: choices.map((c) => ({ index: c.index, text: c.text, tags: c.tags ?? [] })) };
    }
    return { kind: "end" };
  }

  choose(index: number) {
    this.story.ChooseChoiceIndex(index);
  }

  load(checkpoint: string) {
    this.pendingTags = [];
    this.story.state.LoadJson(checkpoint);
    this.checkpoint = checkpoint;
  }

  getVar(name: string) {
    return this.story.variablesState.$(name);
  }

  setVar(name: string, value: string | number | boolean) {
    this.story.variablesState.$(name, value);
  }

  // Ítems activos de una LIST de Ink (p. ej. las pistas encontradas).
  listItems(name: string): string[] {
    const list = this.story.variablesState.$(name);
    if (!(list instanceof InkList)) return [];
    return list.orderedItems.map((pair) => pair.Key.itemName ?? "").filter(Boolean);
  }

  observe(name: string, fn: () => void) {
    this.story.ObserveVariable(name, fn);
  }
}
