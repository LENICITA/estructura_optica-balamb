// ========== PRODUCTO DINÁMICO - CON CARRITO ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Cargando producto dinámico...');

    // Base de datos de productos
    const productos = [
        { id: 1, nombre: "Ángel Gold", precio: 250000, material: "Plastico", imagen: "/img/Opera Captura de pantalla_2026-04-09_213050_www.figma.com.png", vendidos: 150, nuevo: true, descripcion: "Gafas elegantes con montura clásica.", colores: ["Rojo", "Negro", "Azul"], materiales: ["Plástico", "Metal"] },
        { id: 2, nombre: "Sky Blue", precio: 180000, material: "Metal", imagen: "/img/Opera Captura de pantalla_2026-04-09_213113_www.figma.com.png", vendidos: 89, nuevo: false, descripcion: "Gafas modernas color azul cielo.", colores: ["Azul", "Negro"], materiales: ["Metal", "Titanio"] },
        { id: 3, nombre: "Titanium Pro", precio: 350000, material: "Titanio", imagen: "/img/Opera Captura de pantalla_2026-04-09_213126_www.figma.com.png", vendidos: 45, nuevo: true, descripcion: "Gafas ultraligeras de titanio.", colores: ["Negro", "Plateado"], materiales: ["Titanio"] },
        { id: 4, nombre: "Gafas Ámbar", precio: 250000, material: "Plastico", imagen: "/img/Gafas ámbar sobre fondo rojo.png", vendidos: 200, nuevo: true, descripcion: "Gafas con lentes ámbar que protegen de la luz azul.", colores: ["Rojo", "Verde", "Azul", "Negro", "Blanco"], materiales: ["Metal", "Plástico", "Acetato"] }
    ];

    // Obtener ID de la URL
    function getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        return id ? parseInt(id) : 1;
    }

    // Cargar producto en la página
    function loadProduct() {
        const productId = getProductIdFromURL();
        const product = productos.find(p => p.id === productId);
        
        if (!product) {
            console.error('Producto no encontrado');
            document.getElementById('producto-nombre').textContent = 'Producto no encontrado';
            return;
        }

        console.log('Cargando producto:', product.nombre);
        document.title = `Óptica Balamb - ${product.nombre}`;

        // Actualizar imagen
        const imagenElement = document.getElementById('producto-imagen');
        if (imagenElement) {
            imagenElement.src = product.imagen;
            imagenElement.alt = product.nombre;
        }

        // Actualizar nombre
        const nombreElement = document.getElementById('producto-nombre');
        if (nombreElement) nombreElement.textContent = product.nombre;

        // Actualizar precio
        const precioElement = document.getElementById('producto-precio');
        if (precioElement) {
            precioElement.textContent = `$${product.precio.toLocaleString('es-CO')}`;
        }

        // Actualizar descripción
        const descripcionElement = document.getElementById('producto-descripcion');
        if (descripcionElement) descripcionElement.textContent = product.descripcion;

        // Actualizar dropdown de colores
        const colorSelect = document.getElementById('color-select');
        if (colorSelect && product.colores) {
            colorSelect.innerHTML = product.colores.map(color => 
                `<option value="${color.toLowerCase()}">${color}</option>`
            ).join('');
        }

        // Actualizar dropdown de materiales
        const materialSelect = document.getElementById('material-select');
        if (materialSelect && product.materiales) {
            materialSelect.innerHTML = product.materiales.map(material => 
                `<option value="${material.toLowerCase()}">${material}</option>`
            ).join('');
        }

        // Guardar producto actual
        window.currentProduct = product;
    }

    // ========== FUNCIÓN PARA AGREGAR AL CARRITO ==========
    function agregarAlCarritoDesdeProducto() {
        if (!window.currentProduct) {
            console.error('No hay producto cargado');
            return;
        }

        const colorSelect = document.getElementById('color-select');
        const materialSelect = document.getElementById('material-select');
        
        const color = colorSelect?.options[colorSelect.selectedIndex]?.text || 'No seleccionado';
        const material = materialSelect?.options[materialSelect.selectedIndex]?.text || 'No seleccionado';

        // Obtener carrito actual
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Buscar si el producto ya existe (mismo nombre, color y material)
        const existeIndex = carrito.findIndex(item => 
            item.nombre === window.currentProduct.nombre && 
            item.color === color && 
            item.material === material
        );

        if (existeIndex !== -1) {
            // Si existe, aumentar cantidad
            carrito[existeIndex].cantidad = (carrito[existeIndex].cantidad || 1) + 1;
        } else {
            // Si no existe, agregar nuevo
            carrito.push({
                id: window.currentProduct.id,
                nombre: window.currentProduct.nombre,
                precio: window.currentProduct.precio,
                imagen: window.currentProduct.imagen,
                color: color,
                material: material,
                cantidad: 1,
                seleccionado: true,
                fecha: new Date().toISOString()
            });
        }

        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Mostrar notificación
        mostrarNotificacion(`✅ ${window.currentProduct.nombre} añadido al carrito`, 'exito');
        
        // Actualizar contador del carrito si existe la función
        if (typeof actualizarContadorCarrito === 'function') {
            actualizarContadorCarrito();
        }
        
        console.log('Carrito actualizado:', carrito);
    }

    // Notificación flotante
    function mostrarNotificacion(mensaje, tipo) {
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: ${tipo === 'exito' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notificacion.remove(), 300);
        }, 3000);
    }

    // ========== EVENTOS ==========
    
    // Botón añadir al carrito
    const btnCarrito = document.getElementById('btn-anadir-carrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', agregarAlCarritoDesdeProducto);
    }

    // Botón prueba de montura
    const btnPrueba = document.getElementById('btn-prueba-montura');
    if (btnPrueba) {
        btnPrueba.addEventListener('click', function() {
            if (window.currentProduct) {
                window.location.href = `prueba-montura.html?id=${window.currentProduct.id}`;
            }
        });
    }

    // Estrellas para reseñas
    function setupStars() {
        const estrellas = document.querySelectorAll('.estrella');
        const calificacionInput = document.getElementById('calificacion');
        
        if (estrellas.length && calificacionInput) {
            estrellas.forEach(estrella => {
                estrella.addEventListener('click', function() {
                    const valor = parseInt(this.dataset.valor);
                    calificacionInput.value = valor;
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
    }

    // Envío de reseña
    function setupReviewForm() {
        const form = document.getElementById('formReseña');
        const mensajeExito = document.getElementById('mensajeExito');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const calificacion = document.getElementById('calificacion').value;
                const opinion = document.getElementById('opinion').value;
                
                if (calificacion === '0') {
                    alert('⭐ Por favor, selecciona una calificación');
                    return;
                }
                if (!opinion.trim()) {
                    alert('📝 Por favor, escribe tu opinión');
                    return;
                }
                
                if (mensajeExito) mensajeExito.style.display = 'block';
                form.reset();
                document.getElementById('calificacion').value = '0';
                document.querySelectorAll('.estrella').forEach(est => {
                    est.textContent = '☆';
                    est.classList.remove('seleccionada');
                });
                setTimeout(() => {
                    if (mensajeExito) mensajeExito.style.display = 'none';
                }, 3000);
                
                console.log('Reseña enviada:', { calificacion, opinion, producto: window.currentProduct?.nombre });
            });
        }
    }

    // Inicializar
    loadProduct();
    setupStars();
    setupReviewForm();
});

// Animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);