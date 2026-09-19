// src/shared/validators/distribucionValidators.ts

// 1. CONSTANTES

export const DISTRIBUCION_LIMITS = {
  OBSERVACION_MAX: 5000,
  OBSERVACION_MIN: 0,
} as const;

export const ESTADOS_VALIDOS = [
  'PENDIENTE',
  'EN_ENTREGA',
  'ENTREGADO',
  'CANCELADO',
] as const;

export type EstadoDistribucion = (typeof ESTADOS_VALIDOS)[number];

// Ciudades que se consideran "Bogotá" (para detectar si es repartidor local)
export const CIUDADES_BOGOTA = ['bogotá', 'bogota'] as const;

// 2. MENSAJES CENTRALIZADOS

export const MENSAJES_DISTRIBUCION = {
  // IDs
  ID_PEDIDO_REQUERIDO: 'El ID del pedido es obligatorio',
  ID_PEDIDO_INVALIDO: 'ID de pedido inválido',
  ID_REPARTIDOR_REQUERIDO: 'El ID del repartidor es obligatorio',
  ID_REPARTIDOR_INVALIDO: 'ID de repartidor inválido',
  ID_DISTRIBUCION_INVALIDO: 'ID de distribución inválido',

  // Observaciones
  OBSERVACION_MUY_LARGA: `La observación no puede superar los ${DISTRIBUCION_LIMITS.OBSERVACION_MAX} caracteres`,

  // Estados
  ESTADO_INVALIDO: `Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`,

  // Transiciones
  CANCELAR_SOLO_PENDIENTE:
    'Solo se pueden cancelar distribuciones en estado PENDIENTE',
  CANCELAR_EN_ENTREGA:
    'No se puede cancelar una entrega que ya está en camino.',
  CANCELAR_ENTREGADO: 'No se puede cancelar una entrega ya entregada',
  CANCELAR_YA_CANCELADO: 'Esta distribución ya está cancelada',

  INICIAR_SOLO_PENDIENTE:
    'Solo se puede iniciar una entrega en estado PENDIENTE',
  ENTREGAR_SOLO_EN_ENTREGA:
    'Solo se puede marcar como entregado en estado EN_ENTREGA',
} as const;

// 3. TIPOS

export interface ResultadoValidacion {
  valido: boolean;
  mensaje?: string;
}

export interface AsignarPedidoInput {
  id_pedido?: number | string | null;
  id_usuario?: number | string | null;
  observaciones?: string | null;
}

// 4. VALIDADORES BOOLEANOS

