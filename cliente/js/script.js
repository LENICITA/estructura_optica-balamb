// ========== SCRIPT.JS - FUNCIONES GLOBALES ÓPTICA BALAMB ==========

// Variables globales
let productosData = [];
let carrito = [];

// ========== 1. INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Óptica Balamb - Sistema iniciado');
    
    // Cargar productos
    cargarProductos();
    
    // Cargar carrito
    cargarCarritoGlobal();
    
    // Inicializar chatbot
    inicializarChatbot();
    
    // Inicializar mensajes
    inicializarMensajes();
    
    // Actualizar contador del carrito
    actualizarContadorGlobal();
});

// ========== 2. BASE DE DATOS DE PRODUCTOS ==========
function cargarProductos() {
    productosData = [
        {
            id: 1,
            nombre: "Gafas Modernas Titanio",
            precio: 250000,
            imagen: "/img/gafas-titanio.jpg",
            categoria: "Gafas",
            material: "Titanio",
            tipo: "Modernas",
            popularidad: 150,
            descripcion: "Gafas ultraligeras de titanio con diseño moderno"
        },
        {
            id: 2,
            nombre: "Lentes Transitions",
            precio: 320000,
            imagen: "/img/lentes-transitions.jpg",
            categoria: "Lentes",
            material: "Plastico",
            tipo: "Transitions",
            popularidad: 200,
            descripcion: "Lentes que se adaptan a la luz"
        },
        {
            id: 3,
            nombre: "Gafas Metal Classic",
            precio: 180000,
            imagen: "/img/gafas-metal.jpg",
            categoria: "Gafas",
            material: "Metal",
            tipo: "Clásicas",
            popularidad: 120,
            descripcion: "Diseño clásico en metal resistente"
        },
        {
            id: 4,
            nombre: "Lentes de Contacto",
            precio: 150000,
            imagen: "/img/lentes-contacto.jpg",
            categoria: "Accesorios",
            material: "Plastico",
            tipo: "Contacto",
            popularidad: 300,
            descripcion: "Lentes de contacto diarios"
        },
        {
            id: 5,
            nombre: "Gafas Deportivas",
            precio: 210000,
            imagen: "/img/gafas-deportivas.jpg",
            categoria: "Gafas",
            material: "Plastico",
            tipo: "Deportivas",
            popularidad: 180,
            descripcion: "Ideales para actividades al aire libre"
        },
        {
            id: 6,
            nombre: "Gafas Titanio Premium",
            precio: 450000,
            imagen: "/img/gafas-premium.jpg",
            categoria: "Gafas",
            material: "Titanio",
            tipo: "Premium",
            popularidad: 90,
            descripcion: "Edición limitada en titanio"
        }
    ];
    
    // Guardar en localStorage para otras páginas
    localStorage.setItem('productos_db', JSON.stringify(productosData));
}

// ========== 3. FUNCIONES GLOBALES DEL CARRITO ==========
function cargarCarritoGlobal() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    } else {
        carrito = [];
    }
}

function guardarCarritoGlobal() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorGlobal();
}

function actualizarContadorGlobal() {
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    const contadores = document.querySelectorAll('.cart-count');
    contadores.forEach(contador => {
        contador.textContent = totalItems;
        if (totalItems > 0) {
            contador.style.display = 'inline-block';
        } else {
            contador.style.display = 'none';
        }
    });
}

function agregarAlCarritoGlobal(producto) {
    const existeIndex = carrito.findIndex(item => 
        item.id === producto.id && 
        item.color === producto.color && 
        item.material === producto.material
    );
    
    if (existeIndex !== -1) {
        carrito[existeIndex].cantidad = (carrito[existeIndex].cantidad || 1) + 1;
        mostrarNotificacionGlobal(`${producto.nombre} - Cantidad aumentada`, 'success');
    } else {
        carrito.push({
            ...producto,
            cantidad: 1,
            seleccionado: true,
            fecha: new Date().toISOString()
        });
        mostrarNotificacionGlobal(`✅ ${producto.nombre} añadido al carrito`, 'success');
    }
    
    guardarCarritoGlobal();
}

