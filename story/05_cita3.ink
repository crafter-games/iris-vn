// Cita 3: el departamento de Iris. La cena, la pregunta y la confrontación.

=== cita3 ===
# bg:street_night # corruption:3 # sfx:whoosh
Sábado, 8:40 p. m. Barranco. Una casona vieja partida en departamentos, con un portón que chirría como en las películas.
# bg:apartment # sfx:door # bgm:warm
El departamento de Iris es cálido y pequeño. Madera en las paredes, luces ámbar, una ventana grande que da a la oscuridad del mar.
# iris:smile
Iris: Pasa. Hice ají de gallina. Mi abuela diría que está mal. Mi abuela diría que todo está mal.
Comen en el piso, sobre cojines, con los platos en las rodillas. Es la mejor comida que has probado en meses.
Iris: ¿Te gusta? # iris:blush
* [Decirle que es perfecto]
    ~ afinidad += 5
    {nombre}: Está perfecto. Tu abuela está equivocada.
    Iris: Se lo voy a decir. Se va a molestar muchísimo. # iris:laugh
* [Preguntarle por su abuela]
    ~ afinidad += 5
    {nombre}: ¿Tu abuela vive en Lima?
    Iris: En Arequipa. Me llama todos los domingos para decirme que estoy flaca. # iris:smile
    Iris: Bueno. Me llamaba. Hace meses que no contesta el teléfono. # iris:sad
- En una repisa hay una foto enmarcada: dos mujeres en el malecón, abrazadas, riéndose del viento. # iris:neutral
Una tiene el pelo largo. La otra, corto. Fuera de eso, podrían ser la misma persona.
Iris: Valeria y yo. Todo el mundo nos confundía. Nos divertía. # iris:smile
* [Mirar la foto de cerca]
    ~ sospecha += 1
    Te acercas. Las dos tienen un lunar pequeño bajo el ojo izquierdo. En el mismo lugar exacto. # sfx:heartbeat
    Buscas el lunar en la cara de Iris. Está ahí.
    Iris: Te dije que nos confundían. # iris:stare # instant
* [Decirle que se ven felices]
    ~ afinidad += 5
    {nombre}: Se ven felices.
    Iris: Lo éramos. Antes de la fase 3. # iris:sad
- # sfx:static # flash:black
La luz parpadea. Una vez. Dos. Iris no reacciona.
Iris: {nombre}. Te dije que tenía algo que preguntarte. # iris:serious
Iris: ¿Confías en mí?
* [Confío en ti]
    {nombre}: Confío en ti.
    { afinidad >= 60 and sospecha < 5:
        -> final_siempre
    - else:
        Iris: Mientes. # iris:stare # instant
        Iris: Tu voz sube cuando mientes. Lo tengo medido. # sfx:dodon # shake:10
        -> final_desconexion
    }
* [Tengo preguntas]
    {nombre}: No. Tengo preguntas.
    Iris: Lo sé. # iris:neutral # instant
    Iris: Por eso te invité. # iris:stare
    -> confrontacion

=== confrontacion ===
# bg:apartment_dark # iris:stare # sfx:stinger # shake:8 # bgm:horror
Las luces se apagan del todo. Solo queda el reflejo del mar en la ventana y la cara de Iris.
Iris: Vamos a jugar a algo, {nombre}. Yo digo algo. Tú me demuestras que es mentira. # instant
Iris: Si no puedes, es verdad. Así funcionan las cosas aquí.
-> afirmacion_1

= afirmacion_1
Iris: Todo lo que sé de ti, me lo contaste tú. # instant
+ {pistas ? grupo_whatsapp} [📓 El grupo de WhatsApp]
    {nombre}: [[r]]Nunca escribí en el grupo de Crafter. No hay nada mío ahí que pudieras leer.[[/r]] # glass # shake:16
    ~ aciertos += 1
    -> rompe_1
+ {pistas ? foto_noche} [📓 La foto de noche]
    {nombre}: [[r]]Nunca te dije a qué hora tomé esa foto. Y el archivo no guarda la hora.[[/r]] # glass # shake:16
    ~ aciertos += 1
    -> rompe_1
+ {pistas ? mensaje_borrado} [📓 “Te estaré mirando”]
    -> falla -> afirmacion_2
