// src/services/userService.ts
import { apiClient } from './apiClient';
import { ProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from '../types';

// USUARIOS

// Obtener perfil
export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await apiClient.get<ProfileResponse>('/usuarios/perfil');
  return response.data;
};

// Actualizar perfil
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put<UpdateProfileResponse>('/usuarios/perfil', data);
  return response.data;
};