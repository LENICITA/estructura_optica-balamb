// src/core/services/ContactoService.ts
import { apiClient } from './ApiClient';

export interface ContactoData {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}

export interface ContactoResponse {
  success: boolean;
  message: string;
  data?: {
    nombre: string;
    email: string;
    telefono: string;
    mensaje: string;
  };
}

export class ContactoService {
  // Enviar mensaje de contacto (PUBLICO - no requiere token)
  static async enviarMensaje(data: ContactoData): Promise<ContactoResponse> {
    try {
      console.log(' ContactoService - enviarMensaje:', data);

      const response = await apiClient.post<ContactoResponse>('/contacto', {
        nombre: data.nombre.trim(),
        email: data.email.trim().toLowerCase(),
        telefono: data.telefono?.trim() || '',
        mensaje: data.mensaje.trim(),
      });

      console.log(' ContactoService - Respuesta:', response.data);
      return response.data;

    } catch (error: any) {
      console.error(' ContactoService - Error:', error);

      if (error.response) {
        // El servidor respondio con un error
        console.error(' Error response:', error.response.data);
        throw new Error(error.response.data?.message || 'Error al enviar el mensaje');
      } else if (error.request) {
        // No hubo respuesta del servidor
        console.error(' No hubo respuesta del servidor');
        throw new Error('No se pudo conectar con el servidor');
      } else {
        // Error en la configuracion
        console.error(' Error en la peticion:', error.message);
        throw new Error(error.message || 'Error al enviar el mensaje');
      }
    }
  }

  // Verificar estado del servidor (opcional)
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error(' Health check fallo:', error);
      return false;
    }
  }
}