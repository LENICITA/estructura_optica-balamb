document.addEventListener('DOMContentLoaded', function() {
    // ===== CONFIGURACIÓN DEL CHATBOT =====
    const chatbotIcono = document.getElementById('chatbot-icono');
    const chatbotVentana = document.getElementById('chatbot-ventana');
    const chatbotCerrar = document.getElementById('chatbot-cerrar');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotEnviar = document.getElementById('chatbot-enviar');
    const chatbotMensajes = document.getElementById('chatbot-mensajes');
    const opcionBtns = document.querySelectorAll('.opcion-btn');

    // Base de conocimiento del chatbot
    const respuestas = {
        precios: "Nuestros precios varían según el producto. Tenemos opciones desde $20 hasta $500. ¿Te interesa algún producto en específico? Puedo darte más detalles.",
        
        envio: "📦 Realizamos envíos a todo el país. El costo es de $5 para pedidos menores a $50, ¡y GRATIS para pedidos superiores a $50! El tiempo de entrega es de 3-5 días hábiles.",
        
        garantia: "🛡️ Todos nuestros productos tienen 1 año de garantía contra defectos de fabricación. Además, ofrecemos 30 días para devoluciones sin preguntas.",
        
        contacto: "📞 Puedes contactarnos por:\n• Teléfono: (555) 123-4567\n• Email: soporte@optibot.com\n• Horario: Lunes a Viernes 9am - 6pm",
        
        saludo: "¡Hola! Soy OptiBot, tu asistente virtual. 😊<br>¿En qué puedo ayudarte hoy? Puedes preguntarme sobre precios, envíos, garantía o contacto.",
        
        default: "Lo siento, no tengo información sobre eso. ¿Puedes intentar preguntar de otra manera? O selecciona una de las opciones rápidas 👇"
    };

    // ===== FUNCIONES =====
    function toggleChatbot() {
        chatbotVentana.classList.toggle('activo');
        if (chatbotVentana.classList.contains('activo')) {
            chatbotInput.focus();
        }
    }

    function obtenerHoraActual() {
        return new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    function agregarMensaje(texto, tipo) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `mensaje ${tipo}`;
        
        const contenidoDiv = document.createElement('div');
        contenidoDiv.className = 'mensaje-contenido';
        contenidoDiv.innerHTML = texto; // Usamos innerHTML para permitir saltos de línea
        
        const horaDiv = document.createElement('div');
        horaDiv.className = 'mensaje-hora';
        horaDiv.textContent = obtenerHoraActual();
        
        mensajeDiv.appendChild(contenidoDiv);
        mensajeDiv.appendChild(horaDiv);
        
        chatbotMensajes.appendChild(mensajeDiv);
        chatbotMensajes.scrollTop = chatbotMensajes.scrollHeight;
    }

    function procesarMensajeUsuario(mensaje) {
        if (!mensaje.trim()) return;
        
        // Agregar mensaje del usuario
        agregarMensaje(mensaje, 'usuario');
        
        // Procesar respuesta
        setTimeout(() => {
            const respuesta = obtenerRespuesta(mensaje.toLowerCase());
            agregarMensaje(respuesta, 'bot');
        }, 500);
    }

    function obtenerRespuesta(mensaje) {
        // Palabras clave y respuestas
        if (mensaje.includes('precio') || mensaje.includes('costo') || mensaje.includes('valor') || mensaje.includes('cuánto')) {
            return respuestas.precios;
        } else if (mensaje.includes('envío') || mensaje.includes('envio') || mensaje.includes('entrega') || mensaje.includes('shipping')) {
            return respuestas.envio;
        } else if (mensaje.includes('garantía') || mensaje.includes('garantia') || mensaje.includes('devolución') || mensaje.includes('reembolso')) {
            return respuestas.garantia;
        } else if (mensaje.includes('contacto') || mensaje.includes('teléfono') || mensaje.includes('telefono') || mensaje.includes('email') || mensaje.includes('correo')) {
            return respuestas.contacto;
        } else if (mensaje.includes('hola') || mensaje.includes('buenos días') || mensaje.includes('buenas tardes') || mensaje.includes('ayuda')) {
            return respuestas.saludo;
        } else {
            return respuestas.default;
        }
    }

    // ===== EVENT LISTENERS =====
    chatbotIcono.addEventListener('click', toggleChatbot);
    
    chatbotCerrar.addEventListener('click', function(e) {
        e.stopPropagation();
        chatbotVentana.classList.remove('activo');
    });

    chatbotEnviar.addEventListener('click', function() {
        const mensaje = chatbotInput.value;
        procesarMensajeUsuario(mensaje);
        chatbotInput.value = '';
    });

    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const mensaje = chatbotInput.value;
            procesarMensajeUsuario(mensaje);
            chatbotInput.value = '';
        }
    });

    // Botones de opciones rápidas
    opcionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const respuestaKey = this.dataset.respuesta;
            const pregunta = this.textContent.trim();
            
            // Mostrar la pregunta como mensaje del usuario
            agregarMensaje(pregunta, 'usuario');
            
            // Mostrar respuesta correspondiente
            setTimeout(() => {
                agregarMensaje(respuestas[respuestaKey], 'bot');
            }, 500);
        });
    });

    // Cerrar chatbot al hacer clic fuera (opcional)
    document.addEventListener('click', function(e) {
        if (!chatbotVentana.contains(e.target) && 
            !chatbotIcono.contains(e.target) && 
            chatbotVentana.classList.contains('activo')) {
            chatbotVentana.classList.remove('activo');
        }
    });

    console.log('✅ ChatBot OptiBot inicializado correctamente');
});