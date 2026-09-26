// Iris.exe — guion principal.
// Convención: "Nombre: texto" es diálogo; una línea sin prefijo es narración.
// Presentación con tags (ver README): # bg:… # iris:… # sfx:… # shake:… # flash:… # glass
// # phone:open|close # delete # input:var # pause:ms # titlecard # instant # ending:id
// Para M5 (todavía sin efecto): # bgm:… # corruption:0-3
// Verdad roja: [[r]]texto[[/r]]
// Los cameos de Crafter Station son siempre amables y periféricos (ver GDD).

EXTERNAL hora_actual()

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
