// Lo que el navegador ya sabe del jugador, leído en local para el susto de "Eco analiza tu perfil".
// No se pide ningún permiso, no se envía a ningún servidor y no se guarda.

const CITY_NAMES: Record<string, string> = {
  Bogota: "Bogotá",
  Mexico_City: "Ciudad de México",
  Sao_Paulo: "São Paulo",
  Asuncion: "Asunción",
  New_York: "Nueva York",
  Los_Angeles: "Los Ángeles",
  Panama: "Panamá",
  Beijing: "Pekín",
  Shanghai: "Shanghái",
  London: "Londres",
};

const startedAt = Date.now();

// Ciudad de la zona horaria del sistema ("America/Lima" → "Lima").
export function city() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  const last = zone.split("/").pop() ?? "";
  if (!last || zone.startsWith("Etc") || last === "UTC") return "algún lugar del mundo";
  return CITY_NAMES[last] ?? last.replaceAll("_", " ");
}

export function device() {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "un iPhone";
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "un iPad";
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? "un celular Android" : "una tablet Android";
  if (/Macintosh|Mac OS X/.test(ua)) return "una Mac";
  if (/Windows/.test(ua)) return "una PC con Windows";
  if (/Linux|X11/.test(ua)) return "una compu con Linux";
  return "tu dispositivo";
}

export function localTime() {
  return new Intl.DateTimeFormat("es-PE", { weekday: "long", hour: "numeric", minute: "2-digit" }).format(new Date());
}

export function language() {
  return navigator.language || "es";
}

export function darkMode() {
  return matchMedia("(prefers-color-scheme: dark)").matches;
}

export function screenSize() {
  return `${screen.width}×${screen.height}`;
}

export function minutesPlaying() {
  return Math.max(1, Math.round((Date.now() - startedAt) / 60000));
}
