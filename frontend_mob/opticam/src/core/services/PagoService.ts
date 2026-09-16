// src/core/services/PagoService.ts

import { apiClient } from './ApiClient';
import { PagoModel } from '../models/PagoModel';

export interface CrearPagoRequest {
  id_pedido: number;
  eleccion_pago: '50%' | '100%';
  monto: number;
  canal_pago?: string;
}

export interface CrearPagoResponse {
  success: boolean;
  message: string;
  data: {
    id_pago: number;
    bold_link: string;
    bold_reference: string;
  };
}

export interface SaldoPedidoResponse {
  success: boolean;
  data: {
    total_pedido: number;
    total_pagado: number;
    saldo_pendiente: number;
    estado_pago: 'SIN_PAGO' | 'ABONADO_50' | 'PAGADO_COMPLETO';
    tiene_abono_50: boolean;
    tiene_pago_completo: boolean;
  };
}

export interface PagoResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class PagoService {
  // ===== CREAR PAGO =====
  async crearPago(data: CrearPagoRequest): Promise<CrearPagoResponse> {
    try {
      const response = await apiClient.post<CrearPagoResponse>('/pagos', data);
      return response.data;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible crear el pago';
      throw new Error(mensaje);
    }
  }

  // ===== OBTENER PAGOS POR PEDIDO =====
  async obtenerPagosPorPedido(pedidoId: number): Promise<PagoModel[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: any[] }>(
        `/pagos/pedido/${pedidoId}`
      );
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener pagos');
      }

      return PagoModel.fromJSONArray(data.data || []);
    } catch (error: any) {
      // Si el pedido no tiene pagos, el backend puede devolver 404
      // En ese caso devolvemos array vacío
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  // ===== VERIFICAR SALDO DEL PEDIDO =====
  async verificarSaldo(pedidoId: number): Promise<SaldoPedidoResponse> {
    try {
      const response = await apiClient.get<SaldoPedidoResponse>(
        `/pagos/pedido/${pedidoId}/saldo`
      );
      return response.data;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible verificar el saldo';
      throw new Error(mensaje);
    }
  }

  // ===== CONFIRMAR PAGO (WEBHOOK) =====
  async confirmarPago(id_pago: number): Promise<PagoResponse> {
    try {
      const response = await apiClient.put<PagoResponse>(
        `/pagos/${id_pago}/confirmar`
      );
      return response.data;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible confirmar el pago';
      throw new Error(mensaje);
    }
  }

  // ===== RECHAZAR PAGO (WEBHOOK) =====
  async rechazarPago(id_pago: number, motivo?: string): Promise<PagoResponse> {
    try {
      const response = await apiClient.put<PagoResponse>(
        `/pagos/${id_pago}/rechazar`,
        { motivo }
      );
      return response.data;
    } catch (error: any) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        'No fue posible rechazar el pago';
      throw new Error(mensaje);
    }
  }
}