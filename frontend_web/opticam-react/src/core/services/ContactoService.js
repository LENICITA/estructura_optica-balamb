// src/core/services/ContactoService.js
import { apiClient } from './ApiClient';

export class ContactoService {
  // Enviar mensaje de contacto (PUBLICO - no requiere token)
  static async enviarMensaje(data) {
    try {
      console.log(' ContactoService - enviarMensaje:', data);

      const response = await apiClient.post('/contacto', {
        nombre: data.nombre.trim(),
        email: data.email.trim().toLowerCase(),
        telefono: data.telefono?.trim() || '',
        mensaje: data.mensaje.trim(),
      });

      console.log(' ContactoService - Respuesta:', response.data);
      return response.data;

    } catch (error) {
      console.error(' ContactoService - Error:', error);

      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data?.message || 'Error al enviar el mensaje');
      } else if (error.request) {
        console.error('No hubo respuesta del servidor');
        throw new Error('No se pudo conectar con el servidor');
      } else {
        console.error('Error en la peticion:', error.message);
        throw new Error(error.message || 'Error al enviar el mensaje');
      }
    }
  }

  // Verificar estado del servidor (opcional)
  static async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check fallo:', error);
      return false;
    }
  }
}