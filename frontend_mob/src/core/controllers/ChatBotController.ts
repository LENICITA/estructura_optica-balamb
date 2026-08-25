// src/core/controllers/ChatBotController.ts
import { ChatBotService } from '../services/ChatBotService';
import { ChatBotButton } from '../services/ChatBotService';

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
      if (!mensaje || mensaje.trim() === '') {
        return {
          success: false,
          error: 'El mensaje no puede estar vacío',
        };
      }

      const response = await this.chatBotService.enviarMensaje(mensaje.trim());

      if (!response.success) {
        return {
          success: false,
          error: 'Error al procesar el mensaje',
        };
      }

      return {
        success: true,
        respuesta: response.respuesta_chatbot,
        intencion: response.intencion,
      };

    } catch (error) {
      console.error(' Error en enviarMensaje:', error);
      return {
        success: false,
        error: 'Error de conexión con el servidor',
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
