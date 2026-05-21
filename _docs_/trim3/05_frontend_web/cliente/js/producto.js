// ========== PRODUCTO.JS - FUNCIONALIDADES ESPECÍFICAS ==========
// VERSIÓN CORREGIDA - COMPATIBLE CON SISTEMA GLOBAL

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página de producto inicializada');
    
    // Variable global para almacenar producto actual
    let productoActual = null;
    
    // ========== 1. BASE DE DATOS DE PRODUCTOS (FALLBACK) ==========
    const productosDB = [
        { id: 1, nombre: "Ángel Gold", precio: 250000, material: "Plastico", imagen: "/img/producto1.png", colores: ["Dorado", "Negro"], materiales: ["Plástico", "Metal"] },
        { id: 2, nombre: "Sky Blue", precio: 180000, material: "Metal", imagen: "/img/producto2.png", colores: ["Azul", "Negro"], materiales: ["Metal"] },
        { id: 3, nombre: "Titanium Pro", precio: 350000, material: "Titanio", imagen: "/img/producto3.png", colores: ["Plateado", "Negro"], materiales: ["Titanio"] },
        { id: 4, nombre: "Gafas Ámbar", precio: 250000, material: "Plastico", imagen: "/img/producto4.png", colores: ["Ámbar", "Negro", "Marrón"], materiales: ["Plástico", "Acetato"] }
    ];
    
    // ========== 1. CARGAR INFORMACIÓN DEL PRODUCTO ==========
    function cargarInformacionProducto() {
        const productId = obtenerIdProductoDesdeURL();
        console.log('🔍 Buscando producto con ID:', productId);
        
        // Intentar obtener producto de la base de datos global primero
        let productosGlobal = null;
        try {
            const productosStorage = localStorage.getItem('productos_db');
            if (productosStorage) {
                productosGlobal = JSON.parse(productosStorage);
            }
        } catch(e) {
            console.warn('Error al leer productos_db:', e);
        }
        
        // Buscar en productos globales o en DB local
        if (productosGlobal && productosGlobal.length > 0) {
            productoActual = productosGlobal.find(p => p.id == productId);
        }
        
        if (!productoActual) {
            productoActual = productosDB.find(p => p.id == productId);
        }
        
        if (productoActual) {
            console.log('✅ Producto cargado:', productoActual.nombre);
            actualizarUIProducto(productoActual);
            actualizarSelectores(productoActual);
        } else {
            console.warn('⚠️ Producto no encontrado, usando datos del DOM');
            // Usar información del DOM como fallback
            productoActual = {
                id: productId || 1,
                nombre: document.querySelector('.descripcion_producto h1')?.textContent || 'Producto',
                precio: extraerPrecioDelDOM(),
                imagen: document.querySelector('.producto-imagen-principal img')?.src || '/img/default-product.jpg',
                colores: [],
                materiales: []
            };
        }
        
        // Actualizar contador del carrito
        actualizarContadorCarrito();
    }
    
    // Extraer precio del DOM
    function extraerPrecioDelDOM() {
        const precioElement = document.querySelector('.precio-destacado');
        if (precioElement) {
            const precioTexto = precioElement.textContent;
            const precioNumero = parseInt(precioTexto.replace(/[^0-9]/g, ''));
            return isNaN(precioNumero) ? 250000 : precioNumero;
        }
        return 250000;
    }
    
    // Actualizar UI con datos del producto
    function actualizarUIProducto(producto) {
        const titulo = document.querySelector('.descripcion_producto h1');
        const precio = document.querySelector('.precio-destacado');
        const imagen = document.querySelector('.producto-imagen-principal img');
        const descripcion = document.querySelector('.producto-descripcion');
        
        if (titulo && producto.nombre) titulo.textContent = producto.nombre;
        if (precio && producto.precio) {
            precio.textContent = `$${producto.precio.toLocaleString('es-CO')}`;
        }
        if (imagen && producto.imagen) {
            imagen.src = producto.imagen;
            imagen.alt = producto.nombre;
        }
        
        // Actualizar título de la página
        document.title = `Óptica Balamb - ${producto.nombre}`;
    }
    
    // Actualizar selectores de color y material
    function actualizarSelectores(producto) {
        const colorSelect = document.getElementById('color-select');
        const materialSelect = document.getElementById('material-select');
        
        if (colorSelect && producto.colores && producto.colores.length > 0) {
            colorSelect.innerHTML = '<option value="">Seleccionar color</option>' + 
                producto.colores.map(color => `<option value="${color.toLowerCase()}">${color}</option>`).join('');
        }
        
        if (materialSelect && producto.materiales && producto.materiales.length > 0) {
            materialSelect.innerHTML = '<option value="">Seleccionar material</option>' + 
                producto.materiales.map(material => `<option value="${material.toLowerCase()}">${material}</option>`).join('');
        }
    }
    
    // ========== 2. ESTRELLAS INTERACTIVAS PARA RESEÑAS ==========
    const estrellas = document.querySelectorAll('.estrella');
    const calificacionInput = document.getElementById('calificacion');
    
    if (estrellas.length > 0 && calificacionInput) {
        function actualizarEstrellas(valor) {
            estrellas.forEach((est, index) => {
                if (index < valor) {
                    est.textContent = '★';
                    est.classList.add('seleccionada');
                } else {
                    est.textContent = '☆';
                    est.classList.remove('seleccionada');
                }
            });
        }
        
        estrellas.forEach(estrella => {
            estrella.addEventListener('click', function() {
                const valor = parseInt(this.dataset.valor);
                if (isNaN(valor)) return;
                calificacionInput.value = valor;
                actualizarEstrellas(valor);
            });
            
            estrella.addEventListener('mouseenter', function() {
                const valor = parseInt(this.dataset.valor);
                estrellas.forEach((est, index) => {
                    if (index < valor) {
                        est.style.color = '#ffc107';
                    }
                });
            });
            
            estrella.addEventListener('mouseleave', function() {
                const valorActual = parseInt(calificacionInput.value) || 0;
                estrellas.forEach((est, index) => {
                    if (index < valorActual) {
                        est.style.color = '#ffc107';
                    } else {
                        est.style.color = '#ddd';
                    }
                });
            });
        });
    }
    
    // ========== 3. ENVÍO DE FORMULARIO DE RESEÑA ==========
    const formReseña = document.getElementById('formReseña');
    const mensajeExito = document.getElementById('mensajeExito');
    
    if (formReseña) {
        formReseña.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const calificacion = document.getElementById('calificacion')?.value;
            const opinion = document.getElementById('opinion')?.value;
            const nombreUsuario = document.getElementById('nombre-usuario')?.value || 'Usuario anónimo';
            
            if (!calificacion || calificacion === '0') {
                mostrarNotificacion('⭐ Por favor, selecciona una calificación', 'warning');
                return;
            }
            
            if (!opinion || !opinion.trim()) {
                mostrarNotificacion('📝 Por favor, escribe tu opinión', 'warning');
                return;
            }
            
            if (opinion.trim().length < 10) {
                mostrarNotificacion('📝 Tu opinión debe tener al menos 10 caracteres', 'warning');
                return;
            }
            
            // Guardar reseña
            const reseñas = JSON.parse(localStorage.getItem('reseñas_producto') || '[]');
            reseñas.push({
                productoId: obtenerIdProductoDesdeURL() || 'general',
                productoNombre: productoActual?.nombre || 'Producto',
                calificacion: parseInt(calificacion),
                opinion: opinion.trim(),
                nombre: nombreUsuario,
                fecha: new Date().toISOString()
            });
            localStorage.setItem('reseñas_producto', JSON.stringify(reseñas));
            
            if (mensajeExito) mensajeExito.style.display = 'block';
            mostrarNotificacion('✅ ¡Gracias por tu reseña!', 'exito');
            
            formReseña.reset();
            if (calificacionInput) calificacionInput.value = '0';
            
            document.querySelectorAll('.estrella').forEach(est => {
                est.textContent = '☆';
                est.classList.remove('seleccionada');
            });
            
            setTimeout(() => {
                if (mensajeExito) mensajeExito.style.display = 'none';
            }, 3000);
        });
    }
    
    // ========== 4. BOTÓN AÑADIR AL CARRITO (MEJORADO) ==========
    const btnCarrito = document.getElementById('btn-anadir-carrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', function() {
            const colorSelect = document.getElementById('color-select');
            const materialSelect = document.getElementById('material-select');
            
            const color = colorSelect?.options[colorSelect.selectedIndex]?.text || 'Estándar';
            const material = materialSelect?.options[materialSelect.selectedIndex]?.text || productoActual?.material || 'Estándar';
            const nombreProducto = productoActual?.nombre || document.querySelector('.descripcion_producto h1')?.textContent || 'Producto';
            const precio = productoActual?.precio || extraerPrecioDelDOM();
            const imagenProducto = productoActual?.imagen || document.querySelector('.producto-imagen-principal img')?.src || '/img/default-product.jpg';
            
            // Validar selecciones
            if (colorSelect && colorSelect.value === '') {
                mostrarNotificacion('⚠️ Por favor selecciona un color', 'warning');
                return;
            }
            
            if (materialSelect && materialSelect.value === '') {
                mostrarNotificacion('⚠️ Por favor selecciona un material', 'warning');
                return;
            }
            
            // Usar función global si existe
            if (typeof agregarAlCarritoGlobal === 'function') {
                agregarAlCarritoGlobal({
                    id: productoActual?.id || Date.now(),
                    nombre: nombreProducto,
                    precio: precio,
                    imagen: imagenProducto,
                    color: color,
                    material: material
                });
            } else {
                // Fallback local
                let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                
                const existeIndex = carrito.findIndex(item => 
                    item.nombre === nombreProducto && 
                    item.color === color && 
                    item.material === material
                );
                
                if (existeIndex !== -1) {
                    carrito[existeIndex].cantidad = (carrito[existeIndex].cantidad || 1) + 1;
                    mostrarNotificacion(`📦 ${nombreProducto} - Cantidad: ${carrito[existeIndex].cantidad}`, 'exito');
                } else {
                    carrito.push({
                        id: productoActual?.id || Date.now(),
                        nombre: nombreProducto,
                        precio: precio,
                        imagen: imagenProducto,
                        color: color,
                        material: material,
                        cantidad: 1,
                        seleccionado: true,
                        fecha: new Date().toISOString()
                    });
                    mostrarNotificacion(`🕶️ ${nombreProducto} añadido al carrito`, 'exito');
                }
                
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarContadorCarrito();
            }
        });
    }
    
    // ========== 5. ACTUALIZAR CONTADOR DEL CARRITO ==========
    function actualizarContadorCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        
        const contadores = document.querySelectorAll('.cart-count, .carrito-contador, #cart-count');
        contadores.forEach(contador => {
            contador.textContent = totalItems;
            contador.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        });
    }
    
    // ========== 6. BOTÓN VER TODAS LAS RESEÑAS ==========
    const btnVerReseñas = document.getElementById('btn-ver-todas-reseñas');
    if (btnVerReseñas) {
        btnVerReseñas.addEventListener('click', function() {
            const reseñasSection = document.querySelector('.reseñas');
            if (reseñasSection) {
                reseñasSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            const reseñas = JSON.parse(localStorage.getItem('reseñas_producto')) || [];
            const reseñasProducto = reseñas.filter(r => r.productoId == obtenerIdProductoDesdeURL());
            
            if (reseñasProducto.length > 0) {
                mostrarNotificacion(`📖 Hay ${reseñasProducto.length} reseñas disponibles`, 'info');
                mostrarReseñasEnModal(reseñasProducto);
            } else {
                mostrarNotificacion('📖 Aún no hay reseñas. ¡Sé el primero en opinar!', 'info');
            }
        });
    }
    
    // Mostrar reseñas en modal
    function mostrarReseñasEnModal(reseñas) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 12px;
            z-index: 10001;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        `;
        
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3>⭐ Reseñas de clientes</h3>
                <button id="cerrar-modal-reseñas" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            ${reseñas.map(r => `
                <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                    <div style="color: #ffc107;">${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}</div>
                    <p style="margin: 5px 0;"><strong>${r.nombre}</strong> - <small>${new Date(r.fecha).toLocaleDateString()}</small></p>
                    <p>${r.opinion}</p>
                </div>
            `).join('')}
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('cerrar-modal-reseñas').onclick = () => modal.remove();
    }
    
    // ========== 7. NOTIFICACIONES ==========
    function mostrarNotificacion(mensaje, tipo) {
        // Usar función global si existe
        if (typeof mostrarNotificacionGlobal === 'function') {
            mostrarNotificacionGlobal(mensaje, tipo);
            return;
        }
        
        const notificacionesPrevias = document.querySelectorAll('.notificacion-flotante');
        notificacionesPrevias.forEach(notif => notif.remove());
        
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion-flotante';
        
        const colores = { exito: '#4CAF50', info: '#2196F3', warning: '#ff9800', error: '#f44336' };
        const iconos = { exito: '✅', info: 'ℹ️', warning: '⚠️', error: '❌' };
        
        notificacion.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: ${colores[tipo] || '#333'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        notificacion.innerHTML = `${iconos[tipo] || '📢'} ${mensaje}`;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }
    
    // ========== 8. BOTÓN PRUEBA DE MONTURA ==========
    const btnPrueba = document.getElementById('btn-prueba-montura');
    if (btnPrueba) {
        btnPrueba.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarNotificacion('🔄 Redirigiendo a prueba de montura...', 'info');
            
            const productId = obtenerIdProductoDesdeURL();
            
            setTimeout(() => {
                window.location.href = `prueba-montura.html?id=${productId || ''}`;
            }, 500);
        });
    }
    
    // ========== 9. OBTENER ID DE PRODUCTO ==========
    function obtenerIdProductoDesdeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    // ========== 10. AGREGAR ANIMACIONES CSS ==========
    if (!document.querySelector('#animaciones-producto')) {
        const style = document.createElement('style');
        style.id = 'animaciones-producto';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .estrella {
                cursor: pointer;
                transition: transform 0.2s, color 0.2s;
                font-size: 24px;
                color: #ddd;
                display: inline-block;
            }
            .estrella:hover { transform: scale(1.1); }
            .estrella.seleccionada { color: #ffc107; }
        `;
        document.head.appendChild(style);
    }
    
    // ========== 11. INICIALIZACIÓN ==========
    cargarInformacionProducto();
    
    // Escuchar cambios en el carrito
    window.addEventListener('storage', function(e) {
        if (e.key === 'carrito') {
            actualizarContadorCarrito();
        }
    });
    
    console.log('✅ Producto.js inicializado correctamente');
});