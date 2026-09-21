// src/core/services/AuthService.js
import { apiClient } from './ApiClient';

export class AuthService {
  async login(email, contrasena) {
    const response = await apiClient.post('/auth/login', {
      email,
      contrasena,
    });
    return response.data;
  }

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  }

  async solicitarRecuperacion(email) {
    const response = await apiClient.post('/auth/recuperar-password', { email });
    return response.data;
  }

  async verificarTokenRecuperacion(token) {
    const response = await apiClient.get(`/auth/verificar-token/${token}`);
    return response.data;
  }

  async resetearPassword(token, nueva_contrasena) {
    const response = await apiClient.post('/auth/resetear-password', {
      token,
      nueva_contrasena,
    });
    return response.data;
  }

  async verifyToken() {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  }

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
}