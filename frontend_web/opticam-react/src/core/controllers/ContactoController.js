// src/core/controllers/ContactoController.js
import { ContactoService } from '../services/ContactoService';
import { validarFormularioContacto } from '../../shared/validators/contactoValidators';

export class ContactoController {
  static async enviarMensaje(data) {
    try {
      const check = validarFormularioContacto({
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        mensaje: data.mensaje
      });

      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'Datos inválidos',
        };
      }

      const response = await ContactoService.enviarMensaje(data);

      return {
        success: true,
        message: response.message || '¡Mensaje enviado! Te contactaremos pronto.',
        data: response.data,
      };

    } catch (error) {
      console.error(' Error en ContactoController:', error);
      return {
        success: false,
        message: error.message || 'Error al enviar el mensaje',
      };
    }
  }
}