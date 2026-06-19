// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

// Función de login
const login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    // 1. Buscar usuario por email
    const [rows] = await db.promise().query(
      'SELECT * FROM USUARIOS WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const usuario = rows[0];

    // 2. Verificar contraseña (comparar con bcrypt)
    // Como es prueba, comparamos directamente (si no está encriptada)
    if (contrasena !== usuario.contrasena) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // 3. Obtener el rol del usuario
    const [roles] = await db.promise().query(`
      SELECT r.nombre 
      FROM ROLES r
      JOIN ROL_USUARIO ru ON r.id_rol = ru.id_rol
      WHERE ru.id_usuario = ?
    `, [usuario.id_usuario]);

    const rol = roles.length > 0 ? roles[0].nombre : 'cliente';

    // 4. Crear el token
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre_completo,
        rol: rol
      },
      process.env.JWT_SECRET || 'miClaveSecreta123',
      { expiresIn: '24h' }
    );

    // 5. Responder con el token
    res.json({
      success: true,
      token: token,
      user: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_completo,
        email: usuario.email,
        rol: rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

module.exports = { login };