// ========== CARRITO.JS - ÓPTICA BALAMB ==========
// COMPATIBLE CON PRODUCTO.JS

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 Carrito inicializado');
    cargarCarrito();
    actualizarContadorCarrito();
    
    // Eventos
    const selectAll = document.getElementById('seleccionar-todos');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            seleccionarTodos(this.checked);
        });
    }
    
    const btnEliminarSeleccionados = document.getElementById('btn-eliminar-seleccionados');
    if (btnEliminarSeleccionados) {
        btnEliminarSeleccionados.addEventListener('click', eliminarSeleccionados);
    }
    
    const btnVaciar = document.getElementById('btn-vaciar');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', vaciarCarrito);
    }
    
    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', procederAlPago);
    }
});

// Obtener carrito
function obtenerCarrito() {
    const carrito = localStorage.getItem('carrito');
    return carrito ? JSON.parse(carrito) : [];
}

// Guardar carrito
function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

// Actualizar contador en el header
function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    const contadores = document.querySelectorAll('.cart-count');
    contadores.forEach(contador => {
        contador.textContent = totalItems;
    });
}

// Cargar y mostrar carrito
function cargarCarrito() {
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById('carrito-lista');
    
    if (!contenedor) return;
    
    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="carrito-vacio">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Tu carrito está vacío</p>
                <a href="catalogo.html" class="btn-seguir-comprando">
                    <i class="fa-solid fa-store"></i> Seguir comprando
                </a>
            </div>
        `;
        actualizarResumen();
        return;
    }
    
    // Mostrar productos
    contenedor.innerHTML = carrito.map((item, index) => {
        // Asegurar que el precio sea número
        let precio = item.precio;
        if (typeof precio === 'string') {
            precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
        }
        
        const cantidad = item.cantidad || 1;
        const totalItem = precio * cantidad;
        const isChecked = item.seleccionado !== false;
        
        return `
            <div class="carrito-item" data-index="${index}">
                <input type="checkbox" class="item-checkbox" data-index="${index}" ${isChecked ? 'checked' : ''} onchange="toggleItemSeleccionado(${index})">
                <img src="${item.imagen || '/img/default-product.jpg'}" class="item-imagen" onerror="this.src='/img/default-product.jpg'">
                <div class="item-info">
                    <h3>${escapeHtml(item.nombre || 'Producto')}</h3>
                    <p class="item-detalles">
                        Color: ${item.color || '-'} | Material: ${item.material || '-'}
                    </p>
                    <div class="item-cantidad">
                        <button class="btn-cantidad" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <span>${cantidad}</span>
                        <button class="btn-cantidad" onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="item-precio">
                    <span class="precio-unitario">$${precio.toLocaleString('es-CO')}</span>
                    <span class="precio-total">$${totalItem.toLocaleString('es-CO')}</span>
                    <button class="btn-eliminar-item" onclick="eliminarItem(${index})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    actualizarResumen();
}

// Cambiar cantidad
function cambiarCantidad(index, cambio) {
    const carrito = obtenerCarrito();
    if (!carrito[index]) return;
    
    const nuevaCantidad = (carrito[index].cantidad || 1) + cambio;
    
    if (nuevaCantidad >= 1 && nuevaCantidad <= 99) {
        carrito[index].cantidad = nuevaCantidad;
        guardarCarrito(carrito);
        cargarCarrito();
        mostrarNotificacion(`Cantidad actualizada: ${nuevaCantidad}`);
    } else if (nuevaCantidad < 1) {
        eliminarItem(index);
    }
}

// Eliminar un item
function eliminarItem(index) {
    const carrito = obtenerCarrito();
    const producto = carrito[index];
    
    if (confirm(`¿Eliminar "${producto.nombre}" del carrito?`)) {
        carrito.splice(index, 1);
        guardarCarrito(carrito);
        cargarCarrito();
        mostrarNotificacion(`${producto.nombre} eliminado del carrito`);
    }
}

// Vaciar todo el carrito
function vaciarCarrito() {
    if (confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
        localStorage.removeItem('carrito');
        cargarCarrito();
        mostrarNotificacion('Carrito vaciado completamente');
    }
}

// Seleccionar todos
function seleccionarTodos(seleccionado) {
    const carrito = obtenerCarrito();
    carrito.forEach(item => {
        item.seleccionado = seleccionado;
    });
    guardarCarrito(carrito);
    cargarCarrito();
}

// Toggle selección de un item
function toggleItemSeleccionado(index) {
    const carrito = obtenerCarrito();
    if (carrito[index]) {
        carrito[index].seleccionado = !carrito[index].seleccionado;
        guardarCarrito(carrito);
        actualizarResumen();
        
        // Actualizar checkbox "seleccionar todos"
        const todosSeleccionados = carrito.every(item => item.seleccionado !== false);
        const selectAll = document.getElementById('seleccionar-todos');
        if (selectAll) {
            selectAll.checked = todosSeleccionados;
        }
    }
}

// Actualizar resumen
function actualizarResumen() {
    const carrito = obtenerCarrito();
    let total = 0;
    let seleccionados = 0;
    
    carrito.forEach(item => {
        if (item.seleccionado !== false) {
            let precio = item.precio;
            if (typeof precio === 'string') {
                precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
            }
            total += precio * (item.cantidad || 1);
            seleccionados++;
        }
    });
    
    const totalSpan = document.getElementById('total');
    const seleccionadosSpan = document.getElementById('productos-seleccionados');
    
    if (totalSpan) totalSpan.textContent = `$${total.toLocaleString('es-CO')}`;
    if (seleccionadosSpan) {
        seleccionadosSpan.textContent = `${seleccionados} producto${seleccionados !== 1 ? 's' : ''} seleccionado${seleccionados !== 1 ? 's' : ''}`;
    }
}

// Eliminar seleccionados
function eliminarSeleccionados() {
    const carrito = obtenerCarrito();
    const nuevosCarrito = carrito.filter(item => item.seleccionado === false);
    
    if (nuevosCarrito.length === carrito.length) {
        mostrarNotificacion('No has seleccionado ningún producto', 'warning');
        return;
    }
    
    const eliminados = carrito.length - nuevosCarrito.length;
    
    if (confirm(`¿Eliminar ${eliminados} producto(s) seleccionado(s)?`)) {
        guardarCarrito(nuevosCarrito);
        cargarCarrito();
        mostrarNotificacion(`${eliminados} producto(s) eliminado(s)`);
    }
}

// Proceder al pago
function procederAlPago() {
    const carrito = obtenerCarrito();
    const productosSeleccionados = carrito.filter(item => item.seleccionado !== false);
    
    if (productosSeleccionados.length === 0) {
        alert('Por favor selecciona al menos un producto para continuar');
        return;
    }
    
    // Guardar productos seleccionados para el checkout
    localStorage.setItem('carrito_compra', JSON.stringify(productosSeleccionados));
    console.log('✅ Productos para checkout:', productosSeleccionados);
    
    // Redirigir al checkout
    window.location.href = 'checkout.html';
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-carrito';
    notificacion.innerHTML = `
        <i class="fa-solid ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    if (tipo === 'warning') {
        notificacion.style.background = '#ff9800';
    } else if (tipo === 'error') {
        notificacion.style.background = '#f44336';
    }
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 2500);
}

// Escapar HTML para evitar XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Agregar animación de salida
const styleAnim = document.createElement('style');
styleAnim.textContent = `
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
`;
document.head.appendChild(styleAnim);