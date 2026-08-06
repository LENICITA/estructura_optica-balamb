// src/services/authService.ts
import { apiClient } from './apiClient';
import { LoginResponse } from '../types';

//  AUTENTICACIÓN

// Login
export const login = async (email: string, contrasena: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    contrasena,
  });
  return response.data;
};

// Register
export const register = async (userData: any) => {
  const response = await apiClient.post('/usuarios/registro', userData);
  return response.data;
};

// Logout
export const logout = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};