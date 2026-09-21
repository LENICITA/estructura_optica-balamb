// src/shared/validators/formulaValidators.js

// CONSTANTES
export const CONDICIONES_VALIDAS = [
  'DALTONISMO',
  'ASTIGMATISMO',
  'MIOPIA',
  'BAJA VISION'
];

export const ESTADOS_VALIDOS = [
  'Pendiente',
  'Aprobado',
  'Rechazado'
];

export const OBSERVACIONES_MAX_LENGTH = 200;
export const IMAGEN_EXTENSIONES_VALIDAS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

// MENSAJES DE ERROR
export const MENSAJES_FORMULA = {
  CONDICION_REQUERIDA: 'La condición es requerida',
  CONDICION_INVALIDA: 'Condición inválida. Debe ser: DALTONISMO, ASTIGMATISMO, MIOPIA o BAJA VISION',
  IMAGEN_REQUERIDA: 'La imagen de la fórmula es requerida',
  IMAGEN_EXTENSION_INVALIDA: 'Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF',
  OBSERVACIONES_LARGAS: `Las observaciones no pueden superar los ${OBSERVACIONES_MAX_LENGTH} caracteres`,
  COSTO_REQUERIDO: 'El costo es requerido',
  COSTO_INVALIDO: 'El costo debe ser un número válido',
  COSTO_CERO: 'El costo debe ser mayor a 0',
  COSTO_NEGATIVO: 'El costo no puede ser negativo',
  ESTADO_REQUERIDO: 'El estado es requerido',
  ESTADO_INVALIDO: 'Estado inválido. Debe ser: Pendiente, Aprobado o Rechazado',
  FORMULA_RECHAZADA_SIN_PRECIO: 'No se puede asignar precio a una fórmula rechazada',
  ID_INVALIDO: 'ID de fórmula inválido',
  TIPO_ARCHIVO_INVALIDO: 'El archivo debe ser una imagen'
};

// VALIDADORES BÁSICOS
export const validarCondicion = (condicion) => {
  if (!condicion || typeof condicion !== 'string') return false;
  return CONDICIONES_VALIDAS.includes(condicion.toUpperCase().trim());
};

export const validarObservaciones = (observaciones) => {
  if (!observaciones) return true;
  return observaciones.length <= OBSERVACIONES_MAX_LENGTH;
};

export const validarCosto = (costo) => {
  if (costo === undefined || costo === null || costo === '') return false;
  const num = Number(costo);
  return !isNaN(num) && num > 0;
};

export const validarEstado = (estado) => {
  if (!estado || typeof estado !== 'string') return false;
  return ESTADOS_VALIDOS.includes(estado);
};

export const validarExtensionImagen = (uri) => {
  if (!uri) return false;
  const partes = uri.split('.');
  const extension = partes[partes.length - 1]?.toLowerCase();
  return IMAGEN_EXTENSIONES_VALIDAS.includes(extension);
};

export const validarId = (id) => {
  if (id === undefined || id === null || id === '') return false;
  const num = Number(id);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// VALIDADORES CON MENSAJE
export const checkCondicion = (condicion) => {
  if (!condicion || !condicion.trim()) {
    return { valido: false, mensaje: MENSAJES_FORMULA.CONDICION_REQUERIDA };
  }
  if (!validarCondicion(condicion)) {
    return { valido: false, mensaje: MENSAJES_FORMULA.CONDICION_INVALIDA };
  }
  return { valido: true };
};

export const checkObservaciones = (observaciones) => {
  if (!observaciones) return { valido: true };
  if (!validarObservaciones(observaciones)) {
    return { valido: false, mensaje: MENSAJES_FORMULA.OBSERVACIONES_LARGAS };
  }
  return { valido: true };
};

export const checkImagen = (uri) => {
  if (!uri || !uri.trim()) {
    return { valido: false, mensaje: MENSAJES_FORMULA.IMAGEN_REQUERIDA };
  }
  if (!validarExtensionImagen(uri)) {
    return { valido: false, mensaje: MENSAJES_FORMULA.IMAGEN_EXTENSION_INVALIDA };
  }
  return { valido: true };
};

export const checkCosto = (costo) => {
  if (costo === undefined || costo === null || costo === '') {
    return { valido: false, mensaje: MENSAJES_FORMULA.COSTO_REQUERIDO };
  }
  const num = Number(costo);
  if (isNaN(num)) {
    return { valido: false, mensaje: MENSAJES_FORMULA.COSTO_INVALIDO };
  }
  if (num < 0) {
    return { valido: false, mensaje: MENSAJES_FORMULA.COSTO_NEGATIVO };
  }
  if (num === 0) {
    return { valido: false, mensaje: MENSAJES_FORMULA.COSTO_CERO };
  }
  return { valido: true };
};

export const checkEstado = (estado) => {
  if (!estado || !estado.trim()) {
    return { valido: false, mensaje: MENSAJES_FORMULA.ESTADO_REQUERIDO };
  }
  if (!validarEstado(estado)) {
    return { valido: false, mensaje: MENSAJES_FORMULA.ESTADO_INVALIDO };
  }
  return { valido: true };
};

export const checkId = (id) => {
  if (!validarId(id)) {
    return { valido: false, mensaje: MENSAJES_FORMULA.ID_INVALIDO };
  }
  return { valido: true };
};

// VALIDADOR DE FORMULARIO COMPLETO (crear fórmula)
export const validarFormularioFormula = (data) => {
  if (!data.id_usuario || data.id_usuario <= 0) {
    return { valido: false, mensaje: 'No se pudo identificar al usuario' };
  }

  const checks = [
    checkCondicion(data.condicion),
    checkImagen(data.imagen_formula),
    checkObservaciones(data.observaciones)
  ];

  const fallo = checks.find(c => !c.valido);
  return fallo || { valido: true };
};

// VALIDADOR DE ASIGNAR PRECIO
export const validarAsignarPrecio = (data) => {
  const checkIdResult = checkId(data.id_formula);
  if (!checkIdResult.valido) return checkIdResult;

  const checkCostoResult = checkCosto(data.costo);
  if (!checkCostoResult.valido) return checkCostoResult;

  if (data.estado) {
    const checkEstadoResult = checkEstado(data.estado);
    if (!checkEstadoResult.valido) return checkEstadoResult;
  }

  if (data.estadoActualFormula === 'Rechazado') {
    return {
      valido: false,
      mensaje: MENSAJES_FORMULA.FORMULA_RECHAZADA_SIN_PRECIO
    };
  }

  return { valido: true };
};