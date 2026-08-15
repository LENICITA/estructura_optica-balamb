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
      ciudad: string;
    };
  };
  repartidor?: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
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
      ciudad: string;
    };
  };
  repartidor?: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
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
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get direccionCompleta(): string {
    if (!this.pedido) return '';
    return `${this.pedido.direccion_entrega}, ${this.pedido.ciudad_envio}`;
  }

  static fromJSON(data: any): DistribucionModel {
    return new DistribucionModel({
      id_distribucion: data.id_distribucion || data.id || 0,
      id_pedido: data.id_pedido || 0,
      id_usuario: data.id_usuario || 0,
      estado: data.estado || 'PENDIENTE',
      fecha_asignacion: data.fecha_asignacion || new Date().toISOString(),
      fecha_entrega: data.fecha_entrega || null,
      observaciones: data.observaciones || null,
      pedido: data.pedido,
      repartidor: data.repartidor,
    });
  }

  static fromJSONArray(data: any[]): DistribucionModel[] {
    return data.map(item => DistribucionModel.fromJSON(item));
  }
}