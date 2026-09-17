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
    const source = data?.data ?? data ?? {};
    const pedidoData = source.pedido || {};
    const clienteData =
      pedidoData.cliente || source.cliente || {};

    // Repartidor puede venir en varios sitios
    const repartidorData =
      source.repartidor ||
      pedidoData.repartidor ||
      {};

    // Si el backend manda repartidor como string, lo normalizamos
    const repartidorNombre =
      (typeof source.repartidor === 'string' && source.repartidor) ||
      (typeof pedidoData.repartidor === 'string' && pedidoData.repartidor) ||
      repartidorData.nombre ||
      repartidorData.nombre_completo ||
      repartidorData.usuario?.nombre ||
      repartidorData.usuario?.nombre_completo ||
      source.repartidor_nombre ||
      source.nombre_repartidor ||
      source.nombreRepartidor ||
      pedidoData.repartidor_nombre ||
      '';

    const repartidorEmail =
      repartidorData.email ||
      repartidorData.usuario?.email ||
      source.repartidor_email ||
      '';

    const repartidorTelefono =
      repartidorData.telefono ||
      repartidorData.usuario?.telefono ||
      source.repartidor_telefono ||
      '';

    const repartidorId =
      repartidorData.id ||
      repartidorData.id_usuario ||
      repartidorData.usuario?.id ||
      source.id_repartidor ||
      source.id_usuario ||
      0;

    // Vehículo también puede venir en varios sitios
    const vehiculoData =
      repartidorData.vehiculo ||
      repartidorData.tipo_vehiculo ||
      repartidorData.placa ||
      source.vehiculo ||
      source.tipo_vehiculo ||
      source.placa ||
      pedidoData.vehiculo ||
      null;

    const vehiculo =
      typeof vehiculoData === 'string'
        ? vehiculoData
        : vehiculoData?.placa ||
          vehiculoData?.tipo ||
          vehiculoData?.nombre ||
          null;

    // Construimos el objeto repartidor si tenemos al menos nombre o id
    const repartidor =
      repartidorNombre || repartidorId
        ? {
            id: Number(repartidorId) || 0,
            nombre: repartidorNombre,
            email: repartidorEmail,
            telefono: repartidorTelefono,
            vehiculo: vehiculo,
          }
        : undefined;

    return new DistribucionModel({
      id_distribucion:
        source.id_distribucion || source.id || 0,
      id_pedido:
        source.id_pedido || pedidoData.id_pedido || 0,
      id_usuario:
        source.id_usuario || source.id_repartidor || 0,
      estado: source.estado || 'PENDIENTE',
      fecha_asignacion:
        source.fecha_asignacion ||
        source.created_at ||
        source.fecha_creacion ||
        new Date().toISOString(),
      fecha_entrega: source.fecha_entrega || null,
      observaciones: source.observaciones || null,
      pedido: {
        id_pedido:
          pedidoData.id_pedido || source.id_pedido || 0,
        direccion_entrega:
          pedidoData.direccion_entrega ||
          source.direccion_entrega ||
          '',
        ciudad_envio:
          pedidoData.ciudad_envio ||
          source.ciudad_envio ||
          '',
        total: pedidoData.total || source.total || 0,
        fecha_estimada:
          pedidoData.fecha_estimada ||
          source.fecha_estimada ||
          '',
        cliente:
          pedidoData.cliente ||
          source.cliente_nombre ||
          source.cliente_telefono ||
          source.cliente_email ||
          source.cliente_ciudad
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
                  '',
              }
            : undefined,
      },
      repartidor,
    });
  }

  static fromJSONArray(data: any[]): DistribucionModel[] {
    return data.map(item => DistribucionModel.fromJSON(item));
  }
}