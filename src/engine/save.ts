import type { Entry } from "../ui/backlog";
import type { PhoneState } from "../ui/phone";
import { read, write } from "./storage";

export type SceneState = { bg: string; iris: string; phone: PhoneState };

export type SaveData = {
  v: 1;
  date: number;
  checkpoint: string; // estado de Ink justo antes de la línea/elección guardada
  scene: SceneState; // escena tal como estaba antes de esa línea
  backlog: Entry[];
  knot: string;
  chapter: string;
  excerpt: string;
};

export const MANUAL_SLOTS = ["1", "2", "3", "4", "5", "6"];
export const ALL_SLOTS = ["auto", "quick", ...MANUAL_SLOTS];

const CHAPTERS: Record<string, string> = {
  match: "Prólogo · El match",
  prologo: "Prólogo · Code Brew",
  prueba_efectos: "Prueba de efectos",
};

export const chapterName = (knot: string) => CHAPTERS[knot] ?? knot;

export function saveSlot(slot: string, data: SaveData) {
  return write(`save.${slot}`, data);
}

export function loadSlot(slot: string): SaveData | null {
  const data = read<SaveData | null>(`save.${slot}`, null);
  return data?.v === 1 ? data : null;
}

export function latestSave(): SaveData | null {
  return (
    ALL_SLOTS.map(loadSlot)
      .filter((s): s is SaveData => s !== null)
      .sort((a, b) => b.date - a.date)[0] ?? null
  );
}
