// Dibujo original: peluche chibi turquesa con coletas.
import plush from "../assets/plush.svg?raw";
import { read, write } from "../engine/storage";

// Easter egg "where is miku?": un peluche turquesa escondido en algunas escenas.
// Tag: # miku:<id>@<x>,<y>   (posición en % del escenario). Persisten entre partidas.

export const MIKU_TOTAL = 5;

export class Miku {
  private el: HTMLButtonElement;
  private id = "";
  found = new Set(read<string[]>("miku", []));
  onFind: (count: number) => void = () => {};

  constructor(el: HTMLButtonElement) {
    this.el = el;
    this.el.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(plush)}")`;
    this.el.addEventListener("click", (event) => {
      event.stopPropagation();
      this.find();
    });
  }

  get state() {
    return this.el.hidden ? "" : this.spec;
  }

  private spec = "";

  place(spec: string) {
    const [id, pos] = spec.split("@");
    const [x, y] = (pos ?? "").split(",").map(Number);
    if (!id || Number.isNaN(x) || Number.isNaN(y)) return this.hide();
    this.id = id;
    this.spec = spec;
    this.el.style.left = `${x}%`;
    this.el.style.top = `${y}%`;
    this.el.classList.toggle("miku--found", this.found.has(id));
    this.el.hidden = false;
  }

  hide() {
    this.el.hidden = true;
    this.spec = "";
  }

  private find() {
    if (this.found.has(this.id)) return;
    this.found.add(this.id);
    write("miku", [...this.found]);
    this.el.classList.add("miku--found");
    this.el.animate([{ transform: "scale(1)" }, { transform: "scale(1.4) rotate(-10deg)" }, { transform: "scale(1)" }], { duration: 420 });
    this.onFind(this.found.size);
  }
}
