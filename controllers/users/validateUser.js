"use strict";

const { getDB } = require("../../db/db");

const validateUser = async (req, res, next) => {
	let connection;
	try {
		// pido conneción al DB
		connection = await getDB();

		const { registrationCode } = req.params;

		// comprobamos si existe un usuario con este registrationCode
		const [user] = await connection.query(
			`
        SELECT id
        FROM users
        WHERE registrationCode = ?
    	`,
			[registrationCode]
		);

		// y si no lo hay dar un error
		if (user.length === 0) {
			const error = new Error(
				"Ningun usuario encontrado con este código de validación"
			);
			error.httpStatus = 404;
			throw error;
		}

		// activo el usuario y borro registrationCode
		await connection.query(
			`
        UPDATE users
        SET active=true, registrationCode=NULL
        WHERE registrationCode=?
    `,
			[registrationCode]
		);

		res.send({
			status: "ok",
			message: "Usuario validado",
		});
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = validateUser;