function eliminarDelCarritoGlobal(index) {
    const producto = carrito[index];
    if (confirm(`¿Eliminar ${producto.nombre} del carrito?`)) {
        carrito.splice(index, 1);
        guardarCarritoGlobal();
        mostrarNotificacionGlobal(`❌ ${producto.nombre} eliminado`, 'warning');
        if (window.location.pathname.includes('carrito.html')) {
            location.reload();
        }
    }
}

// ========== 4. NOTIFICACIONES GLOBALES ==========
function mostrarNotificacionGlobal(mensaje, tipo = 'success') {
    // Eliminar notificaciones anteriores
    const anteriores = document.querySelectorAll('.notificacion-global');
    anteriores.forEach(notif => notif.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-global';
    
    const colores = {
        success: '#4CAF50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196F3'
    };
    
    const iconos = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colores[tipo] || '#333'};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Segoe UI', sans-serif;
    `;
    
    notificacion.innerHTML = `${iconos[tipo] || '📢'} ${mensaje}`;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// ========== 5. CHATBOT ==========
function inicializarChatbot() {
    const chatbotIcono = document.getElementById('chatbot-icono');
    const chatbotVentana = document.getElementById('chatbot-ventana');
    const chatbotCerrar = document.getElementById('chatbot-cerrar');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotEnviar = document.getElementById('chatbot-enviar');
    const chatbotMensajes = document.getElementById('chatbot-mensajes');
    
    if (!chatbotIcono) return;
    
    // Abrir/cerrar chatbot
    chatbotIcono.addEventListener('click', () => {
        chatbotVentana.classList.toggle('activo');
    });
    
    if (chatbotCerrar) {
        chatbotCerrar.addEventListener('click', () => {
            chatbotVentana.classList.remove('activo');
        });
    }
    
    // Respuestas del chatbot
    const respuestas = {
        precios: "💰 Nuestros precios van desde $150.000 hasta $450.000. ¡Tenemos opciones para todos los presupuestos!",
        envio: "📦 Hacemos envíos a toda Colombia. El costo es de $15.000 o GRATIS en compras mayores a $200.000",
        garantia: "🛡️ Todos nuestros productos tienen 6 meses de garantía contra defectos de fabricación.",
        contacto: "📞 Puedes contactarnos al +57 300 237 4767 o por email: opticavirtualbalamb@gmail.com",
        default: "Lo siento, no entendí tu pregunta. Puedes preguntarme sobre: precios, envíos, garantía o contacto."
    };
    
    function enviarMensaje() {
        const mensaje = chatbotInput.value.trim();
        if (!mensaje) return;
        
        // Agregar mensaje del usuario
        agregarMensaje(mensaje, 'usuario');
        chatbotInput.value = '';
        
        // Determinar respuesta
        let respuesta = respuestas.default;
        const mensajeLower = mensaje.toLowerCase();
        
        if (mensajeLower.includes('precio') || mensajeLower.includes('cuesta') || mensajeLower.includes('valor')) {
            respuesta = respuestas.precios;
        } else if (mensajeLower.includes('envio') || mensajeLower.includes('envío') || mensajeLower.includes('domicilio')) {
            respuesta = respuestas.envio;
        } else if (mensajeLower.includes('garantia') || mensajeLower.includes('garantía')) {
            respuesta = respuestas.garantia;
        } else if (mensajeLower.includes('contacto') || mensajeLower.includes('telefono') || mensajeLower.includes('teléfono') || mensajeLower.includes('email')) {
            respuesta = respuestas.contacto;
        }
        
        // Simular tiempo de respuesta
        setTimeout(() => {
            agregarMensaje(respuesta, 'bot');
        }, 500);
    }
    
    function agregarMensaje(texto, tipo) {
        const mensajeDiv = document.createElement('div');
        mensajeDiv.className = `mensaje ${tipo}`;
        mensajeDiv.innerHTML = `
            <div class="mensaje-contenido">${texto}</div>
            <div class="mensaje-hora">${new Date().toLocaleTimeString()}</div>
        `;
        chatbotMensajes.appendChild(mensajeDiv);
        chatbotMensajes.scrollTop = chatbotMensajes.scrollHeight;
    }
    
    // Eventos del chatbot
    if (chatbotEnviar) {
        chatbotEnviar.addEventListener('click', enviarMensaje);
    }
    
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensaje();
        });
    }
    
    // Botones de opciones rápidas
    const opcionesBtns = document.querySelectorAll('.opcion-btn');
    opcionesBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const respuesta = btn.dataset.respuesta;
            if (respuesta && respuestas[respuesta]) {
                agregarMensaje(respuestas[respuesta], 'bot');
            }
        });
    });
}

// ========== 6. MENSAJES/NOTIFICACIONES ==========
function inicializarMensajes() {
    const btnMensajes = document.getElementById('btn-mensajes');
    if (!btnMensajes) return;
    
    // Crear panel de mensajes si no existe
    if (!document.querySelector('.panel-mensajes')) {
        const panel = document.createElement('div');
        panel.className = 'panel-mensajes';
        panel.innerHTML = `
            <div class="panel-header">
                <h4><i class="fa-regular fa-envelope"></i> Mensajes</h4>
                <button class="cerrar-panel">&times;</button>
            </div>
            <div class="mensajes-lista">
                <div class="mensaje">
                    <i class="fa-regular fa-bell"></i>
                    <div class="mensaje-contenido">
                        <strong>Bienvenido</strong>
                        <p>¡Gracias por visitar Óptica Balamb!</p>
                        <small>Hoy</small>
                    </div>
                </div>
                <div class="mensaje">
                    <i class="fa-solid fa-tag"></i>
                    <div class="mensaje-contenido">
                        <strong>Promoción</strong>
                        <p>15% descuento en lentes Transition</p>
                        <small>Ayer</small>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        
        const cerrarPanel = panel.querySelector('.cerrar-panel');
        cerrarPanel.addEventListener('click', () => {
            panel.classList.remove('active');
        });
        
        btnMensajes.addEventListener('click', () => {
            panel.classList.toggle('active');
        });
    }
}

