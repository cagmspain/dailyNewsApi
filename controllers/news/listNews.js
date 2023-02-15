"use strict";

//REFERENCIA LISTENTRIES

const { getDB } = require("../../db/db");

const listNews = async (req, res, next) => {
	let connection;
	try {
		// pido conneción al DB]]]
		connection = await getDB();

		let { topic } = req.query;

		let news;
		const validTopic = [
			"deporte",
			"economia",
			"cultura",
			"tecnologia",
			"politica",
		];

		if (topic) {
			topic = validTopic.includes(topic) ? topic : "deporte";
			// Leo la entradas en la base de datos
			[news] = await connection.query(
				`
				SELECT news.id,news.leadIn, news.newsText,news.topic, news.date, news.user_id, users.email, SUM(if(news_votes.vote=1,1,0)) AS votesPositives, SUM(if(news_votes.vote=-1,1,0)) AS votesNegatives
						FROM news 
						LEFT JOIN news_votes ON (news.id = news_votes.new_id )
						LEFT JOIN users ON (news.user_id) = users.id
				WHERE news.topic = "${topic}"
				GROUP BY news.id
				ORDER BY news.date DESC
		   		
        `
			);
		} else {
			// Leo la entradas en la base de datos
			[news] = await connection.query(
				`
				SELECT news.id,news.leadIn, news.newsText,news.topic, news.date, news.user_id, users.email, SUM(if(news_votes.vote=1,1,0)) AS votesPositives, SUM(if(news_votes.vote=-1,1,0)) AS votesNegatives
				FROM news 
				LEFT JOIN news_votes ON (news.id = news_votes.new_id )
				LEFT JOIN users ON (news.user_id) = users.id
								GROUP BY news.id
								ORDER BY news.date DESC
   		 `
			);
		}

		//console.log(entries);

		/*let entriesWithPhotos = [];

		if (entries.length > 0) {
			// sacar los id
			const arrayIds = entries.map((entry) => {
				return entry.id;
			});

			// seleciono todas las fotos que tenga como id de la entry los id que estan en arrayIds
			const [photos] = await connection.query(`
        SELECT *
        FROM entries_photos
        WHERE entry_id IN (${arrayIds.join(",")})
      `);

			// juntamos los dos resultados anteriores (entry+fotos)
			entriesWithPhotos = entries.map((entry) => {
				const photosEntry = photos.filter((photo) => {
					return photo.entry_id === entry.id;
				});

				return {
					...entry,
					photos: photosEntry,
				};
			});
		}*/

		res.send({
			status: "ok",
			message: "List news",
			data: news,
		});
	} catch (error) {
		next(error);
	} finally {
		if (connection) connection.release();
	}
};

module.exports = listNews;
