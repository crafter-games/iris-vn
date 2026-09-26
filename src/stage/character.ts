import { loadImage } from "./background";

// Sprite de Iris (sutemo, ver public/chars/CREDITS.md). Busca /chars/iris/iris_<expresión>.png
// y, si una expresión no existe, dibuja una silueta placeholder.
export class Character {
  private el: HTMLImageElement;
  expression = "";
  private cache = new Map<string, string>();

  constructor(el: HTMLImageElement) {
    this.el = el;
  }

  get state() {
    return this.visible ? this.expression : "hide";
  }

  get visible() {
    return this.el.classList.contains("char--visible");
  }

  async show(expression: string) {
    if (expression === "hide") return this.hide();
    const src = await this.resolve(expression);
    if (this.visible && expression !== this.expression) {
      // Cambio de expresión: un parpadeo corto en vez de un fundido completo.
      this.el.animate([{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }], { duration: 160 });
    }
    this.expression = expression;
    this.el.src = src;
    this.el.alt = `Iris (${expression})`;
    this.el.classList.add("char--visible");
  }

  hide() {
    this.el.classList.remove("char--visible");
  }

  // Pequeño empujón hacia la cámara para acompañar un "dodon".
  punch() {
    if (!this.visible) return;
    this.el.animate(
      [
        { transform: "translateX(-50%) scale(1)" },
        { transform: "translateX(-50%) scale(1.03)" },
        { transform: "translateX(-50%) scale(1)" },
      ],
      { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }

  private async resolve(expression: string) {
    const cached = this.cache.get(expression);
    if (cached) return cached;
    const url = `${import.meta.env.BASE_URL}chars/iris/iris_${expression}.png`;
    const src = (await loadImage(url)) ? url : silhouette(expression);
    this.cache.set(expression, src);
    return src;
  }
}

function silhouette(expression: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1000">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#3a3346"/><stop offset="1" stop-color="#1b1f2a"/></linearGradient></defs>
  <path d="M300 70c-95 0-150 70-150 170 0 70 20 150 10 230-5 40-25 70-45 90h370c-20-20-40-50-45-90-10-80 10-160 10-230 0-100-55-170-150-170z" fill="#2a2433"/>
  <ellipse cx="300" cy="250" rx="100" ry="125" fill="url(#g)"/>
  <path d="M60 1000c0-190 90-300 240-300s240 110 240 300z" fill="url(#g)"/>
  <rect x="265" y="360" width="70" height="70" fill="url(#g)"/>
  <rect x="222" y="232" width="70" height="42" rx="10" fill="none" stroke="#5ce1e6" stroke-width="5" opacity=".6"/>
  <rect x="308" y="232" width="70" height="42" rx="10" fill="none" stroke="#5ce1e6" stroke-width="5" opacity=".6"/>
  <path d="M60 1000c0-190 90-300 240-300s240 110 240 300" fill="none" stroke="#e8a0b4" stroke-width="3" opacity=".5"/>
  <text x="300" y="860" text-anchor="middle" font-family="monospace" font-size="34" fill="#e8a0b4" opacity=".85">iris_${expression}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
