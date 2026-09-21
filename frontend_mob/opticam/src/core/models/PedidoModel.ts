// src/core/models/PedidoModel.ts

export type EstadoPedido =
  | 'Pendiente'
  | 'Abonado'
  | 'Listo'
  | 'Pagado'
  | 'En Proceso'
  | 'Enviado'
  | 'Entregado'
  | 'Cancelado';

export interface Pedido {
  id_pedido: number;
  id_usuario: number;
  id_formula?: number | null;
  fecha_pedido: string;
  fecha_estimada: string;
  direccion_entrega: string;
  ciudad_envio: string;
  estado: EstadoPedido;
  costo_envio: number;
  total: number;
  cliente?: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
  };
  formula?: {
    id_formula: number;
    condicion: string;
    imagen_formula: string;
    observaciones: string;
    costo: number;
  };
  productos?: any[];
  repartidor_nombre?: string;
}

export class PedidoModel implements Pedido {
  id_pedido: number;
  id_usuario: number;
  id_formula?: number | null;
  fecha_pedido: string;
  fecha_estimada: string;
  direccion_entrega: string;
  ciudad_envio: string;
  estado: EstadoPedido;
  costo_envio: number;
  total: number;
  cliente?: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
  };
  formula?: {
    id_formula: number;
    condicion: string;
    imagen_formula: string;
    observaciones: string;
    costo: number;
  };
  productos?: any[];
  repartidor_nombre?: string;

  constructor(data: Pedido) {
    this.id_pedido = data.id_pedido;
    this.id_usuario = data.id_usuario;
    this.id_formula = data.id_formula;
    this.fecha_pedido = data.fecha_pedido;
    this.fecha_estimada = data.fecha_estimada;
    this.direccion_entrega = data.direccion_entrega;
    this.ciudad_envio = data.ciudad_envio;
    this.estado = data.estado;
    this.costo_envio = data.costo_envio;
    this.total = data.total;
    this.cliente = data.cliente;
    this.formula = data.formula;
    this.productos = data.productos;
    this.repartidor_nombre = data.repartidor_nombre;
  }

  get estadoDisplay(): string {
    const map: Record<EstadoPedido, string> = {
      'Pendiente': 'Pendiente',
      'Abonado': 'Abonado (50%)',
      'Listo': 'Listo para pagar',
      'Pagado': 'Pagado',
      'En Proceso': 'En proceso',
      'Enviado': 'Enviado',
      'Entregado': 'Entregado',
      'Cancelado': 'Cancelado',
    };
    return map[this.estado] || this.estado;
  }

  get estadoColor(): string {
    const map: Record<EstadoPedido, string> = {
      'Pendiente': '#D97706',
      'Abonado': '#2563EB',
      'Listo': '#7C3AED',
      'Pagado': '#059669',
      'En Proceso': '#0284C7',
      'Enviado': '#6366F1',
      'Entregado': '#22C55E',
      'Cancelado': '#EF4444',
    };
    return map[this.estado] || '#6B7280';
  }

  get totalFormateado(): string {
    return `$${this.total.toLocaleString('es-CO')}`;
  }

  get fechaFormateada(): string {
    const date = new Date(this.fecha_pedido);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get fechaEstimadaFormateada(): string {
    const date = new Date(this.fecha_estimada);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  static fromJSON(data: any): PedidoModel {
    return new PedidoModel({
      id_pedido: data.id_pedido || data.id || 0,
      id_usuario: data.id_usuario || 0,
      id_formula: data.id_formula || null,
      fecha_pedido: data.fecha_pedido || new Date().toISOString(),
      fecha_estimada: data.fecha_estimada || '',
      direccion_entrega: data.direccion_entrega || '',
      ciudad_envio: data.ciudad_envio || '',
      estado: data.estado || 'Pendiente',
      costo_envio: data.costo_envio || 0,
      total: data.total || 0,
      cliente: data.cliente,
      formula: data.formula,
      productos: data.productos || [],
      repartidor_nombre: data.repartidor_nombre || '',
    });
  }

  static fromJSONArray(data: any[]): PedidoModel[] {
    return data.map(item => PedidoModel.fromJSON(item));
  }
}