const ChatBot = {
  // ========== RESPUESTAS ==========
  respuestas: {
    saludo: "¡Hola! Bienvenido a ÓptiCam. ¿En qué puedo ayudarte?",
    productos: "Ofrecemos gafas de sol, monturas, lentes progresivos y accesorios. ¿Te gustaría ver nuestro catálogo?",
    horario: "Nuestro horario de atención es de Lunes a Viernes de 8am a 6pm, y Sábados de 9am a 1pm.",
    envio: "Realizamos envíos a toda la ciudad. El costo de envío es de $5,000 y la entrega demora de 8 a 10 días hábiles.",
    formulamedica: "Para subir tu fórmula médica, ve a 'Mi Perfil' → 'Subir Fórmula'. Adjunta la imagen de tu fórmula y nuestro equipo la revisará. Te enviaremos el precio por este aplicativo.",
    pago: "Aceptamos pagos a través de Bold, nuestra pasarela de pagos segura. Puedes pagar con tarjetas débito/crédito, Nequi, Daviplata y transferencias bancarias. ¡Todos los métodos están disponibles en Bold!",
    devolucion: "Tienes 15 días hábiles para solicitar devoluciones. El producto debe estar en perfecto estado.",
    despedida: "Gracias por contactarnos. ¡Que tengas un excelente día!",
    ayuda: "*Opciones disponibles:*\n\n• Productos - Información sobre gafas y lentes\n• Horario - Horarios de atención\n• Envío - Costos y tiempos de entrega\n• Fórmula médica - Envio de formulas\n• Pago - Métodos de pago aceptados\n• Devolución - Política de cambios y garantías\n\n *¿Necesitas atención personalizada?* Escríbenos al WhatsApp: 330-120-92941",
    precios: "Nuestros precios varían según el producto:\n\n• Gafas de sol: desde $80,000\n• Monturas: desde $120,000\n• Lentes progresivos: desde $250,000\n• Lentes de contacto: desde $60,000\n\n*Los precios pueden variar según la marca y graduación.*",
    contacto: "Puedes contactarnos a través de:\n\n WhatsApp: 330-120-92941\n Correo: opticavirtualbalmb@gmail.com",
    garantia: "Todos nuestros productos tienen 30 días de garantía contra defectos de fabricación",
    default: "Lo siento, no entendí tu pregunta. ¿Podrías reformularla? O escribe 'ayuda' para ver las opciones disponibles."
  },

  // ========== DETECTAR INTENCIÓN ==========
  detectarIntencion: (mensaje) => {
    const msg = mensaje.toLowerCase();

    if (msg.includes('hola') || msg.includes('buenas') || msg.includes('saludo') || msg.includes('que tal')) {
      return 'saludo';
    }
    if (msg.includes('producto') || msg.includes('gafa') || msg.includes('lente') || msg.includes('catalogo') || msg.includes('tienen')) {
      return 'productos';
    }
    if (msg.includes('horario') || msg.includes('abren') || msg.includes('cierran') || msg.includes('atencion')) {
      return 'horario';
    }
    if (msg.includes('envio') || msg.includes('domicilio') || msg.includes('entrega') || msg.includes('demora')) {
      return 'envio';
    }
    if (msg.includes('formula') || msg.includes('receta') || msg.includes('subir') || msg.includes('adjuntar')) {
      return 'formulamedica';
    }
    if (msg.includes('pago') || msg.includes('tarjeta') || msg.includes('bold') || msg.includes('pagar') || msg.includes('metodo') || msg.includes('transferencia')) {
      return 'pago';
    }
    if (msg.includes('devolucion') || msg.includes('cambio') || msg.includes('garantia') || msg.includes('reclamo')) {
      return 'devolucion';
    }
    if (msg.includes('gracias') || msg.includes('adios') || msg.includes('chao') || msg.includes('bye')) {
      return 'despedida';
    }
    if (msg.includes('ayuda') || msg.includes('opciones') || msg.includes('que puedes hacer') || msg.includes('menu')) {
      return 'ayuda';
    }
    
    if (msg.includes('precio') || msg.includes('costos') || msg.includes('cuanto cuesta') || msg.includes('valor') || msg.includes('precios')) {
      return 'precios';
    }
    if (msg.includes('contacto') || msg.includes('contactar') || msg.includes('hablar') || msg.includes('comunicarse') || msg.includes('atención al cliente') || msg.includes('soporte')) {
      return 'contacto';
    }
    if (msg.includes('garantía') || msg.includes('garantia') || msg.includes('protección') || msg.includes('defecto') || msg.includes('falla')) {
      return 'garantia';
    }

    return 'default';
  },

  // ========== OBTENER RESPUESTA ==========
  obtenerRespuesta: (intencion) => {
    return ChatBot.respuestas[intencion] || ChatBot.respuestas.default;
  },
};

export default ChatBot;