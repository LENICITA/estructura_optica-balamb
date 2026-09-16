// src/shared/validators/userValidators.ts

// REGEX Y CONSTANTES
export const REGEX_TELEFONO = /^3\d{9}$/;
export const REGEX_CIUDAD = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REGEX_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
export const REGEX_DOCUMENTO = /^\d+$/;

// MENSAJES DE ERROR (centralizados para QA)
export const MENSAJES = {
  TELEFONO_REQUERIDO: 'El teléfono es requerido',
  TELEFONO_INVALIDO: 'El teléfono debe empezar por 3 y tener 10 dígitos',
  CIUDAD_REQUERIDA: 'La ciudad es requerida',
  CIUDAD_INVALIDA: 'La ciudad solo puede contener letras y espacios',
  EMAIL_REQUERIDO: 'El email es requerido',
  EMAIL_INVALIDO: 'El email no tiene un formato válido',
  PASSWORD_REQUERIDA: 'La contraseña es requerida',
  PASSWORD_CORTA: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_DEBIL: 'La contraseña debe tener: mayúscula, minúscula y número',
  PASSWORD_NO_COINCIDE: 'Las contraseñas no coinciden',
  DOCUMENTO_REQUERIDO: 'El documento es requerido',
  DOCUMENTO_INVALIDO: 'El documento debe contener solo números',
  NOMBRE_REQUERIDO: 'El nombre completo es requerido',
  NOMBRE_CORTO: 'El nombre debe tener al menos 3 caracteres',
  DIRECCION_REQUERIDA: 'La dirección es requerida',
  FECHA_REQUERIDA: 'La fecha de nacimiento es requerida',
  FECHA_INVALIDA: 'La fecha de nacimiento no es válida',
  // Vehículo
  VEHICULO_TIPO_REQUERIDO: 'El tipo de vehículo es requerido',
  VEHICULO_MODELO_REQUERIDO: 'El modelo del vehículo es requerido',
  VEHICULO_PLACA_REQUERIDA: 'La placa es requerida',
  VEHICULO_PLACA_CORTA: 'La placa debe tener entre 5 y 10 caracteres',
  VEHICULO_COLOR_REQUERIDO: 'El color del vehículo es requerido',
  VEHICULO_COLOR_INVALIDO: 'El color solo puede contener letras y espacios'
};

// VALIDADORES

export const validarTelefono = (telefono?: string | null): boolean => {
  if (!telefono) return false;
  return REGEX_TELEFONO.test(telefono.trim());
};

export const validarCiudad = (ciudad?: string | null): boolean => {
  if (!ciudad) return false;
  return REGEX_CIUDAD.test(ciudad.trim());
};

export const validarEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return REGEX_EMAIL.test(email.trim());
};

export const validarPassword = (password?: string | null): boolean => {
  if (!password) return false;
  return password.length >= 8 && REGEX_PASSWORD.test(password);
};

export const validarDocumento = (documento?: string | null): boolean => {
  if (!documento) return false;
  return REGEX_DOCUMENTO.test(documento.trim());
};

// VALIDADORES CON MENSAJE (devuelven { valido, mensaje })

export interface ResultadoValidacion {
  valido: boolean;
  mensaje?: string;
}

export const checkTelefono = (telefono?: string | null): ResultadoValidacion => {
  if (!telefono || !telefono.trim()) {
    return { valido: false, mensaje: MENSAJES.TELEFONO_REQUERIDO };
  }
  if (!validarTelefono(telefono)) {
    return { valido: false, mensaje: MENSAJES.TELEFONO_INVALIDO };
  }
  return { valido: true };
};

export const checkCiudad = (ciudad?: string | null): ResultadoValidacion => {
  if (!ciudad || !ciudad.trim()) {
    return { valido: false, mensaje: MENSAJES.CIUDAD_REQUERIDA };
  }
  if (!validarCiudad(ciudad)) {
    return { valido: false, mensaje: MENSAJES.CIUDAD_INVALIDA };
  }
  return { valido: true };
};

export const checkEmail = (email?: string | null): ResultadoValidacion => {
  if (!email || !email.trim()) {
    return { valido: false, mensaje: MENSAJES.EMAIL_REQUERIDO };
  }
  if (!validarEmail(email)) {
    return { valido: false, mensaje: MENSAJES.EMAIL_INVALIDO };
  }
  return { valido: true };
};

export const checkPassword = (password?: string | null): ResultadoValidacion => {
  if (!password) {
    return { valido: false, mensaje: MENSAJES.PASSWORD_REQUERIDA };
  }
  if (password.length < 8) {
    return { valido: false, mensaje: MENSAJES.PASSWORD_CORTA };
  }
  if (!REGEX_PASSWORD.test(password)) {
    return { valido: false, mensaje: MENSAJES.PASSWORD_DEBIL };
  }
  return { valido: true };
};

