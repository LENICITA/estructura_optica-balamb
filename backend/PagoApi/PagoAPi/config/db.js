// config/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Crear la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Opticamdb',
  port: process.env.DB_PORT || 3306
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('✅ Base de datos conectada:', process.env.DB_NAME || 'Opticamdb');
});

// Exportar la conexión para usarla en otros archivos
module.exports = db;