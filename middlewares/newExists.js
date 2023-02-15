"use strict";

const { getDB } = require("../db/db");

//casi completa, falta hacer pruebas

const newExists = async (req, res, next) => {
	let connection;

	try {
		connection = await getDB();

		const { id } = req.params;

		const [result] = await connection.query(
			`
      		SELECT id FROM news WHERE id=?
   			 `,
			[id]
		);

		if (result.length === 0) {
			const error = new Error("Noticia no encontrada");
			error.httpStatus = 404;
			throw error;
		}

		next();
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = newExists;
