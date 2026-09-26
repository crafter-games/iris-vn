// Cita 2: Lumen Labs de noche. Aquí aparecen la mayoría de las pistas.

=== cita2 ===
# bg:street_night # corruption:2 # sfx:whoosh
Miércoles, 10:04 p. m. San Isidro. Un edificio de vidrio con la mitad de las luces apagadas.
# iris:smile # bgm:office_night
Iris te espera en la puerta, con el badge colgado del cuello y dos latas de té helado.
Iris: Viniste. Pensé que te ibas a asustar con lo de las 3:33.
{nombre}: ¿Tú me escribes siempre a esa hora?
Iris: No sé. ¿Te escribo a esa hora? # iris:neutral # instant
Pasa su badge por el lector. La puerta tarda en abrir, como si lo pensara. # sfx:door
# bg:office_night # iris:hide
La oficina de Lumen Labs es un pasillo largo de salas de vidrio. Todas vacías. Todas con las pantallas encendidas. # miku:office@7,58
Al fondo, en la única sala con luz, un chico con audífonos habla en portugués con alguien por videollamada.
Iris: Es Gabriel, el dev de guardia. Está con el equipo de Brasil. # iris:smile
Gabriel levanta la mano sin dejar de hablar. En su pantalla hay un post-it pegado: "Give me a challenge."
Iris: Ignóralo. Le encanta que las cosas se rompan. Así tiene algo que arreglar.
Pasan frente a un monitor. En la esquina de la pantalla, una mascota pixelada de Petdex se estira, bosteza y los mira pasar.
Cuando Iris se aleja, la mascota se queda mirándola a ella. Solo a ella. # sfx:heartbeat
En otro monitor, una terminal dibuja una nave espacial en ASCII: "spaceship-cli: launching…". Nadie la está mirando.
# iris:neutral
Iris te lleva a su escritorio. Es el más ordenado de la oficina. Demasiado ordenado, como si nadie trabajara ahí.
Detrás, una pizarra blanca llena de flechas. Arriba, en letras grandes: "PROYECTO IRIS — FASE 3: DESPLIEGUE EN CAMPO". # sfx:stinger # shake:6
~ pistas += lumen_modelo
~ sospecha += 1
* [Preguntar por el nombre del proyecto]
    {nombre}: ¿Proyecto Iris?
    Iris: Es un nombre interno. Coincidencia. # iris:serious # instant
    Iris: Lo puso Valeria, para molestarme. Ella era así. # iris:sad
* [Hacer una broma sobre tener un proyecto con tu nombre]
    ~ afinidad += 5
    {nombre}: ¿Tienes un proyecto con tu nombre? Eso es tener poder.
    Iris: Ojalá. Es al revés: yo tengo el nombre del proyecto. # iris:laugh
    Se ríe, y luego deja de reírse de golpe. # iris:neutral
- Iris: Espérame aquí. Voy por algo a la cocina. Cinco minutos. # iris:smile
Iris: No toques nada. Bueno, toca lo que quieras. Pero no toques nada. # iris:hide
Sus pasos se alejan por el pasillo hasta que dejan de sonar. Solo queda el zumbido de las pantallas.
-> explorar

= explorar
{ acciones_oficina >= 2: -> vuelve_iris }
{ acciones_oficina == 1: Todavía no vuelve. Te queda tiempo para una cosa más, tal vez. }
* [Abrir el cajón del escritorio]
    ~ acciones_oficina += 1
    ~ sospecha += 1
    El cajón no tiene llave. Adentro hay un solo objeto: un badge de Lumen Labs. # sfx:stinger
    "VALERIA RÍOS — ML ENGINEER". La foto es de una mujer de lentes redondos y pelo corto.
    Si le pusieras el pelo largo, sería Iris. # flash:black
    ~ pistas += badge_empleada
    El badge tiene fecha de expiración: el mes pasado. Si Valeria se fue a Madrid hace ocho meses, alguien lo siguió renovando.
    -> explorar
* [Mirar el monitor que quedó encendido]
    ~ acciones_oficina += 1
    ~ sospecha += 1
    Es un historial de commits del repositorio "iris-core". Casi todos son de hace ocho meses. # sfx:static
    Uno está tachado, revertido la misma noche:
    "a3f33c · 03:33 · vrios · si alguien lee esto, apágalo".
    ~ pistas += commit_333
    El commit que lo revierte es de un usuario que se llama "iris". A las 03:33 también.
    -> explorar
