// src/shared/validators/contactoValidators.ts

// CONSTANTES
export const CONTACTO_LIMITS = {
  NOMBRE_MIN: 2,
  NOMBRE_MAX: 100,
  EMAIL_MAX: 100,
  TELEFONO_MAX: 20,
  MENSAJE_MIN: 10,
  MENSAJE_MAX: 1000
};

export const REGEX_EMAIL_CONTACTO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REGEX_TELEFONO_CONTACTO = /^[0-9+\-\s()]{7,20}$/;

// MENSAJES DE ERROR
export const MENSAJES_CONTACTO = {
  NOMBRE_REQUERIDO: 'El nombre es requerido',
  NOMBRE_CORTO: `El nombre debe tener al menos ${CONTACTO_LIMITS.NOMBRE_MIN} caracteres`,
  NOMBRE_LARGO: `El nombre no puede superar los ${CONTACTO_LIMITS.NOMBRE_MAX} caracteres`,
  EMAIL_REQUERIDO: 'El email es requerido',
  EMAIL_INVALIDO: 'El email no tiene un formato válido',
  EMAIL_LARGO: `El email no puede superar los ${CONTACTO_LIMITS.EMAIL_MAX} caracteres`,
  TELEFONO_INVALIDO: 'El teléfono debe tener entre 7 y 20 caracteres (solo números, +, -, espacios y paréntesis)',
  MENSAJE_REQUERIDO: 'El mensaje es requerido',
  MENSAJE_CORTO: `El mensaje debe tener al menos ${CONTACTO_LIMITS.MENSAJE_MIN} caracteres`,
  MENSAJE_LARGO: `El mensaje no puede superar los ${CONTACTO_LIMITS.MENSAJE_MAX} caracteres`
};

// TIPOS
export interface ResultadoValidacion {
  valido: boolean;
  mensaje?: string;
}

// CHECKERS

export const checkNombreContacto = (nombre?: string | null): ResultadoValidacion => {
  if (!nombre || !nombre.trim()) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.NOMBRE_REQUERIDO };
  }
  const limpio = nombre.trim();
  if (limpio.length < CONTACTO_LIMITS.NOMBRE_MIN) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.NOMBRE_CORTO };
  }
  if (limpio.length > CONTACTO_LIMITS.NOMBRE_MAX) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.NOMBRE_LARGO };
  }
  return { valido: true };
};

export const checkEmailContacto = (email?: string | null): ResultadoValidacion => {
  if (!email || !email.trim()) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.EMAIL_REQUERIDO };
  }
  const limpio = email.trim();
  if (limpio.length > CONTACTO_LIMITS.EMAIL_MAX) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.EMAIL_LARGO };
  }
  if (!REGEX_EMAIL_CONTACTO.test(limpio)) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.EMAIL_INVALIDO };
  }
  return { valido: true };
};

export const checkTelefonoContacto = (telefono?: string | null): ResultadoValidacion => {
  if (!telefono || !telefono.trim()) {
    return { valido: true };
  }
  const limpio = telefono.trim();
  if (!REGEX_TELEFONO_CONTACTO.test(limpio)) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.TELEFONO_INVALIDO };
  }
  return { valido: true };
};

export const checkMensajeContacto = (mensaje?: string | null): ResultadoValidacion => {
  if (!mensaje || !mensaje.trim()) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.MENSAJE_REQUERIDO };
  }
  const limpio = mensaje.trim();
  if (limpio.length < CONTACTO_LIMITS.MENSAJE_MIN) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.MENSAJE_CORTO };
  }
  if (limpio.length > CONTACTO_LIMITS.MENSAJE_MAX) {
    return { valido: false, mensaje: MENSAJES_CONTACTO.MENSAJE_LARGO };
  }
  return { valido: true };
};

// VALIDADOR DE FORMULARIO COMPLETO

export interface ContactoInput {
  nombre?: string;
  email?: string;
  telefono?: string;
  mensaje?: string;
}

export const validarFormularioContacto = (data: ContactoInput): ResultadoValidacion => {
  const checks = [
    checkNombreContacto(data.nombre),
    checkEmailContacto(data.email),
    checkTelefonoContacto(data.telefono),
    checkMensajeContacto(data.mensaje)
  ];

  const fallo = checks.find(c => !c.valido);
  return fallo || { valido: true };
};