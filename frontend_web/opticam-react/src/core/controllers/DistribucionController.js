// src/core/controllers/DistribucionController.js
import { DistribucionService } from '../services/DistribucionService';
import {
  validarAsignacion,
  checkIdDistribucion,
  checkObservacion,
} from '../../shared/validators/distribucionValidators';

export class DistribucionController {
  constructor() {
    this.distribucionService = new DistribucionService();
  }

  // ===== ADMIN - GESTIÓN =====

  async asignarPedido(data) {
    try {
      const check = validarAsignacion({
        id_pedido: data.id_pedido,
        id_usuario: data.id_usuario,
        observaciones: data.observaciones,
      });

      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'Datos inválidos',
        };
      }

      const result = await this.distribucionService.asignarPedido(data);

      return {
        success: result.success,
        message: result.message || 'Pedido asignado exitosamente',
        data: result.data,
      };
    } catch (error) {
      console.error(' Error en asignarPedido:', error);
      let message = 'Error al asignar el pedido';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, message };
    }
  }

  async getTodasDistribuciones() {
    try {
      return await this.distribucionService.getTodasDistribuciones();
    } catch (error) {
      console.error(' Error en getTodasDistribuciones:', error);
      return [];
    }
  }

  async getDistribucionesExternas() {
    try {
      return await this.distribucionService.getDistribucionesExternas();
    } catch (error) {
      console.error(' Error en getDistribucionesExternas:', error);
      return [];
    }
  }

  async cancelarEntrega(id, observacion) {
    try {
      const checkId = checkIdDistribucion(id);
      if (!checkId.valido) {
        return {
          success: false,
          message: checkId.mensaje || 'ID de distribución inválido',
        };
      }

      const checkObs = checkObservacion(observacion);
      if (!checkObs.valido) {
        return {
          success: false,
          message: checkObs.mensaje || 'Observación inválida',
        };
      }

      const result = await this.distribucionService.cancelarEntrega(id, observacion);

      return {
        success: result.success,
        message: result.message || 'Entrega cancelada exitosamente',
      };
    } catch (error) {
      console.error(' Error en cancelarEntrega:', error);
      let message = 'Error al cancelar la entrega';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, message };
    }
  }

  // ===== ADMIN Y REPARTIDOR =====

  async getPendientes() {
    try {
      return await this.distribucionService.getPendientes();
    } catch (error) {
      console.error(' Error en getPendientes:', error);
      return [];
    }
  }

  async getEnEntrega() {
    try {
      return await this.distribucionService.getEnEntrega();
    } catch (error) {
      console.error(' Error en getEnEntrega:', error);
      return [];
    }
  }

  async getHistorial() {
    try {
      return await this.distribucionService.getHistorial();
    } catch (error) {
      console.error(' Error en getHistorial:', error);
      return [];
    }
  }

  async getDistribucionById(id) {
    try {
      const check = checkIdDistribucion(id);
      if (!check.valido) {
        console.error('ID de distribución inválido:', id);
        return null;
      }

      return await this.distribucionService.getDistribucionById(id);
    } catch (error) {
      console.error(' Error en getDistribucionById:', error);
      return null;
    }
  }

  async iniciarEntrega(id) {
    try {
      const check = checkIdDistribucion(id);
      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'ID de distribución inválido',
        };
      }

      const result = await this.distribucionService.iniciarEntrega(id);

      return {
        success: result.success,
        message: result.message || 'Entrega iniciada exitosamente',
        data: result.data,
      };
    } catch (error) {
      console.error(' Error en iniciarEntrega:', error);
      let message = 'Error al iniciar la entrega';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, message };
    }
  }

  async marcarEntregado(id, observacion) {
    try {
      const checkId = checkIdDistribucion(id);
      if (!checkId.valido) {
        return {
          success: false,
          message: checkId.mensaje || 'ID de distribución inválido',
        };
      }

      const checkObs = checkObservacion(observacion);
      if (!checkObs.valido) {
        return {
          success: false,
          message: checkObs.mensaje || 'Observación inválida',
        };
      }

      const result = await this.distribucionService.marcarEntregado(id, observacion);

      return {
        success: result.success,
        message: result.message || 'Pedido marcado como entregado',
        data: result.data,
      };
    } catch (error) {
      console.error(' Error en marcarEntregado:', error);
      let message = 'Error al marcar como entregado';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, message };
    }
  }

  // ===== REPARTIDOR =====

  async getMisDistribuciones() {
    try {
      return await this.distribucionService.getMisDistribuciones();
    } catch (error) {
      console.error(' Error en getMisDistribuciones:', error);
      return [];
    }
  }
}