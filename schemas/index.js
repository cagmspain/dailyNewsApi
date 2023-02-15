"use strict";

const Joi = require("joi");

const registrationSchema = Joi.object().keys({
	email: Joi.string()
		.required()
		.email()
		.max(100)
		.error(new Error("introduce un email valido")),
	password: Joi.string()
		.required()
		.min(6)
		.max(20)
		.error(
			new Error("Password error, select a password between 6 and 20 characters")
		),
	name: Joi.string()
		.valid(null, "")
		.max(100)
		.error(new Error("Maxima longitud de nombre 100 caracteres")),
	biography: Joi.string()
		.max(300)
		.error(new Error("Biography max leght is 300 chracters")),
});

module.exports = { registrationSchema };
