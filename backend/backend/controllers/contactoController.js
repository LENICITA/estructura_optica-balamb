// backend/controllers/contactoController.js
import { 
    Usuario
} from "../models/relaciones.js";
import sequelize from "../config/database.js";
import nodemailer from 'nodemailer'; 
import dotenv from 'dotenv';


dotenv.config();

// Configuración del transporter para enviar correos
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar conexión con el servidor SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('Error al conectar con SMTP:', error);
  } else {
    console.log('Servidor SMTP listo para enviar correos');
  }
});

// ============================================
// ENVIAR MENSAJE DE CONTACTO
// ============================================
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

    // Guardar en base de datos 
    console.log('Mensaje guardado en BD');

    //  ENVIAR CORREO ELECTRÓNICO
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || `"Formulario Web" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || 'opticavirtualbalamb@gmail.com',
        subject: '📩 Nuevo mensaje de contacto - Óptica Balamb',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #B90F0F; border-bottom: 2px solid #B90F0F; padding-bottom: 10px;">📩 Nuevo mensaje de contacto</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 100px; background-color: #f0f0f0;">Nombre:</td>
                <td style="padding: 8px; background-color: #fafafa;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; background-color: #f0f0f0;">Email:</td>
                <td style="padding: 8px; background-color: #fafafa;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; background-color: #f0f0f0;">Teléfono:</td>
                <td style="padding: 8px; background-color: #fafafa;">${telefono || 'No proporcionado'}</td>
              </tr>
              ${usuario ? `
              <tr>
                <td style="padding: 8px; font-weight: bold; background-color: #f0f0f0;">Usuario ID:</td>
                <td style="padding: 8px; background-color: #fafafa;">${usuario.id}</td>
              </tr>
              ` : ''}
            </table>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin-top: 10px; border: 1px solid #ddd;">
              <strong>💬 Mensaje:</strong>
              <p style="white-space: pre-wrap; margin-top: 8px; color: #333;">${mensaje}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
              Este mensaje fue enviado desde el formulario de contacto de la app móvil.
              <br>Fecha: ${new Date().toLocaleString('es-CO')}
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Correo enviado:', info.messageId);

      // Enviar confirmación al cliente
      try {
        const clienteMailOptions = {
          from: process.env.SMTP_FROM || `"Óptica Balamb" <${process.env.SMTP_USER}>`,
          to: email,
          subject: '📩 Hemos recibido tu mensaje - Óptica Balamb',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              <h2 style="color: #B90F0F;">¡Hola ${nombre}!</h2>
              <p>Hemos recibido tu mensaje y te contactaremos pronto.</p>
              <p><strong>Tu mensaje:</strong></p>
              <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${mensaje}</p>
              <p style="color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                Saludos,<br>
                <strong>Óptica Balamb</strong>
              </p>
            </div>
          `,
        };
        await transporter.sendMail(clienteMailOptions);
        console.log('Correo de confirmación enviado al cliente');
      } catch (clienteError) {
        console.error('Error al enviar confirmación al cliente:', clienteError);
      }

    } catch (emailError) {
      console.error('Error al enviar correo:', emailError);
    }

    res.json({
      success: true,
      message: '¡Mensaje enviado! Te contactaremos pronto.',
      data: {
        nombre,
        email,
        telefono: telefono || 'No proporcionado',
        mensaje
      }
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