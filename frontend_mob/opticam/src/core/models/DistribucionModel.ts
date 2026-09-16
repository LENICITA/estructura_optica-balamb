// src/core/models/DistribucionModel.ts

export type EstadoDistribucion =
  | 'PENDIENTE'
  | 'EN_ENTREGA'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface Distribucion {
  id_distribucion: number;
  id_pedido: number;
  id_usuario: number;
  estado: EstadoDistribucion;
  fecha_asignacion: string;
  fecha_entrega?: string | null;
  observaciones?: string | null;
  pedido?: {
    id_pedido: number;
    direccion_entrega: string;
    ciudad_envio: string;
    total: number;
    fecha_estimada: string;
    cliente?: {
      nombre: string;
      telefono: string;
      email: string;
      ciudad: string;
    };
  };
  repartidor?: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    vehiculo?: string | null;
  };
}

export class DistribucionModel implements Distribucion {
  id_distribucion: number;
  id_pedido: number;
  id_usuario: number;
  estado: EstadoDistribucion;
  fecha_asignacion: string;
  fecha_entrega?: string | null;
  observaciones?: string | null;
  pedido?: {
    id_pedido: number;
    direccion_entrega: string;
    ciudad_envio: string;
    total: number;
    fecha_estimada: string;
    cliente?: {
      nombre: string;
      telefono: string;
      email: string;
      ciudad: string;
    };
  };
  repartidor?: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    vehiculo?: string | null;
  };

  constructor(data: Distribucion) {
    this.id_distribucion = data.id_distribucion;
    this.id_pedido = data.id_pedido;
    this.id_usuario = data.id_usuario;
    this.estado = data.estado;
    this.fecha_asignacion = data.fecha_asignacion;
    this.fecha_entrega = data.fecha_entrega;
    this.observaciones = data.observaciones;
    this.pedido = data.pedido;
    this.repartidor = data.repartidor;
  }

  // ============================================
  // GETTERS
  // ============================================

  get vehiculoRepartidor(): string {
    if (!this.repartidor) return 'N/A';
    return this.repartidor.vehiculo || 'N/A';
  }

  get estadoDisplay(): string {
    const map: Record<EstadoDistribucion, string> = {
      'PENDIENTE': 'Pendiente',
      'EN_ENTREGA': 'En entrega',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado',
    };
    return map[this.estado] || this.estado;
  }

  get estadoColor(): string {
    const map: Record<EstadoDistribucion, string> = {
      'PENDIENTE': '#D97706',
      'EN_ENTREGA': '#2563EB',
      'ENTREGADO': '#22C55E',
      'CANCELADO': '#EF4444',
    };
    return map[this.estado] || '#6B7280';
  }

  get estadoIcon(): string {
    const map: Record<EstadoDistribucion, string> = {
      'PENDIENTE': 'time-outline',
      'EN_ENTREGA': 'bicycle-outline',
      'ENTREGADO': 'checkmark-circle-outline',
      'CANCELADO': 'close-circle-outline',
    };
    return map[this.estado] || 'information-circle-outline';
  }

  get fechaAsignacionFormateada(): string {
    const date = new Date(this.fecha_asignacion);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get fechaEntregaFormateada(): string {
    if (!this.fecha_entrega) return 'Sin fecha';
    const date = new Date(this.fecha_entrega);
    if (isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get fechaEntregaCompleta(): string {
    if (!this.fecha_entrega) return 'Sin fecha';
    const date = new Date(this.fecha_entrega);
    if (isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  get direccionCompleta(): string {
    if (!this.pedido) return '';
    return `${this.pedido.direccion_entrega}, ${this.pedido.ciudad_envio}`;
  }

  get totalFormateado(): string {
    const total = this.pedido?.total || 0;
    return `$${Number(total).toLocaleString('es-CO')}`;
  }

  get tieneObservacion(): boolean {
    return !!(
      this.observaciones &&
      this.observaciones.trim().length > 0
    );
  }

  get esExterna(): boolean {
    if (!this.pedido?.ciudad_envio) return false;
    const ciudad = this.pedido.ciudad_envio.toLowerCase().trim();
    return ciudad !== 'bogotá' && ciudad !== 'bogota';
  }

  // ============================================
  // FACTORY
  // ============================================

  static fromJSON(data: any): DistribucionModel {
    return new DistribucionModel({
      id_distribucion: data.id_distribucion || data.id || 0,
      id_pedido: data.id_pedido || 0,
      id_usuario: data.id_usuario || 0,
      estado: data.estado || 'PENDIENTE',
      fecha_asignacion:
        data.fecha_asignacion || new Date().toISOString(),
      fecha_entrega: data.fecha_entrega || null,
      observaciones: data.observaciones || null,
      pedido: {
        id_pedido: data.id_pedido || 0,
        direccion_entrega: data.direccion_entrega || '',
        ciudad_envio: data.ciudad_envio || '',
        total: data.total || 0,
        fecha_estimada: data.fecha_estimada || '',
        cliente: data.cliente_nombre
          ? {
              nombre: data.cliente_nombre || '',
              telefono: data.cliente_telefono || '',
              email: data.cliente_email || '',
              ciudad: data.cliente_ciudad || '',
            }
          : undefined,
      },
      repartidor: data.repartidor
        ? {
            id:
              data.repartidor.id ||
              data.repartidor.id_usuario ||
              0,
            nombre:
              data.repartidor.nombre ||
              data.repartidor.nombre_completo ||
              '',
            email: data.repartidor.email || '',
            telefono: data.repartidor.telefono || '',
            vehiculo: data.repartidor.vehiculo || null,
          }
        : undefined,
    });
  }

  static fromJSONArray(data: any[]): DistribucionModel[] {
    return data.map(item => DistribucionModel.fromJSON(item));
  }
}