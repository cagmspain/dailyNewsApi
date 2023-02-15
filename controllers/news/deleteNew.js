"use strict";

const { getDB } = require("../../db/db");

const deleteEntry = async (req, res, next) => {
	let connection;

	try {
		connection = await getDB();

		const { id } = req.params;

		// Seleccionar las fotos relacionadas y borrar los ficheros de disco

		// Borrar los posibles votos de la tabla news_votes
		await connection.query(
			`
      		DELETE FROM news_votes WHERE new_id=?
    		`,
			[id]
		);

		// Borrar la entrada de la tabla entries
		await connection.query(`DELETE FROM news WHERE id=?`, [id]);

		// Mandar confirmación
		res.send({
			status: "ok",
			message: `La entrada con id ${id} y todos sus elementos relacionados fueron borrados del sistema`,
		});
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = deleteEntry;
