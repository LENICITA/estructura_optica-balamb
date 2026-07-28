// ========== PRODUCTO DINÁMICO - ÓPTICA BALAMB ==========
// VERSIÓN CORREGIDA Y COMPATIBLE CON SISTEMA GLOBAL

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Producto dinámico - Inicializado');

    // Base de datos de productos (ampliada y consistente)
    const productos = [
        { 
            id: 1, 
            nombre: "Ángel Gold", 
            precio: 250000, 
            material: "Plastico", 
            imagen: "/img/producto1.png", 
            vendidos: 150, 
            nuevo: true, 
            descripcion: "Gafas elegantes con montura clásica en acabado dorado. Ideal para ocasiones especiales y uso diario.",
            colores: ["Dorado", "Negro", "Plateado"],
            materiales: ["Plástico", "Metal"],
            especificaciones: {
                peso: "25g",
                ancho: "140mm",
                incluye: "Estuche, paño de limpieza"
            }
        },
        { 
            id: 2, 
            nombre: "Sky Blue", 
            precio: 180000, 
            material: "Metal", 
            imagen: "/img/producto2.png", 
            vendidos: 89, 
            nuevo: false, 
            descripcion: "Gafas modernas color azul cielo. Diseño fresco y juvenil con protección UV400.",
            colores: ["Azul", "Negro", "Blanco"],
            materiales: ["Metal", "Plástico"],
            especificaciones: {
                peso: "28g",
                ancho: "138mm",
                incluye: "Estuche, paño"
            }
        },
        { 
            id: 3, 
            nombre: "Titanium Pro", 
            precio: 350000, 
            material: "Titanio", 
            imagen: "/img/producto3.png", 
            vendidos: 45, 
            nuevo: true, 
            descripcion: "Gafas ultraligeras de titanio. Máxima resistencia y comodidad para uso prolongado.",
            colores: ["Plateado", "Negro", "Oro rosa"],
            materiales: ["Titanio"],
            especificaciones: {
                peso: "18g",
                ancho: "142mm",
                incluye: "Estuche rígido, paño, tornillos de repuesto"
            }
        },
        { 
            id: 4, 
            nombre: "Gafas Ámbar", 
            precio: 250000, 
            material: "Plastico", 
            imagen: "/img/producto4.png", 
            vendidos: 200, 
            nuevo: true, 
            descripcion: "Gafas con lentes ámbar que protegen de la luz azul. Perfectas para usar frente a pantallas.",
            colores: ["Ámbar", "Negro", "Marrón", "Verde"],
            materiales: ["Plástico", "Acetato", "Metal"],
            especificaciones: {
                peso: "22g",
                ancho: "140mm",
                incluye: "Estuche, paño, filtro de luz azul"
            }
        }
    ];
    
    // Sincronizar con localStorage para mantener consistencia
    localStorage.setItem('productos_db', JSON.stringify(productos));
    
    // Variables del producto actual
    let currentProduct = null;
    
    // ========== 1. OBTENER ID DE LA URL ==========
    function getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        console.log('📦 ID desde URL:', id);
        return id ? parseInt(id) : 1;
    }

    // ========== 2. CARGAR PRODUCTO EN LA PÁGINA ==========
    function loadProduct() {
        const productId = getProductIdFromURL();
        currentProduct = productos.find(p => p.id === productId);
        
        if (!currentProduct) {
            console.error('❌ Producto no encontrado');
            document.getElementById('producto-nombre').textContent = 'Producto no encontrado';
            return;
        }

        console.log('✅ Cargando producto:', currentProduct.nombre);
        document.title = `Óptica Balamb - ${currentProduct.nombre}`;

        // Actualizar imagen principal
        const imagenElement = document.getElementById('producto-imagen');
        if (imagenElement) {
            imagenElement.src = currentProduct.imagen;
            imagenElement.alt = currentProduct.nombre;
        }

        // Actualizar nombre
        const nombreElement = document.getElementById('producto-nombre');
        if (nombreElement) nombreElement.textContent = currentProduct.nombre;

        // Actualizar precio
        const precioElement = document.getElementById('producto-precio');
        if (precioElement) {
            precioElement.textContent = `$${currentProduct.precio.toLocaleString('es-CO')}`;
        }

        // Actualizar descripción
        const descripcionElement = document.getElementById('producto-descripcion');
        if (descripcionElement) descripcionElement.textContent = currentProduct.descripcion;

        // Actualizar contador de vendidos
        const vendidosElement = document.getElementById('producto-vendidos');
        if (vendidosElement) {
            vendidosElement.textContent = `${currentProduct.vendidos} personas compraron este producto`;
        }

        // Actualizar dropdown de colores
        const colorSelect = document.getElementById('color-select');
        if (colorSelect && currentProduct.colores) {
            colorSelect.innerHTML = currentProduct.colores.map(color => 
                `<option value="${color.toLowerCase()}">${color}</option>`
            ).join('');
        }

        // Actualizar dropdown de materiales
        const materialSelect = document.getElementById('material-select');
        if (materialSelect && currentProduct.materiales) {
            materialSelect.innerHTML = currentProduct.materiales.map(material => 
                `<option value="${material.toLowerCase()}">${material}</option>`
            ).join('');
        }
        
        // Actualizar especificaciones si existe el contenedor
        const especificacionesContainer = document.getElementById('producto-especificaciones');
        if (especificacionesContainer && currentProduct.especificaciones) {
            especificacionesContainer.innerHTML = `
                <li><strong>Peso:</strong> ${currentProduct.especificaciones.peso}</li>
                <li><strong>Ancho:</strong> ${currentProduct.especificaciones.ancho}</li>
                <li><strong>Incluye:</strong> ${currentProduct.especificaciones.incluye}</li>
            `;
        }
        
        // Mostrar badge de nuevo si aplica
        const badgeContainer = document.querySelector('.producto-badge');
        if (badgeContainer && currentProduct.nuevo) {
            badgeContainer.innerHTML = '<span class="badge-nuevo-producto">✨ NUEVO</span>';
        }
        
        // Guardar referencia global
        window.currentProduct = currentProduct;
    }

    // ========== 3. AGREGAR AL CARRITO (MEJORADO) ==========
    function agregarAlCarritoDesdeProducto() {
        if (!currentProduct) {
            console.error('❌ No hay producto cargado');
            mostrarNotificacion('Error: Producto no disponible', 'error');
            return;
        }

        const colorSelect = document.getElementById('color-select');
        const materialSelect = document.getElementById('material-select');
        
        const color = colorSelect?.options[colorSelect.selectedIndex]?.text || 'Estándar';
        const material = materialSelect?.options[materialSelect.selectedIndex]?.text || currentProduct.material;

        // Validar que se haya seleccionado una opción
        if (colorSelect && colorSelect.value === '') {
            mostrarNotificacion('⚠️ Por favor selecciona un color', 'warning');
            return;
        }
        
        if (materialSelect && materialSelect.value === '') {
            mostrarNotificacion('⚠️ Por favor selecciona un material', 'warning');
            return;
        }

        // Crear objeto producto
        const productoParaCarrito = {
            id: currentProduct.id,
            nombre: currentProduct.nombre,
            precio: currentProduct.precio,
            imagen: currentProduct.imagen,
            color: color,
            material: material,
            cantidad: 1
        };

        // Usar función global si existe
        if (typeof agregarAlCarritoGlobal === 'function') {
            agregarAlCarritoGlobal(productoParaCarrito);
        } else {
            // Fallback si no existe función global
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            
            const existeIndex = carrito.findIndex(item => 
                item.id === currentProduct.id && 
                item.color === color && 
                item.material === material
            );

            if (existeIndex !== -1) {
                carrito[existeIndex].cantidad = (carrito[existeIndex].cantidad || 1) + 1;
                mostrarNotificacion(`📦 ${currentProduct.nombre} - Cantidad aumentada a ${carrito[existeIndex].cantidad}`, 'success');
            } else {
                carrito.push({
                    ...productoParaCarrito,
                    seleccionado: true,
                    fecha: new Date().toISOString()
                });
                mostrarNotificacion(`✅ ${currentProduct.nombre} añadido al carrito`, 'success');
            }

            localStorage.setItem('carrito', JSON.stringify(carrito));
            
            // Actualizar contador
            if (typeof actualizarContadorGlobal === 'function') {
                actualizarContadorGlobal();
            } else {
                // Actualizar contadores manualmente
                const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
                const contadores = document.querySelectorAll('.cart-count');
                contadores.forEach(contador => {
                    contador.textContent = totalItems;
                    contador.style.display = totalItems > 0 ? 'inline-flex' : 'none';
                });
            }
        }
        
        console.log('🛒 Producto agregado:', { nombre: currentProduct.nombre, color, material });
    }

    // ========== 4. NOTIFICACIÓN FLOTANTE (MEJORADA) ==========
    function mostrarNotificacion(mensaje, tipo = 'success') {
        // Usar función global si existe
        if (typeof mostrarNotificacionGlobal === 'function') {
            mostrarNotificacionGlobal(mensaje, tipo);
            return;
        }
        
        // Fallback local
        const notificacion = document.createElement('div');
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
            bottom: 100px;
            right: 20px;
            background: ${colores[tipo] || '#4CAF50'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        notificacion.innerHTML = `${iconos[tipo] || '📢'} ${mensaje}`;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }

    // ========== 5. PRUEBA DE MONTURA ==========
    function setupPruebaMontura() {
        const btnPrueba = document.getElementById('btn-prueba-montura');
        if (btnPrueba && currentProduct) {
            btnPrueba.addEventListener('click', function() {
                console.log('🔍 Iniciando prueba de montura para:', currentProduct.nombre);
                mostrarNotificacion('🔄 Cargando prueba de montura...', 'info');
                setTimeout(() => {
                    window.location.href = `prueba-montura.html?id=${currentProduct.id}`;
                }, 500);
            });
        }
    }

    // ========== 6. ESTRELLAS PARA RESEÑAS (MEJORADO) ==========
    function setupStars() {
        const estrellas = document.querySelectorAll('.estrella');
        const calificacionInput = document.getElementById('calificacion');
        
        if (estrellas.length && calificacionInput) {
            // Función para actualizar estrellas
            function actualizarEstrellas(valor) {
                estrellas.forEach((est, index) => {
                    if (index < valor) {
                        est.textContent = '★';
                        est.classList.add('seleccionada');
                        est.style.color = '#ffc107';
                    } else {
                        est.textContent = '☆';
                        est.classList.remove('seleccionada');
                        est.style.color = '#ddd';
                    }
                });
            }
            
            // Evento click
            estrellas.forEach(estrella => {
                estrella.addEventListener('click', function() {
                    const valor = parseInt(this.dataset.valor);
                    if (isNaN(valor)) return;
                    calificacionInput.value = valor;
                    actualizarEstrellas(valor);
                });
                
                // Hover effect
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
                    actualizarEstrellas(valorActual);
                });
            });
        }
    }

    // ========== 7. ENVÍO DE RESEÑA (MEJORADO) ==========
    function setupReviewForm() {
        const form = document.getElementById('formReseña');
        const mensajeExito = document.getElementById('mensajeExito');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const calificacion = document.getElementById('calificacion')?.value;
                const opinion = document.getElementById('opinion')?.value;
                const nombreUsuario = document.getElementById('nombre-usuario')?.value || 'Usuario anónimo';
                
                // Validaciones
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
                    productoId: currentProduct?.id,
                    productoNombre: currentProduct?.nombre,
                    calificacion: parseInt(calificacion),
                    opinion: opinion.trim(),
                    nombre: nombreUsuario,
                    fecha: new Date().toISOString()
                });
                localStorage.setItem('reseñas_producto', JSON.stringify(reseñas));
                
                // Mostrar éxito
                if (mensajeExito) {
                    mensajeExito.style.display = 'block';
                }
                mostrarNotificacion('✅ ¡Gracias por tu reseña!', 'success');
                
                // Limpiar formulario
                form.reset();
                const calificacionInput = document.getElementById('calificacion');
                if (calificacionInput) calificacionInput.value = '0';
                
                // Resetear estrellas
                const estrellas = document.querySelectorAll('.estrella');
                estrellas.forEach(est => {
                    est.textContent = '☆';
                    est.classList.remove('seleccionada');
                });
                
                // Ocultar mensaje después de 3 segundos
                setTimeout(() => {
                    if (mensajeExito) {
                        mensajeExito.style.display = 'none';
                    }
                }, 3000);
                
                console.log('✅ Reseña guardada:', { calificacion, opinion, producto: currentProduct?.nombre });
            });
        }
    }

    // ========== 8. ACTUALIZAR CONTADOR DEL CARRITO ==========
    function actualizarContadorProducto() {
        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        const contadores = document.querySelectorAll('.cart-count');
        contadores.forEach(contador => {
            contador.textContent = totalItems;
            contador.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        });
    }

    // ========== 9. INICIALIZAR TODO ==========
    loadProduct();
    setupStars();
    setupReviewForm();
    setupPruebaMontura();
    actualizarContadorProducto();
    
    // Agregar evento al botón del carrito
    const btnCarrito = document.getElementById('btn-anadir-carrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', agregarAlCarritoDesdeProducto);
    }
    
    // Escuchar cambios en el carrito desde otras pestañas
    window.addEventListener('storage', function(e) {
        if (e.key === 'carrito') {
            actualizarContadorProducto();
        }
    });
    
    console.log('✅ Producto.js inicializado correctamente');
});

// ========== ESTILOS ADICIONALES ==========
const styleProducto = document.createElement('style');
styleProducto.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .badge-nuevo-producto {
        background: #4CAF50;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        display: inline-block;
    }
    
    .estrella {
        cursor: pointer;
        transition: transform 0.2s, color 0.2s;
        font-size: 24px;
        display: inline-block;
    }
    
    .estrella:hover {
        transform: scale(1.1);
    }
    
    .estrella.seleccionada {
        color: #ffc107;
    }
    
    #producto-vendidos {
        font-size: 14px;
        color: #4CAF50;
        margin-top: 5px;
    }
    
    .producto-especificaciones {
        list-style: none;
        padding: 0;
    }
    
    .producto-especificaciones li {
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }
`;
document.head.appendChild(styleProducto);