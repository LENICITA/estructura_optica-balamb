// src/core/controllers/DistribucionController.ts
import { DistribucionService } from '../services/DistribucionService';
import { DistribucionModel } from '../models/DistribucionModel';

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
      if (!data.id_pedido) {
        return { success: false, message: 'El ID del pedido es obligatorio' };
      }
      if (!data.id_usuario) {
        return { success: false, message: 'El ID del repartidor es obligatorio' };
      }

      const result = await this.distribucionService.asignarPedido(data);
      return {
        success: true,
        message: 'Pedido asignado exitosamente',
        data: result,
      };
    } catch (error: any) {
      console.error(' Error en asignarPedido:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al asignar pedido',
      };
    }
  }

  //  OBTENER TODAS LAS DISTRIBUCIONES (ADMIN)
  async getTodasDistribuciones(): Promise<DistribucionModel[]> {
    try {
      return await this.distribucionService.getTodasDistribuciones();
    } catch (error) {
      console.error(' Error en getTodasDistribuciones:', error);
      return [];
    }
  }

  //  OBTENER DISTRIBUCIONES EXTERNAS (ADMIN)
  async getDistribucionesExternas(): Promise<DistribucionModel[]> {
    try {
      return await this.distribucionService.getDistribucionesExternas();
    } catch (error) {
      console.error(' Error en getDistribucionesExternas:', error);
      return [];
    }
  }

  //  CANCELAR ENTREGA (ADMIN)
  async cancelarEntrega(id: number, observacion?: string): Promise<DistribucionResult> {
    try {
      const result = await this.distribucionService.cancelarEntrega(id, observacion);
      return {
        success: result.success,
        message: result.message || 'Entrega cancelada exitosamente',
      };
    } catch (error: any) {
      console.error(' Error en cancelarEntrega:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al cancelar la entrega',
      };
    }
  }

  // ADMIN Y REPARTIDOR - PENDIENTES

  //  OBTENER PEDIDOS PENDIENTES (ADMIN ve externas, REPARTIDOR ve sus pendientes)
  async getPendientes(): Promise<DistribucionModel[]> {
    try {
      return await this.distribucionService.getPendientes();
    } catch (error) {
      console.error(' Error en getPendientes:', error);
      return [];
    }
  }

  //  OBTENER PEDIDOS EN ENTREGA (ADMIN ve externas, REPARTIDOR ve sus en entrega)
  async getEnEntrega(): Promise<DistribucionModel[]> {
    try {
      return await this.distribucionService.getEnEntrega();
    } catch (error) {
      console.error(' Error en getEnEntrega:', error);
      return [];
    }
  }

  //  OBTENER HISTORIAL (ADMIN ve externas, REPARTIDOR ve su historial)
  async getHistorial(): Promise<DistribucionModel[]> {
    try {
      return await this.distribucionService.getHistorial();
    } catch (error) {
      console.error(' Error en getHistorial:', error);
      return [];
    }
  }

  //  OBTENER DISTRIBUCIÓN POR ID (ADMIN y REPARTIDOR)
  async getDistribucionById(id: number): Promise<DistribucionModel | null> {
    try {
      return await this.distribucionService.getDistribucionById(id);
    } catch (error) {
      console.error(' Error en getDistribucionById:', error);
      return null;
    }
  }

  // ADMIN Y REPARTIDOR - ACCIONES

  //  INICIAR ENTREGA (ADMIN solo externas, REPARTIDOR sus pedidos)
  async iniciarEntrega(id: number): Promise<DistribucionResult> {
    try {
      const result = await this.distribucionService.iniciarEntrega(id);
      return {
        success: result.success,
        message: result.message || 'Entrega iniciada exitosamente',
      };
    } catch (error: any) {
      console.error(' Error en iniciarEntrega:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al iniciar la entrega',
      };
    }
  }

  //  MARCAR ENTREGADO (ADMIN solo externas, REPARTIDOR sus pedidos)
  async marcarEntregado(id: number, observacion?: string): Promise<DistribucionResult> {
    try {
      const result = await this.distribucionService.marcarEntregado(id, observacion);
      return {
        success: result.success,
        message: result.message || 'Pedido marcado como entregado',
      };
    } catch (error: any) {
      console.error(' Error en marcarEntregado:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al marcar como entregado',
      };
    }
  }
}