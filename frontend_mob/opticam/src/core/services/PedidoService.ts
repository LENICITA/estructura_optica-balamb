// src/core/services/PedidoService.ts
import { apiClient } from './ApiClient';
import { PedidoModel } from '../models/PedidoModel';

export interface PedidoResponse {
  success: boolean;
  message?: string;
  data?: any;
  count?: number;
}

export interface CrearPedidoRequest {
  id_formula?: number;
  direccion_entrega: string;
  ciudad_envio: string;
  productos: Array<{ id_producto: number; cantidad: number }>;
}

export interface EstadisticasPedidos {
  total_pedidos: number;
  abonados: number;
  listos: number;
  pagados: number;
  en_proceso: number;
  enviados: number;
  entregados: number;
  ingresos_totales: number;
  promedio_venta: number;
}

export class PedidoService {
  // ===== CREAR PEDIDO =====
  async crearPedido(data: CrearPedidoRequest): Promise<{ id_pedido: number; total: number }> {
    const response = await apiClient.post<PedidoResponse>('/pedidos', data);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || 'Error al crear el pedido');
    }

    return {
      id_pedido: result.data?.id_pedido || 0,
      total: result.data?.total || 0,
    };
  }

  // ===== OBTENER MIS PEDIDOS (CLIENTE) =====
  async getMisPedidos(): Promise<PedidoModel[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/pedidos/mis-pedidos');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedidos');
    }

    return PedidoModel.fromJSONArray(data.data || []);
  }

  // ===== OBTENER PEDIDO POR ID =====
  async getPedidoById(id: number): Promise<PedidoModel | null> {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/pedidos/${id}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedido');
    }

    if (!data.data) return null;
    const pedidoData = data.data.pedido || data.data;
      return PedidoModel.fromJSON(pedidoData);
  }

  // ===== CANCELAR PEDIDO =====
  async cancelarPedido(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(`/pedidos/${id}/cancelar`);
    return response.data;
  }

  // ===== ADMIN: OBTENER TODOS LOS PEDIDOS =====
  async getTodosLosPedidos(): Promise<PedidoModel[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/pedidos/admin/todos');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedidos');
    }

    return PedidoModel.fromJSONArray(data.data || []);
  }

  // ===== ADMIN: OBTENER PEDIDOS POR ESTADO =====
  async getPedidosByEstado(estado: string): Promise<PedidoModel[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/pedidos/admin/estado/${estado}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener pedidos por estado');
    }

    return PedidoModel.fromJSONArray(data.data || []);
  }

  // ===== ADMIN: ACTUALIZAR ESTADO DEL PEDIDO =====
  async actualizarEstadoPedido(id: number, estado: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(`/pedidos/${id}/estado`, { estado });
    return response.data;
  }

  // ===== ADMIN: MARCAR PEDIDO COMO LISTO =====
  async marcarPedidoComoListo(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(`/pedidos/${id}/listo`);
    return response.data;
  }

  // ===== ADMIN: ACTUALIZAR FECHA ESTIMADA =====
  async actualizarFechaEstimada(id: number, fecha_estimada: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.put<{ success: boolean; message: string }>(`/pedidos/${id}/fecha-estimada`, { fecha_estimada });
    return response.data;
  }

  // ===== ADMIN: OBTENER ESTADÍSTICAS =====
  async getEstadisticas(): Promise<EstadisticasPedidos> {
    const response = await apiClient.get<{ success: boolean; data: EstadisticasPedidos }>('/pedidos/admin/estadisticas');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener estadísticas');
    }

    return data.data;
  }
}