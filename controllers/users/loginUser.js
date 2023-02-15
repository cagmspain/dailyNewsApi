"use strict";

const jwt = require("jsonwebtoken");

const { getDB } = require("../../db/db");
const { validate, generateError } = require("../../helpers");
const { registrationSchema } = require("../../schemas/index");

// https://yopmail.com/en/ para crear email temporaneas

// Script de postman:
//   var jsonData = pm.response.json();
//   pm.globals.set("token", jsonData.data.token);

const loginUser = async (req, res, next) => {
	let connection;
	try {
		// pido conneción al DB
		connection = await getDB();

		// valido los datos del body
		await validate(registrationSchema, req.body);

		// Recojo de req.body el email y la password
		const { email, password } = req.body;

		// selecionamos el usuario con este email y pwd
		const [user] = await connection.query(
			`
        	SELECT id, role,  active , name
        	FROM users
        	WHERE email=? AND password=SHA2(?, 512)
    		`,
			[email, password]
		);

		// si no encuentro el usuario salgo con error
		if (user.length === 0) {
			//   const error = new Error('Email o password no correctos');
			//   error.httpStatus = 401;
			//   throw error;
			generateError("Email o contraseña incorrectos", 401);
		}

		// comprobar que el usuario sea activo
		console.log("user:", user); // [ { id: 2, role: 'normal', active: 1 } ]
		if (!user[0].active) {
			generateError(
				"Usuario pendiente de validación. Comprueba tu correo electronico.",
				401
			);
		}

		// creo objeto con los datos que quiero guardar en el token
		const info = {
			id: user[0].id,
			role: user[0].role,
			email: user[0].email,
		};

		// Ejemplo de token:
		// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6Im5vcm1hbCIsImlhdCI6MTY1ODk0MzUyMCwiZXhwIjoxNjU5MDI5OTIwfQ.b2DprQ8s3-MtpP8g3rZO1o5JOX__sqqIqGbsxKUW8NQ
		const token = jwt.sign(info, process.env.JWT_SECRET, { expiresIn: "1d" });
		const id = user[0].id;
		const nombre = user[0].name;

		res.send({
			status: "ok",
			data: {
				token,
				id,
				nombre,
				email,
			},
		});
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = loginUser;
