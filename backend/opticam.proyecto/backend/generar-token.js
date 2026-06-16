// backend/generar-token.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Datos del usuario admin que insertaste en la BD
const payload = {
  id_usuario: 1,
  email: 'opticavirtualbalmb@gmail.com',
  nombre: 'Héctor Cabrejo',
  rol: 'admin'
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

console.log('========================================');
console.log('🔑 TOKEN GENERADO:');
console.log('========================================');
console.log(token);
console.log('========================================');
console.log('📋 Bearer token para Postman:');
console.log(`Bearer ${token}`);
console.log('========================================');