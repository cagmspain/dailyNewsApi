"use strict";
const { number } = require("joi");
const { getDB } = require("../../db/db");
const { formatDateToDB } = require("../../helpers");

const voteNew = async (req, res, next) => {
	let connection;

	try {
		connection = await getDB();

		// Recojo los parámetros
		const { id } = req.params;
		let { vote } = req.body;

		vote = Number(vote);

		// compruebo que el valor de votos esté en rango
		if (vote !== 1 && vote !== -1) {
			const error = new Error("El voto debe estar entre -1 y 1");
			error.httpStatus = 400;
			throw error;
		}

		// Compruebo el usuario no sea el creador de la entrada
		const [current] = await connection.query(
			`
      		SELECT user_id 
      		FROM news
      		WHERE id=?
    		`,
			[id]
		);

		if (current[0].user_id === req.userAuth.id) {
			const error = new Error("No puedes votar tu propia noticia");
			error.httpStatus = 403;
			throw error;
		}

		// Compruebo que el usuario no votara anteriormente la noticia
		const [existingVote] = await connection.query(
			`
      		SELECT id, vote 
      		FROM news_votes
      		WHERE user_id=? AND new_id=?
    		`,
			[req.userAuth.id, id]
		);

		console.log("existingVote.length", existingVote.length);
		console.log(" existingVote.vote", existingVote.vote);
		console.log(" existingVote", existingVote);
		console.log("vote", vote);

		if (existingVote.length > 0 && existingVote[0].vote === vote) {
			const error = new Error(
				`Ya votaste (${
					vote === 1 ? "positivamente" : "negativamente"
				}) esta entrada anteriormente`
			);
			error.httpStatus = 403;
			throw error;
		}

		if (existingVote.length > 0 && existingVote[0].vote !== parseInt(vote)) {
			await connection.query(
				`
					DELETE FROM news_votes WHERE new_id=?
				`,
				[id]
			);
		}

		const now = new Date();

		// Añado el voto a la tabla
		const [result] = await connection.query(
			`
      		INSERT INTO news_votes(date, vote, new_id, user_id)
      		VALUES(?,?,?,?)
    		`,
			[now, vote, id, req.userAuth.id]
		);
		//console.log(result);

		const [newVotesNegative] = await connection.query(
			`
			SELECT COUNT(vote) AS votesNegative
			FROM news_votes 
			WHERE new_id = ? AND vote=-1
      		
    		`,
			[id]
		);
		const [newVotesPositive] = await connection.query(
			`
			SELECT COUNT(vote) AS votesPositive
			FROM news_votes 
			WHERE new_id = ? AND vote=1
      		
    		`,
			[id]
		);
		console.log(
			newVotesNegative[0].votesNegative,
			newVotesPositive[0].votesPositive
		);

		res.send({
			status: "ok",
			data: {
				id: result.insertId,
				negative: newVotesNegative[0].votesNegative,
				positive: newVotesPositive[0].votesPositive,
			},
		});
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = voteNew;
