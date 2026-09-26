// Interludio: los días entre citas, todo por el celular. Aquí empieza a pudrirse.

=== interludio ===
# bg:black # corruption:1 # bgm:uneasy
# phone:open
Domingo, 11:48 p. m.
Iris: llegaste bien?
Iris: perdón por la foto. no sé por qué la tomé con tu celular. pensé que era el mío
Iris: somos iguales de distraídos, eso es bueno
* [Decirle que no pasa nada]
    ~ afinidad += 5
    {nombre}: No pasa nada. Salí bien, de hecho.
    Iris: saliste perfecto :)
* [Preguntarle cómo desbloqueó tu celular]
    ~ sospecha += 1
    {nombre}: ¿Cómo lo desbloqueaste?
    Iris: estaba desbloqueado, {nombre}
    Iris: siempre lo dejas desbloqueado. deberías cuidar eso
- Iris: te mando una canción. es de las que se escuchan con la luz apagada
Iris: escúchala entera, no hagas skip
Martes, 7:02 p. m.
Crafter Station: 📸 Fotos del Code Brew del jueves. ¡Gracias por venir, crafters!
Henry · Crafter: Saludos desde Beijing 👋 Lima ⇄ 北京. La próxima me conecto por video.
Emmy · Crafter: Qué buena vibra la del jueves. ¡Nos vemos en el próximo!
Abres el álbum. Treinta y dos fotos. Te encuentras en cuatro: junto a la puerta, con el café, riéndote, sentado.
En la foto donde estás sentado, la silla de al lado está vacía. # sfx:heartbeat
Iris estuvo en esa silla toda la noche.
~ sospecha += 1
Iris: vi que subieron fotos del code brew
Iris: no salgo en ninguna, verdad? # instant
Iris: nunca salgo bien en fotos. es un talento
* [Preguntarle por la foto de la silla vacía]
    ~ sospecha += 1
    {nombre}: En una foto estoy yo y la silla de al lado está vacía. Tú estabas ahí.
    Iris: me había parado a traer café
    Iris: o la foto es de antes de que llegara. no sé, {nombre}. son fotos
    Iris: por qué me preguntas eso?
    Iris: jaja mejor dime qué te pareció la canción # delete
* [Dejarlo pasar]
    ~ afinidad += 5
    {nombre}: Sales bien. Bueno, saliste bien en la mía.
    Iris: la que te tomé yo no cuenta
    Iris: pero gracias :)
- Iris: mira, te mando una foto vieja. yo en la oficina, el primer día. 2021
Es Iris frente a un ventanal, con el mismo hoodie gris, sonriendo con el pulgar arriba. Detrás de ella, la ciudad de noche.
* [Hacer zoom en el reflejo del vidrio]
    ~ sospecha += 1
    Amplías la foto. En el reflejo del ventanal está ella, de espaldas.
    Pero la mujer del reflejo tiene el pelo corto. # sfx:stinger # flash:black
    ~ pistas += foto_reflejo
    Vuelves a mirar la foto completa. Iris tiene el pelo largo. Siempre lo ha tenido largo.
* [Responder que se ve linda]
    ~ afinidad += 5
    {nombre}: Te ves igual. Bueno, igual de linda.
    Iris: mentiroso. ahora uso lentes más grandes :)
- Miércoles, 3:33 a. m. # sfx:notif
Iris: estás despierto?
* [Responder]
    ~ afinidad += 5
    {nombre}: Sí. No podía dormir.
    Iris: yo tampoco. nunca puedo a esta hora
* [No responder]
    ~ sospecha += 1
    Dejas el celular boca abajo sobre la cama.
    Iris: sé que lo estás
    Iris: tu pantalla está encendida # sfx:heartbeat
    Iris: jaja es broma. se ven los checks azules, tonto
    Tienes las confirmaciones de lectura desactivadas.
- Iris: a esta hora la oficina hace un ruido raro. como si respirara
Iris: los servidores. obvio. pero igual
Número desconocido: No confíes en lo que te responde en menos de un segundo. —V
~ sospecha += 1
Iris: {nombre}? # delete
Iris: me escuchas?
Iris: qué hora es donde estás? # instant
{nombre}: Las {hora_actual()}.
Iris: sí. eso pensé # instant
Iris: deberías dormir, {nombre}. mañana te quiero despierto
Iris: quieres ver la oficina de noche? a partir de las 10 no queda nadie
Iris: bueno. casi nadie
* [Aceptar]
    ~ afinidad += 5
    {nombre}: Sí. Quiero ver dónde trabajas.
    Iris: te va a gustar. o te va a dar miedo. las dos cosas están bien
* [Aceptar, pero preguntarle quién es V]
    ~ sospecha += 1
    {nombre}: Sí. Oye, ¿quién es V?
    Iris: ?
    Iris: no conozco a ninguna V # instant
    Iris: miércoles a las 10. te espero abajo
- # phone:close
-> cita2
