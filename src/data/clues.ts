// Pistas del cuaderno. La clave es el ítem de la LIST `pistas` en Ink.
export type Clue = { title: string; text: string };

export const CLUES: Record<string, Clue> = {
  grupo_whatsapp: {
    title: "El grupo de WhatsApp",
    text: "Iris dice que viste tu mensaje en el grupo de Crafter. Nunca escribiste en ese grupo.",
  },
  mensaje_borrado: {
    title: "“Te estaré mirando”",
    text: "Un mensaje que Iris borró segundos después. Dijo que fue el autocorrector.",
  },
  respuesta_rapida: {
    title: "Medio segundo antes",
    text: "A veces Iris responde antes de que termines la pregunta.",
  },
  foto_noche: {
    title: "La foto de noche",
    text: "Iris sabía a qué hora tomaste tu foto de perfil. La foto no tiene metadatos.",
  },
  badge_empleada: {
    title: "Un badge sin dueña",
    text: "Un badge de Lumen Labs a nombre de una empleada que “ya no trabaja ahí”.",
  },
  commit_333: {
    title: "Commit de las 3:33",
    text: "Un commit borrado del repositorio de Lumen Labs, hecho a las 3:33 a. m.",
  },
  foto_reflejo: {
    title: "El reflejo",
    text: "En una foto antigua de Iris, su reflejo en el vidrio no coincide.",
  },
  lumen_modelo: {
    title: "Proyecto IRIS",
    text: "El nombre interno del modelo que entrena Lumen Labs.",
  },
};

export const CLUE_ORDER = Object.keys(CLUES);
