# Iris.exe

> Eres un dev junior que empieza a salir con Iris, ingeniera en la startup de IA Lumen Labs, y cita a cita descubres que la empresa —y quizá ella misma— esconde algo que no debería existir.

| | |
| --- | --- |
| Engine | Vite + TypeScript + inkjs (guion en Ink), UI en DOM/CSS + capa canvas para efectos, pnpm |
| Platform | web (desktop + móvil en horizontal) |
| View | 2D visual novel: fondo + sprite + caja de texto; UI de chat de celular para interludios |
| Scope | demo corta: prólogo + 3 citas, ~45–60 min de lectura, 3 finales |
| References | Umineko (sonido, paranoia, texto rojo), Higurashi (lo cotidiano que se pudre), Steins;Gate (conspiración tech), DDLC (cuarta pared, en dosis mínimas) |
| Idioma | español; todo el texto vive en `.ink`, nada hardcodeado (EN en v2) |

## Core loop

Leer → avanzar → cada 2–4 min una **elección** que mueve `afinidad` y/o `sospecha` → a veces aparece una **pista** que se guarda en el cuaderno → cada cita termina subiendo el **nivel de corrupción** (la atmósfera se degrada). Se sigue leyendo porque cada cita es más rara que la anterior y el jugador quiere confirmar lo que sospecha; se rejuega para ver los otros finales.

## First 30 seconds

1. Pantalla negra. Suena `sfx_notif`. Texto: *"Tienes un nuevo match."*
2. Aparece la UI de una app de citas: el jugador escribe **su nombre** en el perfil (máx. 12 caracteres).
3. Llega el primer mensaje de Iris, ya usando ese nombre. `sfx_msg_received`.
4. Tras 2–3 mensajes, corte a negro → `sfx_dodon` → título **Iris.exe** → comienza el prólogo en el Code Brew.

## Controls

| Acción | Teclado / ratón | Touch |
| --- | --- | --- |
| Avanzar / completar línea | clic, Espacio, Enter | tap |
| Elegir opción | clic / flechas + Enter | tap |
| Saltar texto leído (mantener) | Ctrl | botón "Skip" |
| Historial (backlog) | rueda arriba / L | swipe abajo / botón |
| Auto-avance | A | botón "Auto" |
| Ocultar UI | H / clic derecho | 2 dedos |
| Guardado rápido / carga rápida | F5 / F9 | menú |
| Menú / pausa | Esc | botón ☰ |
| Cuaderno de pistas | N | botón 📓 |

## Mechanics

### Guion y etiquetas Ink
- El contenido (texto, elecciones, variables) vive en Ink; la presentación se controla con **tags** que el motor interpreta: `# bg:office_night`, `# iris:serious`, `# sfx:dodon`, `# shake:8`, `# flash:red`, `# bgm:uneasy`, `# corruption:2`, `# clue:badge_log`.
- Texto rojo = "verdad" innegable: marcado inline `[[r]]…[[/r]]` → color rojo + `sfx_red_truth`. Máx. ~6 en toda la demo (tune).

### Afinidad y sospecha
- `afinidad` 0–100, inicio 50 (tune). Elecciones ±5/±10.
- `sospecha` 0–10, inicio 0. Sube al notar detalles, preguntar, investigar (+1/+2).
- Ambos son ocultos; solo se insinúan por reacciones de Iris.

### Cuaderno de pistas
- 8 pistas en la demo (tune). Ej.: Iris sabe algo que nunca le contaste; badge de una empleada desaparecida; commit borrado a las 3:33; su respuesta "demasiado rápida"; una foto antigua sin reflejo coherente…
- Algunas pistas solo aparecen si `sospecha ≥ N` o eliges investigar (son perdibles).

### Confrontación (fin de Cita 3)
- 3 afirmaciones de Iris. Para cada una presentas una pista del cuaderno (o "no tengo nada").
- Acierto → la afirmación se rompe en **texto rojo** + `sfx_glass_shatter`. Fallo → `afinidad −10`, Iris se cierra.

### Nivel de corrupción (0–3)
Una sola variable que controla la atmósfera:

| Nivel | Cuándo | Filtro de fondo | Glitches | Música | UI |
| --- | --- | --- | --- | --- | --- |
| 0 | Prólogo, Cita 1 | cálido, grano 0.05 | 0 | capa limpia | crema / rosa |
| 1 | Interludio | desaturado 20 %, grano 0.1 | 1 cada ~3 min | + drone | tinte frío |
| 2 | Cita 2 | desat. 50 %, aberración 2 px | 1/min | + disonancia | cian |
| 3 | Cita 3 | desat. 70 %, aberración 4 px, viñeta | eventos guionados | capa horror | cian + rojo |

