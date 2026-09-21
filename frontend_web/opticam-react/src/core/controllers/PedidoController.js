// src/core/controllers/PedidoController.js
import { PedidoService } from '../services/PedidoService';
import {
  validarFormularioPedido,
  checkIdPedido,
  checkEstadoPedido,
  checkFechaEstimada,
  ESTADOS_ACTIVOS_ADMIN
} from '../../shared/validators/pedidoValidators';

export class PedidoController {
  constructor() {
    this.pedidoService = new PedidoService();
  }

  // ===== CREAR PEDIDO =====
  async crearPedido(data) {
    try {
      const check = validarFormularioPedido({
        direccion_entrega: data.direccion_entrega,
        ciudad_envio: data.ciudad_envio,
        productos: data.productos
      });

      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'Datos inválidos',
        };
      }

      const result = await this.pedidoService.crearPedido(data);

      return {
        success: true,
        message: result.message || 'Pedido creado exitosamente',
        data: result.data,
      };

    } catch (error) {
      console.error(' Error en crearPedido:', error);
      let message = 'Error al crear el pedido';
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

  // ===== OBTENER MIS PEDIDOS (CLIENTE) =====
  async getMisPedidos() {
    try {
      return await this.pedidoService.getMisPedidos();
    } catch (error) {
      console.error(' Error en getMisPedidos:', error);
      return [];
    }
  }

  // ===== OBTENER PEDIDO POR ID =====
  async getPedidoById(id) {
    try {
      const check = checkIdPedido(id);
      if (!check.valido) {
        console.error('ID de pedido inválido:', id);
        return null;
      }
      return await this.pedidoService.getPedidoById(id);
    } catch (error) {
      console.error(' Error en getPedidoById:', error);
      return null;
    }
  }

  // ===== CANCELAR PEDIDO =====
  async cancelarPedido(id) {
    try {
      const check = checkIdPedido(id);
      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'ID de pedido inválido',
        };
      }
      const result = await this.pedidoService.cancelarPedido(id);

      return {
        success: result.success,
        message: result.message || 'Pedido cancelado exitosamente',
      };

    } catch (error) {
      console.error(' Error en cancelarPedido:', error);
      let message = 'Error al cancelar el pedido';
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

  // ===== ADMIN: OBTENER TODOS LOS PEDIDOS =====
  async getTodosLosPedidos() {
    try {
      return await this.pedidoService.getTodosLosPedidos();
    } catch (error) {
      console.error(' Error en getTodosLosPedidos:', error);
      return [];
    }
  }

  // ===== ADMIN: OBTENER PEDIDOS POR ESTADO =====
  async getPedidosByEstado(estado) {
    try {
      if (!ESTADOS_ACTIVOS_ADMIN.includes(estado)) {
        console.error('Estado no permitido para admin:', estado);
        return [];
      }
      return await this.pedidoService.getPedidosByEstado(estado);
    } catch (error) {
      console.error(' Error en getPedidosByEstado:', error);
      return [];
    }
  }

  // ===== ADMIN: ACTUALIZAR ESTADO DEL PEDIDO =====
  async actualizarEstadoPedido(id, estado) {
    try {
      const checkId = checkIdPedido(id);
      if (!checkId.valido) {
        return {
          success: false,
          message: checkId.mensaje || 'ID de pedido inválido',
        };
      }

      const checkEstado = checkEstadoPedido(estado);
      if (!checkEstado.valido) {
        return {
          success: false,
          message: checkEstado.mensaje || 'Estado inválido',
        };
      }

      const result = await this.pedidoService.actualizarEstadoPedido(id, estado);

      return {
        success: result.success,
        message: result.message || `Estado actualizado a: ${estado}`,
      };

    } catch (error) {
      console.error(' Error en actualizarEstadoPedido:', error);
      let message = 'Error al actualizar estado';
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

  // ===== ADMIN: MARCAR PEDIDO COMO LISTO =====
  async marcarPedidoComoListo(id) {
    try {
      const check = checkIdPedido(id);
      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'ID de pedido inválido',
        };
      }
      const result = await this.pedidoService.marcarPedidoComoListo(id);

      return {
        success: result.success,
        message: result.message || 'Pedido marcado como LISTO',
      };

    } catch (error) {
      console.error(' Error en marcarPedidoComoListo:', error);
      let message = 'Error al marcar pedido como listo';
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

  // ===== ADMIN: ACTUALIZAR FECHA ESTIMADA =====
  async actualizarFechaEstimada(id, fecha_estimada) {
    try {
      const checkId = checkIdPedido(id);
      if (!checkId.valido) {
        return {
          success: false,
          message: checkId.mensaje || 'ID de pedido inválido',
        };
      }

      const checkFecha = checkFechaEstimada(fecha_estimada);
      if (!checkFecha.valido) {
        return {
          success: false,
          message: checkFecha.mensaje || 'Fecha inválida',
        };
      }

      return await this.pedidoService.actualizarFechaEstimada(id, fecha_estimada);
    } catch (error) {
      console.error(' Error en actualizarFechaEstimada:', error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          'No fue posible actualizar la fecha estimada',
      };
    }
  }

  // ===== ADMIN: OBTENER ESTADÍSTICAS =====
  async getEstadisticas() {
    try {
      return await this.pedidoService.getEstadisticas();
    } catch (error) {
      console.error(' Error en getEstadisticas:', error);
      return {
        total_pedidos: 0,
        abonados: 0,
        listos: 0,
        pagados: 0,
        en_proceso: 0,
        enviados: 0,
        entregados: 0,
        ingresos_totales: 0,
        promedio_venta: 0,
      };
    }
  }
}