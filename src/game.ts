import storyJson from "../story/main.ink";
import { musicState, playMood, setCorruptionAudio } from "./audio/music";
import { playBlip, playSfx, setSfxSuppressed, unlockAudio, type Voice } from "./audio/sfx";
import { CLUES } from "./data/clues";
import { CREDITS } from "./data/credits";
import { ENDINGS, chapterName, latestSave, loadSlot, markEnding, saveSlot, seenEndings, type SaveData, type SceneState } from "./engine/save";
import { Script, type Step } from "./engine/script";
import { settings } from "./engine/settings";
import { read, remove, write } from "./engine/storage";
import { parseTags, type Tag } from "./engine/tags";
import { wait } from "./engine/wait";
import { Background } from "./stage/background";
import { Character } from "./stage/character";
import { Corruption } from "./stage/corruption";
import { MIKU_TOTAL, Miku } from "./stage/miku";
import { Effects } from "./stage/effects";
import { Backlog } from "./ui/backlog";
import { Choices } from "./ui/choices";
import { Notebook } from "./ui/notebook";
import { Panel, button } from "./ui/panel";
import { Phone } from "./ui/phone";
import { SaveMenu } from "./ui/saveMenu";
import { SettingsPanel } from "./ui/settingsPanel";
import { hydrateIcons } from "./ui/icons";
import { TitleScreen } from "./ui/titleScreen";
import { TextBox } from "./ui/textbox";
import { Scan } from "./ui/scan";
import { CreditsRoll } from "./ui/creditsRoll";
import { AUTHOR, REPO_URL } from "./data/credits";
import { Toast } from "./ui/toast";
import * as visitor from "./engine/visitor";
import { CLUE_ORDER } from "./data/clues";

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;

const AUTO_MS_PER_CHAR = 25; // (tune) el modo auto espera más en líneas largas
const TICK_MS = 50;

type LineOptions = { instant: boolean; input: string | null; sys: boolean };

export class Game {
  private stage = $("#stage");
  private start = $("#start");
  private titlecard = $("#titlecard");
  private textbox = new TextBox($("#textbox"));
  private choices = new Choices($("#choices"));
  private phone = new Phone($("#phone"));
  private background = new Background($(".bg"));
  private iris = new Character($<HTMLImageElement>("#iris"));
  private effects = new Effects($("#scene"), $("#flash"), $<HTMLCanvasElement>("#fx-glass"));
  private toast = new Toast($("#toasts"));
  private backlog = new Backlog($("#overlays"));
  private saves = new SaveMenu($("#overlays"));
  private settingsPanel = new SettingsPanel($("#overlays"));
  private notebook = new Notebook($("#overlays"), $("#notebook-count"));
  private menu = new Panel($("#overlays"), "panel--menu", "Menú");
  private credits = new Panel($("#overlays"), "panel--credits", "Créditos");
  private title = new TitleScreen($("#start"));
  private scan = new Scan($("#scan"));
  private roll = new CreditsRoll($("#roll"));
  private lastEnding = "";
  private corruption = new Corruption($("#stage"));
  private miku = new Miku($<HTMLButtonElement>("#miku"));
  private tabTitle = "";

  private script = new Script(storyJson);
  private runId = 0;
  private playing = false;
  private resolveTitlecard: (() => void) | null = null;

  // Estado del paso actual, para guardar exactamente donde está el jugador.
  private stepScene: SceneState | null = null;
  private stepBacklog = 0;
  private stepExcerpt = "";
  private currentSeen = false;
  private knot = "";

  private skipToggle = false;
  private ctrlHeld = false;
  private auto = false;
  private seen = new Set(read<string[]>("seen", []));

  constructor() {
    hydrateIcons();
    // Firma y repo en la pantalla de inicio.
    const by = $<HTMLAnchorElement>(".start__by");
    by.href = AUTHOR.url;
    by.textContent = AUTHOR.name;
    $<HTMLAnchorElement>(".start__repo").href = REPO_URL;
    document.querySelectorAll(".start a").forEach((a) => a.addEventListener("click", (event) => event.stopPropagation()));
    this.bindInput();
    this.buildMenu();
    this.saves.onSave = (slot) => this.save(slot);
    this.saves.onLoad = (data) => this.load(data);
    this.miku.onFind = (count) => {
      playSfx("clue");
      if (count >= MIKU_TOTAL) this.toast.show("Logro: where is miku?", "trophy");
      else this.toast.show(`where is miku? ${count}/${MIKU_TOTAL}`, "music");
    };
    setInterval(() => this.tick(), TICK_MS);
    this.showStart();
  }

