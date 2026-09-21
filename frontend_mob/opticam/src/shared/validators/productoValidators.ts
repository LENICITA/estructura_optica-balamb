// src/shared/validators/productoValidators.ts

// CONSTANTES
export const PRODUCTO_LIMITS = {
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 45,
  DESCRIPCION_MIN: 2,
  DESCRIPCION_MAX: 45,
  MARCA_MIN: 2,
  MARCA_MAX: 45,
  MATERIAL_MIN: 2,
  MATERIAL_MAX: 45,
  COLOR_MIN: 2,
  COLOR_MAX: 45
};

export const REGEX_COLOR = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const CATEGORIAS_VALIDAS = [
  { id_categoria: 1, nombre: 'MONTURAS' },
  { id_categoria: 2, nombre: 'ACCESORIOS' },
  { id_categoria: 3, nombre: 'GAFAS DE SOL' }
] as const;

export const CATEGORIAS_IDS = [1, 2, 3];

// MENSAJES DE ERROR
export const MENSAJES_PRODUCTO = {
  CATEGORIA_REQUERIDA: 'La categoría es requerida',
  CATEGORIA_INVALIDA: 'Categoría inválida. Debe ser 1 (MONTURAS), 2 (ACCESORIOS) o 3 (GAFAS DE SOL)',

  NOMBRE_REQUERIDO: 'El nombre es requerido',
  NOMBRE_CORTO: `El nombre debe tener al menos ${PRODUCTO_LIMITS.NOMBRE_MIN} caracteres`,
  NOMBRE_LARGO: `El nombre no puede superar los ${PRODUCTO_LIMITS.NOMBRE_MAX} caracteres`,

  DESCRIPCION_REQUERIDA: 'La descripción es requerida',
  DESCRIPCION_CORTA: `La descripción debe tener al menos ${PRODUCTO_LIMITS.DESCRIPCION_MIN} caracteres`,
  DESCRIPCION_LARGA: `La descripción no puede superar los ${PRODUCTO_LIMITS.DESCRIPCION_MAX} caracteres`,

  MARCA_REQUERIDA: 'La marca es requerida',
  MARCA_CORTA: `La marca debe tener al menos ${PRODUCTO_LIMITS.MARCA_MIN} caracteres`,
  MARCA_LARGA: `La marca no puede superar los ${PRODUCTO_LIMITS.MARCA_MAX} caracteres`,

  PRECIO_REQUERIDO: 'El precio es requerido',
  PRECIO_INVALIDO: 'El precio debe ser un número válido',
  PRECIO_CERO: 'El precio debe ser mayor a 0',
  PRECIO_NEGATIVO: 'El precio no puede ser negativo',

  IMAGEN_REQUERIDA: 'La imagen es requerida',

  MATERIAL_REQUERIDO: 'El material es requerido',
  MATERIAL_CORTO: `El material debe tener al menos ${PRODUCTO_LIMITS.MATERIAL_MIN} caracteres`,
  MATERIAL_LARGO: `El material no puede superar los ${PRODUCTO_LIMITS.MATERIAL_MAX} caracteres`,

  COLOR_REQUERIDO: 'El color es requerido',
  COLOR_INVALIDO: 'El color solo puede contener letras y espacios',
  COLOR_LARGO: `El color no puede superar los ${PRODUCTO_LIMITS.COLOR_MAX} caracteres`,

  ID_INVALIDO: 'ID de producto inválido'
};

// TIPOS
export interface ResultadoValidacion {
  valido: boolean;
  mensaje?: string;
}

// VALIDADORES BÁSICOS

export const validarCategoria = (id?: number | string | null): boolean => {
  if (id === undefined || id === null || id === '') return false;
  return CATEGORIAS_IDS.includes(Number(id));
};

export const validarColor = (color?: string | null): boolean => {
  if (!color || !color.trim()) return false;
  return REGEX_COLOR.test(color.trim());
};

export const validarPrecio = (precio?: string | number | null): boolean => {
  if (precio === undefined || precio === null || precio === '') return false;
  const num = Number(precio);
  return !isNaN(num) && num > 0;
};

export const validarId = (id?: string | number | null): boolean => {
  if (id === undefined || id === null || id === '') return false;
  const num = Number(id);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// CHECKERS CON MENSAJE

export const checkCategoria = (id?: number | string | null): ResultadoValidacion => {
  if (id === undefined || id === null || id === '') {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.CATEGORIA_REQUERIDA };
  }
  if (!validarCategoria(id)) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.CATEGORIA_INVALIDA };
  }
  return { valido: true };
};

