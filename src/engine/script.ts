import { Story } from "inkjs";

export type Step =
  | { kind: "line"; speaker: string | null; text: string; tags: string[] }
  | { kind: "choices"; options: { index: number; text: string }[] }
  | { kind: "end" };

// "Iris: hola" → hablante "Iris". Sin prefijo → narración.
const SPEAKER = /^([^:\n]{1,24}):\s+(.+)$/s;

// Envuelve el runtime de Ink y lo expone como una secuencia de pasos para el motor.
export class Script {
  private story: Story;

  constructor(json: string) {
    this.story = new Story(json);
  }

  next(): Step {
    if (this.story.canContinue) {
      const raw = this.story.Continue()?.trim() ?? "";
      const tags = this.story.currentTags ?? [];
      if (!raw) return this.next();
      const match = raw.match(SPEAKER);
      return match
        ? { kind: "line", speaker: match[1].trim(), text: match[2].trim(), tags }
        : { kind: "line", speaker: null, text: raw, tags };
    }
    const choices = this.story.currentChoices;
    if (choices.length) {
      return { kind: "choices", options: choices.map((c) => ({ index: c.index, text: c.text })) };
    }
    return { kind: "end" };
  }

  choose(index: number) {
    this.story.ChooseChoiceIndex(index);
  }

  setVar(name: string, value: string | number | boolean) {
    this.story.variablesState.$(name, value);
  }
}
