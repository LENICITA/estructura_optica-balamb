// src/core/controllers/PagoController.js
import { PagoService } from '../services/PagoService';
import {
  validarFormularioPago,
  checkIdPago,
  checkIdPedido
} from '../../shared/validators/pagoValidators';

export class PagoController {
  constructor() {
    this.pagoService = new PagoService();
  }

  // ===== CREAR PAGO =====
  async crearPago(data) {
    try {
      const check = validarFormularioPago({
        id_pedido: data.id_pedido,
        eleccion_pago: data.eleccion_pago,
        monto: data.monto
      });

      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'Datos inválidos',
        };
      }

      const result = await this.pagoService.crearPago(data);

      return {
        success: result.success,
        message: result.message || 'Link de pago generado exitosamente',
        data: result.data,
      };

    } catch (error) {
      console.error(' Error en crearPago:', error);
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
  async obtenerPagosPorPedido(pedidoId) {
    try {
      const checkId = checkIdPedido(pedidoId);
      if (!checkId.valido) {
        console.error('ID de pedido inválido:', pedidoId);
        return [];
      }

      return await this.pagoService.obtenerPagosPorPedido(pedidoId);
    } catch (error) {
      console.error(' Error en obtenerPagosPorPedido:', error);
      return [];
    }
  }

  // ===== VERIFICAR SALDO DEL PEDIDO =====
  async verificarSaldo(pedidoId) {
    try {
      const checkId = checkIdPedido(pedidoId);
      if (!checkId.valido) {
        console.error('ID de pedido inválido:', pedidoId);
        return {
          total_pedido: 0,
          total_pagado: 0,
          saldo_pendiente: 0,
          estado_pago: 'SIN_PAGO',
          tiene_abono_50: false,
          tiene_pago_completo: false,
        };
      }
      const result = await this.pagoService.verificarSaldo(pedidoId);
      return result.data;
    } catch (error) {
      console.error(' Error en verificarSaldo:', error);
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
  async confirmarPago(id_pago) {
    try {
      const checkId = checkIdPago(id_pago);
      if (!checkId.valido) {
        return {
          success: false,
          message: checkId.mensaje || 'ID de pago inválido',
        };
      }

      const result = await this.pagoService.confirmarPago(id_pago);

      return {
        success: result.success,
        message: result.message || 'Pago confirmado exitosamente',
        data: result.data,
      };

    } catch (error) {
      console.error(' Error en confirmarPago:', error);
      return {
        success: false,
        message: error.message || 'Error al confirmar el pago',
      };
    }
  }

  // ===== RECHAZAR PAGO (WEBHOOK) =====
  async rechazarPago(id_pago, motivo) {
    try {
      const checkId = checkIdPago(id_pago);
      if (!checkId.valido) {
        return {
          success: false,
          message: checkId.mensaje || 'ID de pago inválido',
        };
      }
      const result = await this.pagoService.rechazarPago(id_pago, motivo);

      return {
        success: result.success,
        message: result.message || 'Pago rechazado',
        data: result.data,
      };

    } catch (error) {
      console.error(' Error en rechazarPago:', error);
      return {
        success: false,
        message: error.message || 'Error al rechazar el pago',
      };
    }
  }
}