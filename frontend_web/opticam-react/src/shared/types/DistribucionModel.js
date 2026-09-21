// src/shared/types/DistribucionModel.js

export class DistribucionModel {
  constructor(data) {
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

  get vehiculoRepartidor() {
    if (!this.repartidor) return 'N/A';
    return this.repartidor.vehiculo || 'N/A';
  }

  get estadoDisplay() {
    const map = {
      'PENDIENTE': 'Pendiente',
      'EN_ENTREGA': 'En entrega',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado',
    };
    return map[this.estado] || this.estado;
  }

  get estadoColor() {
    const map = {
      'PENDIENTE': '#D97706',
      'EN_ENTREGA': '#2563EB',
      'ENTREGADO': '#22C55E',
      'CANCELADO': '#EF4444',
    };
    return map[this.estado] || '#6B7280';
  }

  get estadoIcon() {
    const map = {
      'PENDIENTE': 'time-outline',
      'EN_ENTREGA': 'bicycle-outline',
      'ENTREGADO': 'checkmark-circle-outline',
      'CANCELADO': 'close-circle-outline',
    };
    return map[this.estado] || 'information-circle-outline';
  }

  get fechaAsignacionFormateada() {
    const date = new Date(this.fecha_asignacion);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get fechaEntregaFormateada() {
    if (!this.fecha_entrega) return 'Sin fecha';
    const date = new Date(this.fecha_entrega);
    if (isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  get fechaEntregaCompleta() {
    if (!this.fecha_entrega) return 'Sin fecha';
    const date = new Date(this.fecha_entrega);
    if (isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  get direccionCompleta() {
    if (!this.pedido) return '';
    return `${this.pedido.direccion_entrega}, ${this.pedido.ciudad_envio}`;
  }

  get totalFormateado() {
    const total = this.pedido?.total || 0;
    return `$${Number(total).toLocaleString('es-CO')}`;
  }

  get tieneObservacion() {
    return !!(
      this.observaciones &&
      this.observaciones.trim().length > 0
    );
  }

  get esExterna() {
    if (!this.pedido?.ciudad_envio) return false;
    const ciudad = this.pedido.ciudad_envio.toLowerCase().trim();
    return ciudad !== 'bogotá' && ciudad !== 'bogota';
  }

  // ============================================
  // FACTORY
  // ============================================

  static fromJSON(data) {
    const source = data?.data ?? data ?? {};
    const pedidoData = source.pedido || {};
    const clienteData = source.cliente || pedidoData.cliente || {};
    const repartidorData =
      source.repartidor ||
      source.repartidor_asignado ||
      source.admin_asignado ||
      {};

    return new DistribucionModel({
      id_distribucion: source.id_distribucion || source.id || 0,

      id_pedido: source.id_pedido || pedidoData.id_pedido || 0,

      id_usuario: source.id_usuario || 0,

      estado: source.estado || 'PENDIENTE',

      fecha_asignacion: source.fecha_asignacion || new Date().toISOString(),

      fecha_entrega: source.fecha_entrega || null,

      observaciones: source.observaciones || null,

      pedido: {
        id_pedido: pedidoData.id_pedido || source.id_pedido || 0,

        direccion_entrega:
          pedidoData.direccion_entrega || source.direccion_entrega || '',

        ciudad_envio:
          pedidoData.ciudad_envio ||
          source.ciudad_envio ||
          clienteData.ciudad ||
          source.cliente_ciudad ||
          '',

        total: pedidoData.total || source.total || 0,

        fecha_estimada:
          pedidoData.fecha_estimada || source.fecha_estimada || '',

        cliente:
          clienteData.nombre ||
          clienteData.nombre_completo ||
          source.cliente_nombre
            ? {
                nombre:
                  clienteData.nombre ||
                  clienteData.nombre_completo ||
                  source.cliente_nombre ||
                  '',

                telefono:
                  clienteData.telefono ||
                  source.cliente_telefono ||
                  '',

                email:
                  clienteData.email ||
                  source.cliente_email ||
                  '',

                ciudad:
                  clienteData.ciudad ||
                  source.cliente_ciudad ||
                  pedidoData.ciudad_envio ||
                  source.ciudad_envio ||
                  '',
              }
            : undefined,
      },

      repartidor:
        source.repartidor || repartidorData.id
          ? {
              id:
                repartidorData.id ||
                repartidorData.id_usuario ||
                0,

              nombre:
                repartidorData.nombre ||
                repartidorData.nombre_completo ||
                '',

              email: repartidorData.email || '',

              telefono: repartidorData.telefono || '',

              vehiculo: (() => {
                const v = repartidorData.vehiculo;
                if (!v) return null;
                if (typeof v === 'string') return v;
                if (typeof v === 'object') {
                  return (
                    v.descripcion ||
                    [v.tipo, v.modelo, v.placa].filter(Boolean).join(' • ') ||
                    null
                  );
                }
                return null;
              })(),
            }
          : undefined,
    });
  }

  static fromJSONArray(data) {
    return data.map(item => DistribucionModel.fromJSON(item));
  }
}