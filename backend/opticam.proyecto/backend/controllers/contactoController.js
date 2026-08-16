import { Usuario } from '../models/relaciones.js';
import sequelize from '../config/database.js';

// ENVIAR MENSAJE DE CONTACTO
export const enviarMensaje = async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;
    const usuario = req.user;

    console.log('Nuevo mensaje de contacto:');
    console.log('Nombre:', nombre);
    console.log('Email:', email);
    console.log('Teléfono:', telefono);
    console.log('Mensaje:', mensaje);

    // Validaciones
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y mensaje son requeridos'
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    console.log('Mensaje de contacto registrado');

    res.json({
      success: true,
      message: 'Mensaje enviado! Te contactaremos pronto.'
    });

  } catch (error) {
    console.error('Error al enviar mensaje de contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};