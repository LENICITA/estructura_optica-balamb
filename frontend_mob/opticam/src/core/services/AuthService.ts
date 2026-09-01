// src/core/services/AuthService.ts
import { apiClient } from './ApiClient';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    usuario: {
      id: number;
      nombre_completo: string;
      email: string;
      telefono: string;
      ciudad: string;
      roles: string[];
    };
    token: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    usuario: {
      id: number;
      nombre_completo: string;
      email: string;
      telefono: string;
      ciudad: string;
      roles: string[];
    };
    token: string;
  };
}

export interface PasswordRecoveryResponse {
  success: boolean;
  message: string;
  token?: string;
  resetLink?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export class AuthService {
  async login(email: string, contrasena: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      contrasena,
    });
    return response.data;
  }

  async register(userData: any): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  }

  async solicitarRecuperacion(email: string): Promise<PasswordRecoveryResponse> {
    const response = await apiClient.post<PasswordRecoveryResponse>('/auth/recuperar-password', { email });
    return response.data;
  }

  async verificarTokenRecuperacion(token: string): Promise<any> {
    const response = await apiClient.get(`/auth/verificar-token/${token}`);
    return response.data;
  }

  async resetearPassword(token: string, nueva_contrasena: string): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/resetear-password', {
      token,
      nueva_contrasena,
    });
    return response.data;
  }

  async verifyToken(): Promise<any> {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
}