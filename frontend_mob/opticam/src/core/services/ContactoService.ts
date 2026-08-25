// src/services/ContactoService.ts
import { ContactoRepository } from '../repositories/ContactoRepository';
import { MensajeContacto, MensajeContactoResponse, validarMensajeContacto } from '../models/MensajeContacto';

export class ContactoService {
  static async enviarMensaje(data: MensajeContacto): Promise<MensajeContactoResponse> {
    // Validar datos
    const { valid, errors } = validarMensajeContacto(data);
    if (!valid) {
      throw new Error(errors.join('. '));
    }

    // Limpiar datos
    const datosLimpios = {
      ...data,
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      telefono: data.telefono?.trim() || '',
      mensaje: data.mensaje.trim(),
    };

    return await ContactoRepository.enviarMensaje(datosLimpios);
  }
}