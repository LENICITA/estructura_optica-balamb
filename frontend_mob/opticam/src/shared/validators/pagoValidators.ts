// src/shared/validators/pagoValidators.ts

// CONSTANTES
export const ELECCIONES_PAGO = ['50%', '100%'] as const;
export const ESTADOS_PAGO = ['Pendiente', 'Confirmado', 'Rechazado'] as const;
export const CANALES_PAGO = ['Bold'] as const;

// MENSAJES DE ERROR
export const MENSAJES_PAGO = {
  ID_PEDIDO_INVALIDO: 'ID de pedido inválido',
  ID_PAGO_INVALIDO: 'ID de pago inválido',

  ELECCION_REQUERIDA: 'La elección de pago es requerida',
  ELECCION_INVALIDA: 'La elección de pago debe ser 50% o 100%',

  MONTO_REQUERIDO: 'El monto es requerido',
  MONTO_INVALIDO: 'El monto debe ser un número válido',
  MONTO_CERO: 'El monto debe ser mayor a 0',
  MONTO_NEGATIVO: 'El monto no puede ser negativo',

  ESTADO_REQUERIDO: 'El estado es requerido',
  ESTADO_INVALIDO: 'Estado inválido. Debe ser: Pendiente, Confirmado o Rechazado',

  CANAL_INVALIDO: 'El canal de pago debe ser Bold',

  PEDIDO_REQUERIDO: 'El ID del pedido es requerido'
};

// TIPOS
export interface ResultadoValidacion {
  valido: boolean;
  mensaje?: string;
}

export type EleccionPago = '50%' | '100%';
export type EstadoPago = 'Pendiente' | 'Confirmado' | 'Rechazado';

// VALIDADORES BÁSICOS

export const validarId = (id?: string | number | null): boolean => {
  if (id === undefined || id === null || id === '') return false;
  const num = Number(id);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

export const validarEleccionPago = (eleccion?: string | null): boolean => {
  if (!eleccion || typeof eleccion !== 'string') return false;
  return ELECCIONES_PAGO.includes(eleccion as any);
};

export const validarMonto = (monto?: string | number | null): boolean => {
  if (monto === undefined || monto === null || monto === '') return false;
  const num = Number(monto);
  return !isNaN(num) && num > 0;
};

export const validarEstadoPago = (estado?: string | null): boolean => {
  if (!estado || typeof estado !== 'string') return false;
  return ESTADOS_PAGO.includes(estado as any);
};

export const validarCanalPago = (canal?: string | null): boolean => {
  if (!canal || typeof canal !== 'string') return false;
  return CANALES_PAGO.includes(canal as any);
};

// CHECKERS CON MENSAJE

export const checkIdPedido = (id?: string | number | null): ResultadoValidacion => {
  if (id === undefined || id === null || id === '') {
    return { valido: false, mensaje: MENSAJES_PAGO.PEDIDO_REQUERIDO };
  }
  if (!validarId(id)) {
    return { valido: false, mensaje: MENSAJES_PAGO.ID_PEDIDO_INVALIDO };
  }
  return { valido: true };
};

export const checkIdPago = (id?: string | number | null): ResultadoValidacion => {
  if (!validarId(id)) {
    return { valido: false, mensaje: MENSAJES_PAGO.ID_PAGO_INVALIDO };
  }
  return { valido: true };
};

export const checkEleccionPago = (eleccion?: string | null): ResultadoValidacion => {
  if (!eleccion || !eleccion.trim()) {
    return { valido: false, mensaje: MENSAJES_PAGO.ELECCION_REQUERIDA };
  }
  if (!validarEleccionPago(eleccion)) {
    return { valido: false, mensaje: MENSAJES_PAGO.ELECCION_INVALIDA };
  }
  return { valido: true };
};

export const checkMonto = (monto?: string | number | null): ResultadoValidacion => {
  if (monto === undefined || monto === null || monto === '') {
    return { valido: false, mensaje: MENSAJES_PAGO.MONTO_REQUERIDO };
  }
  const num = Number(monto);
  if (isNaN(num)) {
    return { valido: false, mensaje: MENSAJES_PAGO.MONTO_INVALIDO };
  }
  if (num < 0) {
    return { valido: false, mensaje: MENSAJES_PAGO.MONTO_NEGATIVO };
  }
  if (num === 0) {
    return { valido: false, mensaje: MENSAJES_PAGO.MONTO_CERO };
  }
  return { valido: true };
};

export const checkEstadoPago = (estado?: string | null): ResultadoValidacion => {
  if (!estado || !estado.trim()) {
    return { valido: false, mensaje: MENSAJES_PAGO.ESTADO_REQUERIDO };
  }
  if (!validarEstadoPago(estado)) {
    return { valido: false, mensaje: MENSAJES_PAGO.ESTADO_INVALIDO };
  }
  return { valido: true };
};

export const checkCanalPago = (canal?: string | null): ResultadoValidacion => {
  if (!canal || !canal.trim()) {
    return { valido: false, mensaje: MENSAJES_PAGO.CANAL_INVALIDO };
  }
  if (!validarCanalPago(canal)) {
    return { valido: false, mensaje: MENSAJES_PAGO.CANAL_INVALIDO };
  }
  return { valido: true };
};

// VALIDADOR DE FORMULARIO COMPLETO (crear pago)

export interface CrearPagoInput {
  id_pedido?: number;
  eleccion_pago?: string;
  monto?: number;
}

export const validarFormularioPago = (data: CrearPagoInput): ResultadoValidacion => {
  const checks = [
    checkIdPedido(data.id_pedido),
    checkEleccionPago(data.eleccion_pago),
    checkMonto(data.monto)
  ];

  const fallo = checks.find(c => !c.valido);
  return fallo || { valido: true };
};