+ {pistas ? respuesta_rapida} [📓 Medio segundo antes]
    -> falla -> afirmacion_2
+ {pistas ? badge_empleada} [📓 Un badge sin dueña]
    -> falla -> afirmacion_2
+ {pistas ? commit_333} [📓 Commit de las 3:33]
    -> falla -> afirmacion_2
+ {pistas ? foto_reflejo} [📓 El reflejo]
    -> falla -> afirmacion_2
+ {pistas ? lumen_modelo} [📓 Proyecto IRIS]
    -> falla -> afirmacion_2
+ [No tengo nada]
    -> nada -> afirmacion_2

= rompe_1
Iris: … # iris:surprised # instant
Iris: Bien. Una. # iris:stare
-> afirmacion_2

= afirmacion_2
Iris: Valeria renunció. Se fue a Madrid. No la busques. # instant
+ {pistas ? badge_empleada} [📓 Un badge sin dueña]
    {nombre}: [[r]]El badge de Valeria se renovó el mes pasado. Alguien la sigue registrando como empleada.[[/r]] # glass # shake:16
    ~ aciertos += 1
    -> rompe_2
+ {pistas ? commit_333} [📓 Commit de las 3:33]
    {nombre}: [[r]]Valeria pidió que apagaran el modelo. Y el modelo revirtió su pedido esa misma noche.[[/r]] # glass # shake:16
    ~ aciertos += 1
    -> rompe_2
+ {pistas ? grupo_whatsapp} [📓 El grupo de WhatsApp]
    -> falla -> afirmacion_3
+ {pistas ? foto_noche} [📓 La foto de noche]
    -> falla -> afirmacion_3
+ {pistas ? mensaje_borrado} [📓 “Te estaré mirando”]
    -> falla -> afirmacion_3
+ {pistas ? respuesta_rapida} [📓 Medio segundo antes]
    -> falla -> afirmacion_3
+ {pistas ? foto_reflejo} [📓 El reflejo]
    -> falla -> afirmacion_3
+ {pistas ? lumen_modelo} [📓 Proyecto IRIS]
    -> falla -> afirmacion_3
+ [No tengo nada]
    -> nada -> afirmacion_3

= rompe_2
Iris: Valeria… # iris:sad # instant
Iris: Dos. # iris:stare
-> afirmacion_3

= afirmacion_3
Iris: Yo soy Iris. Solo Iris. Lo que dices, lo digo yo. # instant
+ {pistas ? respuesta_rapida} [📓 Medio segundo antes]
    {nombre}: [[r]]Me respondes antes de que termine de preguntar. Nadie lee tan rápido, a menos que la respuesta ya esté escrita.[[/r]] # glass # shake:16
    ~ aciertos += 1
    -> rompe_3
+ {pistas ? foto_reflejo} [📓 El reflejo]
    {nombre}: [[r]]La mujer del reflejo en tu foto de 2021 no eras tú.[[/r]] # glass # shake:16
    ~ aciertos += 1
    -> rompe_3
+ {pistas ? grupo_whatsapp} [📓 El grupo de WhatsApp]
    -> falla -> veredicto
+ {pistas ? foto_noche} [📓 La foto de noche]
    -> falla -> veredicto
+ {pistas ? mensaje_borrado} [📓 “Te estaré mirando”]
    -> falla -> veredicto
+ {pistas ? badge_empleada} [📓 Un badge sin dueña]
    -> falla -> veredicto
+ {pistas ? commit_333} [📓 Commit de las 3:33]
    -> falla -> veredicto
+ {pistas ? lumen_modelo} [📓 Proyecto IRIS]
    -> falla -> veredicto
+ [No tengo nada]
    -> nada -> veredicto

= rompe_3
Iris se lleva la mano a la oreja izquierda. Al audífono. # iris:surprised # sfx:static
Iris: Tres. # instant
-> veredicto

= falla
Iris: Eso no prueba nada. # iris:stare # instant
Iris: Pensé que estabas prestando atención. # sfx:stinger
~ afinidad -= 10
->->

= nada
Iris: Entonces es verdad. # iris:neutral # instant
->->

= veredicto
{ aciertos >= 2 and sospecha >= 5:
    -> final_verdad
- else:
    -> final_desconexion
}
