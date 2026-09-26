# Character art credits

## Iris (`iris/iris_*.png`)

- **Source**: "Female Character Sprite for Visual Novel" by **sutemo**
  - https://sutemo.itch.io/female-character
  - Author links: https://www.deviantart.com/stereo-mono · https://ko-fi.com/sutemo
- **File used**: `Female Sprite by Sutemo.zip` → `Female Sprite by Sutemo.psd` (bust-up, 1011×1145 px, uploaded May 17, 2020; free download, downloaded 2026-09-25)
- **Itch.io page tag**: "No generative AI was used" (hand-drawn)
- **License (verbatim from the itch.io page)**:
  > This sprite can be used in personal or commercial projects. however you can't resell the sprite on its own.

  No attribution is required by the text, but we credit the author anyway.
  Do not redistribute or sell these sprite files as standalone assets.

### Layers used (same for every expression)

| PSD group | Layer |
| --- | --- |
| Hair behind | Long Hair / Hime Cut → Dark |
| Base Body | Base Body |
| Costume | Hoodie 1 (recolored from mint green to gray; the "42" print and white hood lining untouched) |
| Hair front | Long Hair → Dark |
| Accessories | Circle Glasses (lens white fill reduced to ~30% of its original opacity, glasses moved up 28 px so the eyes sit centered in the lenses) |

### Expressions

| File | PSD layers |
| --- | --- |
| `iris_neutral.png` | Expression → normal |
| `iris_smile.png` | Expression → Smile |
| `iris_laugh.png` | Expression → Laugh |
| `iris_blush.png` | Expression → Smile 2 + Blush → 2 |
| `iris_surprised.png` | Expression → Shocked |
| `iris_sad.png` | Expression → Sad |
| `iris_serious.png` | Expression → Annoyed |
| `iris_stare.png` | Custom mix: Expression → Shocked (eyes and brows, above y=585) + Expression → normal (mouth) |

Layer stacking follows the PSD order: hair behind, body, blush, costume, hair front, expression, accessories.
Modifications (recolor, lens opacity, glasses offset, expression mix, crop) were made for this game.

### Creepy / distorted variants (same layers, same 842×1020 canvas and alignment)

All derived from the same sutemo PSD layers and look (Long Hair/Hime Cut Dark back, Long Hair Dark front, gray Hoodie 1, Circle Glasses +28 px). Pixel edits were done by us with a script (no AI generation).

| File | Base layers | Edits |
| --- | --- | --- |
| `iris_creepy.png` | Expression → Smile | Higurashi-style shadow band: purple multiply gradient (fading in from the bangs, strongest at the brows/upper lids, gone just below the eyes) applied only to the Base Body skin and the expression layer (hair, glasses and background untouched). Irises repainted inside a fitted ellipse as flat dark mauve-gray with a dark limbal ring and a 3 px black pinpoint pupil; all catchlights and pink highlights removed; lash/outline pixels kept. Faint cold diagonal glare streaks inside the glasses lenses. |
| `iris_hollow.png` | Expression → normal (flat mouth) | Opaque eye pixels (sclera + iris) filled near-black (soft peach eyelid tint left alone), tiny dim red pinpoint with a faint glow at each iris center, light shadow over the upper face, whole sprite desaturated ~40% and cooled. |
| `iris_glitch.png` | `iris_stare.png` | Premultiplied RGB split (red sampled 6 px right → shifts left; green/blue sampled 6 px left → cyan shifts right), 6 horizontal slices displaced 12–40 px moving RGBA (vacated pixels become transparent), scanlines on every 3rd row (−18%), a few thin cyan lines. |
