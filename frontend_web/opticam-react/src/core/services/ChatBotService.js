// src/core/services/ChatBotService.js
import { apiClient } from './ApiClient';

export class ChatBotService {
  // ===== ENVIAR MENSAJE =====
  async enviarMensaje(mensaje) {
    const response = await apiClient.post('/chatbot/mensaje', { mensaje });
    return response.data;
  }

  // ===== OBTENER BOTONES =====
  async obtenerBotones() {
    const response = await apiClient.get('/chatbot/botones');
    return response.data.botones || [];
  }
}