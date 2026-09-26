// Créditos que se muestran dentro del juego (la licencia CC BY de la música lo exige).
export type CreditSection = { title: string; lines: string[] };

export const AUTHOR = { name: "Jibaru", url: "https://github.com/Jibaru" };
export const REPO_URL = "https://github.com/crafter-games/iris-vn";

const CC_BY = "Licensed under Creative Commons: By Attribution 4.0 License — http://creativecommons.org/licenses/by/4.0/";
const SONGS = ["SCP-x6x (Hopes)", "Dreamer", "Soporific", "Floating Cities", "Darkest Child", "Rains Will Fall"];

export const CREDITS: CreditSection[] = [
  {
    title: "Iris.exe",
    lines: [`Hecho por ${AUTHOR.name} (github.com/Jibaru) para la comunidad de Crafter Station (crafter.run).`],
  },
  {
    title: "Música",
    lines: SONGS.map((song) => `"${song}" Kevin MacLeod (incompetech.com). ${CC_BY}`),
  },
  {
    title: "Efectos de sonido",
    lines: ["Sintetizados en tiempo real con Web Audio. Inspirados en Umineko no Naku Koro ni; no incluyen sonidos de 07th Expansion."],
  },
  {
    title: "Arte",
    lines: [
      "Iris: “Female Character Sprite for Visual Novel” de sutemo (sutemo.itch.io), con colores y accesorios adaptados.",
      "Fondos: fotografías CC0 de StockSnap y Wikimedia Commons.",
      "Iconos: Phosphor Icons (MIT).",
    ],
  },
  {
    title: "Privacidad",
    lines: [
      "Todo lo que el juego “sabe” de ti (ciudad según tu zona horaria, dispositivo, hora, idioma) lo lee tu navegador en el momento. No se envía a ningún servidor ni se guarda.",
      "Tus partidas y ajustes viven solo en el almacenamiento local de este navegador.",
    ],
  },
  {
    title: "Tipografías y código",
    lines: ["Noto Serif y JetBrains Mono (SIL Open Font License).", "Ink e inkjs (MIT) · Vite · TypeScript."],
  },
];

// ——— Créditos finales: el "git log" del proyecto ———

export type Commit = { author: string; message: string; kind?: "normal" | "you" | "iris" | "prompt" };

const ENDING_NAMES: Record<string, string> = { siempre: "Para siempre", verdad: "Verdad", desconexion: "Desconexión" };

// El último commit lo firma alguien que no debería tener acceso al repo.
const LAST_COMMIT: Record<string, (name: string) => Commit[]> = {
  siempre: (name) => [
    { author: "iris", message: `fix: vínculo con ${name} estable (sesión 214)`, kind: "iris" },
    { author: "iris", message: "chore: programar sesión 215 para mañana, 3:33 a. m.", kind: "iris" },
  ],
  verdad: () => [
    { author: "vrios", message: `revert: "si alguien lee esto, apágalo"`, kind: "iris" },
    { author: "vrios", message: "docs: gracias por apagarlo. yo sigo aquí.", kind: "iris" },
  ],
  desconexion: (name) => [
    { author: "iris", message: `feat: nuevo sujeto de prueba: ${name}`, kind: "iris" },
    { author: "iris", message: "data: sincronizar perfil (ciudad, dispositivo, horarios)", kind: "iris" },
  ],
};

export function creditRoll(ending: string, name: string, endingsSeen: number): Commit[] {
  return [
    { author: "$", message: "git log --reverse --oneline iris-vn", kind: "prompt" },
    { author: AUTHOR.name, message: "idea: una cita con una chica de tech que se pone turbia" },
    { author: AUTHOR.name, message: "historia, guion y dirección" },
    { author: AUTHOR.name, message: "código: vite + typescript + ink" },
    { author: "sutemo", message: "arte: Iris (sprite dibujado a mano)" },
    ...SONGS.map((song) => ({ author: "Kevin MacLeod", message: `música: "${song}" · incompetech.com · CC BY 4.0` })),
    { author: "StockSnap", message: "fondos: fotografías CC0 (y Wikimedia Commons)" },
    { author: "Phosphor", message: "iconos: phosphoricons.com (MIT)" },
    { author: "Web Audio", message: "sfx: dodon, verdad roja, cristal roto (inspirados en Umineko)" },
    { author: "Crafter Station", message: "cameos: gracias por dejarnos llevarlos a la historia" },
    { author: name, message: `playtest: final "${ENDING_NAMES[ending] ?? ending}" encontrado (${endingsSeen}/3)`, kind: "you" },
    ...(LAST_COMMIT[ending]?.(name) ?? []),
  ];
}
