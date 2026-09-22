// src/core/services/DistribucionService.js
import { apiClient } from './ApiClient';
import { DistribucionModel } from '../../shared/types/DistribucionModel';

export class DistribucionService {
  // ============================================
  // ADMIN
  // ============================================

  async asignarPedido(data) {
    try {
      const response = await apiClient.post('/distribucion', data);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible asignar el pedido';
      return { success: false, message: mensaje };
    }
  }

  async getTodasDistribuciones() {
    const response = await apiClient.get('/distribucion/admin/todas');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener distribuciones');
    }

    return DistribucionModel.fromJSONArray(data.data || []);
  }

  async getDistribucionesExternas() {
    const response = await apiClient.get('/distribucion/admin/externas');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener distribuciones externas');
    }

    return DistribucionModel.fromJSONArray(data.data || []);
  }

  async cancelarEntrega(id, observacion) {
    try {
      const response = await apiClient.put(`/distribucion/admin/${id}/cancelar`, {
        observacion,
      });
      return response.data;
    } catch (error) {
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

  async getPendientes() {
    const response = await apiClient.get('/distribucion/pendientes');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedidos pendientes');
    }

    return DistribucionModel.fromJSONArray(data.data || []);
  }

  async getEnEntrega() {
    const response = await apiClient.get('/distribucion/en-entrega');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedidos en entrega');
    }

    return DistribucionModel.fromJSONArray(data.data || []);
  }

  async getHistorial() {
    const response = await apiClient.get('/distribucion/historial');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener historial');
    }

    return DistribucionModel.fromJSONArray(data.data || []);
  }

  async getDistribucionById(id) {
    const response = await apiClient.get(`/distribucion/${id}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener la distribución');
    }

    if (!data.data) return null;

    return DistribucionModel.fromJSON(data.data);
  }

  async iniciarEntrega(id) {
    try {
      const response = await apiClient.patch(`/distribucion/${id}/iniciar`);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible iniciar la entrega';
      return { success: false, message: mensaje };
    }
  }

  async marcarEntregado(id, observacion) {
    try {
      const response = await apiClient.patch(`/distribucion/${id}/entregar`, {
        observacion,
      });
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible marcar como entregado';
      return { success: false, message: mensaje };
    }
  }

  // ============================================
  // REPARTIDOR
  // ============================================

  async getMisDistribuciones() {
    const response = await apiClient.get('/distribucion/mis-distribuciones');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener tus distribuciones');
    }

    return DistribucionModel.fromJSONArray(data.data || []);
  }
}