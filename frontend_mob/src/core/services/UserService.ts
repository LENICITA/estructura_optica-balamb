// src/core/services/UserService.ts
import { apiClient } from './ApiClient';
import { 
  ProfileResponse, 
  UpdateProfileRequest, 
  UpdateProfileResponse 
} from '../models/UserModel';

export class UserService {
  // ===== PERFIL =====
  async getProfile(): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>('/usuarios/perfil');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await apiClient.put<UpdateProfileResponse>('/usuarios/perfil', data);
    return response.data;
  }

  // ===== CLIENTES =====
  async registrarCliente(data: any): Promise<any> {
    const response = await apiClient.post('/usuarios/registro', data);
    return response.data;
  }

  async countClientes(): Promise<{ success: boolean; data: { total: number } }> {
    const response = await apiClient.get('/usuarios/clientes/count');
    return response.data;
  }

  // ===== REPARTIDORES =====
  async getRepartidores(): Promise<{ success: boolean; data: any[] }> {
    const response = await apiClient.get('/usuarios/repartidores');
    return response.data;
  }

  async getRepartidorById(id: number): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.get(`/usuarios/repartidores/${id}`);
    return response.data;
  }

  async registrarRepartidor(data: any): Promise<any> {
    const response = await apiClient.post('/usuarios/repartidores', data);
    return response.data;
  }

  async actualizarRepartidor(id: number, data: any): Promise<any> {
    const response = await apiClient.put(`/usuarios/repartidores/${id}`, data);
    return response.data;
  }

  async cambiarEstadoRepartidor(id: number, estado: string): Promise<any> {
    const response = await apiClient.patch(`/usuarios/repartidores/${id}/estado`, { estado });
    return response.data;
  }

  async eliminarRepartidor(id: number): Promise<any> {
    const response = await apiClient.delete(`/usuarios/repartidores/${id}`);
    return response.data;
  }

  async buscarRepartidores(filtros: { nombre?: string; ciudad?: string; estado?: string; placa?: string }): Promise<any> {
    const response = await apiClient.get('/usuarios/repartidores/buscar', { params: filtros });
    return response.data;
  }
}