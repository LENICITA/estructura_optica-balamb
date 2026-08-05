// models/chatbot.js
// NO usa base de datos, solo contiene la lógica

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
    ayuda: "📋 *Opciones disponibles:*\n\n• Productos - Información sobre gafas y lentes\n• Horario - Horarios de atención\n• Envío - Costos y tiempos de entrega\n• Fórmula médica - Envio de formulas\n• Pago - Métodos de pago aceptados\n• Devolución - Política de cambios y garantías\n\n💬 *¿Necesitas atención personalizada?* Escríbenos al WhatsApp: 📱 330-120-92941",
    default: "Lo siento, no entendí tu pregunta. ¿Podrías reformularla? O escribe 'ayuda' para ver las opciones disponibles."
  },

  // ========== FAQ ==========
  faqs: [
    {
      id: 1,
      pregunta: "¿Qué productos ofrecen?",
      respuesta: "Ofrecemos gafas de sol, monturas, lentes progresivos, lentes de contacto y accesorios."
    },
    {
      id: 2,
      pregunta: "¿Cómo puedo comprar?",
      respuesta: "Puedes comprar directamente en nuestra web, seleccionando los productos, guardandolos en el carrito y realizando el pago online con un abono del 50% si asi lo deseas."
    },
    {
      id: 3,
      pregunta: "¿Cuánto cuesta el envío?",
      respuesta: "El costo de envío es de $5,000 para fuera de la ciudad de bogotá. Envíos gratis en la ciudad de bogotá."
    },
    {
      id: 4,
      pregunta: "¿Cuánto tarda la entrega?",
      respuesta: "La entrega demora entre 8 a 10 días hábiles después de confirmado el pago."
    },
    {
      id: 5,
      pregunta: "¿Aceptan devoluciones?",
      respuesta: "Sí, aceptamos devoluciones dentro de los 15 días hábiles posteriores a la compra."
    },
    {
      id: 6,
      pregunta: "¿Necesito fórmula médica para comprar gafas?",
      respuesta: "Solo para lentes graduados necesitas fórmula médica. Para gafas de sol no es necesaria."
    },
    {
      id: 7,
      pregunta: "¿Qué métodos de pago aceptan?",
      respuesta: "Aceptamos todos los métodos de pago a través de Bold: tarjetas débito/crédito, Nequi, Daviplata, transferencias bancarias y más. Es nuestra pasarela de pagos segura y confiable."
    },
    {
      id: 8,
      pregunta: "¿Cómo contactar con atención al cliente?",
      respuesta: "Puedes contactarnos al WhatsApp 330-120-92941 o al correo opticavirtualbalmb@gmail.com"
    }
  ],

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
    
    return 'default';
  },

  // ========== OBTENER RESPUESTA ==========
  obtenerRespuesta: (intencion) => {
    return ChatBot.respuestas[intencion] || ChatBot.respuestas.default;
  },

  // ========== OBTENER FAQ ==========
  getFaqs: () => {
    return ChatBot.faqs;
  },

  // ========== BUSCAR FAQ ==========
  searchFaqs: (termino) => {
    const search = termino.toLowerCase();
    return ChatBot.faqs.filter(faq => 
      faq.pregunta.toLowerCase().includes(search) || 
      faq.respuesta.toLowerCase().includes(search)
    );
  }
};

export default ChatBot;