  // ——— Pantalla de inicio ———

  private showStart() {
    this.playing = false;
    playMood("title");
    const actions = this.start.querySelector(".start__actions")!;
    const latest = latestSave();
    const go = (fn: () => void) => () => {
      unlockAudio();
      playSfx("ui_click");
      fn();
    };
    actions.replaceChildren(
      ...(latest ? [button("Continuar", go(() => this.load(latest)), "start__btn")] : []),
      button("Nueva partida", go(() => this.newGame()), "start__btn"),
      ...(latest ? [button("Cargar", go(() => this.saves.open("load")), "start__btn")] : []),
      button("Ajustes", go(() => this.settingsPanel.open()), "start__btn"),
      button("Créditos", go(() => this.credits.open()), "start__btn"),
    );
    const seen = seenEndings();
    const endings = this.start.querySelector<HTMLElement>(".start__endings")!;
    endings.hidden = seen.length === 0;
    endings.textContent = `Finales  ${ENDINGS.map((id) => (seen.includes(id) ? "◆" : "◇")).join(" ")}`;
    this.title.show(seen);
    this.start.hidden = false;
  }

  private newGame() {
    this.resetStage();
    this.script = this.newScript();
    this.backlog.restore([]);
    this.syncNotebook(false);
    this.begin();
  }

  private newScript() {
    const script = new Script(storyJson);
    script.observe("pistas", () => this.syncNotebook(true));
    return script;
  }

  private begin() {
    this.title.hide();
    this.start.hidden = true;
    this.playing = true;
    this.run(++this.runId);
  }

  // ——— Bucle principal ———

  private async run(id: number) {
    for (;;) {
      if (id !== this.runId) return;
      const scene = this.captureScene();
      const step = this.script.next();
      this.stepScene = scene;
      this.stepBacklog = this.backlog.entries.length;

      if (step.kind === "line") {
        await this.playLine(step, id);
      } else if (step.kind === "choices") {
        this.stepExcerpt = this.backlog.entries.at(-1)?.text ?? "";
        this.skipToggle = false;
        this.updateModes();
        this.save("auto", true);
        const index = await this.choices.pick(step.options, { phone: this.phone.open });
        if (id !== this.runId) return;
        this.backlog.add({ speaker: "›", text: step.options.find((o) => o.index === index)?.text ?? "" });
        this.script.choose(index);
        playSfx("ui_click");
      } else {
        this.resetStage();
        this.showStart();
        return;
      }
    }
  }

  private async playLine(step: Extract<Step, { kind: "line" }>, id: number) {
    this.currentSeen = this.seen.has(step.id);
    this.knot = step.id.split(".")[0] || this.knot;
    this.stepExcerpt = step.text.replace(/\[\[\/?r\]\]/g, "");
    const fast = this.skipping && this.canSkipCurrent;
    setSfxSuppressed(fast);

    const options = await this.applyTags(parseTags(step.tags), fast);
    if (id !== this.runId) return;

    if (step.text.includes("[[r]]") && !fast) {
      this.effects.flash("white");
      playSfx("red_truth");
    }

    this.backlog.add({ speaker: step.speaker, text: step.text });
    const instant = options.instant || fast;

    if (this.phone.open) {
      const player = String(this.script.getVar("nombre"));
      const sender = this.phone.senderFor(step.speaker, player);
      if (options.input) {
        this.skipToggle = false;
        this.updateModes();
        await this.phone.say("system", step.text, { wait: false });
        const value = await this.phone.ask("Tu nombre");
        if (id !== this.runId) return;
        playSfx("ui_click");
        this.script.setVar(options.input, value);
      } else if (sender === "system" && !options.sys) {
        // Narración con el celular abierto: pensamiento, no mensaje del chat.
        await this.phone.think(step.text);
      } else {
        await this.phone.say(sender, step.text, { instant, name: step.speaker ?? "" });
      }
    } else {
      const voice = this.voiceFor(step.speaker);
      await this.textbox.say(step.speaker, step.text, { instant, blip: () => playBlip(voice) });
    }
    if (id !== this.runId) return;
    this.markSeen(step.id);
  }

