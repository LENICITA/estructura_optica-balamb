// src/core/services/DistribucionService.ts
import { apiClient } from './ApiClient';
import { DistribucionModel } from '../models/DistribucionModel';

export interface DistribucionResponse {
  success: boolean;
  message?: string;
  data?: any;
  count?: number;
}

export class DistribucionService {
  // ============================================
  // ADMIN
  // ============================================

  async asignarPedido(data: {
      id_pedido: number;
      id_usuario: number;
      observaciones?: string;
    }): Promise<{ success: boolean; message: string; data?: any }> {
      try {
        const response = await apiClient.post<DistribucionResponse>(
          '/distribucion',
          data
        );
        return response.data;
      } catch (error: any) {
        const mensaje =
          error.response?.data?.message ||
          error.message ||
          'No fue posible asignar el pedido';
        return { success: false, message: mensaje };
      }
    }

  async getTodasDistribuciones(): Promise<DistribucionModel[]> {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>('/distribucion/admin/todas');
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener distribuciones');
      }

      return DistribucionModel.fromJSONArray(data.data || []);
    }

  async getDistribucionesExternas(): Promise<DistribucionModel[]> {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>('/distribucion/admin/externas');
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener distribuciones externas');
      }

      return DistribucionModel.fromJSONArray(data.data || []);
    }

  async cancelarEntrega(
      id: number,
      observacion?: string
    ): Promise<{ success: boolean; message: string; data?: any }> {
      try {
        const response = await apiClient.put<DistribucionResponse>(
          `/distribucion/admin/${id}/cancelar`,
          { observacion }
        );
        return response.data;
      } catch (error: any) {
        const mensaje =
          error.response?.data?.message ||
          error.message ||
          'No fue posible cancelar la entrega';
        return { success: false, message: mensaje };
      }
    }

  // ============================================
  // ADMIN Y REPARTIDOR
  // ============================================

  async getPendientes(): Promise<DistribucionModel[]> {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>('/distribucion/pendientes');
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener pedidos pendientes');
      }

      return DistribucionModel.fromJSONArray(data.data || []);
    }

  async getEnEntrega(): Promise<DistribucionModel[]> {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>('/distribucion/en-entrega');
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener pedidos en entrega');
      }

      return DistribucionModel.fromJSONArray(data.data || []);
    }

  async getHistorial(): Promise<DistribucionModel[]> {
      const response = await apiClient.get<{
        success: boolean;
        data: any[];
      }>('/distribucion/historial');
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener historial');
      }

      return DistribucionModel.fromJSONArray(data.data || []);
    }

  async getDistribucionById(id: number): Promise<DistribucionModel | null> {
      const response = await apiClient.get<{
        success: boolean;
        data: any;
      }>(`/distribucion/${id}`);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener la distribución');
      }

      if (!data.data) return null;

      return DistribucionModel.fromJSON(data.data);
    }

  async iniciarEntrega(
      id: number
    ): Promise<{ success: boolean; message: string; data?: any }> {
      try {
        const response = await apiClient.patch<DistribucionResponse>(
          `/distribucion/${id}/iniciar`
        );
        return response.data;
      } catch (error: any) {
        const mensaje =
          error.response?.data?.message ||
          error.message ||
          'No fue posible iniciar la entrega';
        return { success: false, message: mensaje };
      }
    }

  async marcarEntregado(
      id: number,
      observacion?: string
    ): Promise<{ success: boolean; message: string; data?: any }> {
      try {
        const response = await apiClient.patch<DistribucionResponse>(
          `/distribucion/${id}/entregar`,
          { observacion }
        );
        return response.data;
      } catch (error: any) {
        const mensaje =
          error.response?.data?.message ||
          error.message ||
          'No fue posible marcar como entregado';
        return { success: false, message: mensaje };
      }
    }

    // REPARTIDOR

    // OBTENER TODAS MIS DISTRIBUCIONES (REPARTIDOR)
    async getMisDistribuciones(): Promise<DistribucionModel[]> {
        const response = await apiClient.get<{
          success: boolean;
          data: any[];
        }>('/distribucion/mis-distribuciones');
        const data = response.data;

        if (!data.success) {
          throw new Error(data.message || 'Error al obtener tus distribuciones');
        }

        return DistribucionModel.fromJSONArray(data.data || []);
      }
    }