export const checkNombreProducto = (nombre?: string | null): ResultadoValidacion => {
  if (!nombre || !nombre.trim()) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.NOMBRE_REQUERIDO };
  }
  const limpio = nombre.trim();
  if (limpio.length < PRODUCTO_LIMITS.NOMBRE_MIN) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.NOMBRE_CORTO };
  }
  if (limpio.length > PRODUCTO_LIMITS.NOMBRE_MAX) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.NOMBRE_LARGO };
  }
  return { valido: true };
};

export const checkDescripcionProducto = (descripcion?: string | null): ResultadoValidacion => {
  if (!descripcion || !descripcion.trim()) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.DESCRIPCION_REQUERIDA };
  }
  const limpio = descripcion.trim();
  if (limpio.length < PRODUCTO_LIMITS.DESCRIPCION_MIN) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.DESCRIPCION_CORTA };
  }
  if (limpio.length > PRODUCTO_LIMITS.DESCRIPCION_MAX) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.DESCRIPCION_LARGA };
  }
  return { valido: true };
};

export const checkMarcaProducto = (marca?: string | null): ResultadoValidacion => {
  if (!marca || !marca.trim()) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.MARCA_REQUERIDA };
  }
  const limpio = marca.trim();
  if (limpio.length < PRODUCTO_LIMITS.MARCA_MIN) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.MARCA_CORTA };
  }
  if (limpio.length > PRODUCTO_LIMITS.MARCA_MAX) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.MARCA_LARGA };
  }
  return { valido: true };
};

export const checkPrecioProducto = (precio?: string | number | null): ResultadoValidacion => {
  if (precio === undefined || precio === null || precio === '') {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.PRECIO_REQUERIDO };
  }
  const num = Number(precio);
  if (isNaN(num)) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.PRECIO_INVALIDO };
  }
  if (num < 0) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.PRECIO_NEGATIVO };
  }
  if (num === 0) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.PRECIO_CERO };
  }
  return { valido: true };
};

export const checkImagenProducto = (uri?: string | null): ResultadoValidacion => {
  if (!uri || !uri.trim()) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.IMAGEN_REQUERIDA };
  }
  return { valido: true };
};

export const checkMaterialProducto = (material?: string | null): ResultadoValidacion => {
  if (!material || !material.trim()) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.MATERIAL_REQUERIDO };
  }
  const limpio = material.trim();
  if (limpio.length < PRODUCTO_LIMITS.MATERIAL_MIN) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.MATERIAL_CORTO };
  }
  if (limpio.length > PRODUCTO_LIMITS.MATERIAL_MAX) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.MATERIAL_LARGO };
  }
  return { valido: true };
};

export const checkColorProducto = (color?: string | null): ResultadoValidacion => {
  if (!color || !color.trim()) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.COLOR_REQUERIDO };
  }
  const limpio = color.trim();
  if (limpio.length > PRODUCTO_LIMITS.COLOR_MAX) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.COLOR_LARGO };
  }
  if (!validarColor(limpio)) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.COLOR_INVALIDO };
  }
  return { valido: true };
};

export const checkIdProducto = (id?: string | number | null): ResultadoValidacion => {
  if (!validarId(id)) {
    return { valido: false, mensaje: MENSAJES_PRODUCTO.ID_INVALIDO };
  }
  return { valido: true };
};

// VALIDADOR DE FORMULARIO COMPLETO (crear / editar)

export interface ProductoInput {
  id_categoria?: number | string;
  nombre?: string;
  descripcion?: string;
  marca?: string;
  precio?: string | number;
  imagen?: string;
  material?: string;
  color?: string;
}

export const validarFormularioProducto = (data: ProductoInput): ResultadoValidacion => {
  const checks = [
    checkCategoria(data.id_categoria),
    checkNombreProducto(data.nombre),
    checkDescripcionProducto(data.descripcion),
    checkMarcaProducto(data.marca),
    checkPrecioProducto(data.precio),
    checkImagenProducto(data.imagen),
    checkMaterialProducto(data.material),
    checkColorProducto(data.color)
  ];

  const fallo = checks.find(c => !c.valido);
  return fallo || { valido: true };
};

// VALIDADOR PARA EDITAR (imagen opcional)

export interface ProductoEditarInput {
  id_categoria?: number | string;
  nombre?: string;
  descripcion?: string;
  marca?: string;
  precio?: string | number;
  imagen?: string;
  material?: string;
  color?: string;
}

export const validarFormularioEditarProducto = (data: ProductoEditarInput): ResultadoValidacion => {
  const checks = [
    checkCategoria(data.id_categoria),
    checkNombreProducto(data.nombre),
    checkDescripcionProducto(data.descripcion),
    checkMarcaProducto(data.marca),
    checkPrecioProducto(data.precio),
    checkMaterialProducto(data.material),
    checkColorProducto(data.color)
  ];

  const fallo = checks.find(c => !c.valido);
  return fallo || { valido: true };
};