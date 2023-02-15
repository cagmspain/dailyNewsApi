"use strict";

const { getDB } = require("../db/db");
const { generateError } = require("../helpers");

//casi completa probar

const canEdit = async (req, res, next) => {
	let connection;

	try {
		connection = await getDB();

		const { id } = req.params;

		// Seleccionar la entrada de la base de datos para saber quien la creó
		const [current] = await connection.query(
			`
      		SELECT user_id
      		FROM news
     	 	WHERE id=?
    		`,
			[id]
		);

		console.log("Id usuario que creó la entry:", current[0].user_id);

		// salgo con error si el usuario logueado no es el mismo que creó la entry o no tiene role de admin
		if (
			req.userAuth.id !== current[0].user_id &&
			req.userAuth.role !== "admin"
		) {
			generateError("No tienes los permisos para editar la noticia", 401);
		}

		next();
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = canEdit;
