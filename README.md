# Iris.exe

Hecho por [Jibaru](https://github.com/Jibaru) para la comunidad de [Crafter Station](https://crafter.run).

Visual novel web de citas y misterio. Diseño completo en [`GDD.md`](GDD.md).

**Jugar:** https://iris.crafter.run

## Controles

| Acción | Teclado / ratón | Touch |
| --- | --- | --- |
| Avanzar | clic, Espacio, Enter | tap |
| Saltar texto leído | mantener Ctrl / botón Skip | botón Skip |
| Auto | A / botón Auto | botón Auto |
| Historial | L / rueda arriba | botón Log |
| Cuaderno de pistas | N | 📓 |
| Guardado rápido / carga rápida | F5 / F9 | — |
| Ocultar interfaz | H / clic derecho | — |
| Menú (guardar, cargar, ajustes, título) | Esc | ☰ |

Las partidas, el texto leído y los ajustes se guardan en `localStorage` (claves `iris.*`).

## Desarrollo

```bash
pnpm install
pnpm dev          # servidor local con recarga
pnpm build        # typecheck + build a dist/
pnpm preview      # sirve dist/ en :4173
pnpm playtest     # recorre el juego en Chromium headless y guarda capturas en playtest/
pnpm test:story   # rutas a los 3 finales + 500 partidas aleatorias, sin navegador
node tools/og.mjs         # regenera la imagen para redes (public/og.jpg) desde tools/og.html
node tools/route-shots.mjs   # juega la ruta "Verdad" y captura los momentos clave
```

- El guion vive en `story/*.ink` (un archivo por capítulo, incluidos desde `main.ink`) ([Ink](https://github.com/inkle/ink)). Se compila a JSON en build (`tools/vite-plugin-ink.ts`).
- `Nombre: texto` es diálogo; una línea sin prefijo es narración.
- Tags de presentación en el guion:

  | Tag | Efecto |
  | --- | --- |
  | `# bg:<clave>` | Fondo `public/bg/bg_<clave>.jpg` con crossfade (`black` = negro). Placeholder si falta. |
  | `# iris:<expresión>` | Sprite `public/chars/iris/iris_<expresión>.png`: neutral, smile, laugh, blush, surprised, sad, serious, stare, creepy, hollow, glitch (`hide` la oculta). Silueta si falta. |
  | `# sfx:<clave>` | Sonido sintetizado (`src/audio/sfx.ts`): dodon, red_truth, glass_shatter, riser, stinger, heartbeat, static… |
  | `# shake:<px>` / `# flash:<color>` / `# glass` | Sacudida, destello, cristal roto. |
  | `# phone:open` / `# phone:close` | Celular; los diálogos se vuelven burbujas y la narración, pensamientos. |
  | `# chat:<id>` | Cambia de conversación: iris, crafter, desconocido, borrado (`src/ui/phone.ts`). |
  | `# sys` | Narración como aviso dentro del chat (fechas, "Tienes un nuevo match"). |
  | `[texto #pista]` (en opciones) | Muestra el icono del cuaderno en la opción. |
  | `# delete` | Borra el último mensaje de Iris antes de esta línea. |
  | `# input:<var>` | Pide un texto en el celular y lo guarda en la variable Ink. |
  | `# pause:<ms>` / `# titlecard` / `# instant` | Pausa, logo del juego, línea sin máquina de escribir. |
  | `# bgm:<mood>` | Música: `public/music/<mood>.mp3` (title, warm, uneasy, office_night, horror, confession) o `none`. Generativa si falta el archivo. |
  | `# corruption:<0-3>` | Nivel de corrupción: filtro de fondos, grano, viñeta, aberración, glitches, capas de audio, color de la UI. |
  | `# glitch` | Glitch de pantalla puntual. |
  | `# credits` | Créditos finales tipo `git log` según el último final (`src/ui/creditsRoll.ts`). |
  | `# scan` | Pantalla falsa "Eco analiza tu perfil" con datos del navegador (`src/engine/visitor.ts`); nada sale del navegador. |
  | `# flicker[:creepy|hollow|glitch]` | Iris se distorsiona una fracción de segundo y vuelve (al azar si no se indica). |
  | `# tabtitle:<texto>` | Cambia el título de la pestaña (`$nombre` = nombre del jugador; vacío = normal). |
  | `# corrupt_slot` | La ranura 6, si está vacía, aparece "corrupta" con el nombre del jugador. |
  | `# miku:<id>@<x>,<y>` | Peluche escondido clicable (logro "where is miku?"). |
  | `[[r]]…[[/r]]` | Verdad roja (destello + sonido). |

- Funciones Ink: `hora_actual()`, `ciudad()` (según la zona horaria) y `dispositivo()`.
- Pistas: `LIST pistas` en Ink (`~ pistas += foto_noche`); los textos del cuaderno están en `src/data/clues.ts`.
- Deploy: cada push a `main` se despliega solo en el VPS de Crafter (Dokploy, `Dockerfile`).
