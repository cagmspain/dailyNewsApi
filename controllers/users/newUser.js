"use strict";

const { validate, generateRandomString, sendEmail } = require("../../helpers");

const { registrationSchema } = require("../../schemas");
const { getDB } = require("../../db/db");

const newUser = async (req, res, next) => {
	let connection;
	try {
		// pido conneción al DB
		connection = await getDB();

		// crear el usuario en la base de datos

		// console.log('request headers', req.headers);

		// valido los datos del body

		await validate(registrationSchema, req.body);

		// Recojo de req.body el email y la password
		const { email, password, name, biography } = req.body;

		// Compruebo que no exista un usuario en la base de datos con ese email
		const [existingUser] = await connection.query(
			`
     		 SELECT id
      		 FROM users
      		 WHERE email=?
    		`,
			[email]
		);

		if (existingUser.length > 0) {
			const error = new Error("Ya existe un usuario con esta email");
			error.httpStatus = 409;
			throw error;
		}

		// Creo un código de registro (contraseña temporal de un solo uso)
		const registrationCode = generateRandomString(40);

		//console.log('registrationCode:', registrationCode);

		// body email con enlace de activacions
		const bodyEmail = `
      		Acabas de registrarte en OurDiallynews.
      		Pulsa en este enlace para activar el usuario: ${process.env.PUBLIC_HOST}/users/validate/${registrationCode}
    	`;

		// eviamos el correo de validación del usuario creado
		sendEmail({
			to: email,
			subject: "Correo de activación usuario de 'Our dialy news'",
			body: bodyEmail,
		});

		// añado el usuario en el DB
		await connection.query(
			`
      		INSERT INTO users (date, email, password, name, biography, registrationCode)
      		VALUES (?, ?, SHA2(?, 512), ?, ? , ?)
    		`,
			[new Date(), email, password, name, biography, registrationCode]
		);

		res.status(201).send({
			status: "ok",
			message: "Usuario creado, comprueba tú correo para activarlo.",
		});
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = newUser;
