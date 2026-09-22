// src/core/services/ApiClient.js
import axios from 'axios';
import { API_URL } from '../../shared/constants/api';
import { StorageRepository } from '../repositories/StorageRepository';

export class ApiClient {
  constructor() {
    this.storage = StorageRepository.getInstance();

    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    // Interceptor para agregar token automáticamente
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.storage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores de autenticación
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.storage.getToken();

        console.log(' Interceptor ejecutado. Token encontrado:', token ? 'SÍ' : 'NO');

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(' Authorization header enviado:', config.headers.Authorization.substring(0, 30) + '...');
        } else {
          console.log(' No se encontró token en el interceptor');
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Métodos genéricos
  async get(url, config) {
    return this.client.get(url, config);
  }

  async post(url, data, config) {
    return this.client.post(url, data, config);
  }

  async put(url, data, config) {
    return this.client.put(url, data, config);
  }

  async patch(url, data, config) {
    return this.client.patch(url, data, config);
  }

  async delete(url, config) {
    return this.client.delete(url, config);
  }

  // Obtener la instancia de axios por si se necesita
  getInstance() {
    return this.client;
  }
}

// Exportar una instancia única (singleton)
export const apiClient = new ApiClient();