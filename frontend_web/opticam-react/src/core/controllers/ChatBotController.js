// src/core/controllers/ChatBotController.js
import { ChatBotService } from '../services/ChatBotService';
import { checkMensajeChatbot } from '../../shared/validators/chatbotValidators';

export class ChatBotController {
  constructor() {
    this.chatBotService = new ChatBotService();
  }

  // ===== ENVIAR MENSAJE =====
  async enviarMensaje(mensaje) {
    try {
      const check = checkMensajeChatbot(mensaje);

      if (!check.valido) {
        return {
          success: false,
          error: check.mensaje || 'Mensaje inválido',
        };
      }

      const response = await this.chatBotService.enviarMensaje(mensaje.trim());

      if (!response.success) {
        return {
          success: false,
          error: response.mensaje || 'Error al procesar el mensaje',
        };
      }

      return {
        success: true,
        respuesta: response.respuesta_chatbot,
        intencion: response.intencion,
      };

    } catch (error) {
      console.error(' Error en enviarMensaje:', error);
      const mensajeBackend = error.response?.data?.message;
      return {
        success: false,
        error: mensajeBackend || 'Error de conexión con el servidor',
      };
    }
  }

  // ===== OBTENER BOTONES =====
  async obtenerBotones() {
    try {
      const botones = await this.chatBotService.obtenerBotones();
      return botones;
    } catch (error) {
      console.error(' Error en obtenerBotones:', error);
      return [];
    }
  }

  // ===== OBTENER RESPUESTA DE BIENVENIDA =====
  getMensajeBienvenida() {
    return '¡Hola! Soy OptiBot 👋\n¿En qué puedo ayudarte?';
  }

  // ===== CREAR MENSAJE PARA UI =====
  crearMensaje(texto, tipo) {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      texto,
      tipo,
      timestamp: new Date(),
    };
  }
}