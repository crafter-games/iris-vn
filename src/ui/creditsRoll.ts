import { playSfx } from "../audio/sfx";
import { AUTHOR, REPO_URL, creditRoll } from "../data/credits";
import { wait } from "../engine/wait";
import { icon } from "./icons";

const LINE_MS = 900; // (tune) ritmo del log
const CHAR_MS = 14;
const IRIS_EXPRESSION: Record<string, string> = { siempre: "smile", verdad: "sad", desconexion: "creepy" };

// Hash corto con pinta de git; el último siempre termina en 333.
const hash = (i: number, last: boolean) =>
  last ? "a3f333" : ((i * 2654435761) >>> 0).toString(16).padStart(8, "0").slice(0, 6);

// Créditos finales como un "git log" que se escribe en una terminal.
export class CreditsRoll {
  private root: HTMLElement;
  private log: HTMLElement;
  private iris: HTMLImageElement;
  private outro: HTMLElement;
  private fast = false;
  private resolve: (() => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.log = root.querySelector(".roll__log")!;
    this.iris = root.querySelector(".roll__iris")!;
    this.outro = root.querySelector(".roll__outro")!;
    const by = root.querySelector<HTMLAnchorElement>(".roll__by")!;
    by.href = AUTHOR.url;
    by.replaceChildren(icon("github"), `hecho por ${AUTHOR.name}`);
    const repo = root.querySelector<HTMLAnchorElement>(".roll__repo")!;
    repo.href = REPO_URL;
    repo.replaceChildren(icon("github"), "código en GitHub");
    root.querySelectorAll("a").forEach((a) => a.addEventListener("click", (event) => event.stopPropagation()));
  }

  get open() {
    return !this.root.hidden;
  }

  async play(ending: string, name: string, endingsSeen: number) {
    this.fast = false;
    this.log.replaceChildren();
    this.outro.hidden = true;
    this.iris.src = `${import.meta.env.BASE_URL}chars/iris/iris_${IRIS_EXPRESSION[ending] ?? "neutral"}.png`;
    this.root.hidden = false;
    this.root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 800 });
    await wait(900);

    const commits = creditRoll(ending, name, endingsSeen);
    for (const [i, commit] of commits.entries()) {
      const last = i === commits.length - 1;
      const line = document.createElement("li");
      line.className = `roll__line roll__line--${commit.kind ?? "normal"}`;
      if (commit.kind === "prompt") {
        line.textContent = `$ ${commit.message}`;
      } else {
        const sha = document.createElement("span");
        sha.className = "roll__sha";
        sha.textContent = hash(i, last);
        const author = document.createElement("span");
        author.className = "roll__author";
        author.textContent = commit.author;
        const message = document.createElement("span");
        message.className = "roll__msg";
        line.append(sha, author, message);
        this.log.append(line);
        await this.type(message, commit.message);
        if (commit.kind === "iris") {
          playSfx(last ? "dodon" : "static");
          line.animate([{ filter: "none" }, { filter: "hue-rotate(90deg) blur(1px)" }, { filter: "none" }], { duration: 260, easing: "steps(3)" });
        }
        this.log.scrollTop = this.log.scrollHeight;
        if (!this.fast) await wait(commit.kind === "iris" ? LINE_MS * 2 : LINE_MS);
        continue;
      }
      this.log.append(line);
      if (!this.fast) await wait(LINE_MS);
    }

    await wait(this.fast ? 200 : 1200);
    this.outro.hidden = false;
    this.outro.animate([{ opacity: 0, transform: "translateY(1cqh)" }, { opacity: 1, transform: "none" }], { duration: 900 });
    await new Promise<void>((resolve) => (this.resolve = resolve));
    await this.root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600 }).finished;
    this.root.hidden = true;
  }

  // Primer avance: termina el log de golpe. Después: cierra.
  advance() {
    if (this.resolve) {
      const resolve = this.resolve;
      this.resolve = null;
      resolve();
    } else this.fast = true;
  }

  reset() {
    this.resolve = null;
    this.root.hidden = true;
  }

  private async type(el: HTMLElement, text: string) {
    if (this.fast) {
      el.textContent = text;
      return;
    }
    for (let i = 1; i <= text.length; i++) {
      if (this.fast) {
        el.textContent = text;
        return;
      }
      el.textContent = text.slice(0, i);
      await wait(CHAR_MS);
    }
  }
}
