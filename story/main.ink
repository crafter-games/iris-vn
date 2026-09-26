// Iris.exe — guion principal.
// Convención: "Nombre: texto" es diálogo; una línea sin prefijo es narración.
// Presentación con tags (ver README): # bg:… # iris:… # sfx:… # shake:… # flash:… # glass
// # phone:open|close # chat:<iris|crafter|desconocido|borrado> # sys # delete # input:var
// # pause:ms # titlecard # instant # ending:id # credits (git log de créditos según el último final)
// Con el celular abierto, la narración sale como pensamiento fuera del teléfono;
// "# sys" la convierte en un aviso dentro del chat (fechas, "Tienes un nuevo match").
// En las opciones, [texto #pista] muestra el icono del cuaderno.
// Atmósfera: # bgm:<mood|none> # corruption:0-3 # glitch
// Cuarta pared: # tabtitle:<texto con $nombre> # corrupt_slot
// Susto: # scan ("Eco analiza tu perfil" con datos del navegador; nada sale del navegador)
// Easter egg: # miku:<id>@<x>,<y>  (peluche escondido, posición en % del escenario)
// Verdad roja: [[r]]texto[[/r]]
// Los cameos de Crafter Station son siempre amables y periféricos (ver GDD).

EXTERNAL hora_actual()
EXTERNAL ciudad()
EXTERNAL dispositivo()

VAR nombre = "Tú"
VAR afinidad = 50
VAR sospecha = 0
VAR aciertos = 0
VAR acciones_oficina = 0

// Pistas del cuaderno (textos en src/data/clues.ts). Todas empiezan sin descubrir.
LIST pistas = grupo_whatsapp, mensaje_borrado, respuesta_rapida, foto_noche, badge_empleada, commit_333, foto_reflejo, lumen_modelo

INCLUDE 00_match.ink
INCLUDE 01_prologo.ink
INCLUDE 02_cita1.ink
INCLUDE 03_interludio.ink
INCLUDE 04_cita2.ink
INCLUDE 05_cita3.ink
INCLUDE 06_finales.ink

-> match

// Respaldo si el motor no enlaza la función (p. ej. al probar el guion en Inky).
=== function hora_actual() ===
~ return "3:33"

=== function ciudad() ===
~ return "Lima"

=== function dispositivo() ===
~ return "tu laptop"
