"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const morgan = require("morgan");
const fileUpload = require("express-fileupload");

//instacio express
const app = express();
app.use(cors());
app.use(express.json());

//Middlewares
app.use(morgan("dev"));
app.use(fileUpload());
const isUser = require("./middlewares/isUser");
const canEdit = require("./middlewares/canEdit");
const userExists = require("./middlewares/userExists");
const newExists = require("./middlewares/newExists");

//const { PORT, UPLOAD_DIRECTORY } = process.env;

//import modulos internos
//import controllers news
const {
	listNews,
	createNew,
	previousNews,
	editNew,
	deleteNew,
	voteNew,
} = require("./controllers/news");

//import controllers users
const { newUser, validateUser, loginUser } = require("./controllers/users");

//####  RUTAS  ####
//####### LISTA ENDPOINTS USERS #########

//POST- /users -Crear un usuario, pendiente validar
app.post("/signup", newUser);

//GET- /users/validate/:registrationcode -Validaresmos usuario registrado
app.get("/users/validate/:registrationCode", validateUser);

//POST- /users/login -realizar login, devolverá token de usuario
app.post("/login", loginUser);

//###### LISTA ENDPOINTS news/noticias  #######

//GET -/news - JSON con la lista de últimas noticias del DIA ordenadas por valoración. | SIN TOKEN
app.get("/news", listNews);

//GET -/news/previous - lista de noticias de días anteriores |SIN TOKEN
app.get("/news/previous", previousNews);

///implementado filtro en listNews

//POST- /news- publicar una noticia | TOKEN REQUERIDO
app.post("/news", isUser, createNew);

//PUT- /news/:id - editar una noticia en sus diferentes campos |TOKEN REQUERIDO
app.put("/news/:id", isUser, newExists, canEdit, editNew);

//DELETE- /news/:id -borrar una noticia |TOKEN REQUERIDO
app.delete("/news/:id", isUser, newExists, canEdit, deleteNew);

//POST- /news/:id/votes - votar una noticia positiva o negativamente, solo piuede votar una vez y no puede votar sus propias noticias |TOKEN REQUERIDO
app.post("/news/:id/votes", isUser, newExists, voteNew);

//Midelware de 404
app.use((req, res) => {
	res.status(404).send({
		status: "error",
		message: "NOT FOUND",
	});
});

//Midelware de los errores
app.use((error, req, res, next) => {
	//console.log(error);
	res.status(error.httpStatus || 500).send({
		status: error,
		message: error.message,
	});
});

//lanzamos servidor

app.listen(3000, () => {
	console.log("servidor funcionando en puerto 3000");
});
