import { read, write } from "./storage";

export type Settings = {
  textSpeed: number; // caracteres por segundo; 0 = instantáneo
  autoDelay: number; // ms base antes de avanzar en modo auto
  skipUnread: boolean; // saltar también texto no leído
  master: number; // 0..1
  music: number;
  sfx: number;
  ui: number;
};

const DEFAULTS: Settings = {
  textSpeed: 40,
  autoDelay: 1400,
  skipUnread: false,
  master: 0.8,
  music: 0.7,
  sfx: 0.9,
  ui: 0.6,
};

export const settings: Settings = { ...DEFAULTS, ...read<Partial<Settings>>("settings", {}) };

const listeners = new Set<(s: Settings) => void>();

export function updateSettings(patch: Partial<Settings>) {
  Object.assign(settings, patch);
  write("settings", settings);
  listeners.forEach((fn) => fn(settings));
}

export function onSettings(fn: (s: Settings) => void) {
  listeners.add(fn);
  fn(settings);
}
