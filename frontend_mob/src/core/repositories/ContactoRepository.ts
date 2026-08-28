// src/repositories/ContactoRepository.ts
import { apiClient } from '../services/ApiClient';
import { MensajeContacto, MensajeContactoResponse } from '../models/MensajeContacto';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ContactoRepository {
  static async enviarMensaje(data: MensajeContacto): Promise<MensajeContactoResponse> {
    try {
      const token = await AsyncStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await apiClient.post('/contacto', data, config);
      return response.data;
    } catch (error: any) {
      console.error('Error en ContactoRepository:', error);
      throw error;
    }
  }
}