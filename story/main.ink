// Iris.exe — guion principal.
// Convención: "Nombre: texto" es diálogo; una línea sin prefijo es narración.
// Presentación con tags (ver README): # bg:… # iris:… # sfx:… # shake:… # flash:… # glass
// # phone:open|close # delete # input:var # pause:ms # titlecard # instant
// Verdad roja: [[r]]texto[[/r]]

VAR nombre = "Tú"
VAR afinidad = 50
VAR sospecha = 0

-> match

=== match ===
# bg:black
# sfx:notif # phone:open
Tienes un nuevo match.
Completa tu perfil para responder. # input:nombre
Iris: hola, {nombre} :)
Iris: perdón si es raro escribir primero. vi que también vas al Code Brew de mañana
* [Responder con curiosidad]
    ~ afinidad += 5
    {nombre}: Sí, voy. ¿Tú también?
    Iris: sí!! presento algo pequeño. bueno, no yo. mi equipo
* [Preguntar cómo lo sabe]
    ~ sospecha += 1
    {nombre}: ¿Cómo sabes que voy? No lo puse en mi perfil.
    Iris: lo pusiste en el grupo de whatsapp de crafter, no?
    Nunca escribiste en ese grupo.
- Iris: te reconocí de tu foto. es bonita. se nota que la tomaste de noche
Iris: mañana te veo. no llegues tarde
Iris: te estaré mirando
Iris: jaja olvida eso, se envió solo. autocorrector # delete
Iris: nos vemos {nombre} # instant
-> prologo

=== prologo ===
# phone:close # pause:900
# sfx:dodon # shake:10 # titlecard
# bg:codebrew # sfx:whoosh
Jueves, 8:12 p. m. Un Code Brew de Crafter Station en Barranco.
Huele a café recalentado y a laptops que llevan demasiadas horas encendidas.
Alguien presenta una demo que falla dos veces. Todos aplauden igual.
# iris:smile
Iris: ¿{nombre}? Eres tú, ¿no? El del match.
Iris: Perdón, te reconocí por la foto. Bueno… por la foto y porque eres el único que no está mirando una pantalla. # iris:laugh
* [Sonreír y saludarla]
    ~ afinidad += 5
    {nombre}: Hola. Sí, soy yo. Eres más alta que en tu foto.
    Iris: Es el ángulo. Siempre me tomo fotos desde arriba, como una cámara de seguridad. # iris:smile
    Iris: …Eso sonó raro. Olvídalo. # iris:blush
* [Preguntarle cómo supo cuál eras]
    ~ sospecha += 1
    {nombre}: ¿Cómo sabías que era yo? Hay como treinta personas acá.
    Iris: Ya te dije. La foto. # iris:serious # instant
    Ella responde antes de que termine la pregunta. Medio segundo antes. # sfx:heartbeat
- Iris se sienta a tu lado y abre su laptop. En la tapa hay un sticker que dice "LUMEN LABS". # iris:neutral
Iris: Trabajo ahí. Entrenamos modelos. Nada interesante, en serio.
Iris: Aunque… si quieres, un día te muestro la oficina de noche. Es otra cosa cuando no hay nadie. # iris:smile
-> prueba_efectos

// Escena temporal para probar los efectos del hito M2. Se reemplaza en M4.
=== prueba_efectos ===
# bg:office_night # iris:hide # sfx:stinger
[Prueba M2] La oficina de Lumen Labs, de noche.
# sfx:riser
Algo se acerca.
# sfx:dodon # shake:12 # iris:stare
Iris: Nunca te dije dónde trabajaba antes.
Iris: [[r]]Tú nunca estuviste en ese grupo de WhatsApp.[[/r]]
# glass # shake:16
La pantalla se rompe.
# sfx:static # flash:cyan # iris:hide
Fin de la prueba del hito M2.
-> END