export const validarId = (id?: number | string | null): boolean => {
  if (id === undefined || id === null || id === '') return false;
  const num = Number(id);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

export const validarObservacion = (
  obs?: string | null
): boolean => {
  if (obs === undefined || obs === null) return true;
  if (typeof obs !== 'string') return false;
  return obs.length <= DISTRIBUCION_LIMITS.OBSERVACION_MAX;
};

export const validarEstado = (estado?: string | null): boolean => {
  if (!estado) return false;
  return (ESTADOS_VALIDOS as readonly string[]).includes(
    estado.toUpperCase()
  );
};

export const esCiudadBogota = (ciudad?: string | null): boolean => {
  if (!ciudad) return false;
  const normalizada = ciudad.toLowerCase().trim();
  return (CIUDADES_BOGOTA as readonly string[]).includes(normalizada);
};

// 5. CHECKERS CON MENSAJE

export const checkIdPedido = (
  id?: number | string | null
): ResultadoValidacion => {
  if (!validarId(id)) {
    return {
      valido: false,
      mensaje: !id
        ? MENSAJES_DISTRIBUCION.ID_PEDIDO_REQUERIDO
        : MENSAJES_DISTRIBUCION.ID_PEDIDO_INVALIDO,
    };
  }
  return { valido: true };
};

export const checkIdRepartidor = (
  id?: number | string | null
): ResultadoValidacion => {
  if (!validarId(id)) {
    return {
      valido: false,
      mensaje: !id
        ? MENSAJES_DISTRIBUCION.ID_REPARTIDOR_REQUERIDO
        : MENSAJES_DISTRIBUCION.ID_REPARTIDOR_INVALIDO,
    };
  }
  return { valido: true };
};

export const checkIdDistribucion = (
  id?: number | string | null
): ResultadoValidacion => {
  if (!validarId(id)) {
    return {
      valido: false,
      mensaje: MENSAJES_DISTRIBUCION.ID_DISTRIBUCION_INVALIDO,
    };
  }
  return { valido: true };
};

export const checkObservacion = (
  obs?: string | null
): ResultadoValidacion => {
  if (!validarObservacion(obs)) {
    return {
      valido: false,
      mensaje: MENSAJES_DISTRIBUCION.OBSERVACION_MUY_LARGA,
    };
  }
  return { valido: true };
};

export const checkEstado = (
  estado?: string | null
): ResultadoValidacion => {
  if (!validarEstado(estado)) {
    return {
      valido: false,
      mensaje: MENSAJES_DISTRIBUCION.ESTADO_INVALIDO,
    };
  }
  return { valido: true };
};

// 6. VALIDADOR DE FORMULARIO — ASIGNAR PEDIDO

export const validarAsignacion = (
  data: AsignarPedidoInput
): ResultadoValidacion => {
  const checks: ResultadoValidacion[] = [
    checkIdPedido(data.id_pedido),
    checkIdRepartidor(data.id_usuario),
    checkObservacion(data.observaciones),
  ];

  const fallo = checks.find((c) => !c.valido);
  return fallo || { valido: true };
};

// 7. VALIDADOR DE TRANSICIONES

const TRANSICIONES_PERMITIDAS: Record<EstadoDistribucion, EstadoDistribucion[]> = {
  PENDIENTE: ['EN_ENTREGA', 'CANCELADO'],
  EN_ENTREGA: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

export const esTransicionValida = (
  actual: string,
  nueva: string
): boolean => {
  const estadoActual = actual?.toUpperCase() as EstadoDistribucion;
  const estadoNuevo = nueva?.toUpperCase() as EstadoDistribucion;

  if (!TRANSICIONES_PERMITIDAS[estadoActual]) return false;
  return TRANSICIONES_PERMITIDAS[estadoActual].includes(estadoNuevo);
};

export const checkCancelar = (
  estadoActual: string
): ResultadoValidacion => {
  if (!esTransicionValida(estadoActual, 'CANCELADO')) {
    let mensaje: string;
    switch (estadoActual) {
      case 'EN_ENTREGA':
        mensaje = MENSAJES_DISTRIBUCION.CANCELAR_EN_ENTREGA;
        break;
      case 'ENTREGADO':
        mensaje = MENSAJES_DISTRIBUCION.CANCELAR_ENTREGADO;
        break;
      case 'CANCELADO':
        mensaje = MENSAJES_DISTRIBUCION.CANCELAR_YA_CANCELADO;
        break;
      default:
        mensaje = MENSAJES_DISTRIBUCION.CANCELAR_SOLO_PENDIENTE;
    }
    return { valido: false, mensaje };
  }
  return { valido: true };
};

export const checkIniciar = (
  estadoActual: string
): ResultadoValidacion => {
  if (!esTransicionValida(estadoActual, 'EN_ENTREGA')) {
    return {
      valido: false,
      mensaje: MENSAJES_DISTRIBUCION.INICIAR_SOLO_PENDIENTE,
    };
  }
  return { valido: true };
};

export const checkEntregar = (
  estadoActual: string
): ResultadoValidacion => {
  if (!esTransicionValida(estadoActual, 'ENTREGADO')) {
    return {
      valido: false,
      mensaje: MENSAJES_DISTRIBUCION.ENTREGAR_SOLO_EN_ENTREGA,
    };
  }
  return { valido: true };
};