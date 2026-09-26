// Prueba el guion sin navegador: rutas dirigidas a cada final + partidas aleatorias.
// Uso: node tools/story-test.mjs [partidas_aleatorias]
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Compiler, CompilerOptions } from "inkjs/full";

const main = resolve("story/main.ink");
const root = dirname(main);
const errors = [];
const options = new CompilerOptions(
  main,
  [],
  false,
  (message, type) => type === 2 && errors.push(message),
  {
    ResolveInkFilename: (f) => resolve(root, f),
    LoadInkFileContents: (f) => readFileSync(f, "utf8"),
  },
);
const compiled = new Compiler(readFileSync(main, "utf8"), options).Compile();
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
const json = compiled.ToJson();
const { Story } = await import("inkjs/full");

const SPEAKER = /^([^:\n]{1,24}):\s+(.+)$/s;
const KNOWN_TAGS = new Set(["chat", "sys", "glitch", "tabtitle", "corrupt_slot", "miku", "bg", "iris", "sfx", "shake", "flash", "glass", "phone", "delete", "input", "pause", "titlecard", "instant", "ending", "bgm", "corruption"]);

// Juega una partida. `pick(options, story)` devuelve el índice elegido.
function play(pick) {
  const story = new Story(json);
  story.BindExternalFunction("hora_actual", () => "11:11 p. m.");
  let ending = null;
  let words = 0;
  const problems = [];
  for (let guard = 0; guard < 5000; guard++) {
    while (story.canContinue) {
      const line = story.Continue().trim();
      for (const tag of story.currentTags ?? []) {
        const [key, value] = tag.split(":").map((s) => s.trim());
        if (!KNOWN_TAGS.has(key)) problems.push(`tag desconocido: #${tag}`);
        if (key === "ending") ending = value;
      }
      words += line.split(/\s+/).filter(Boolean).length;
      const m = line.match(SPEAKER);
      if (m && /^["“(]/.test(m[1])) problems.push(`narración leída como diálogo: ${line}`);
    }
    const choices = story.currentChoices;
    if (!choices.length) break;
    story.ChooseChoiceIndex(pick(choices, story));
  }
  if (story.currentChoices.length) problems.push("no terminó (bucle)");
  return {
    ending,
    words,
    problems,
    afinidad: story.variablesState.$("afinidad"),
    sospecha: story.variablesState.$("sospecha"),
    aciertos: story.variablesState.$("aciertos"),
    pistas: story.variablesState.$("pistas").Count,
  };
}

const byText = (prefs) => (choices) => {
  for (const pref of prefs) {
    const i = choices.findIndex((c) => c.text.includes(pref));
    if (i >= 0) return choices[i].index;
  }
  return choices[0].index;
};

// En la confrontación, presenta la pista que rompe cada afirmación.
const CORRECT = {
  afirmacion_1: ["El grupo de WhatsApp", "La foto de noche"],
  afirmacion_2: ["Un badge", "Commit de las"],
  afirmacion_3: ["Medio segundo", "El reflejo"],
};
const confront = (fallback) => (choices, story) => {
  const stitch = Object.keys(CORRECT).find((k) => String(choices[0].sourcePath).includes(k));
  return stitch ? byText(CORRECT[stitch])(choices) : fallback(choices, story);
};

const routes = {
  siempre: byText([
    "curiosidad", "Sonreír", "Contarle", "sin pensarlo", "Agradecerle", "Cambiar de tema", "broma",
    "beso", "no pasa nada", "Dejarlo pasar", "linda", "Responder", "Aceptar]", "Hacer una broma",
    "Quedarte quieto", "Tomarle la mano", "Abrazarla", "perfecto", "felices", "Confío",
  ].map((s) => s.replace("]", ""))),
  verdad: confront(byText([
    "Preguntar cómo lo sabe", "cómo supo", "qué hacen", "cómo lo sabía", "qué le pasó", "celular volteado",
    "desbloqueó", "silla vacía", "zoom", "No responder", "quién es V", "nombre del proyecto",
    "cajón", "monitor", "qué le contesta", "audífono", "de cerca", "Tengo preguntas",
    "El grupo de WhatsApp", "La foto de noche", "Un badge", "Commit de las", "Medio segundo", "El reflejo",
    "Decirle que se vaya",
  ])),
  desconexion: byText(["Preguntar cómo lo sabe", "cómo supo", "Tengo preguntas", "No tengo nada"]),
};

let failed = false;
for (const [name, pick] of Object.entries(routes)) {
  const r = play(pick);
  const ok = r.ending === name && !r.problems.length;
  failed ||= !ok;
  console.log(`${ok ? "✓" : "✗"} ruta ${name}: final=${r.ending} afinidad=${r.afinidad} sospecha=${r.sospecha} aciertos=${r.aciertos} pistas=${r.pistas} palabras=${r.words}`);
  r.problems.forEach((p) => console.log("   ", p));
}

const runs = Number(process.argv[2] ?? 500);
const endings = {};
const allProblems = new Set();
let minWords = Infinity;
let maxWords = 0;
for (let i = 0; i < runs; i++) {
  const r = play((choices) => choices[Math.floor(Math.random() * choices.length)].index);
  endings[r.ending ?? "sin final"] = (endings[r.ending ?? "sin final"] ?? 0) + 1;
  r.problems.forEach((p) => allProblems.add(p));
  minWords = Math.min(minWords, r.words);
  maxWords = Math.max(maxWords, r.words);
}
console.log(`${runs} partidas aleatorias → ${JSON.stringify(endings)} · palabras por partida ${minWords}–${maxWords}`);
if (endings["sin final"] || allProblems.size) {
  failed = true;
  allProblems.forEach((p) => console.log("   ✗", p));
}
process.exit(failed ? 1 : 0);
