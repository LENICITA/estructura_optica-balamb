// src/core/controllers/PedidoController.ts
import { PedidoService } from '../services/PedidoService';
import { PedidoModel } from '../models/PedidoModel';

export interface CrearPedidoData {
  id_formula?: number;
  direccion_entrega: string;
  ciudad_envio: string;
  productos: Array<{ id_producto: number; cantidad: number }>;
}

export interface PedidoResult {
  success: boolean;
  message?: string;
  data?: any;
}

export class PedidoController {
  private pedidoService: PedidoService;

  constructor() {
    this.pedidoService = new PedidoService();
  }

  // ===== CREAR PEDIDO =====
  async crearPedido(data: CrearPedidoData): Promise<PedidoResult> {
    try {
      // Validaciones
      if (!data.direccion_entrega || !data.direccion_entrega.trim()) {
        return {
          success: false,
          message: 'La dirección de entrega es obligatoria',
        };
      }

      if (!data.ciudad_envio || !data.ciudad_envio.trim()) {
        return {
          success: false,
          message: 'La ciudad de envío es obligatoria',
        };
      }

      if (!data.productos || data.productos.length === 0) {
        return {
          success: false,
          message: 'Debes agregar al menos un producto',
        };
      }

      const result = await this.pedidoService.crearPedido(data);

      return {
        success: true,
        message: 'Pedido creado exitosamente',
        data: result,
      };

    } catch (error: any) {
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
  async getMisPedidos(): Promise<PedidoModel[]> {
    try {
      return await this.pedidoService.getMisPedidos();
    } catch (error) {
      console.error(' Error en getMisPedidos:', error);
      return [];
    }
  }

  // ===== OBTENER PEDIDO POR ID =====
  async getPedidoById(id: number): Promise<PedidoModel | null> {
    try {
      return await this.pedidoService.getPedidoById(id);
    } catch (error) {
      console.error(' Error en getPedidoById:', error);
      return null;
    }
  }

  // ===== CANCELAR PEDIDO =====
  async cancelarPedido(id: number): Promise<PedidoResult> {
    try {
      const result = await this.pedidoService.cancelarPedido(id);

      return {
        success: result.success,
        message: result.message || 'Pedido cancelado exitosamente',
      };

    } catch (error: any) {
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
  async getTodosLosPedidos(): Promise<PedidoModel[]> {
    try {
      return await this.pedidoService.getTodosLosPedidos();
    } catch (error) {
      console.error(' Error en getTodosLosPedidos:', error);
      return [];
    }
  }

  // ===== ADMIN: OBTENER PEDIDOS POR ESTADO =====
  async getPedidosByEstado(estado: string): Promise<PedidoModel[]> {
    try {
      return await this.pedidoService.getPedidosByEstado(estado);
    } catch (error) {
      console.error(' Error en getPedidosByEstado:', error);
      return [];
    }
  }

  // ===== ADMIN: ACTUALIZAR ESTADO DEL PEDIDO =====
  async actualizarEstadoPedido(id: number, estado: string): Promise<PedidoResult> {
    try {
      const estadosValidos = ['Abonado', 'Listo', 'Pagado', 'En Proceso', 'Enviado', 'Entregado'];
      if (!estadosValidos.includes(estado)) {
        return {
          success: false,
          message: 'Estado inválido. Debe ser: Abonado, Listo, Pagado, En Proceso, Enviado, Entregado',
        };
      }

      const result = await this.pedidoService.actualizarEstadoPedido(id, estado);

      return {
        success: result.success,
        message: result.message || `Estado actualizado a: ${estado}`,
      };

    } catch (error: any) {
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
  async marcarPedidoComoListo(id: number): Promise<PedidoResult> {
    try {
      const result = await this.pedidoService.marcarPedidoComoListo(id);

      return {
        success: result.success,
        message: result.message || 'Pedido marcado como LISTO',
      };

    } catch (error: any) {
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

  // ===== ADMIN: OBTENER ESTADÍSTICAS =====
  async getEstadisticas(): Promise<any> {
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