// controllers/chatbotController.js
import ChatBot from '../models/chatbot.js';

// ========== ENVIAR MENSAJE ==========

// 1. Enviar mensaje y recibir respuesta automática
export const enviarMensaje = (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Debes enviar un mensaje"
      });
    }

    // Detectar intención del mensaje
    const intencion = ChatBot.detectarIntencion(mensaje);

    // Obtener respuesta automática
    const respuesta = ChatBot.obtenerRespuesta(intencion);

    // No se guarda nada en base de datos
    res.json({
      success: true,
      mensaje_usuario: mensaje,
      respuesta_chatbot: respuesta,
      intencion: intencion,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error al procesar mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar el mensaje"
    });
  }
};

export const getBotones = (req, res) => {
  try {
    const botones = [
      { id: 1, label: 'Precios', value: 'precios' },
      { id: 2, label: 'Envíos', value: 'envio' },
      { id: 3, label: 'Garantía', value: 'garantia' },
      { id: 4, label: 'Contacto', value: 'contacto' },
      { id: 5, label: 'Productos', value: 'productos' },
      { id: 6, label: 'Horario', value: 'horario' },
      { id: 7, label: 'Pagos', value: 'pago' },
      { id: 8, label: 'Devoluciones', value: 'devolucion' },
    ];

    res.json({
      success: true,
      count: botones.length,
      botones: botones
    });
  } catch (error) {
    console.error("Error al obtener botones:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los botones"
    });
  }
};
