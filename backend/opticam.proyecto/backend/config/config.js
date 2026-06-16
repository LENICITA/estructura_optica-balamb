// config/config.js

require('dotenv').config();
const mysql = require('mysql');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(function(err) {
  if (err) {
    console.error(' Error conectando a BD:', err.message);
    throw err;
  }
  console.log(' Base de datos conectada:', process.env.DB_NAME);
});

module.exports = db;