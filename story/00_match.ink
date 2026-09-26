// Los primeros 30 segundos: el match en la app.

=== match ===
# bg:black # corruption:0
# sfx:notif # phone:open # chat:iris
Tienes un nuevo match. # sys
Completa tu perfil para responder. # input:nombre
Iris: hola, {nombre} :)
Iris: perdón si es raro escribir primero. vi que también vas al Code Brew de mañana
* [Responder con curiosidad]
    ~ afinidad += 5
    {nombre}: Sí, voy. ¿Tú también?
    Iris: sí!! mi equipo presenta algo pequeño. bueno, yo solo cargo la laptop
* [Preguntar cómo lo sabe]
    ~ sospecha += 1
    {nombre}: ¿Cómo sabes que voy? No lo puse en mi perfil.
    Iris: lo pusiste en el grupo de whatsapp de crafter, no?
    Nunca escribiste en ese grupo. Solo lees.
    ~ pistas += grupo_whatsapp
- Iris: te reconocí de tu foto. es bonita. se nota que la tomaste de noche
~ pistas += foto_noche
Iris: mañana te veo. no llegues tarde
Iris: te estaré mirando
Iris: jaja olvida eso, se envió solo. autocorrector # delete
~ pistas += mensaje_borrado
Iris: nos vemos {nombre} # instant
-> prologo
