// src/shared/types/PedidoModel.js

export class PedidoModel {
  constructor(data) {
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

  get estadoDisplay() {
    const map = {
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

  get estadoColor() {
    const map = {
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

  get totalFormateado() {
    return `$${this.total.toLocaleString('es-CO')}`;
  }

  get fechaFormateada() {
    const date = new Date(this.fecha_pedido);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get fechaEstimadaFormateada() {
    const date = new Date(this.fecha_estimada);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  static fromJSON(data) {
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

  static fromJSONArray(data) {
    return data.map(item => PedidoModel.fromJSON(item));
  }
}