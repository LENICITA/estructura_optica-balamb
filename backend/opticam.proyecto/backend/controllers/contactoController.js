// backend/controllers/contactoController.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log(' Configurando transporter...');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? ' Presente' : ' Faltante');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error al conectar con SMTP:', error);
  } else {
    console.log(' Servidor SMTP listo para enviar correos');
  }
});

export const enviarMensaje = async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;

    console.log(' Mensaje de contacto recibido:');
    console.log('Nombre:', nombre);
    console.log('Email:', email);
    console.log('Teléfono:', telefono);
    console.log('Mensaje:', mensaje);

    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y mensaje son requeridos'
      });
    }

    console.log(' Preparando envio de correo...');

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Formulario Web" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'opticavirtualbalamb@gmail.com',
      subject: ' Nuevo mensaje de contacto - Óptica Balamb',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color: #B90F0F;">📩 Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
          <p><strong>Mensaje:</strong></p>
          <p style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">${mensaje}</p>
          <p style="color: #666; font-size: 12px;">Enviado desde el formulario de contacto</p>
        </div>
      `,
    };

    console.log(' Enviando correo a:', mailOptions.to);
    console.log(' Desde:', mailOptions.from);

    const info = await transporter.sendMail(mailOptions);
    console.log(' Correo enviado. ID:', info.messageId);

    res.json({
      success: true,
      message: 'Mensaje enviado correctamente'
    });

  } catch (error) {
    console.error(' Error al enviar correo:', error);
    console.error(' Detalle:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
};