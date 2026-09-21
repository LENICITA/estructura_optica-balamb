// src/core/services/PagoService.js
import { apiClient } from './ApiClient';
import { PagoModel } from '../../shared/types/PagoModel';

export class PagoService {
  // ===== CREAR PAGO =====
  async crearPago(data) {
    try {
      const response = await apiClient.post('/pagos', data);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible crear el pago';
      throw new Error(mensaje);
    }
  }

  // ===== OBTENER PAGOS POR PEDIDO =====
  async obtenerPagosPorPedido(pedidoId) {
    try {
      const response = await apiClient.get(`/pagos/pedido/${pedidoId}`);
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener pagos');
      }

      return PagoModel.fromJSONArray(data.data || []);
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  // ===== VERIFICAR SALDO DEL PEDIDO =====
  async verificarSaldo(pedidoId) {
    try {
      const response = await apiClient.get(`/pagos/pedido/${pedidoId}/saldo`);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible verificar el saldo';
      throw new Error(mensaje);
    }
  }

  // ===== CONFIRMAR PAGO (WEBHOOK) =====
  async confirmarPago(id_pago) {
    try {
      const response = await apiClient.put(`/pagos/${id_pago}/confirmar`);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible confirmar el pago';
      throw new Error(mensaje);
    }
  }

  // ===== RECHAZAR PAGO (WEBHOOK) =====
  async rechazarPago(id_pago, motivo) {
    try {
      const response = await apiClient.put(`/pagos/${id_pago}/rechazar`, {
        motivo,
      });
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible rechazar el pago';
      throw new Error(mensaje);
    }
  }
}