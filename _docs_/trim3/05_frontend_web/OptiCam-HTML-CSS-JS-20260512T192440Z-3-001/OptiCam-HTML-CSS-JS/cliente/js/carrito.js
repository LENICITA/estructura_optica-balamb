// ========== CARRITO DE COMPRAS - ÓPTICA BALAMB ==========

let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ========== NOTIFICACIONES BONITAS (SIN ALERT) ==========
function mostrarNotificacion(mensaje, tipo) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    
    // Colores según el tipo
    const colores = {
        exito: '#4CAF50',
        error: '#f44336',
        warning: '#FF9800',
        info: '#2196F3'
    };
    
    // Iconos según el tipo
    const iconos = {
        exito: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notificacion.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${colores[tipo] || colores.exito};
        color: white;
        padding: 14px 22px;
        border-radius: 12px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
    `;
    
    notificacion.innerHTML = `
        <i class="fa-solid ${iconos[tipo]}" style="font-size: 20px;"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    // Cerrar al hacer clic
    notificacion.onclick = () => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    };
    
    // Auto cerrar después de 3 segundos
    setTimeout(() => {
        if (notificacion && notificacion.parentNode) {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }
    }, 3000);
}

// ========== MODAL DE CONFIRMACIÓN (BONITO) ==========
function mostrarConfirmacion(mensaje, titulo, onConfirmar) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(3px);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
    `;
    
    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 20px;
        max-width: 400px;
        width: 90%;
        padding: 25px;
        text-align: center;
        animation: scaleIn 0.2s ease;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    modal.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="background: #fee2e2; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-trash-can" style="font-size: 28px; color: #dc2626;"></i>
            </div>
        </div>
        <h3 style="font-size: 20px; margin-bottom: 10px; color: #1a1a2e;">${titulo}</h3>
        <p style="color: #6b7280; margin-bottom: 25px;">${mensaje}</p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="confirmar-no" style="background: #f3f4f6; border: none; padding: 10px 25px; border-radius: 40px; cursor: pointer; font-size: 14px; color: #6b7280;">
                Cancelar
            </button>
            <button id="confirmar-si" style="background: #dc2626; border: none; padding: 10px 25px; border-radius: 40px; cursor: pointer; font-size: 14px; color: white; font-weight: 600;">
                Sí, eliminar
            </button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Eventos
    document.getElementById('confirmar-si').onclick = () => {
        onConfirmar();
        overlay.remove();
    };
    
    document.getElementById('confirmar-no').onclick = () => {
        overlay.remove();
    };
    
    // Cerrar al hacer clic fuera
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
}

// ========== MODAL DE ÉXITO (para pago) ==========
function mostrarModalExito(mensaje, subtitulo) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(3px);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 20px;
        max-width: 400px;
        width: 90%;
        padding: 30px;
        text-align: center;
        animation: scaleIn 0.2s ease;
    `;
    
    modal.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="background: #dcfce7; width: 70px; height: 70px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <i class="fa-solid fa-check" style="font-size: 35px; color: #22c55e;"></i>
            </div>
        </div>
        <h3 style="font-size: 22px; margin-bottom: 10px; color: #1a1a2e;">${mensaje}</h3>
        <p style="color: #6b7280; margin-bottom: 25px;">${subtitulo}</p>
        <button id="modal-cerrar" style="background: #B90F0F; border: none; padding: 12px 30px; border-radius: 40px; cursor: pointer; font-size: 14px; color: white; font-weight: 600;">
            Continuar
        </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    document.getElementById('modal-cerrar').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// ========== GUARDAR CARRITO ==========
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ========== RENDERIZAR CARRITO ==========
function renderizarCarrito() {
    const lista = document.getElementById('carrito-lista');
    const totalElement = document.getElementById('total');
    const seleccionadosSpan = document.getElementById('productos-seleccionados');
    
    if (!lista) return;
    
    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="carrito-vacio">
                <i class="fa-solid fa-cart-shopping"></i>
                <h3>🛒 Tu carrito está vacío</h3>
                <p>¡Agrega productos desde la tienda!</p>
                <button class="btn-seguir-comprando" onclick="window.location.href='catalogo.html'">
                    <i class="fa-solid fa-store"></i> Seguir comprando
                </button>
            </div>
        `;
        if (totalElement) totalElement.textContent = '$0';
        if (seleccionadosSpan) seleccionadosSpan.textContent = '0 productos seleccionados';
        const header = document.querySelector('.carrito-header');
        const footer = document.querySelector('.carrito-footer');
        if (header) header.style.display = 'none';
        if (footer) footer.style.display = 'none';
        return;
    }
    
    const header = document.querySelector('.carrito-header');
    const footer = document.querySelector('.carrito-footer');
    if (header) header.style.display = 'flex';
    if (footer) footer.style.display = 'flex';
    
    lista.innerHTML = carrito.map((producto, index) => `
        <div class="carrito-item ${producto.seleccionado ? 'seleccionado' : ''}" data-index="${index}">
            <div class="item-checkbox">
                <input type="checkbox" 
                       ${producto.seleccionado ? 'checked' : ''} 
                       onchange="toggleSeleccionItem(${index})">
            </div>
            <div class="item-imagen">
                <img src="${producto.imagen || 'img/default.png'}" alt="${producto.nombre}" onerror="this.src='img/logo2.jpeg'">
            </div>
            <div class="item-info">
                <h3>${producto.nombre}</h3>
                <div class="item-detalles">
                    <span class="detalle-color"> ${producto.colorSeleccionado || 'N/A'}</span>
                    <span class="detalle-material"> ${producto.materialSeleccionado || 'N/A'}</span>
                </div>
                <div class="precio-unitario">$${producto.precio.toLocaleString()} c/u</div>
            </div>
            <div class="item-cantidad">
                <button onclick="cambiarCantidad(${index}, -1)" ${producto.cantidad <= 1 ? 'disabled' : ''}>−</button>
                <span>${producto.cantidad}</span>
                <button onclick="cambiarCantidad(${index}, 1)">+</button>
            </div>
            <div class="item-subtotal">
                <span>$${(producto.precio * producto.cantidad).toLocaleString()}</span>
            </div>
            <div class="item-acciones">
                <button class="btn-eliminar" onclick="eliminarItem(${index})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    actualizarTotales();
}

