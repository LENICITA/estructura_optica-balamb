// src/shared/validators/pedidoValidators.js

// CONSTANTES
export const PEDIDO_LIMITS = {
  DIRECCION_MIN: 5,
  DIRECCION_MAX: 45,
  CIUDAD_MAX: 45
};

export const REGEX_CIUDAD = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const ESTADOS_VALIDOS = [
  'Pendiente',
  'Abonado',
  'Listo',
  'Pagado',
  'En Proceso',
  'Enviado',
  'Entregado',
  'Cancelado'
];

export const ESTADOS_ACTIVOS_ADMIN = [
  'Abonado',
  'Listo',
  'Pagado',
  'En Proceso',
  'Enviado',
  'Entregado'
];

// MENSAJES DE ERROR
export const MENSAJES_PEDIDO = {
  DIRECCION_REQUERIDA: 'La dirección de entrega es obligatoria',
  DIRECCION_CORTA: `La dirección debe tener al menos ${PEDIDO_LIMITS.DIRECCION_MIN} caracteres`,
  DIRECCION_LARGA: `La dirección no puede superar los ${PEDIDO_LIMITS.DIRECCION_MAX} caracteres`,
  CIUDAD_REQUERIDA: 'La ciudad de envío es obligatoria',
  CIUDAD_INVALIDA: 'La ciudad solo puede contener letras y espacios',
  CIUDAD_LARGA: `La ciudad no puede superar los ${PEDIDO_LIMITS.CIUDAD_MAX} caracteres`,
  PRODUCTOS_REQUERIDOS: 'Debes agregar al menos un producto',
  PRODUCTOS_INVALIDOS: 'Cada producto debe tener un id válido y una cantidad mayor o igual a 1',
  ID_INVALIDO: 'ID de pedido inválido',
  ESTADO_REQUERIDO: 'El estado es requerido',
  ESTADO_INVALIDO: 'Estado inválido',
  FECHA_REQUERIDA: 'La fecha estimada es requerida',
  FECHA_FORMATO_INVALIDO: 'La fecha debe tener formato YYYY-MM-DD',
  FECHA_INVALIDA: 'La fecha estimada no es válida',
  FECHA_PASADA: 'La fecha estimada no puede ser anterior a hoy'
};

// VALIDADORES BÁSICOS
export const validarDireccion = (direccion) => {
  if (!direccion || typeof direccion !== 'string') return false;
  const limpio = direccion.trim();
  return limpio.length >= PEDIDO_LIMITS.DIRECCION_MIN && limpio.length <= PEDIDO_LIMITS.DIRECCION_MAX;
};

export const validarCiudad = (ciudad) => {
  if (!ciudad || typeof ciudad !== 'string') return false;
  return REGEX_CIUDAD.test(ciudad.trim());
};

export const validarProductos = (productos) => {
  if (!Array.isArray(productos) || productos.length === 0) return false;
  for (const item of productos) {
    if (!item.id_producto || typeof item.id_producto !== 'number' || item.id_producto <= 0) return false;
    if (!item.cantidad || typeof item.cantidad !== 'number' || item.cantidad < 1 || !Number.isInteger(item.cantidad)) return false;
  }
  return true;
};

export const validarId = (id) => {
  if (id === undefined || id === null || id === '') return false;
  const num = Number(id);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

export const validarFechaEstimada = (fecha) => {
  if (!fecha || typeof fecha !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

  const fechaComparar = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (isNaN(fechaComparar.getTime())) return false;
  return fechaComparar >= hoy;
};

// CHECKERS CON MENSAJE
export const checkDireccion = (direccion) => {
  if (!direccion || !direccion.trim()) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.DIRECCION_REQUERIDA };
  }
  const limpio = direccion.trim();
  if (limpio.length < PEDIDO_LIMITS.DIRECCION_MIN) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.DIRECCION_CORTA };
  }
  if (limpio.length > PEDIDO_LIMITS.DIRECCION_MAX) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.DIRECCION_LARGA };
  }
  return { valido: true };
};

export const checkCiudad = (ciudad) => {
  if (!ciudad || !ciudad.trim()) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.CIUDAD_REQUERIDA };
  }
  const limpio = ciudad.trim();
  if (limpio.length > PEDIDO_LIMITS.CIUDAD_MAX) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.CIUDAD_LARGA };
  }
  if (!REGEX_CIUDAD.test(limpio)) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.CIUDAD_INVALIDA };
  }
  return { valido: true };
};

export const checkProductos = (productos) => {
  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.PRODUCTOS_REQUERIDOS };
  }
  if (!validarProductos(productos)) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.PRODUCTOS_INVALIDOS };
  }
  return { valido: true };
};

export const checkIdPedido = (id) => {
  if (!validarId(id)) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.ID_INVALIDO };
  }
  return { valido: true };
};

export const checkEstadoPedido = (estado) => {
  if (!estado || !estado.trim()) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.ESTADO_REQUERIDO };
  }
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.ESTADO_INVALIDO };
  }
  return { valido: true };
};

export const checkFechaEstimada = (fecha) => {
  if (!fecha || !fecha.trim()) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.FECHA_REQUERIDA };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.FECHA_FORMATO_INVALIDO };
  }
  const fechaComparar = new Date(`${fecha}T00:00:00`);
  if (isNaN(fechaComparar.getTime())) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.FECHA_INVALIDA };
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaComparar < hoy) {
    return { valido: false, mensaje: MENSAJES_PEDIDO.FECHA_PASADA };
  }
  return { valido: true };
};

// VALIDADOR DE FORMULARIO COMPLETO (crear pedido)
export const validarFormularioPedido = (data) => {
  const checks = [
    checkDireccion(data.direccion_entrega),
    checkCiudad(data.ciudad_envio),
    checkProductos(data.productos)
  ];

  const fallo = checks.find(c => !c.valido);
  return fallo || { valido: true };
};