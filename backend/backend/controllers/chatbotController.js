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

// ========== FAQ ==========

// 2. Obtener todas las preguntas frecuentes
export const getFaqs = (req, res) => {
  try {
    const faqs = ChatBot.getFaqs();

    res.json({
      success: true,
      count: faqs.length,
      faqs: faqs
    });
  } catch (error) {
    console.error("Error al obtener FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener preguntas frecuentes"
    });
  }
};

// 3. Buscar FAQ por texto
export const searchFaqs = (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Debes proporcionar un término de búsqueda"
      });
    }

    const results = ChatBot.searchFaqs(q);

    res.json({
      success: true,
      query: q,
      count: results.length,
      resultados: results
    });
  } catch (error) {
    console.error("Error al buscar FAQ:", error);
    res.status(500).json({
      success: false,
      message: "Error al buscar preguntas frecuentes"
    });
  }
};