// Nivel de corrupción (0–3): una sola perilla para toda la atmósfera visual.
// El audio se ajusta aparte con setCorruptionAudio().

type Level = {
  filter: string; // filtro CSS de los fondos
  grain: number;
  vignette: number;
  aberration: number; // px de separación roja/cian
  glitchEverySec: number; // 0 = sin glitches aleatorios
};

const LEVELS: Level[] = [
  { filter: "saturate(0.95) contrast(1.04) brightness(0.95) sepia(0.08)", grain: 0.05, vignette: 0.25, aberration: 0, glitchEverySec: 0 },
  { filter: "saturate(0.8) contrast(1.07) brightness(0.9) hue-rotate(-8deg)", grain: 0.09, vignette: 0.4, aberration: 0, glitchEverySec: 180 },
  { filter: "saturate(0.5) contrast(1.12) brightness(0.84) hue-rotate(-15deg)", grain: 0.12, vignette: 0.55, aberration: 2, glitchEverySec: 60 },
  { filter: "saturate(0.3) contrast(1.2) brightness(0.78) hue-rotate(-22deg)", grain: 0.16, vignette: 0.75, aberration: 4, glitchEverySec: 30 },
];

export class Corruption {
  level = 0;
  private stage: HTMLElement;
  private offsets: SVGFEOffsetElement[];

  constructor(stage: HTMLElement) {
    this.stage = stage;
    this.offsets = [...document.querySelectorAll<SVGFEOffsetElement>("#chroma feOffset")];
    this.set(0);
  }

  set(level: number) {
    this.level = Math.max(0, Math.min(3, Math.round(level)));
    const l = LEVELS[this.level];
    const style = this.stage.style;
    style.setProperty("--bg-filter", l.aberration ? `${l.filter} url(#chroma)` : l.filter);
    style.setProperty("--grain", String(l.grain));
    style.setProperty("--vignette", String(l.vignette));
    this.offsets.forEach((o, i) => o.setAttribute("dx", String(i === 0 ? l.aberration : -l.aberration)));
    this.stage.dataset.corruption = String(this.level);
  }

  // Probabilidad de glitch aleatorio en un tick de `tickMs`.
  glitchChance(tickMs: number) {
    const every = LEVELS[this.level].glitchEverySec;
    return every ? tickMs / (every * 1000) : 0;
  }
}
