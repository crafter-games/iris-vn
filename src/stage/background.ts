const FADE_MS = 400; // (tune)

// Dos capas que se alternan para hacer crossfade entre fondos.
// Si la imagen no existe todavía, muestra un placeholder con la clave.
export class Background {
  private layers: HTMLElement[];
  private front = 0;
  private current = "";

  constructor(root: HTMLElement) {
    this.layers = [...root.querySelectorAll<HTMLElement>(".bg__layer")];
  }

  async show(key: string) {
    if (key === this.current) return;
    this.current = key;
    const next = this.layers[1 - this.front];
    const prev = this.layers[this.front];

    if (key === "black") {
      next.style.backgroundImage = "none";
      next.textContent = "";
      next.classList.remove("bg__layer--placeholder");
    } else {
      const url = `${import.meta.env.BASE_URL}bg/bg_${key}.jpg`;
      const found = await loadImage(url);
      next.classList.toggle("bg__layer--placeholder", !found);
      next.style.backgroundImage = found ? `url("${url}")` : placeholder(key);
      next.textContent = found ? "" : `bg_${key}`;
    }

    next.style.transition = prev.style.transition = `opacity ${FADE_MS}ms ease`;
    next.style.opacity = "1";
    prev.style.opacity = "0";
    this.front = 1 - this.front;
  }
}

export function loadImage(url: string) {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function placeholder(key: string) {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return `radial-gradient(ellipse at 30% 30%, hsl(${hash} 30% 22%), hsl(${(hash + 40) % 360} 25% 8%))`;
}
