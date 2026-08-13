import { apiClient } from './apiClient';

export interface ChatBotResponse {
  success: boolean;
  mensaje_usuario: string;
  respuesta_chatbot: string;
  intencion: string;
  timestamp: string;
}

export interface ChatBotButton {
  id: number;
  label: string;
  value: string;
}

interface BotonesResponse {
  success: boolean;
  count: number;
  botones: ChatBotButton[];
}

// ENVIAR MENSAJE

export const enviarMensajeChatBot = async (
  mensaje: string
): Promise<ChatBotResponse> => {

  const response =
    await apiClient.post(
      '/chatbot/mensaje',
      {
        mensaje,
      }
    );

  return response.data;
};

// OBTENER BOTONES

export const obtenerBotonesChatBot =
  async (): Promise<ChatBotButton[]> => {

    const response =
      await apiClient.get<BotonesResponse>(
        '/chatbot/botones'
      );

    return response.data.botones || [];
  };