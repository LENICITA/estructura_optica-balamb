// src/services/userService.ts
import { apiClient } from './apiClient';
import { ProfileResponse } from '../types';

// USUARIOS

// Obtener perfil
export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>('/usuarios/perfil');
  return response.data;
};

// Actualizar perfil
export const updateProfile = async (data: {
  nombre_completo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  email?: string;
}): Promise<{ success: boolean; message: string; data: any }> => {
  const response = await apiClient.put('/usuarios/perfil', data);
  return response.data;
};