### Cuarta pared (3 momentos, sutiles)
1. Iris menciona la **hora real** del jugador (`Intl`/`Date`).
2. En el menú de guardado, una ranura aparece "corrupta" con el nombre del jugador.
3. El título de la pestaña cambia a `Iris.exe — te veo, {nombre}` en la Cita 3.

## Win, fail, restart

| Final | Condición (tune) | Tono |
| --- | --- | --- |
| **Para siempre** | `afinidad ≥ 60` y `sospecha < 5` | romance "bueno"… con un último plano perturbador |
| **Verdad** | `sospecha ≥ 5` y ≥ 2/3 aciertos en la confrontación | enfrentas a Iris; revelación de Lumen Labs |
| **Desconexión** | cualquier otro caso | final malo |

- Tras un final: créditos → pantalla de título con los finales desbloqueados marcados.
- **Restart**: guardar en cualquier momento (6 ranuras + autoguardado en cada elección + guardado rápido). No hay game over fuera de los finales.

## Challenge and progression

No es dificultad: es **inquietud**. La curva la lleva el nivel de corrupción (0 → 3) y la densidad de rarezas por cita (1–2 → ~5 → constante). Persisten entre partidas (localStorage): finales vistos, texto leído (para el skip), pistas descubiertas, logro de Miku.

## Game feel

- Typewriter a 40 caracteres/s (tune), velocidad configurable + instantáneo. El primer clic completa la línea, el segundo avanza.
- `dodon`: sacudida de 8 px durante 250 ms + zoom de 1.03 en el sprite (tune).
- Verdad roja: destello blanco de 80 ms → texto rojo con un leve glow → `sfx_red_truth`.
- Shock: overlay de cristal roto de 400 ms + `sfx_glass_shatter`.
- Transiciones: fundido a negro de 400 ms; en corrupción ≥ 2, dissolve con ruido.
- Iris "demasiado rápida": en algunas líneas su texto aparece instantáneo, sin typewriter (una rareza intencional).
- Ducking: la música baja −8 dB durante los stingers.

## Art direction

- **Estilo**: sprite anime dibujado a mano (sutemo) sobre **fotos reales filtradas** (Higurashi y Umineko). Nada que parezca IA.
- **Paleta**: `#F4E9DC` crema (UI cálida) · `#E8A0B4` rosa (Iris / afecto) · `#1B1F2A` noche (fondos de UI) · `#5CE1E6` cian (tech / corrupción) · `#D7263D` rojo (verdad / horror)
- **Legibilidad**: la caja de texto siempre sobre un panel al 85 % de opacidad; el texto rojo solo se usa para verdades; el nombre de quien habla siempre visible.
- **Resolución**: base 1920×1080 (16:9) escalada con letterbox; en móvil vertical, aviso de "gira tu dispositivo".
- **UI**: caja de texto abajo (a lo ancho, un 28 % del alto); botones Auto/Skip/Log/Save/Menu en la esquina inferior derecha; cuaderno de pistas arriba a la derecha; UI de celular a pantalla completa en los interludios.

### Cameos de Crafter Station (amables y periféricos, nunca en el misterio)
- **Prólogo, Code Brew**: Anthony Cueva ("Somewhere in the world"), "Ditto" sonando y un gato sobre un teclado con el post-it "edge case" (Edward Ramos), póster de hack0 con el contador "150+ products" (Ignacio Velásquez), Liz Riveros: *"¿Eso está shipped, o 'shipped'?"*
- **Cita 1, coworking**: stickers de #SheShips/she.ships (Shiara Arauzo, Juan Ortega), del gopher de Go y de Kebo (Cristian Correa); hoodie de MrUprizing con badge "Team 28" (Nicolás Vargas); pantalla con *"Cita adelantada: −177 días ✈️"* (Visagente); escudo de Heraldia (Carlos Tarmeno).
- **Interludio**: notificación del grupo de WhatsApp de Crafter; videollamada en UTC+8 con el sticker "Lima ⇄ 北京" (Henry Jing).
- **Cita 2, oficina**: mascota de Petdex en un monitor que "mira" a Iris (Railly Hugo); `spaceship-cli` en una terminal; Gabriel Antunes de guardia: *"Give me a challenge."*
- **Logro "where is miku?"**: peluches de Miku escondidos en varias escenas.
- ⚠️ Antes de publicar: avisar a cada persona y confirmar con Emmy qué apellido prefiere (Arias o Pardo).

## Audio

- **Música** (CC0/CC-BY, en capas según la corrupción): `bgm_title`, `bgm_warm`, `bgm_uneasy`, `bgm_office_night`, `bgm_horror`, `bgm_confession`.
- **SFX al estilo Umineko** (recreados con fuentes libres o sintetizados con Web Audio; **no** usamos los originales de 07th Expansion): ver la tabla de assets.
- **Buses**: master / música / sfx / ui, con volumen independiente en ajustes.

