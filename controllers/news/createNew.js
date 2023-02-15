"use strict";

const { getDB } = require("../../db/db");

const createNew = async (req, res, next) => {
	let connection;

	try {
		connection = await getDB();

		//leo del body los datos
		const { leadIn, newsText, topic } = req.body;
		if (!leadIn || !newsText || !topic) {
			const error = new Error("completa los campos obligatorios");
			error.httpStatus = 400;
			throw error;
		}

		const [result] = await connection.query(
			`
              INSERT INTO news (leadIn, newsText, topic, user_id)
              VALUES (?,?,?,?);
          `,
			[leadIn, newsText, topic, req.userAuth.id]
		);

		const id = result.insertId;
		const user_id = req.userAuth.id;
		const user_email = req.userAuth.email;
		res.send({
			status: "ok",
			message: "creo noticia",
			data: { leadIn, newsText, topic, id, user_id },
		});
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = createNew;
