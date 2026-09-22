// src/core/services/UserService.js
import { apiClient } from './ApiClient';

export class UserService {
  // ===== PERFIL =====
  async getProfile() {
    const response = await apiClient.get('/usuarios/perfil');
    return response.data;
  }

  async updateProfile(data) {
    const response = await apiClient.put('/usuarios/perfil', data);
    return response.data;
  }

  // ===== CLIENTES =====
  async registrarCliente(data) {
    const response = await apiClient.post('/usuarios/registro', data);
    return response.data;
  }

  async countClientes() {
    const response = await apiClient.get('/usuarios/clientes/count');
    return response.data;
  }

  // ===== REPARTIDORES =====
  async getRepartidores() {
    const response = await apiClient.get('/usuarios/repartidores');
    return response.data;
  }

  async getRepartidorById(id) {
    const response = await apiClient.get(`/usuarios/repartidores/${id}`);
    return response.data;
  }

  async registrarRepartidor(data) {
    const response = await apiClient.post('/usuarios/repartidores', data);
    return response.data;
  }

  async actualizarRepartidor(id, data) {
    const response = await apiClient.put(`/usuarios/repartidores/${id}`, data);
    return response.data;
  }

  async cambiarEstadoRepartidor(id, estado) {
    const response = await apiClient.patch(`/usuarios/repartidores/${id}/estado`, { estado });
    return response.data;
  }

  async eliminarRepartidor(id) {
    const response = await apiClient.delete(`/usuarios/repartidores/${id}`);
    return response.data;
  }

  async buscarRepartidores(filtros) {
    const response = await apiClient.get('/usuarios/repartidores/buscar', { params: filtros });
    return response.data;
  }
}