// Iris.exe — guion principal.
// Convención: "Nombre: texto" es diálogo; una línea sin prefijo es narración.
// La presentación (fondos, sprites, sonido) va en tags: # bg:… # iris:… # sfx:…

VAR nombre = "Tú"
VAR afinidad = 50
VAR sospecha = 0

-> prologo

=== prologo ===
Jueves, 8:12 p. m. Un Code Brew de Crafter Station en Barranco.
Huele a café recalentado y a laptops que llevan demasiadas horas encendidas.
Alguien presenta una demo que falla dos veces. Todos aplauden igual.
Iris: ¿{nombre}? Eres tú, ¿no? El del match.
Iris: Perdón, te reconocí por la foto. Bueno… por la foto y porque eres el único que no está mirando una pantalla.
* [Sonreír y saludarla]
    ~ afinidad += 5
    {nombre}: Hola. Sí, soy yo. Tú eres más alta que en tu foto.
    Iris: Es el ángulo. Siempre me tomo fotos desde arriba, como una cámara de seguridad.
    Iris: …Eso sonó raro. Olvídalo.
* [Preguntarle cómo supo cuál eras]
    ~ sospecha += 1
    {nombre}: ¿Cómo sabías que era yo? Hay como treinta personas acá.
    Iris: Ya te dije. La foto.
    Ella responde antes de que termine la pregunta. Medio segundo antes.
- Iris se sienta a tu lado y abre su laptop. En la tapa hay un sticker que dice "LUMEN LABS".
Iris: Trabajo ahí. Entrenamos modelos. Nada interesante, en serio.
Iris: Aunque… si quieres, un día te muestro la oficina de noche. Es otra cosa cuando no hay nadie.
-> fin_prueba

=== fin_prueba ===
Fin de la prueba del hito M1.
-> END