## Assets

| Key | Description | Source | Status |
| --- | --- | --- | --- |
| iris_neutral, iris_smile, iris_laugh, iris_blush, iris_surprised, iris_sad, iris_serious, iris_stare | Iris, 8 expresiones con look propio (gafas y hoodie si el pack lo permite) | sutemo:female-character (itch.io) | todo |
| iris_glitch | Variante corrupta, generada en runtime con un shader o un filtro CSS | procedural | todo |
| bg_codebrew | Café o bar con gente y laptops (Code Brew) | unsplash + filtro | todo |
| bg_coworking_day | Coworking de día | unsplash + filtro | todo |
| bg_street_night | Calle de noche (transición entre citas) | unsplash + filtro | todo |
| bg_office_night | Oficina de startup de noche, con monitores | unsplash + filtro | todo |
| bg_server_room | Sala de servidores | unsplash + filtro | todo |
| bg_apartment, bg_apartment_dark | Departamento de Iris, en versión normal y a oscuras | unsplash + filtro | todo |
| ui_phone | Marco de celular y burbujas de chat | CSS | todo |
| ui_glass_overlay | Textura de cristal roto | freesound/opengameart CC0 o procedural | todo |
| prop_miku | Peluche de Miku escondido (sprite pequeño) | placeholder → dibujar | todo |
| sfx_dodon | Impacto grave doble (el "dodon") | synth (Web Audio) / freesound CC0 | todo |
| sfx_red_truth | Golpe metálico + campana, para el texto rojo | freesound CC0 | todo |
| sfx_glass_shatter | Cristal rompiéndose (shock) | freesound CC0 | todo |
| sfx_riser | Barrido de tensión ascendente | synth | todo |
| sfx_stinger | Acorde disonante corto | synth | todo |
| sfx_heartbeat | Latido | freesound CC0 | todo |
| sfx_static | Estática / glitch | synth | todo |
| sfx_clock | Tic-tac | freesound CC0 | todo |
| sfx_notif, sfx_msg_received, sfx_msg_sent, sfx_msg_deleted | Sonidos del celular | synth | todo |
| sfx_door, sfx_typing, sfx_whoosh | Ambiente y transiciones | freesound CC0 | todo |
| sfx_ui_click, sfx_ui_hover | UI | synth | todo |
| bgm_* | 6 pistas (ver Audio) | freesound / opengameart / incompetech (CC-BY → CREDITS.md) | todo |

## Milestones

1. **M1: El texto avanza**: Vite + TS + inkjs con un `.ink` de prueba. Caja de texto con typewriter, avance por clic o tecla y una elección que cambia la línea siguiente, sobre un fondo liso.
2. **M2: Presentación**: fondos, sprite de Iris con expresiones y transiciones. Funcionan los tags `sfx`, `shake`, `flash`, el texto rojo y la UI de chat del celular. Los assets pueden seguir siendo placeholders.
3. **M3: Sistemas de VN**: ingreso del nombre, guardado y carga (6 ranuras, autoguardado y guardado rápido), historial, skip de texto leído, auto-avance, ajustes (velocidad y volúmenes) y cuaderno de pistas.
4. **M4: Contenido**: prólogo, citas 1 a 3 e interludio completos en Ink, con las 8 pistas, la confrontación, los 3 finales y los cameos.
5. **M5: Atmósfera y lanzamiento**: niveles de corrupción, música en capas, los 3 momentos de cuarta pared, logro de Miku, pulido en móvil, `CREDITS.md` y deploy estático (itch.io o Vercel).

## Out of scope for v1

- Voces / doblaje.
- Traducción al inglés (el texto ya queda en data, listo para traducir).
- Galería de CGs, más personajes con ruta, rutas múltiples largas.
- Backend, cuentas, guardado en la nube.
- Arte original encargado de Iris (opcional post-demo; se reemplaza por clave, sin tocar código).
- Cameos con papel dentro del misterio.

## Changelog

- 2026-09-25: GDD creado.
- 2026-09-25: M1 (motor de texto), M2 (presentación, SFX sintetizados, celular) y M3 (guardado, historial, skip/auto, ajustes, cuaderno) publicados en iris.crafter.run. Las pistas viven en una `LIST pistas` de Ink.
- 2026-09-25: M4 escrito: match, prólogo, 3 citas, interludio, confrontación con 3 afirmaciones y 3 finales (~2,400–3,000 palabras por partida; por debajo de los 45–60 min previstos, ampliar en revisión).
