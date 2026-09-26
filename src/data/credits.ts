// Créditos que se muestran dentro del juego (la licencia CC BY de la música lo exige).
export type CreditSection = { title: string; lines: string[] };

const CC_BY = "Licensed under Creative Commons: By Attribution 4.0 License — http://creativecommons.org/licenses/by/4.0/";
const macleod = (song: string) => `"${song}" Kevin MacLeod (incompetech.com). ${CC_BY}`;

export const CREDITS: CreditSection[] = [
  {
    title: "Iris.exe",
    lines: ["Una visual novel de citas y misterio, hecha con cariño para la comunidad de Crafter Station (crafter.run)."],
  },
  {
    title: "Música",
    lines: ["SCP-x6x (Hopes)", "Dreamer", "Soporific", "Floating Cities", "Darkest Child", "Rains Will Fall"].map(macleod),
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
