// src/core/controllers/ChatBotController.ts
import { ChatBotService } from '../services/ChatBotService';
import { ChatBotButton } from '../services/ChatBotService';
import { checkMensajeChatbot } from '../../shared/validators/chatbotValidators';

export interface ChatBotMessage {
  id: string;
  texto: string;
  tipo: 'usuario' | 'bot';
  timestamp: Date;
}

export class ChatBotController {
  private chatBotService: ChatBotService;

  constructor() {
    this.chatBotService = new ChatBotService();
  }

  // ===== ENVIAR MENSAJE =====
  async enviarMensaje(mensaje: string): Promise<{
    success: boolean;
    respuesta?: string;
    intencion?: string;
    error?: string;
  }> {
    try {
      // Validación con el validador compartido
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

    } catch (error: any) {
      console.error(' Error en enviarMensaje:', error);

      // Mensaje de error más específico si el backend lo da
      const mensajeBackend = error.response?.data?.message;
      return {
        success: false,
        error: mensajeBackend || 'Error de conexión con el servidor',
      };
    }
  }

  // ===== OBTENER BOTONES =====
  async obtenerBotones(): Promise<ChatBotButton[]> {
    try {
      const botones = await this.chatBotService.obtenerBotones();
      return botones;
    } catch (error) {
      console.error(' Error en obtenerBotones:', error);
      return [];
    }
  }

  // ===== OBTENER RESPUESTA DE BIENVENIDA =====
  getMensajeBienvenida(): string {
    return '¡Hola! Soy OptiBot 👋\n¿En qué puedo ayudarte?';
  }

  // ===== CREAR MENSAJE PARA UI =====
  crearMensaje(texto: string, tipo: 'usuario' | 'bot'): ChatBotMessage {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      texto,
      tipo,
      timestamp: new Date(),
    };
  }
}