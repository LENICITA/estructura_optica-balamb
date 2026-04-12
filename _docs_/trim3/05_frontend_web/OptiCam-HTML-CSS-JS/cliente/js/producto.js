// ========== PRODUCTO.JS - FUNCIONALIDADES ESPECÍFICAS ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página de producto inicializada');
    
    // ========== 1. ESTRELLAS INTERACTIVAS PARA RESEÑAS ==========
    const estrellas = document.querySelectorAll('.estrella');
    const calificacionInput = document.getElementById('calificacion');
    
    if (estrellas.length > 0 && calificacionInput) {
        estrellas.forEach(estrella => {
            estrella.addEventListener('click', function() {
                const valor = parseInt(this.dataset.valor);
                calificacionInput.value = valor;
                
                // Actualizar estrellas visualmente
                estrellas.forEach((est, index) => {
                    if (index < valor) {
                        est.textContent = '★';
                        est.classList.add('seleccionada');
                    } else {
                        est.textContent = '☆';
                        est.classList.remove('seleccionada');
                    }
                });
            });
        });
    }
    
    // ========== 2. ENVÍO DE FORMULARIO DE RESEÑA ==========
    const formReseña = document.getElementById('formReseña');
    const mensajeExito = document.getElementById('mensajeExito');
    
    if (formReseña) {
        formReseña.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const calificacion = document.getElementById('calificacion').value;
            const opinion = document.getElementById('opinion').value;
            
            if (calificacion === '0') {
                alert('⚠️ Por favor, selecciona una calificación');
                return;
            }
            
            if (!opinion.trim()) {
                alert('⚠️ Por favor, escribe tu opinión');
                return;
            }
            
            // Mostrar mensaje de éxito
            if (mensajeExito) {
                mensajeExito.style.display = 'block';
            }
            
            // Limpiar formulario
            formReseña.reset();
            document.getElementById('calificacion').value = '0';
            
            // Resetear estrellas
            const todasEstrellas = document.querySelectorAll('.estrella');
            todasEstrellas.forEach(est => {
                est.textContent = '☆';
                est.classList.remove('seleccionada');
            });
            
            // Ocultar mensaje después de 3 segundos
            setTimeout(() => {
                if (mensajeExito) {
                    mensajeExito.style.display = 'none';
                }
            }, 3000);
            
            console.log('✅ Reseña enviada:', { calificacion, opinion });
        });
    }
    
    // ========== 3. BOTÓN AÑADIR AL CARRITO ==========
    const btnCarrito = document.getElementById('btn-anadir-carrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', function() {
            const color = document.getElementById('color-select')?.value || 'No seleccionado';
            const material = document.getElementById('material-select')?.value || 'No seleccionado';
            const nombreProducto = document.querySelector('.descripcion_producto h1')?.textContent || 'Producto';
            const precioProducto = document.querySelector('.precio-destacado')?.textContent || '$250.000';
            
            // Mostrar notificación de éxito
            mostrarNotificacion(`🕶️ ${nombreProducto} añadido al carrito\nColor: ${color}\nMaterial: ${material}`, 'exito');
            
            console.log('Producto añadido:', { nombreProducto, precioProducto, color, material });
        });
    }
    
    // ========== 4. BOTÓN VER TODAS LAS RESEÑAS ==========
    const btnVerReseñas = document.getElementById('btn-ver-todas-reseñas');
    if (btnVerReseñas) {
        btnVerReseñas.addEventListener('click', function() {
            // Scroll a la sección de reseñas
            const reseñasSection = document.querySelector('.reseñas');
            if (reseñasSection) {
                reseñasSection.scrollIntoView({ behavior: 'smooth' });
            }
            mostrarNotificacion('📖 Próximamente: Todas las reseñas de nuestros clientes', 'info');
        });
    }
    
    // ========== 5. FUNCIÓN PARA MOSTRAR NOTIFICACIONES ==========
    function mostrarNotificacion(mensaje, tipo) {
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: ${tipo === 'exito' ? '#4CAF50' : tipo === 'info' ? '#2196F3' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        notificacion.innerHTML = mensaje.replace(/\n/g, '<br>');
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }
    
    // ========== 6. BOTÓN PRUEBA DE MONTURA - REDIRECCIÓN CORREGIDA ==========
    const btnPrueba = document.getElementById('btn-prueba-montura');
    if (btnPrueba) {
        console.log('✅ Botón de prueba de montura encontrado');
        
        btnPrueba.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Mostrar notificación de carga
            mostrarNotificacion('🔄 Redirigiendo a prueba de montura...', 'info');
            
            // Obtener información del producto actual
            const nombreProducto = document.querySelector('.descripcion_producto h1')?.textContent || 'Producto';
            const productId = obtenerIdProductoDesdeURL();
            
            console.log('🔍 Redirigiendo a prueba de montura');
            console.log('Producto:', nombreProducto);
            console.log('ID del producto:', productId);
            
            // ====== CAMBIA ESTA RUTA SEGÚN TU ESTRUCTURA ======
            // Opción 1: Si prueba-montura.html está en la misma carpeta que producto.html
            window.location.href = `/cliente/pruebamonturas.html`;
            
            // Opción 2: Si está en la carpeta /cliente/ (descomenta y comenta la opción 1)
            // window.location.href = '/cliente/prueba-montura.html';
            
            // Opción 3: Si está en la raíz del proyecto
            // window.location.href = '/prueba-montura.html';
            
            // Opción 4: Pasar el ID del producto a la página de prueba
            // window.location.href = `prueba-montura.html?id=${productId}&nombre=${encodeURIComponent(nombreProducto)}`;
        });
    } else {
        console.error('❌ ERROR: Botón con id "btn-prueba-montura" NO encontrado');
        console.log('💡 Verifica que el elemento exista en el HTML con ese ID exacto');
    }
    
    // ========== 7. FUNCIÓN AUXILIAR PARA OBTENER ID DE PRODUCTO ==========
    function obtenerIdProductoDesdeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        console.log('📦 Producto ID desde URL:', id);
        return id;
    }
    
    // ========== 8. AGREGAR ANIMACIONES CSS ==========
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
    `;
    document.head.appendChild(style);
});