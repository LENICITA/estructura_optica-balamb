// src/controllers/ContactoController.ts
import { ContactoService } from '../services/ContactoService';
import { MensajeContacto } from '../models/MensajeContacto';

export class ContactoController {
  static async enviarMensaje(data: MensajeContacto) {
    try {
      const response = await ContactoService.enviarMensaje(data);
      return {
        success: true,
        message: response.message || '¡Mensaje enviado! Te contactaremos pronto.',
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Error en ContactoController:', error);
      return {
        success: false,
        message: error.message || 'Error al enviar el mensaje',
        error: error.message,
      };
    }
  }
}