// Prólogo: el Code Brew de Crafter Station. Todo es cálido; solo una o dos cosas no encajan.

=== prologo ===
# phone:close # pause:900
# sfx:dodon # shake:10 # titlecard
# bg:codebrew # sfx:whoosh # bgm:warm
Jueves, 8:12 p. m. Un Code Brew de Crafter Station en Barranco.
Huele a café recalentado y a laptops que llevan demasiadas horas encendidas.
Anthony presenta la noche con un micrófono que suena solo cuando quiere. En su gafete, donde debería ir la ciudad, dice "Somewhere in the world".
Alguien presenta una demo que falla dos veces. Todos aplauden igual. Así funcionan estas cosas.
En una mesa del fondo, un gato duerme sobre un teclado. Al lado, un post-it: "edge case".
Por los parlantes suena "Ditto". Nadie sabe quién la puso, pero nadie la cambia.
Liz pasa con una tablet llena de tarjetas de colores y le pregunta a alguien, con toda la calma del mundo:
Liz: ¿Eso está shipped, o "shipped"?
Te quedas cerca de la puerta, con un vaso de café que no pediste, mirando un póster de hack0 que dice "150+ products launched".
# iris:smile
Iris: ¿{nombre}? Eres tú, ¿no? El del match.
Es más bajita de lo que imaginabas. Lentes redondos, hoodie gris, el pelo largo recogido con un lápiz.
Iris: Perdón, te reconocí por la foto. Bueno… por la foto y porque eres el único que no está mirando una pantalla. # iris:laugh
* [Sonreír y saludarla]
    ~ afinidad += 5
    {nombre}: Hola. Sí, soy yo. Eres más… real que en la app.
    Iris: Es el ángulo. Siempre me tomo fotos desde arriba, como una cámara de seguridad. # iris:smile
    Iris: …Eso sonó raro. Olvídalo. # iris:blush
* [Preguntarle cómo supo cuál eras]
    ~ sospecha += 1
    {nombre}: ¿Cómo sabías que era yo? Hay como treinta personas acá.
    Iris: Ya te dije. La foto. # iris:serious # instant
    Responde antes de que termines la pregunta. Medio segundo antes. # sfx:heartbeat
    ~ pistas += respuesta_rapida
    Iris: Además estabas parado como alguien que quiere irse. Es fácil de detectar. # iris:smile
- Iris se sienta a tu lado y abre su laptop. En la tapa hay un sticker que dice "LUMEN LABS". # iris:neutral
Iris: Trabajo ahí. Entrenamos modelos de lenguaje. Nada interesante, en serio.
Iris: Hacemos que los bots hablen como personas. O que las personas… no, olvídalo, eso es el pitch.
* [Preguntar qué hacen exactamente]
    {nombre}: ¿Cómo que hacen que los bots hablen como personas?
    Iris: Si le das a un modelo suficientes conversaciones de alguien, aprende a responder como esa persona. Su ritmo, sus muletillas, lo que nunca diría. # iris:serious
    Iris: Nosotros lo usamos para atención al cliente. Aburridísimo. # iris:smile
    Lo dice como quien recita algo que le hicieron aprender.
* [Contarle qué haces tú]
    ~ afinidad += 5
    {nombre}: Yo hago backend. APIs, colas, cosas que se rompen a las 3 de la mañana.
    Iris: Ah, eres de los que sostienen el mundo sin que nadie se entere. # iris:laugh
    Iris: Me gusta eso. La gente invisible sabe muchas cosas.
- En el escenario, alguien del equipo de Lumen Labs presenta: "Eco, el asistente que te sugiere qué responder en tus chats".
Eco predice la siguiente frase de la otra persona con un 94% de precisión. La sala hace "ohhh".
Iris no aplaude. Mira la pantalla como si fuera un examen que ya reprobó una vez. # iris:serious
{nombre}: ¿No te gusta?
Iris: Me gusta demasiado. Ese es el problema. # iris:neutral
Iris: Oye. ¿Estás libre el sábado? Hay un coworking en Miraflores que abre los sábados. Tiene el mejor café de Lima y nadie lo sabe. # iris:smile
* [Aceptar sin pensarlo]
    ~ afinidad += 10
    {nombre}: Sí. Claro que sí.
    Iris: Perfecto. Ya lo sabía, pero es bonito escucharlo. # iris:laugh
* [Aceptar, pero bromear con que una cita en un coworking es muy de dev]
    ~ afinidad += 5
    {nombre}: ¿Una cita en un coworking? Qué romántico.
    Iris: Es el único lugar donde sé qué hacer con las manos. # iris:blush
    Iris: Sábado, 4 p. m. Te mando la ubicación.
- Cuando te vas, la miras desde la puerta. Sigue sentada frente a su laptop, escribiendo rápido. # iris:hide
Tu celular vibra antes de que llegues a la esquina. # sfx:notif
Es la ubicación del sábado. La mandó cuando todavía la estabas mirando, y ella no había tocado el celular.
-> cita1
