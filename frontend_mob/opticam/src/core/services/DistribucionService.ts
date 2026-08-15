// src/core/services/DistribucionService.ts
import { apiClient } from './ApiClient';
import { DistribucionModel } from '../models/DistribucionModel';

export class DistribucionService {
  // ============================================
  // ADMIN
  // ============================================

  async asignarPedido(data: { id_pedido: number; id_usuario: number; observaciones?: string }): Promise<any> {
    const response = await apiClient.post('/distribucion', data);
    return response.data;
  }

  async getTodasDistribuciones(): Promise<any> {
    const response = await apiClient.get('/distribucion/admin/todas');
    return response.data;
  }

  async getDistribucionesExternas(): Promise<any> {
    const response = await apiClient.get('/distribucion/admin/externas');
    return response.data;
  }

  async cancelarEntrega(id: number, observacion?: string): Promise<any> {
    const response = await apiClient.put(`/distribucion/admin/${id}/cancelar`, { observacion });
    return response.data;
  }

  // ============================================
  // ADMIN Y REPARTIDOR
  // ============================================

  async getPendientes(): Promise<any> {
    const response = await apiClient.get('/distribucion/pendientes');
    return response.data;
  }

  async getEnEntrega(): Promise<any> {
    const response = await apiClient.get('/distribucion/en-entrega');
    return response.data;
  }

  async getHistorial(): Promise<any> {
    const response = await apiClient.get('/distribucion/historial');
    return response.data;
  }

  async getDistribucionById(id: number): Promise<any> {
    const response = await apiClient.get(`/distribucion/${id}`);
    return response.data;
  }

  async iniciarEntrega(id: number): Promise<any> {
    const response = await apiClient.patch(`/distribucion/${id}/iniciar`);
    return response.data;
  }

  async marcarEntregado(id: number, observacion?: string): Promise<any> {
    const response = await apiClient.patch(`/distribucion/${id}/entregar`, { observacion });
    return response.data;
  }
}