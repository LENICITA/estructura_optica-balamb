export const validarMensajeContacto = (data) => {
  const errors = [];

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('El email no es válido');
  }

  if (!data.mensaje || data.mensaje.trim().length < 10) {
    errors.push('El mensaje debe tener al menos 10 caracteres');
  }

  return { valid: errors.length === 0, errors };
};