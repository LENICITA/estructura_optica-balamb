// models/chatbot.js
// NO usa base de datos, solo contiene la lógica

const ChatBot = {
  // Respuestas predefinidas del chatbot
  respuestas: {
    saludo: "¡Hola! Bienvenido a ÓptiCam. ¿En qué puedo ayudarte?",
    productos: "Ofrecemos gafas de sol, monturas, lentes progresivos y accesorios. ¿Te gustaría ver nuestro catálogo?",
    horario: "Nuestro horario de atención es de Lunes a Viernes de 8am a 6pm, y Sábados de 9am a 1pm.",
    envio: "Realizamos envíos a toda la ciudad. El costo de envío fuera de bogotá es de $5,000 y la entrega demora de 8 a 10 días hábiles.",
    formulamedica: "Para subir tu fórmula médica, ve a 'Mi Perfil' → 'Subir Fórmula'. Adjunta la imagen de tu fórmula y nuestro equipo la revisará. Te enviaremos el precio por este aplicativo.",
    pago: "Aceptamos pagos a través de Bold, nuestra pasarela de pagos segura. Puedes pagar con tarjetas débito/crédito, Nequi, Daviplata y transferencias bancarias. ¡Todos los métodos están disponibles en Bold!",
    devolucion: "Tienes 15 días hábiles para solicitar devoluciones. El producto debe estar en perfecto estado.",
    despedida: "Gracias por contactarnos. ¡Que tengas un excelente día!",
    ayuda: "📋 *Opciones disponibles:*\n\n• Productos - Información sobre gafas y lentes\n• Horario - Horarios de atención\n• Envío - Costos y tiempos de entrega\n• Fórmula médica - Envio de formulas\n• Pago - Métodos de pago aceptados\n• Devolución - Política de cambios y garantías\n\n💬 *¿Necesitas atención personalizada?* Escríbenos al WhatsApp: 📱 330-120-92941",
    default: "Lo siento, no entendí tu pregunta. ¿Podrías reformularla? O escribe 'ayuda' para ver las opciones disponibles.",
    
    // ===== REPARTIDOR =====
    reparto_pedidos: "📦 *Tus pedidos asignados hoy:*\n\nVe a la sección 'Mis Entregas' en tu app.\nAllí encontrarás:\n• 📍 Dirección completa del cliente\n• 👤 Nombre y teléfono del cliente\n• ⏰ Horario estimado de entrega\n• 📝 Notas adicionales del pedido\n\nRecuerda revisar tu lista antes de salir a la ruta.",
    
    reparto_direccion: "📍 *¿Cómo ver la dirección?*\n\nCada pedido en 'Mis Entregas' tiene:\n1. La dirección completa\n2. Un botón para abrir en Google Maps\n3. Referencias adicionales del cliente\n\nSi no encuentras la dirección, contacta al cliente por el teléfono que aparece en el pedido.",
    
    reparto_horario: "⏰ *Horario de entregas:*\n\n• Tu jornada es de 8:00 am a 6:00 pm\n• Los pedidos se asignan desde las 7:00 am\n• Tienes 2 horas para entregar después de asignado\n• Si no puedes entregar, avisa al admin\n\n📌 Recuerda: las entregas son en el horario indicado en cada pedido.",
    
    reparto_incidente: "⚠️ *Reportar un incidente:*\n\nSi tienes un problema durante la entrega:\n1. 📱 Llama al admin: 330-120-92941\n2. 📝 Describe el problema en 'Reportes'\n3. 📸 Toma fotos si es necesario\n\n❌ No entregues el pedido si:\n• El cliente no está en casa\n• La dirección no existe\n• Hay riesgo para tu seguridad\n\n¡Siempre prioriza tu seguridad!",
    
    reparto_ayuda: "📋 *Ayuda para repartidores:*\n\nEscribe:\n• 'pedidos' → Ver mis asignaciones\n• 'dirección' → Cómo ver direcciones\n• 'horario' → Mi jornada laboral\n• 'incidente' → Reportar problemas\n\n💬 *¿Emergencia?* Llama al admin: 📱 330-120-92941",
    
    reparto_default: "Lo siento, no entendí tu consulta como repartidor. Escribe 'ayuda repartidor' para ver las opciones disponibles."
  },

  // FAQ predefinidas (sin base de datos)
  faqs: [
    // ----- CLIENTE -----
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
    },
    
    // ----- REPARTIDOR -----
    {
      id: 9,
      pregunta: "¿Cómo veo mis pedidos asignados?",
      respuesta: "Ve a la sección 'Mis Entregas' en tu app. Allí encontrarás todos los pedidos que debes entregar hoy con dirección, cliente y horario."
    },
    {
      id: 10,
      pregunta: "¿Cómo veo la dirección de entrega?",
      respuesta: "Cada pedido muestra la dirección completa y un botón para abrir en Google Maps. También verás el teléfono del cliente para contactarlo."
    },
    {
      id: 11,
      pregunta: "¿Cuál es mi horario de entregas?",
      respuesta: "Tu jornada es de 8:00 am a 6:00 pm. Los pedidos se asignan desde las 7:00 am. Tienes 2 horas para entregar después de la asignación."
    },
    {
      id: 12,
      pregunta: "¿Qué hago si hay un problema en la entrega?",
      respuesta: "Reporta el incidente al admin por WhatsApp 📱 330-120-92941. Describe el problema y toma fotos si es necesario. No entregues si hay riesgo."
    }
  ],

  // Detectar intención del mensaje
  detectarIntencion: (mensaje) => {
    const msg = mensaje.toLowerCase();
    const esRepartidor = msg.includes('repartidor') || msg.includes('reparto') || 
                         msg.includes('entrega') || msg.includes('entregas') || 
                         msg.includes('repartiendo') || msg.includes('ruta');

    // ===== REPARTIDOR =====
    if (esRepartidor) {
      if (msg.includes('pedido') || msg.includes('asignado') || msg.includes('mis entregas') || msg.includes('lista')) {
        return 'reparto_pedidos';
      }
      if (msg.includes('dirección') || msg.includes('ubicacion') || msg.includes('mapa') || msg.includes('google')) {
        return 'reparto_direccion';
      }
      if (msg.includes('horario') || msg.includes('turno') || msg.includes('jornada') || msg.includes('hora')) {
        return 'reparto_horario';
      }
      if (msg.includes('incidente') || msg.includes('problema') || msg.includes('retraso') || 
          msg.includes('cliente no responde') || msg.includes('accidente') || msg.includes('reportar')) {
        return 'reparto_incidente';
      }
      if (msg.includes('ayuda') || msg.includes('opciones') || msg.includes('menu')) {
        return 'reparto_ayuda';
      }
      return 'reparto_default';
    }

    // ===== CLIENTE =====
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

  // Obtener respuesta según la intención
  obtenerRespuesta: (intencion) => {
    return ChatBot.respuestas[intencion] || ChatBot.respuestas.default;
  },

  // Obtener FAQ (sin base de datos)
  getFaqs: () => {
    return ChatBot.faqs;
  },

  // Buscar FAQ por texto
  searchFaqs: (termino) => {
    const search = termino.toLowerCase();
    return ChatBot.faqs.filter(faq => 
      faq.pregunta.toLowerCase().includes(search) || 
      faq.respuesta.toLowerCase().includes(search)
    );
  }
};

export default ChatBot;