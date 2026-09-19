// src/core/controllers/DistribucionController.ts
import { DistribucionService } from '../services/DistribucionService';
import { DistribucionModel } from '../models/DistribucionModel';
import {
  validarAsignacion,
  checkIdDistribucion,
  checkObservacion,
} from '../../shared/validators/distribucionValidators';

export interface AsignarPedidoData {
  id_pedido: number;
  id_usuario: number;
  observaciones?: string;
}

export interface DistribucionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export class DistribucionController {
  private distribucionService: DistribucionService;

  constructor() {
    this.distribucionService = new DistribucionService();
  }

  // ADMIN - GESTIÓN

  //  ASIGNAR PEDIDO A REPARTIDOR (ADMIN)
  async asignarPedido(data: AsignarPedidoData): Promise<DistribucionResult> {
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
      } catch (error: any) {
        console.error('Error en asignarPedido:', error);

        let message = 'Error al asignar el pedido';
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }

        return { success: false, message };
      }
    }


  //  OBTENER TODAS LAS DISTRIBUCIONES (ADMIN)
  async getTodasDistribuciones(): Promise<DistribucionModel[]> {
      try {
        return await this.distribucionService.getTodasDistribuciones();
      } catch (error) {
        console.error('Error en getTodasDistribuciones:', error);
        return [];
      }
    }

  //  OBTENER DISTRIBUCIONES EXTERNAS (ADMIN)
  async getDistribucionesExternas(): Promise<DistribucionModel[]> {
      try {
        return await this.distribucionService.getDistribucionesExternas();
      } catch (error) {
        console.error('Error en getDistribucionesExternas:', error);
        return [];
      }
    }

  //  CANCELAR ENTREGA (ADMIN)
  async cancelarEntrega(
      id: number,
      observacion?: string
    ): Promise<DistribucionResult> {
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

        const result = await this.distribucionService.cancelarEntrega(
          id,
          observacion
        );

        return {
          success: result.success,
          message: result.message || 'Entrega cancelada exitosamente',
        };
      } catch (error: any) {
        console.error('Error en cancelarEntrega:', error);

        let message = 'Error al cancelar la entrega';
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }

        return { success: false, message };
      }
    }

  // ADMIN Y REPARTIDOR - PENDIENTES

  //  OBTENER PEDIDOS PENDIENTES (ADMIN ve externas, REPARTIDOR ve sus pendientes)
  async getPendientes(): Promise<DistribucionModel[]> {
      try {
        return await this.distribucionService.getPendientes();
      } catch (error) {
        console.error('Error en getPendientes:', error);
        return [];
      }
    }

  //  OBTENER PEDIDOS EN ENTREGA (ADMIN ve externas, REPARTIDOR ve sus en entrega)
  async getEnEntrega(): Promise<DistribucionModel[]> {
      try {
        return await this.distribucionService.getEnEntrega();
      } catch (error) {
        console.error('Error en getEnEntrega:', error);
        return [];
      }
    }


  //  OBTENER HISTORIAL (ADMIN ve externas, REPARTIDOR ve su historial)
  async getHistorial(): Promise<DistribucionModel[]> {
      try {
        return await this.distribucionService.getHistorial();
      } catch (error) {
        console.error('Error en getHistorial:', error);
        return [];
      }
    }

  //  OBTENER DISTRIBUCIÓN POR ID (ADMIN y REPARTIDOR)
  async getDistribucionById(id: number): Promise<DistribucionModel | null> {
      try {
        const check = checkIdDistribucion(id);
        if (!check.valido) {
          console.error('ID de distribución inválido:', id);
          return null;
        }

        return await this.distribucionService.getDistribucionById(id);
      } catch (error) {
        console.error('Error en getDistribucionById:', error);
        return null;
      }
    }

  // ADMIN Y REPARTIDOR - ACCIONES

  //  INICIAR ENTREGA (ADMIN solo externas, REPARTIDOR sus pedidos)
  async iniciarEntrega(id: number): Promise<DistribucionResult> {
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
      } catch (error: any) {
        console.error('Error en iniciarEntrega:', error);

        let message = 'Error al iniciar la entrega';
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }

        return { success: false, message };
      }
    }

  //  MARCAR ENTREGADO (ADMIN solo externas, REPARTIDOR sus pedidos)
  async marcarEntregado(
      id: number,
      observacion?: string
    ): Promise<DistribucionResult> {
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

        const result = await this.distribucionService.marcarEntregado(
          id,
          observacion
        );

        return {
          success: result.success,
          message: result.message || 'Pedido marcado como entregado',
          data: result.data,
        };
      } catch (error: any) {
        console.error('Error en marcarEntregado:', error);

        let message = 'Error al marcar como entregado';
        if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }

        return { success: false, message };
      }
    }


//  REPARTIDOR - VER TODAS MIS DISTRIBUCIONES (TODOS LOS ESTADOS)
  async getMisDistribuciones(): Promise<DistribucionModel[]> {
      try {
        return await this.distribucionService.getMisDistribuciones();
      } catch (error) {
        console.error('Error en getMisDistribuciones:', error);
        return [];
      }
    }
  }