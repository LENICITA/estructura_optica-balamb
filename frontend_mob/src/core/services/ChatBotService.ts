// src/core/services/ChatBotService.ts
import { apiClient } from './ApiClient';

export interface ChatBotResponse {
  success: boolean;
  mensaje_usuario: string;
  respuesta_chatbot: string;
  intencion: string;
  timestamp: string;
  mensaje?: string;
}

export interface ChatBotButton {
  id: number;
  label: string;
  value: string;
}

export interface BotonesResponse {
  success: boolean;
  count: number;
  botones: ChatBotButton[];
}

export class ChatBotService {
  // ===== ENVIAR MENSAJE =====
  async enviarMensaje(mensaje: string): Promise<ChatBotResponse> {
    const response = await apiClient.post<ChatBotResponse>('/chatbot/mensaje', { mensaje });
    return response.data;
  }

  // ===== OBTENER BOTONES =====
  async obtenerBotones(): Promise<ChatBotButton[]> {
    const response = await apiClient.get<BotonesResponse>('/chatbot/botones');
    return response.data.botones || [];
  }
}