  // Aplica las etiquetas de presentación antes de mostrar la línea.
  private async applyTags(tags: Tag[], fast: boolean): Promise<LineOptions> {
    const options: LineOptions = { instant: false, input: null, sys: false };
    for (const { key, value } of tags) {
      switch (key) {
        case "bg":
          await this.background.show(value);
          this.miku.hide();
          break;
        case "miku":
          this.miku.place(value);
          break;
        case "scan":
          await this.runScan(fast);
          break;
        case "flicker":
          if (!fast) this.iris.flicker(value, value === "hollow" ? 110 : 150);
          break;
        case "glitch":
          if (!fast) {
            this.effects.glitch();
            playSfx("static");
          }
          break;
        case "tabtitle":
          this.setTab(value.replaceAll("$nombre", String(this.script.getVar("nombre"))));
          break;
        case "corrupt_slot":
          // Cuarta pared: una ranura vacía aparece "corrupta" con el nombre del jugador.
          if (!loadSlot("6")) write("corrupt", String(this.script.getVar("nombre")));
          break;
        case "iris":
          await this.iris.show(value);
          break;
        case "sfx":
          playSfx(value);
          if (value === "dodon" && !fast) this.iris.punch();
          break;
        case "shake":
          if (!fast) this.effects.shake(Number(value) || 8);
          break;
        case "flash":
          if (!fast) this.effects.flash(value || "white");
          break;
        case "glass":
          playSfx("glass_shatter");
          if (!fast) this.effects.glass();
          break;
        case "phone":
          if (value === "open") {
            this.textbox.hide();
            this.phone.show();
          } else this.phone.hide();
          break;
        case "delete":
          this.phone.deleteLast();
          break;
        case "chat":
          this.phone.switchChat(value);
          break;
        case "sys":
          options.sys = true;
          break;
        case "pause":
          this.textbox.hide();
          if (!fast) await wait(Number(value) || 800);
          break;
        case "titlecard":
          await this.showTitlecard();
          break;
        case "instant":
          options.instant = true;
          break;
        case "input":
          options.input = value;
          break;
        case "ending":
          markEnding(value);
          this.lastEnding = value;
          break;
        case "credits":
          if (!fast) await this.roll.play(this.lastEnding || "desconexion", String(this.script.getVar("nombre")), seenEndings().length);
          break;
        case "bgm":
          playMood(value);
          break;
        case "corruption":
          this.setCorruption(Number(value) || 0);
          break;
        default:
          console.warn(`tag desconocido: #${key}:${value}`);
      }
    }
    return options;
  }

  // Susto: "Eco analiza tu perfil" con lo que el navegador ya sabe (nada sale del navegador).
  private async runScan(fast: boolean) {
    const name = String(this.script.getVar("nombre"));
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    await this.scan.run(
      `ECO v3.3 · análisis de perfil · ${name}`,
      [
        { label: "Usuario", value: name },
        { label: "Ubicación aproximada", value: visitor.city() },
        { label: "Dispositivo", value: cap(visitor.device().replace(/^(un|una) /, "")) },
        { label: "Hora local", value: visitor.localTime() },
        { label: "Idioma", value: visitor.language() },
        { label: "Modo oscuro", value: visitor.darkMode() ? "activado" : "desactivado" },
        { label: "Pantalla", value: visitor.screenSize() },
        { label: "Cosas que notaste", value: `${this.notebook.found.length} de ${CLUE_ORDER.length}` },
        { label: "Tiempo en la app", value: `${visitor.minutesPlaying()} min` },
        { label: "Compatibilidad con IRIS", value: "97,3 %", alert: true },
        { label: "Estado del vínculo", value: "en progreso", alert: true },
      ],
      { fast },
    );
  }

  // Iris suena distinta cuando te mira fijo o cuando todo está corrupto.
  private voiceFor(speaker: string | null): Voice {
    if (!speaker) return "narrator";
    if (speaker === "Iris") {
      const creepy = ["stare", "creepy", "hollow", "glitch"].includes(this.iris.state) || this.corruption.level >= 3;
      return creepy ? "iris_creepy" : "iris";
    }
    return speaker === String(this.script.getVar("nombre")) ? "me" : "other";
  }

