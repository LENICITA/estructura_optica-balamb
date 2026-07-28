// ========== CHECKOUT.JS - COMPATIBLE CON PRODUCTO.JS ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('💳 Checkout inicializado');
    
    // ========== FUNCIONES PARA OBTENER CARRITO (COMPATIBLES CON TU SISTEMA) ==========
    
    // Obtener carrito - MISMA FUNCIÓN QUE USA TU PRODUCTO.JS
    function obtenerCarrito() {
        const carrito = localStorage.getItem('carrito');
        return carrito ? JSON.parse(carrito) : [];
    }
    
    // Obtener productos seleccionados para checkout
    function obtenerProductosCheckout() {
        // Primero intentar obtener los seleccionados del carrito (cuando se hace clic en "Proceder al pago")
        let productosSeleccionados = localStorage.getItem('carrito_compra');
        
        if (productosSeleccionados) {
            productosSeleccionados = JSON.parse(productosSeleccionados);
            console.log('✅ Productos seleccionados para compra:', productosSeleccionados);
            return productosSeleccionados;
        }
        
        // Si no hay seleccionados, obtener todo el carrito
        const carrito = obtenerCarrito();
        console.log('✅ Todo el carrito:', carrito);
        
        // Filtrar solo los productos que están seleccionados (si tienen la propiedad seleccionado)
        const productosActivos = carrito.filter(item => item.seleccionado !== false);
        console.log('✅ Productos activos en carrito:', productosActivos);
        
        return productosActivos;
    }
    
    // ========== MOSTRAR RESUMEN DEL PEDIDO ==========
    function mostrarResumen() {
        const carrito = obtenerProductosCheckout();
        console.log('📦 Carrito en mostrarResumen:', carrito);
        
        const itemsContainer = document.getElementById('order-items');
        const totalsContainer = document.getElementById('order-totals');
        
        if (!itemsContainer) {
            console.error('❌ No se encontró el contenedor order-items');
            return;
        }
        
        // Si no hay productos
        if (!carrito || carrito.length === 0) {
            console.warn('⚠️ El carrito está vacío');
            itemsContainer.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-cart-shopping" style="font-size: 48px; color: #ccc;"></i>
                    <p style="margin-top: 15px;">No hay productos en tu carrito</p>
                    <a href="catalogo.html" style="color: var(--color-primario); display: inline-block; margin-top: 15px; text-decoration: none;">
                        <i class="fa-solid fa-store"></i> Ir al catálogo
                    </a>
                </div>
            `;
            if (totalsContainer) {
                totalsContainer.innerHTML = `
                    <div class="summary-total">
                        <span>Total:</span>
                        <span>$0</span>
                    </div>
                `;
            }
            return;
        }
        
        // Mostrar productos - USANDO LAS MISMAS PROPIEDADES QUE GUARDA TU PRODUCTO.JS
        itemsContainer.innerHTML = carrito.map((item, index) => {
            // Obtener el precio correctamente (puede ser número o string con formato)
            let precio = item.precio;
            if (typeof precio === 'string') {
                precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
            }
            
            const cantidad = item.cantidad || 1;
            const totalItem = precio * cantidad;
            
            return `
                <div class="order-item" data-index="${index}">
                    <img src="${item.imagen || '/img/default-product.jpg'}" 
                         class="order-item-image" 
                         onerror="this.src='/img/default-product.jpg'">
                    <div class="order-item-info">
                        <h4>${item.nombre || 'Producto'}</h4>
                        <p>Cantidad: ${cantidad}</p>
                        <p>Color: ${item.color || '-'} / Material: ${item.material || '-'}</p>
                    </div>
                    <div class="order-item-price">
                        $${totalItem.toLocaleString('es-CO')}
                    </div>
                </div>
            `;
        }).join('');
        
        // Calcular totales
        const subtotal = carrito.reduce((sum, item) => {
            let precio = item.precio;
            if (typeof precio === 'string') {
                precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
            }
            return sum + (precio * (item.cantidad || 1));
        }, 0);
        
        const envio = subtotal > 200000 ? 0 : 15000;
        const total = subtotal + envio;
        
        console.log('💰 Totales calculados:', { subtotal, envio, total });
        
        if (totalsContainer) {
            totalsContainer.innerHTML = `
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div class="summary-row">
                    <span>Envío:</span>
                    <span>${envio === 0 ? 'GRATIS 🎉' : `$${envio.toLocaleString('es-CO')}`}</span>
                </div>
                <div class="summary-total">
                    <span>Total:</span>
                    <span>$${total.toLocaleString('es-CO')}</span>
                </div>
            `;
        }
        
        return { subtotal, envio, total, carrito };
    }
    
    // ========== CONFIGURAR MÉTODOS DE PAGO ==========
    function setupPaymentMethods() {
        const methods = document.querySelectorAll('.payment-method');
        const cardDetails = document.getElementById('card-details');
        const nequiDetails = document.getElementById('nequi-details');
        const pseDetails = document.getElementById('pse-details');
        
        if (!methods.length) return;
        
        methods.forEach(method => {
            method.addEventListener('click', function() {
                methods.forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                const radio = this.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                
                // Ocultar todos los detalles
                if (cardDetails) cardDetails.classList.remove('active');
                if (nequiDetails) nequiDetails.classList.remove('active');
                if (pseDetails) pseDetails.classList.remove('active');
                
                // Mostrar el detalle correspondiente
                const methodValue = radio?.value;
                if (methodValue === 'tarjeta' && cardDetails) {
                    cardDetails.classList.add('active');
                } else if (methodValue === 'nequi' && nequiDetails) {
                    nequiDetails.classList.add('active');
                } else if (methodValue === 'pse' && pseDetails) {
                    pseDetails.classList.add('active');
                }
            });
        });
        
        // Activar el primer método por defecto
        const firstMethod = methods[0];
        if (firstMethod) {
            firstMethod.click();
        }
    }
    
    // ========== VALIDAR FORMULARIO ==========
    function validarFormularioEnvio() {
        const nombre = document.getElementById('nombre')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const direccion = document.getElementById('direccion')?.value.trim();
        const ciudad = document.getElementById('ciudad')?.value.trim();
        const telefono = document.getElementById('telefono')?.value.trim();
        const cedula = document.getElementById('cedula')?.value.trim();
        
        const errores = [];
        
        if (!nombre) errores.push('Nombre completo');
        if (!email) errores.push('Correo electrónico');
        if (!direccion) errores.push('Dirección');
        if (!ciudad) errores.push('Ciudad');
        if (!telefono) errores.push('Teléfono');
        if (!cedula) errores.push('Cédula');
        
        if (errores.length > 0) {
            alert(`Por favor complete los siguientes campos:\n- ${errores.join('\n- ')}`);
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingrese un correo electrónico válido');
            return false;
        }
        
        const telefonoRegex = /^\d{7,}$/;
        if (!telefonoRegex.test(telefono.replace(/\s/g, ''))) {
            alert('Por favor ingrese un número de teléfono válido (mínimo 7 dígitos)');
            return false;
        }
        
        return true;
    }
    
    // ========== OBTENER MÉTODO DE PAGO ==========
    function obtenerMetodoPago() {
        const selected = document.querySelector('.payment-method.active input');
        return selected ? selected.value : null;
    }
    
    // ========== VALIDACIONES DE PAGO ==========
    function validarTarjeta(numero, expiracion, cvv) {
        const numLimpio = numero.replace(/\s/g, '');
        
        if (!/^\d{16}$/.test(numLimpio)) {
            alert('Número de tarjeta inválido (debe tener 16 dígitos)');
            return false;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
            alert('Formato de fecha inválido (use MM/AA)');
            return false;
        }
        
        const [mes, año] = expiracion.split('/');
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);
        const ahora = new Date();
        const añoActual = ahora.getFullYear() % 100;
        const mesActual = ahora.getMonth() + 1;
        
        if (mesNum < 1 || mesNum > 12) {
            alert('Mes inválido');
            return false;
        }
        
        if (añoNum < añoActual || (añoNum === añoActual && mesNum < mesActual)) {
            alert('La tarjeta está vencida');
            return false;
        }
        
        if (!/^\d{3}$/.test(cvv)) {
            alert('CVV inválido (debe tener 3 dígitos)');
            return false;
        }
        
        return true;
    }
    
    function validarNequi(telefonoNequi) {
        const telefonoLimpio = telefonoNequi.replace(/\s/g, '');
        if (!/^\d{10}$/.test(telefonoLimpio)) {
            alert('Número de Nequi inválido (debe tener 10 dígitos)');
            return false;
        }
        return true;
    }
    
    // ========== PROCESAR PAGO ==========
    async function procesarPago(event) {
        event.preventDefault();
        
        if (!validarFormularioEnvio()) return;
        
        const metodoPago = obtenerMetodoPago();
        if (!metodoPago) {
            alert('Por favor seleccione un método de pago');
            return;
        }
        
        // Validar según método
        if (metodoPago === 'tarjeta') {
            const numero = document.getElementById('card-number')?.value;
            const expiracion = document.getElementById('card-expiry')?.value;
            const cvv = document.getElementById('card-cvv')?.value;
            
            if (!numero || !expiracion || !cvv) {
                alert('Por favor complete los datos de la tarjeta');
                return;
            }
            
            if (!validarTarjeta(numero, expiracion, cvv)) return;
            
        } else if (metodoPago === 'nequi') {
            const telefonoNequi = document.getElementById('nequi-phone')?.value;
            if (!telefonoNequi) {
                alert('Por favor ingrese su número de Nequi');
                return;
            }
            if (!validarNequi(telefonoNequi)) return;
        }
        
        // Obtener datos del pedido
        const { subtotal, envio, total, carrito } = mostrarResumen();
        
        if (!carrito || carrito.length === 0) {
            alert('No hay productos en tu carrito');
            return;
        }
        
        const datosEnvio = {
            nombre: document.getElementById('nombre')?.value.trim(),
            email: document.getElementById('email')?.value.trim(),
            direccion: document.getElementById('direccion')?.value.trim(),
            ciudad: document.getElementById('ciudad')?.value.trim(),
            telefono: document.getElementById('telefono')?.value.trim(),
            cedula: document.getElementById('cedula')?.value.trim(),
            notas: document.getElementById('notas')?.value.trim() || ''
        };
        
        // Crear pedido
        const pedido = {
            id: 'ORD-' + Date.now(),
            fecha: new Date().toISOString(),
            cliente: datosEnvio,
            productos: carrito,
            metodoPago: metodoPago,
            subtotal: subtotal,
            envio: envio,
            total: total,
            estado: 'pendiente'
        };
        
        console.log('📋 Pedido creado:', pedido);
        
        // Guardar pedido
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        pedidos.push(pedido);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        
        // Limpiar carrito - IMPORTANTE: Eliminar solo los productos comprados
        const carritoActual = obtenerCarrito();
        const productosCompradosIds = carrito.map(p => `${p.nombre}-${p.color}-${p.material}`);
        
        const nuevoCarrito = carritoActual.filter(item => {
            const itemKey = `${item.nombre}-${item.color}-${item.material}`;
            return !productosCompradosIds.includes(itemKey);
        });
        
        localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
        
        // Limpiar carrito_compra
        localStorage.removeItem('carrito_compra');
        
        // Mostrar mensaje de éxito
        let mensaje = '';
        if (metodoPago === 'tarjeta') {
            mensaje = `✅ ¡Pago procesado exitosamente!\n\nNúmero de pedido: ${pedido.id}\nTotal: $${total.toLocaleString('es-CO')}\n\nRecibirás un correo de confirmación en ${datosEnvio.email}`;
        } else if (metodoPago === 'nequi') {
            mensaje = `📱 ¡Solicitud de pago enviada!\n\nNúmero de pedido: ${pedido.id}\nTotal a pagar: $${total.toLocaleString('es-CO')}\n\nTe enviaremos un mensaje a tu Nequi para completar el pago.`;
        } else if (metodoPago === 'pse') {
            mensaje = `🏦 Redirigiendo a PSE...\n\nNúmero de pedido: ${pedido.id}\nTotal: $${total.toLocaleString('es-CO')}\n\nSerás redirigido a tu banco para completar la transacción.`;
        }
        
        alert(mensaje);
        
        // Redirigir a confirmación
        window.location.href = `confirmacion.html?id=${pedido.id}`;
    }
    
    // ========== FORMATOS DE INPUTS ==========
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            if (value.length > 16) value = value.slice(0, 16);
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }
    
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    const cardCvvInput = document.getElementById('card-cvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
        });
    }
    
    // ========== VERIFICAR DATOS EN CONSOLA ==========
    console.log('=== 📊 VERIFICACIÓN DE DATOS ===');
    console.log('carrito_compra:', localStorage.getItem('carrito_compra'));
    console.log('carrito completo:', localStorage.getItem('carrito'));
    
    // ========== INICIALIZAR ==========
    mostrarResumen();
    setupPaymentMethods();
    
    // Configurar evento del formulario
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', procesarPago);
    }
});