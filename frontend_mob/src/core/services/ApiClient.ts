// src/core/services/ApiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from '../../shared/constants/api';
import { StorageRepository } from '../repositories/StorageRepository';

export class ApiClient {
  private client: AxiosInstance;
  private storage: StorageRepository;

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

        // EL TOKEN LLEGA AL INTERCEPTOR
        console.log(' Interceptor ejecutado. Token encontrado:', token ? ' SÍ' : ' NO');

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
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Obtener la instancia de axios por si se necesita
  getInstance(): AxiosInstance {
    return this.client;
  }
}

// Exportar una instancia única (singleton)
export const apiClient = new ApiClient();
