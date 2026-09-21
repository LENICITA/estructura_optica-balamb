// src/shared/validators/chatbotValidators.js

// CONSTANTES
export const MENSAJE_CHATBOT_MAX_LENGTH = 300;

// MENSAJES DE ERROR
export const MENSAJES_CHATBOT = {
  MENSAJE_REQUERIDO: 'El mensaje no puede estar vacío',
  MENSAJE_LARGO: `El mensaje no puede superar los ${MENSAJE_CHATBOT_MAX_LENGTH} caracteres`,
  MENSAJE_TIPO_INVALIDO: 'El mensaje debe ser texto'
};

// VALIDADORES
export const validarMensajeChatbot = (mensaje) => {
  if (!mensaje) return false;
  if (typeof mensaje !== 'string') return false;
  const texto = mensaje.trim();
  if (texto === '') return false;
  if (texto.length > MENSAJE_CHATBOT_MAX_LENGTH) return false;
  return true;
};

// CHECKERS CON MENSAJE
export const checkMensajeChatbot = (mensaje) => {
  if (mensaje === undefined || mensaje === null) {
    return { valido: false, mensaje: MENSAJES_CHATBOT.MENSAJE_REQUERIDO };
  }
  if (typeof mensaje !== 'string') {
    return { valido: false, mensaje: MENSAJES_CHATBOT.MENSAJE_TIPO_INVALIDO };
  }
  if (mensaje.trim() === '') {
    return { valido: false, mensaje: MENSAJES_CHATBOT.MENSAJE_REQUERIDO };
  }
  if (mensaje.length > MENSAJE_CHATBOT_MAX_LENGTH) {
    return { valido: false, mensaje: MENSAJES_CHATBOT.MENSAJE_LARGO };
  }
  return { valido: true };
};