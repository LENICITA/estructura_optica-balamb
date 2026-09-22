// src/core/services/PedidoService.js
import { apiClient } from './ApiClient';
import { PedidoModel } from '../../shared/types/PedidoModel';

export class PedidoService {
  // ===== CREAR PEDIDO =====
  async crearPedido(data) {
    const response = await apiClient.post('/pedidos', data);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || 'Error al crear el pedido');
    }

    return {
      success: true,
      message: result.message || 'Pedido creado exitosamente',
      data: result.data,
    };
  }

  // ===== OBTENER MIS PEDIDOS (CLIENTE) =====
  async getMisPedidos() {
    const response = await apiClient.get('/pedidos/mis-pedidos');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedidos');
    }

    return PedidoModel.fromJSONArray(data.data || []);
  }

  // ===== OBTENER PEDIDO POR ID =====
  async getPedidoById(id) {
    const response = await apiClient.get(`/pedidos/${id}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedido');
    }

    if (!data.data) return null;

    const pedidoData = {
      ...(data.data.pedido || data.data),
      productos: data.data.productos || data.data.pedido?.productos || [],
    };

    return PedidoModel.fromJSON(pedidoData);
  }

  // ===== CANCELAR PEDIDO =====
  async cancelarPedido(id) {
    try {
      const response = await apiClient.put(`/pedidos/${id}/cancelar`);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible cancelar el pedido';
      return { success: false, message: mensaje };
    }
  }

  // ===== ADMIN: OBTENER TODOS LOS PEDIDOS =====
  async getTodosLosPedidos() {
    const response = await apiClient.get('/pedidos/admin/todos');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedidos');
    }

    return PedidoModel.fromJSONArray(data.data || []);
  }

  // ===== ADMIN: OBTENER PEDIDOS POR ESTADO =====
  async getPedidosByEstado(estado) {
    const response = await apiClient.get(`/pedidos/admin/estado/${estado}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedidos por estado');
    }

    return PedidoModel.fromJSONArray(data.data || []);
  }

  // ===== ADMIN: ACTUALIZAR ESTADO DEL PEDIDO =====
  async actualizarEstadoPedido(id, estado) {
    try {
      const response = await apiClient.put(`/pedidos/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible actualizar el estado';
      return { success: false, message: mensaje };
    }
  }

  // ===== ADMIN: MARCAR PEDIDO COMO LISTO =====
  async marcarPedidoComoListo(id) {
    try {
      const response = await apiClient.put(`/pedidos/${id}/listo`);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible marcar el pedido como LISTO';
      return { success: false, message: mensaje };
    }
  }

  // ===== ADMIN: ACTUALIZAR FECHA ESTIMADA =====
  async actualizarFechaEstimada(id, fecha_estimada) {
    try {
      const response = await apiClient.put(`/pedidos/${id}/fecha-estimada`, {
        fecha_estimada,
      });
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible actualizar la fecha estimada';
      return { success: false, message: mensaje };
    }
  }

  // ===== ADMIN: OBTENER ESTADÍSTICAS =====
  async getEstadisticas() {
    const response = await apiClient.get('/pedidos/admin/estadisticas');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener estadísticas');
    }

    return data.data;
  }
}