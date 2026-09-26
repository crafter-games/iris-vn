import { read, write } from "../engine/storage";

// Easter egg "where is miku?": un peluche turquesa escondido en algunas escenas.
// Tag: # miku:<id>@<x>,<y>   (posición en % del escenario). Persisten entre partidas.

export const MIKU_TOTAL = 5;

const PLUSH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <path d="M22 44c-14 18-16 44-8 66 6-8 10-20 12-34z" fill="#39c5bb"/>
  <path d="M98 44c14 18 16 44 8 66-6-8-10-20-12-34z" fill="#39c5bb"/>
  <ellipse cx="60" cy="96" rx="26" ry="20" fill="#e9eef0"/>
  <path d="M50 84l10 10 10-10" fill="none" stroke="#39c5bb" stroke-width="5"/>
  <circle cx="60" cy="54" r="34" fill="#f6e2d3"/>
  <path d="M26 52c0-24 16-38 34-38s34 14 34 38c-8-12-20-16-34-16s-26 4-34 16z" fill="#39c5bb"/>
  <rect x="24" y="36" width="8" height="10" rx="2" fill="#2a2433"/>
  <rect x="88" y="36" width="8" height="10" rx="2" fill="#2a2433"/>
  <ellipse cx="48" cy="58" rx="4" ry="5" fill="#2a2433"/>
  <ellipse cx="72" cy="58" rx="4" ry="5" fill="#2a2433"/>
  <path d="M55 68q5 4 10 0" fill="none" stroke="#2a2433" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

export class Miku {
  private el: HTMLButtonElement;
  private id = "";
  found = new Set(read<string[]>("miku", []));
  onFind: (count: number) => void = () => {};

  constructor(el: HTMLButtonElement) {
    this.el = el;
    this.el.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(PLUSH)}")`;
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
