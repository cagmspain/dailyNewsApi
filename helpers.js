"use strict";

//const { format } = require("date-fns");
const axios = require("axios");
const fs_sync = require("fs");
const fs = require("fs/promises");
const path = require("path");
//const sharp = require("sharp");
const uuid = require("uuid");
const crypto = require("crypto");
const sgEmail = require("@sendgrid/mail");

// configuro SendGrid
sgEmail.setApiKey(process.env.SENDGRID_API_KEY);

const { UPLOAD_DIRECTORY } = process.env;

const staticDir = path.join(__dirname, UPLOAD_DIRECTORY);

function formatDateToDB(dateObject) {
	return format(dateObject, "yyyy-MM-dd HH:mm:ss");
}

async function savePhoto(dataPhoto) {
	await fs.access(staticDir);

	// voy a leer la imagen con sharp
	const imagen = sharp(dataPhoto.data);

	// genero un nombre unico para la imagen
	//upload_UUID_nombreoriginal
	const photoName = `upload_${uuid.v4()}_${dataPhoto.name}`;

	// guardo el file (buffer) en static/
	await imagen.toFile(path.join(staticDir, photoName));

	// devuelvo el nombre del file
	return photoName;
}

// Borra un fichero en el directorio de uploads
async function deletePhoto(photo) {
	const photoPath = path.join(staticDir, photo);

	await fs.unlink(photoPath);
}

async function validate(schema, data) {
	try {
		await schema.validateAsync(data);
	} catch (error) {
		error.httpStatus = 400;
		throw error;
	}
}

function generateRandomString(byteString) {
	return crypto.randomBytes(byteString).toString("hex");
}

async function sendEmail({ to, subject, body }) {
	try {
		const msg = {
			to,
			from: process.env.SENDGRID_FROM,
			subject,
			text: body,
			html: `
        <div>
        <h1>${subject}</h1>
        <p>${body}</p>
        </div>
        `,
		};

		await sgEmail.send(msg);
	} catch (error) {
		throw new Error(`Error enviando email (${error.message})`);
	}
}

function generateError(msg, statusCode) {
	const error = new Error(msg);
	error.httpStatus = statusCode;
	throw error;
}

async function downloadImage(url, filepath) {
	const queryResponse = await axios({
		url,
		method: "GET",
		responseType: "stream",
	});

	const imageUrl = queryResponse.data.responseUrl;

	const response = await axios({
		url: imageUrl,
		method: "GET",
		responseType: "stream",
	});

	return new Promise((resolve, reject) => {
		response.data
			.pipe(fs_sync.createWriteStream(filepath))
			.on("error", reject)
			.once("close", () => resolve(filepath));
	});
}

module.exports = {
	formatDateToDB,
	savePhoto,
	deletePhoto,
	validate,
	generateRandomString,
	sendEmail,
	generateError,
	downloadImage,
};
