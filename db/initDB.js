"use strict";

// script que se ocupará de crear las tablas y añadir datos

// IMPORTANTE
// Ejecución: node./db/initDB.js
// Esto no funcionaría: node ./initDB.js

// node initDB.js
require("dotenv").config();
//const { formatDateToDB } = require('../helpers');

const { getDB } = require("./db");

let connection;

async function main() {
	try {
		//DEBUG
		//console.log(process.env.MYSQL_USER);

		connection = await getDB();

		// CREO LAS TABLAS
		console.log("Borrando las tablas...");

		await connection.query("DROP TABLE IF EXISTS news_votes;");
		await connection.query("DROP TABLE IF EXISTS news;");
		await connection.query("DROP TABLE IF EXISTS users;");

		// CREO LAS TABLAS
		console.log("Creando las tablas...");

		// Tabla usuarios
		await connection.query(`
    CREATE TABLE users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(512) NOT NULL,
      name VARCHAR(100),
      avatar VARCHAR(50),
      biography VARCHAR(300),
      active BOOLEAN DEFAULT false,
      role ENUM("admin", "normal") DEFAULT "normal" NOT NULL,
      registrationCode VARCHAR(100),
      deleted BOOLEAN DEFAULT false,
      lastAuthUpdate DATETIME,
      recoverCode VARCHAR(100)
    )
    `);

		// Tabla noticias
		await connection.query(`
     CREATE TABLE news (
       id INT PRIMARY KEY AUTO_INCREMENT,
       date DATETIME DEFAULT CURRENT_TIMESTAMP,
       image VARCHAR(100),
       leadIn VARCHAR(200) NOT NULL,
       newsText TEXT NOT NULL,
       topic ENUM("deporte", "economia", "cultura", "politica", "tecnologia") NOT NULL,
       user_id INT NOT NULL,
       FOREIGN KEY (user_id) REFERENCES users(id)
     );
   `);

		// Tabla news votes
		await connection.query(`
      CREATE TABLE news_votes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        vote TINYINT NOT NULL,
        new_id INT NOT NULL,
        FOREIGN KEY (new_id) REFERENCES news(id),
        CONSTRAINT news_votes_CK1 CHECK (vote IN (-1,1)),
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, new_id )
      );
    `);

		console.log("Creo usuario admin...");
		await connection.query(`
     INSERT INTO users(email, password, name, active, role)
     VALUES (
      
      "cagmspain@gmail.com",
      SHA2("${process.env.ADMIN_PASSWORD}", 512),
      "Carlos Gonzalez",
      true,
      "admin"
     )
     `);
	} catch (error) {
		console.error("ERROR:", error.message);
	} finally {
		// libero la connección
		if (connection) {
			connection.release();
		}
		process.exit();
	}
}

main();
