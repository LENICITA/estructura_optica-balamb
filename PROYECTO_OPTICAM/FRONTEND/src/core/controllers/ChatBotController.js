// src/core/controllers/ChatBotController.js
import { ChatBotService } from '../services/ChatBotService';
import { checkMensajeChatbot } from '../../shared/validators/chatbotValidators';

// Helper: genera un ID único y criptográficamente seguro
// Funciona en cualquier contexto (HTTP, HTTPS, red local)
function generarIdSeguro() {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, (n) => n.toString(16).padStart(8, '0')).join('-');
}

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
      console.error('Error en enviarMensaje:', error);
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
      console.error('Error en obtenerBotones:', error);
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
      id: `${Date.now()}-${generarIdSeguro()}`,
      texto,
      tipo,
      timestamp: new Date(),
    };
  }
}