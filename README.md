Web noticias Colaborativas

DESCRIPCIÓN

Implementar una API que permita gestionar noticias colaborativas, estilo reddit o menéame, donde los usuarios puedan registrarse y publicar una noticia en una serie de categorías temáticas fijas.

Tecnologías utilizadas:

Javascript,Mysql,node,Express,Postman.

ENTIDADES

Users
Noticias

END POINTS

NOTICIAS

GET -/news - JSON con la lista de últimas noticias del DIA ordenadas por valoración. | SIN TOKEN
GET -/news/previous - lista de noticias de días anteriores |SIN TOKEN
GET - /news - filtrar noticias por tema, query params |SIN TOKEN
POST- /news- publicar una noticia | TOKEN REQUERIDO
PUT- /news/:id - editar una noticia en sus diferentes campos |TOKEN REQUERIDO
DELETE- /news/:id -borrar una noticia |TOKEN REQUERIDO
POST- /news/:id/votes - votar una noticia positiva o negativamente, solo piuede votar una vez y no puede votar sus propias noticias |TOKEN REQUERIDO

USUARIOS

POST- /users -Crear un usuario, pendiente validar
GET- /users/validate/:registrationcode -Validaresmos usuario registrado
POST- /users/login -realizar login, devolverá token de usuario

//opcional//
Gestionar oerfil de usuario(nombre, email, biografia..)