// ========== SELECCIONAR ITEM ==========
function toggleSeleccionItem(index) {
    carrito[index].seleccionado = !carrito[index].seleccionado;
    guardarCarrito();
    renderizarCarrito();
}

// ========== SELECCIONAR TODOS ==========
function toggleSeleccionarTodos() {
    const checkbox = document.getElementById('seleccionar-todos');
    if (!checkbox) return;
    const seleccionar = checkbox.checked;
    carrito.forEach(item => item.seleccionado = seleccionar);
    guardarCarrito();
    renderizarCarrito();
    
    if (seleccionar) {
        mostrarNotificacion('Todos los productos seleccionados', 'info');
    } else {
        mostrarNotificacion('Selección de productos eliminada', 'info');
    }
}

// ========== CAMBIAR CANTIDAD ==========
function cambiarCantidad(index, delta) {
    const nuevaCantidad = carrito[index].cantidad + delta;
    if (nuevaCantidad < 1) {
        eliminarItem(index);
    } else {
        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito();
        renderizarCarrito();
        mostrarNotificacion(`Cantidad actualizada: ${nuevaCantidad}`, 'exito');
    }
}

// ========== ELIMINAR ITEM (CON CONFIRMACIÓN BONITA) ==========
function eliminarItem(index) {
    const producto = carrito[index];
    mostrarConfirmacion(
        `¿Estás seguro de eliminar "${producto.nombre}" del carrito?`,
        'Eliminar producto',
        () => {
            carrito.splice(index, 1);
            guardarCarrito();
            renderizarCarrito();
            mostrarNotificacion(`✓ ${producto.nombre} eliminado del carrito`, 'exito');
        }
    );
}

// ========== ELIMINAR SELECCIONADOS (CON CONFIRMACIÓN) ==========
function eliminarSeleccionados() {
    const seleccionados = carrito.filter(item => item.seleccionado);
    if (seleccionados.length === 0) {
        mostrarNotificacion('No hay productos seleccionados para eliminar', 'warning');
        return;
    }
    
    mostrarConfirmacion(
        `¿Eliminar ${seleccionados.length} producto(s) seleccionado(s)?`,
        'Eliminar productos',
        () => {
            carrito = carrito.filter(item => !item.seleccionado);
            guardarCarrito();
            renderizarCarrito();
            mostrarNotificacion(`✓ ${seleccionados.length} producto(s) eliminados`, 'exito');
        }
    );
}

// ========== VACIAR CARRITO (CON CONFIRMACIÓN) ==========
function vaciarCarrito() {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
    }
    
    mostrarConfirmacion(
        '¿Estás seguro de vaciar todo el carrito? Esta acción no se puede deshacer.',
        'Vaciar carrito',
        () => {
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
            mostrarNotificacion(' Carrito vaciado correctamente', 'exito');
        }
    );
}

// ========== ACTUALIZAR TOTALES ==========
function actualizarTotales() {
    const totalElement = document.getElementById('total');
    const seleccionadosSpan = document.getElementById('productos-seleccionados');
    
    const seleccionados = carrito.filter(item => item.seleccionado);
    const total = seleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const cantidad = seleccionados.length;
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    if (totalElement) totalElement.textContent = `$${total.toLocaleString()}`;
    if (seleccionadosSpan) seleccionadosSpan.textContent = `${cantidad} de ${totalItems} productos seleccionados`;
    
    const checkboxTodos = document.getElementById('seleccionar-todos');
    if (checkboxTodos && carrito.length > 0) {
        const todosSeleccionados = carrito.every(item => item.seleccionado);
        checkboxTodos.checked = todosSeleccionados;
    }
}

// ========== PAGAR SELECCIONADOS (MODAL BONITO) ==========
function pagarSeleccionados() {
    const seleccionados = carrito.filter(item => item.seleccionado);
    if (seleccionados.length === 0) {
        mostrarNotificacion('Selecciona al menos un producto para continuar', 'warning');
        return;
    }
    
    const total = seleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    mostrarModalExito(
        '¡Compra realizada!',
        `Has comprado ${seleccionados.length} producto(s) por un total de $${total.toLocaleString()}`
    );
    
    // Eliminar los productos pagados del carrito
    carrito = carrito.filter(item => !item.seleccionado);
    guardarCarrito();
    renderizarCarrito();
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();
});

// ========== ANIMACIONES CSS ==========
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes scaleIn {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);