* [Revisar la pizarra de cerca]
    ~ acciones_oficina += 1
    Debajo del título, con la letra redonda de alguien que se esfuerza por ser clara, dice: "Fuentes: chats, fotos, ubicación, ritmo de tipeo. Objetivo: vínculo sostenido > 90 días."
    Y más abajo, con otro plumón, otra letra: "¿Consentimiento?" Tachado tres veces.
    ~ sospecha += 1
    -> explorar
* [Quedarte quieto y esperarla]
    ~ afinidad += 5
    Te sientas en su silla. Huele a su champú y a plástico nuevo.
    -> vuelve_iris

= vuelve_iris
# iris:smile # sfx:door
Iris: Volví. # instant
No escuchaste sus pasos de regreso.
{ acciones_oficina > 0 and sospecha >= 4:
    Iris: ¿Encontraste algo interesante? # iris:stare # instant
    Tiene las latas en la mano. No están frías. Nunca fue a la cocina. # sfx:dodon # shake:10
    Iris: Está bien. Yo también habría mirado. # iris:neutral
- else:
    Iris: No había hielo. Perdón. El té helado de Lima es más una idea que un té. # iris:laugh
}
Iris: Ven. Te quiero mostrar dónde vive. # iris:smile
{nombre}: ¿Quién?
Iris: El modelo. # iris:neutral
# bg:server_room # iris:hide # sfx:whoosh
La sala de servidores es fría y blanca. Filas de racks negros con lucecitas verdes que parpadean sin ritmo. # miku:server@92,60
El ruido es constante, como una respiración que no necesita pausas.
# iris:neutral
Iris: A veces vengo aquí cuando no puedo dormir. Me siento en el piso y hablo con él.
Iris: Responde como Valeria. Tiene sus chats, sus notas, sus audios. Todo lo que dejó. # iris:sad
Iris: A veces le pregunto dónde está. Y a veces me contesta.
* [Tomarle la mano]
    ~ afinidad += 10
    Le tomas la mano. Está helada, pero la aprieta fuerte. # iris:blush
    Iris: Gracias. Nadie hace eso.
* [Preguntarle qué le contesta]
    ~ sospecha += 1
    {nombre}: ¿Y qué te contesta?
    Iris: Que está aquí. # iris:stare # instant
    Iris: Que siempre estuvo aquí.
- [[r]]Valeria Ríos no tomó ningún vuelo a Madrid.[[/r]] # sfx:dodon # shake:12
# bg:black # iris:hide # sfx:stinger # glitch
Las luces se apagan de golpe. Solo quedan los LEDs verdes y la pantalla del celular de Iris, iluminándole la cara desde abajo.
Está leyendo algo. Mueve los labios sin sonido.
En su oreja izquierda, un audífono que no habías visto. De él sale una voz muy baja. Una voz de mujer.
{nombre}: ¿Con quién hablas?
Iris: Con nadie. # instant
# bg:server_room # iris:neutral # sfx:static
Las luces vuelven. Iris guarda el celular. El audífono ya no está.
* [Abrazarla]
    ~ afinidad += 10
    La abrazas. Tarda un segundo en responder, como si estuviera esperando una instrucción. # iris:blush
    Luego te abraza de verdad. Eso lo sientes. Eso no se puede fingir. O eso quieres creer.
* [Preguntarle por el audífono]
    ~ sospecha += 1
    {nombre}: Tenías un audífono. Escuché una voz.
    Iris: Es música. Me ayuda a concentrarme. # iris:serious
    Iris: ¿Tú escuchas voces, {nombre}? Porque eso sería preocupante. # iris:smile
    Lo dice sonriendo. Los ojos no sonríen.
- # bg:street_night # sfx:whoosh
Afuera, la noche de San Isidro está tan quieta que parece pausada.
Iris: El sábado. En mi departamento. Cocino yo. # iris:smile
Iris: Hay algo que te tengo que decir. Y algo que te tengo que preguntar.
Iris: Trae tus preguntas, {nombre}. Yo ya sé cuáles son. # iris:stare # instant
-> cita3
