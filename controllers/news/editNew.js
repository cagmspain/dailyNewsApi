"use strict";

const { getDB } = require("../../db/db");
const { formatDateToDB } = require("../../helpers");

const editNew = async (req, res, next) => {
	let connection;
	try {
		connection = await getDB();

		const { id } = req.params;

		// Comprobar que los datos mínimos vienen en el body
		const { topic, leadIn, newsText, image } = req.body;

		if (!leadIn || !newsText || !topic) {
			const error = new Error("Debes incluir campos topic, leadIn y newsText");
			error.httpStatus = 400;
			throw error;
		}

		//FIXME gestionar fecha timestamp Duda!

		const date = new Date();

		// Hacer la query de SQL UPDATE
		await connection.query(
			`UPDATE news SET date=?, topic=?, leadIn=? , newsText=?, image=? WHERE id=?`,
			[date, topic, leadIn, newsText, image, id]
		);

		// Devolver una respuesta
		res.send({
			status: "ok",
			data: {
				id,
				date,
				topic,
				leadIn,
				newsText,
				image,
			},
		});
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = editNew;