  // Título a mitad de escena: aparece tras el "dodon" y espera un avance.
  private async showTitlecard() {
    this.textbox.hide();
    this.titlecard.hidden = false;
    this.titlecard.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: "ease-out" });
    await wait(900);
    await new Promise<void>((resolve) => (this.resolveTitlecard = resolve));
    await this.titlecard.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).finished;
    this.titlecard.hidden = true;
  }

  // ——— Avance, skip y auto ———

  private advance() {
    if (!this.playing) return;
    if (this.stage.classList.contains("ui-hidden")) {
      this.stage.classList.remove("ui-hidden");
      return;
    }
    if (this.resolveTitlecard) {
      const resolve = this.resolveTitlecard;
      this.resolveTitlecard = null;
      return resolve();
    }
    if (Panel.anyOpen || this.choices.active || this.phone.asking) return;
    if (this.roll.open) return this.roll.advance();
    if (this.scan.open) return this.scan.advance();
    if (this.phone.open) this.phone.advance();
    else this.textbox.advance();
  }

  private get skipping() {
    return this.skipToggle || this.ctrlHeld;
  }

  private get canSkipCurrent() {
    return this.currentSeen || settings.skipUnread;
  }

  private tick() {
    if (!this.playing || Panel.anyOpen || this.choices.active || this.phone.asking) return;
    if (this.skipping) {
      if (this.canSkipCurrent) {
        this.advance();
        this.advance();
        return;
      }
      // Llegamos a texto nuevo: el skip se detiene solo.
      if (this.skipToggle) {
        this.skipToggle = false;
        this.updateModes();
      }
    }
    // En corrupción alta, Iris se distorsiona sola de vez en cuando.
    const flickerEvery = [0, 0, 45000, 20000][this.corruption.level];
    if (!this.skipping && flickerEvery && Math.random() < TICK_MS / flickerEvery) this.iris.flicker();
    if (!this.skipping && Math.random() < this.corruption.glitchChance(TICK_MS)) {
      this.effects.glitch();
      playSfx("static");
    }
    if (this.auto && !this.resolveTitlecard) {
      const done = this.phone.open ? this.phone.completedAt : this.textbox.completedAt;
      const waitMs = settings.autoDelay + this.stepExcerpt.length * AUTO_MS_PER_CHAR;
      if (done !== null && performance.now() - done > waitMs) this.advance();
    }
  }

  private markSeen(id: string) {
    if (this.seen.has(id)) return;
    this.seen.add(id);
    write("seen", [...this.seen]);
  }

  private toggleAuto() {
    this.auto = !this.auto;
    this.skipToggle = false;
    this.updateModes();
  }

  private toggleSkip() {
    this.skipToggle = !this.skipToggle;
    this.auto = false;
    this.updateModes();
  }

  private updateModes() {
    $("#btn-auto").classList.toggle("is-on", this.auto);
    $("#btn-skip").classList.toggle("is-on", this.skipping);
    this.stage.dataset.mode = this.skipping ? "skip" : this.auto ? "auto" : "";
  }

  // ——— Guardar / cargar ———

  private captureScene(): SceneState {
    return {
      bg: this.background.current,
      iris: this.iris.state,
      phone: this.phone.state,
      bgm: musicState(),
      corruption: this.corruption.level,
      tab: this.tabTitle,
      miku: this.miku.state,
    };
  }

  private save(slot: string, silent = false) {
    if (!this.playing || !this.stepScene) return;
    const data: SaveData = {
      v: 1,
      date: Date.now(),
      checkpoint: this.script.checkpoint,
      scene: this.stepScene,
      backlog: this.backlog.entries.slice(0, this.stepBacklog),
      knot: this.knot,
      chapter: chapterName(this.knot),
      excerpt: this.stepExcerpt.slice(0, 90),
    };
    const ok = saveSlot(slot, data);
    if (ok && slot === "6") remove("corrupt");
    if (!silent) this.toast.show(ok ? "Partida guardada" : "No se pudo guardar (almacenamiento bloqueado)", "floppy");
  }

  private async load(data: SaveData) {
    this.resetStage();
    this.script = this.newScript();
    this.script.load(data.checkpoint);
    this.knot = data.knot ?? "";
    this.backlog.restore(data.backlog);
    this.syncNotebook(false);
    await this.background.show(data.scene.bg || "black");
    await this.iris.show(data.scene.iris || "hide");
    this.phone.restore(data.scene.phone);
    this.setCorruption(data.scene.corruption ?? 0);
    playMood(data.scene.bgm || "none");
    this.setTab(data.scene.tab ?? "");
    if (data.scene.miku) this.miku.place(data.scene.miku);
    this.begin();
  }

  // Deja el escenario limpio y cancela el bucle en curso.
  private resetStage() {
    this.runId++;
    this.playing = false;
    this.resolveTitlecard = null;
    this.titlecard.hidden = true;
    this.textbox.reset();
    this.scan.reset();
    this.roll.reset();
    this.choices.cancel();
    this.phone.reset();
    this.iris.hide();
    this.background.show("black");
    this.skipToggle = this.auto = false;
    this.updateModes();
    setSfxSuppressed(false);
    this.setCorruption(0);
    this.setTab("");
    this.miku.hide();
    playMood("none");
    while (Panel.anyOpen) Panel.closeTop();
  }

  private setCorruption(level: number) {
    this.corruption.set(level);
    setCorruptionAudio(this.corruption.level);
  }

  // Cuarta pared: el título de la pestaña del navegador.
  private setTab(title: string) {
    this.tabTitle = title;
    document.title = title || "Iris.exe";
  }

  private syncNotebook(announce: boolean) {
    const items = this.script.listItems("pistas");
    const fresh = items.filter((id) => !this.notebook.found.includes(id));
    this.notebook.set(items);
    if (!announce) return;
    for (const id of fresh) {
      if (!CLUES[id]) continue;
      playSfx("clue");
      this.toast.show(`Pista nueva: ${CLUES[id].title}`, "notebook");
    }
  }

  // ——— Menú y controles ———

  private buildMenu() {
    const item = (label: string, fn: () => void) =>
      button(label, () => {
        playSfx("ui_click");
        this.menu.close();
        fn();
      }, "menu__item");
    const list = document.createElement("nav");
    list.className = "menu";
    list.append(
      item("Guardar", () => this.saves.open("save")),
      item("Cargar", () => this.saves.open("load")),
      item("Historial", () => this.backlog.open()),
      item("Cuaderno", () => this.notebook.open()),
      item("Ajustes", () => this.settingsPanel.open()),
      item("Créditos", () => this.credits.open()),
      item("Volver al título", () => {
        this.resetStage();
        this.showStart();
      }),
    );
    this.menu.body.append(list);

    for (const section of CREDITS) {
      const block = document.createElement("section");
      block.className = "credits__section";
      const title = document.createElement("h3");
      title.textContent = section.title;
      block.append(title, ...section.lines.map((line) => Object.assign(document.createElement("p"), { textContent: line })));
      this.credits.body.append(block);
    }

    const bind = (selector: string, fn: () => void) =>
      $(selector).addEventListener("click", (event) => {
        event.stopPropagation();
        playSfx("ui_click");
        fn();
      });
    bind("#btn-auto", () => this.toggleAuto());
    bind("#btn-skip", () => this.toggleSkip());
    bind("#btn-log", () => this.backlog.open());
    bind("#btn-save", () => this.saves.open("save"));
    bind("#btn-menu", () => this.menu.open());
    bind("#btn-notebook", () => this.notebook.open());
    bind("#btn-menu-corner", () => this.menu.open());
  }

  private bindInput() {
    this.stage.addEventListener("click", () => this.advance());
    this.stage.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (this.playing && !Panel.anyOpen) this.stage.classList.toggle("ui-hidden");
    });
    this.stage.addEventListener(
      "wheel",
      (event) => {
        if (this.playing && !Panel.anyOpen && event.deltaY < 0) this.backlog.open();
      },
      { passive: true },
    );

    window.addEventListener("keyup", (event) => {
      if (event.key === "Control") {
        this.ctrlHeld = false;
        this.updateModes();
      }
    });
    window.addEventListener("blur", () => {
      this.ctrlHeld = false;
      this.updateModes();
    });

    window.addEventListener("keydown", (event) => {
      if (event.target instanceof HTMLInputElement && event.target.type !== "range" && event.target.type !== "checkbox") return;
      const key = event.key;

      if (key === "Escape") {
        if (Panel.anyOpen) Panel.closeTop();
        else if (this.playing) this.menu.open();
        return;
      }
      if (Panel.anyOpen || !this.playing) return;

      if (key === "Control") {
        if (!event.repeat) {
          this.ctrlHeld = true;
          this.updateModes();
        }
        return;
      }
      if (event.repeat) return;

      if (this.choices.active) {
        if (key === "ArrowRight") this.choices.move(1);
        else if (key === "ArrowLeft") this.choices.move(-1);
        else if (key === "ArrowDown") this.choices.move(this.choices.columns);
        else if (key === "ArrowUp") this.choices.move(-this.choices.columns);
        else if (key === "Enter" || key === " ") this.choices.confirm();
        else return;
      } else if (key === "Enter" || key === " ") this.advance();
      else if (key === "a" || key === "A") this.toggleAuto();
      else if (key === "l" || key === "L") this.backlog.open();
      else if (key === "n" || key === "N") this.notebook.open();
      else if (key === "h" || key === "H") this.stage.classList.toggle("ui-hidden");
      else if (key === "F5") this.save("quick");
      else if (key === "F9") {
        const quick = loadSlot("quick");
        if (quick) this.load(quick);
        else this.toast.show("No hay guardado rápido");
      } else return;
      event.preventDefault();
    });
  }
}
