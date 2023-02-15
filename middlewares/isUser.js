"use strict";

const jwt = require("jsonwebtoken");

const { generateError } = require("../helpers");
const { getDB } = require("../db/db");

//configurar jwt para pruebas

const isUser = async (req, res, next) => {
	let connection;

	try {
		// pido conneción al DB
		connection = await getDB();

		const { authorization } = req.headers;

		console.log(req.headers);

		// si no tengo Authorization salgo con un error
		if (!authorization) {
			generateError("Falta la cabecera de autorización", 401);
		}

		let tokenInfo;
		try {
			tokenInfo = jwt.verify(authorization, process.env.JWT_SECRET);
		} catch (error) {
			generateError("Token no valido", 401);
		}

		console.log("tokenInfo:", tokenInfo); // { id: 2, role: 'normal', iat: 1658943520, exp: 1659029920 }
		// comprobamos que el token sea valido respecto a lastAuthUpdate
		const [user] = await connection.query(
			`
      		SELECT lastAuthUpdate
      		FROM users
      		WHERE id=?
      		`,
			[tokenInfo.id]
		);

		const lastAuthUpdate = new Date(user[0].lastAuthUpdate);
		const timestampCreateToken = new Date(tokenInfo.iat * 1000);

		if (timestampCreateToken < lastAuthUpdate) {
			generateError("Token caducado", 401);
		}

		// añadimos en la request (req) el tokenInfo
		req.userAuth = tokenInfo;

		// continuo
		next();
	} catch (error) {
		//throw error;
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = isUser;