// ========== 7. ANIMACIONES CSS GLOBALES ==========
const styleGlobal = document.createElement('style');
styleGlobal.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .cart-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background: var(--color-primario, #B90F0F);
        color: white;
        font-size: 11px;
        font-weight: bold;
        min-width: 18px;
        height: 18px;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
    }
    
    .icons button {
        position: relative;
    }
    
    .panel-mensajes {
        position: fixed;
        top: 80px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        z-index: 1000;
        display: none;
        overflow: hidden;
    }
    
    .panel-mensajes.active {
        display: block;
        animation: slideInRight 0.3s ease;
    }
    
    .panel-header {
        background: var(--color-primario, #B90F0F);
        color: white;
        padding: 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .cerrar-panel {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
    }
    
    .mensajes-lista {
        max-height: 400px;
        overflow-y: auto;
    }
    
    .mensajes-lista .mensaje {
        display: flex;
        gap: 12px;
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .mensajes-lista .mensaje:hover {
        background: #f5f5f5;
    }
    
    .mensajes-lista .mensaje i {
        color: var(--color-primario, #B90F0F);
        font-size: 18px;
    }
    
    .mensajes-lista .mensaje-contenido {
        flex: 1;
    }
    
    .mensajes-lista .mensaje-contenido strong {
        display: block;
        font-size: 14px;
        margin-bottom: 3px;
    }
    
    .mensajes-lista .mensaje-contenido p {
        font-size: 12px;
        color: #666;
        margin: 0 0 3px;
    }
    
    .mensajes-lista .mensaje-contenido small {
        font-size: 10px;
        color: #999;
    }
`;
document.head.appendChild(styleGlobal);