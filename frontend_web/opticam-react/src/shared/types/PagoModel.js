// src/shared/types/PagoModel.js

export class PagoModel {
  constructor(data) {
    this.id_pago = data.id_pago;
    this.id_pedido = data.id_pedido;
    this.fecha_pago = data.fecha_pago;
    this.eleccion_pago = data.eleccion_pago;
    this.canal_pago = data.canal_pago;
    this.monto = data.monto;
    this.estado = data.estado;
    this.bold_reference = data.bold_reference;
    this.bold_payment_id = data.bold_payment_id;
    this.bold_link = data.bold_link;
  }

  get montoFormateado() {
    return `$${this.monto.toLocaleString('es-CO')}`;
  }

  get fechaFormateada() {
    const date = new Date(this.fecha_pago);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get estadoDisplay() {
    const map = {
      'Pendiente': 'Pendiente',
      'Confirmado': 'Confirmado',
      'Rechazado': 'Rechazado',
    };
    return map[this.estado] || this.estado;
  }

  get estadoColor() {
    const map = {
      'Pendiente': '#D97706',
      'Confirmado': '#059669',
      'Rechazado': '#EF4444',
    };
    return map[this.estado] || '#6B7280';
  }

  get eleccionDisplay() {
    return this.eleccion_pago === '50%' ? '50% (Abono inicial)' : '100% (Pago completo)';
  }

  static fromJSON(data) {
    return new PagoModel({
      id_pago: data.id_pago || data.id || 0,
      id_pedido: data.id_pedido || 0,
      fecha_pago: data.fecha_pago || new Date().toISOString(),
      eleccion_pago: data.eleccion_pago || '50%',
      canal_pago: data.canal_pago || 'Bold',
      monto: data.monto || 0,
      estado: data.estado || 'Pendiente',
      bold_reference: data.bold_reference,
      bold_payment_id: data.bold_payment_id,
      bold_link: data.bold_link,
    });
  }

  static fromJSONArray(data) {
    return data.map(item => PagoModel.fromJSON(item));
  }
}