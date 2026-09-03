// src/core/controllers/PagoController.ts

import { PagoService } from '../services/PagoService';
import { PagoModel } from '../models/PagoModel';

export interface CrearPagoData {
  id_pedido: number;
  eleccion_pago: '50%' | '100%';
  monto: number;
}

export interface PagoResult {
  success: boolean;
  message?: string;
  data?: any;
}

export class PagoController {
  private pagoService: PagoService;

  constructor() {
    this.pagoService = new PagoService();
  }

  // ===== CREAR PAGO =====
  async crearPago(data: CrearPagoData): Promise<PagoResult> {
    try {
      // Validaciones
      if (!data.id_pedido) {
        return {
          success: false,
          message: 'El ID del pedido es obligatorio',
        };
      }

      if (!data.eleccion_pago || !['50%', '100%'].includes(data.eleccion_pago)) {
        return {
          success: false,
          message: 'La elección de pago debe ser 50% o 100%',
        };
      }

      if (!data.monto || data.monto <= 0) {
        return {
          success: false,
          message: 'El monto debe ser mayor a 0',
        };
      }

      const result = await this.pagoService.crearPago(data);

      return {
        success: result.success,
        message: result.message || 'Link de pago generado exitosamente',
        data: result.data,
      };

    } catch (error: any) {
      console.error('Error en crearPago:', error);

      let message = 'Error al crear el pago';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message,
      };
    }
  }

  // ===== OBTENER PAGOS POR PEDIDO =====
  async obtenerPagosPorPedido(pedidoId: number): Promise<PagoModel[]> {
    try {
      return await this.pagoService.obtenerPagosPorPedido(pedidoId);
    } catch (error) {
      console.error('Error en obtenerPagosPorPedido:', error);
      return [];
    }
  }

  // ===== VERIFICAR SALDO DEL PEDIDO =====
  async verificarSaldo(pedidoId: number): Promise<any> {
    try {
      const result = await this.pagoService.verificarSaldo(pedidoId);
      return result.data;
    } catch (error) {
      console.error('Error en verificarSaldo:', error);
      return {
        total_pedido: 0,
        total_pagado: 0,
        saldo_pendiente: 0,
        estado_pago: 'SIN_PAGO',
        tiene_abono_50: false,
        tiene_pago_completo: false,
      };
    }
  }

  // ===== CONFIRMAR PAGO (WEBHOOK) =====
  async confirmarPago(id_pago: number): Promise<PagoResult> {
    try {
      const result = await this.pagoService.confirmarPago(id_pago);

      return {
        success: result.success,
        message: result.message || 'Pago confirmado exitosamente',
        data: result.data,
      };

    } catch (error: any) {
      console.error('Error en confirmarPago:', error);
      return {
        success: false,
        message: error.message || 'Error al confirmar el pago',
      };
    }
  }

  // ===== RECHAZAR PAGO (WEBHOOK) =====
  async rechazarPago(id_pago: number, motivo?: string): Promise<PagoResult> {
    try {
      const result = await this.pagoService.rechazarPago(id_pago, motivo);

      return {
        success: result.success,
        message: result.message || 'Pago rechazado',
        data: result.data,
      };

    } catch (error: any) {
      console.error('Error en rechazarPago:', error);
      return {
        success: false,
        message: error.message || 'Error al rechazar el pago',
      };
    }
  }
}