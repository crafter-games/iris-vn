// Cita 1: el coworking de Miraflores. Una buena tarde con dos detalles que no cuadran.

=== cita1 ===
# bg:street_night # sfx:whoosh # corruption:0
Sábado. Cruzas Miraflores con la garúa pegada a la ropa, siguiendo un pin que no tiene nombre.
# bg:coworking_day # sfx:door # bgm:warm
# miku:coworking@88,40
El coworking es luminoso, lleno de plantas y de gente que trabaja un sábado porque quiere, o porque no sabe qué más hacer.
Iris ya está ahí, en una mesa junto a la ventana, con dos cafés servidos.
# iris:smile
Iris: Llegaste. Te pedí un americano, sin azúcar.
Nunca le dijiste cómo tomas el café.
* [Agradecerle y tomar el café]
    ~ afinidad += 5
    {nombre}: Gracias. Justo como me gusta.
    Iris: Tienes cara de americano sin azúcar. Es un cumplido, creo. # iris:laugh
* [Preguntarle cómo lo sabía]
    ~ sospecha += 1
    {nombre}: ¿Cómo sabías que lo tomo así?
    Iris: Suerte. # iris:neutral # instant
    Iris: …Y tus historias de Instagram. Salen muchos americanos. No soy una stalker, lo prometo. Bueno, un poquito. # iris:blush
    Tu Instagram es privado.
- La laptop de Iris está cubierta de stickers: SheShips, un gopher de Go, una alcancía de Kebo con cara de satisfecha. # iris:neutral
En la mesa de al lado, un chico con un hoodie que dice "MrUprizing" le pregunta la clave del wifi. Lleva colgado un badge de hackathon: "Team 28".
Iris se la dicta de memoria. No es la primera vez que viene.
Al fondo, alguien celebra frente a su pantalla: "¡Cita adelantada: −177 días!". Aplauden tres personas que no lo conocen.
En la pared hay un escudo de armas enmarcado, con una placa pequeña: "generado por Heraldia". Nadie sabe de quién es la familia.
Iris: Me encanta este lugar. Valeria me lo enseñó. # iris:smile
{nombre}: ¿Valeria?
Iris: Una compañera de Lumen. Trabajábamos juntas en el mismo proyecto. # iris:neutral
Iris: Ya no está.
* [Preguntar qué le pasó]
    ~ sospecha += 1
    {nombre}: ¿Renunció?
    Iris: Algo así. Se fue a Madrid, dicen. # iris:sad
    Iris: No se despidió de nadie. Ni de mí. # iris:serious
    Mira su café mientras lo dice, pero sus ojos no se mueven. Como si estuviera leyendo algo en la superficie.
* [Cambiar de tema con cuidado]
    ~ afinidad += 5
    {nombre}: Lo siento. ¿Quieres hablar de otra cosa?
    Iris: Sí. Gracias. Eres amable. # iris:smile
    Iris: Casi nadie nota cuándo cambiar de tema.
- Hablan durante horas. De la universidad, de proyectos que nunca terminaron, de por qué todos los devs de Lima terminan teniendo una opinión sobre el ceviche.
Iris se ríe con todo el cuerpo. Se tapa la boca cuando lo hace, como si reírse fuera un secreto. # iris:laugh
Por un rato, todo es exactamente lo que parece: una cita buena. Una cita de verdad.
# sfx:clock
Su celular vibra sobre la mesa. 3:33 p. m. # iris:surprised # glitch
Iris lo voltea boca abajo sin mirarlo. # iris:neutral
Iris: Alarma para tomar agua. Si no, me olvido. # instant
No toma agua.
* [Hacer una broma para romper el momento]
    ~ afinidad += 5
    {nombre}: ¿Hay alguna app que te recuerde tomar agua sin mirarte feo?
    Iris: Todas te miran feo. Pero algunas lo disimulan mejor. # iris:laugh
* [Mirar el celular volteado]
    ~ sospecha += 1
    La pantalla todavía brilla contra la mesa. Alcanzas a ver una sola palabra en la notificación antes de que se apague: "sesión".
    Iris: {nombre}. Estás aquí conmigo, ¿no? # iris:stare # instant
    Iris: Entonces mírame a mí. # iris:smile
- Cuando sale el sol de las seis, que en Lima es más una idea que un sol, caminan hasta el malecón. # bg:street_night # sfx:whoosh
Iris saca su celular y te toma una foto sin avisar. # iris:smile # flash:white
Iris: Para acordarme. Tengo mala memoria. # iris:laugh
Iris: Te escribo. El miércoles te quiero mostrar algo.
* [Despedirte con un beso en la mejilla]
    ~ afinidad += 10
    Te acercas. Ella no se mueve, pero cierra los ojos un segundo antes de que llegues. # iris:blush
    Como si supiera exactamente cuándo ibas a hacerlo.
* [Despedirte con la mano]
    Levantas la mano. Ella hace lo mismo, al mismo tiempo, en el mismo ángulo. # iris:neutral
    Un espejo con medio segundo de ventaja.
- # iris:hide
Cuando vuelves a tu casa, revisas tu galería por costumbre.
Hay una foto tuya en el malecón, tomada desde arriba. Tú no la tomaste. # sfx:stinger
-> interludio
