# Iris.exe

Visual novel web de citas y misterio. Diseño completo en [`GDD.md`](GDD.md).

**Jugar:** https://iris.crafter.run

## Desarrollo

```bash
pnpm install
pnpm dev          # servidor local con recarga
pnpm build        # typecheck + build a dist/
pnpm preview      # sirve dist/ en :4173
pnpm playtest     # recorre el guion en Chromium headless y guarda capturas en playtest/
```

- El guion vive en `story/*.ink` ([Ink](https://github.com/inkle/ink)). Se compila a JSON en build (`tools/vite-plugin-ink.ts`).
- `Nombre: texto` es diálogo; una línea sin prefijo es narración.
- Tags de presentación en el guion:

  | Tag | Efecto |
  | --- | --- |
  | `# bg:<clave>` | Fondo `public/bg/bg_<clave>.jpg` con crossfade (`black` = negro). Placeholder si falta. |
  | `# iris:<expresión>` | Sprite `public/chars/iris/iris_<expresión>.png` (`hide` lo oculta). Silueta si falta. |
  | `# sfx:<clave>` | Sonido sintetizado (`src/audio/sfx.ts`): dodon, red_truth, glass_shatter, riser, stinger, heartbeat, static… |
  | `# shake:<px>` / `# flash:<color>` / `# glass` | Sacudida, destello, cristal roto. |
  | `# phone:open` / `# phone:close` | Chat de celular; las líneas se vuelven burbujas. |
  | `# delete` | Borra el último mensaje de Iris antes de esta línea. |
  | `# input:<var>` | Pide un texto en el celular y lo guarda en la variable Ink. |
  | `# pause:<ms>` / `# titlecard` / `# instant` | Pausa, logo del juego, línea sin máquina de escribir. |
  | `[[r]]…[[/r]]` | Verdad roja (destello + sonido). |

- Deploy: cada push a `main` se despliega solo en el VPS de Crafter (Dokploy, `Dockerfile`).