export const checkDocumento = (documento?: string | null): ResultadoValidacion => {
  if (!documento || !documento.trim()) {
    return { valido: false, mensaje: MENSAJES.DOCUMENTO_REQUERIDO };
  }
  if (!validarDocumento(documento)) {
    return { valido: false, mensaje: MENSAJES.DOCUMENTO_INVALIDO };
  }
  return { valido: true };
};

export const checkNombre = (nombre?: string | null): ResultadoValidacion => {
  if (!nombre || !nombre.trim()) {
    return { valido: false, mensaje: MENSAJES.NOMBRE_REQUERIDO };
  }
  if (nombre.trim().length < 3) {
    return { valido: false, mensaje: MENSAJES.NOMBRE_CORTO };
  }
  return { valido: true };
};

export const checkDireccion = (direccion?: string | null): ResultadoValidacion => {
  if (!direccion || !direccion.trim()) {
    return { valido: false, mensaje: MENSAJES.DIRECCION_REQUERIDA };
  }
  return { valido: true };
};

export const checkFechaNacimiento = (fecha?: string | null): ResultadoValidacion => {
  if (!fecha || !fecha.trim()) {
    return { valido: false, mensaje: MENSAJES.FECHA_REQUERIDA };
  }
  const date = new Date(fecha);
  if (isNaN(date.getTime())) {
    return { valido: false, mensaje: MENSAJES.FECHA_INVALIDA };
  }
  return { valido: true };
};

// VALIDADOR DE VEHÍCULO

export interface VehiculoInput {
  tipo?: string;
  modelo?: string;
  placa?: string;
  color?: string;
}

export const checkVehiculo = (vehiculo?: VehiculoInput | null): ResultadoValidacion => {
  if (!vehiculo) {
    return { valido: false, mensaje: 'Los datos del vehículo son requeridos' };
  }
  if (!vehiculo.tipo || !vehiculo.tipo.trim()) {
    return { valido: false, mensaje: MENSAJES.VEHICULO_TIPO_REQUERIDO };
  }
  if (!vehiculo.modelo || !vehiculo.modelo.trim()) {
    return { valido: false, mensaje: MENSAJES.VEHICULO_MODELO_REQUERIDO };
  }
  if (!vehiculo.placa || !vehiculo.placa.trim()) {
    return { valido: false, mensaje: MENSAJES.VEHICULO_PLACA_REQUERIDA };
  }
  if (vehiculo.placa.trim().length < 5) {
    return { valido: false, mensaje: MENSAJES.VEHICULO_PLACA_CORTA };
  }
  if (!vehiculo.color || !vehiculo.color.trim()) {
    return { valido: false, mensaje: MENSAJES.VEHICULO_COLOR_REQUERIDO };
  }
  if (!validarCiudad(vehiculo.color)) {
    return { valido: false, mensaje: MENSAJES.VEHICULO_COLOR_INVALIDO };
  }
  return { valido: true };
};

// VALIDADOR DE FORMULARIO COMPLETO DE CLIENTE

export interface ClienteInput {
  nombre_completo?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  documento?: string;
  ciudad?: string;
  direccion?: string;
  email?: string;
  contrasena?: string;
}

export const validarFormularioCliente = (data: ClienteInput): ResultadoValidacion => {
  const checks = [
    checkNombre(data.nombre_completo),
    checkEmail(data.email),
    checkTelefono(data.telefono),
    checkDocumento(data.documento),
    checkFechaNacimiento(data.fecha_nacimiento),
    checkCiudad(data.ciudad),
    checkDireccion(data.direccion),
    checkPassword(data.contrasena)
  ];

  const fallo = checks.find(c => !c.valido);
  return fallo || { valido: true };
};

// VALIDADOR DE FORMULARIO COMPLETO DE REPARTIDOR

export interface RepartidorInput extends ClienteInput {
  vehiculo?: VehiculoInput;
}

export const validarFormularioRepartidor = (data: RepartidorInput): ResultadoValidacion => {
  const checks = [
    checkNombre(data.nombre_completo),
    checkEmail(data.email),
    checkTelefono(data.telefono),
    checkDocumento(data.documento),
    checkFechaNacimiento(data.fecha_nacimiento),
    checkCiudad(data.ciudad),
    checkDireccion(data.direccion),
    checkPassword(data.contrasena),
    checkVehiculo(data.vehiculo)
  ];

  const fallo = checks.find(c => !c.valido);
  return fallo || { valido: true };
};