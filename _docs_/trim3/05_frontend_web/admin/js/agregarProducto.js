// ========== AGREGAR PRODUCTO - CONECTADO CON CATÁLOGO ==========

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 Página de agregar producto iniciada");

    // ========== 1. PREVISUALIZACIÓN DE IMAGEN ==========
    const inputImagen = document.getElementById("imagen");
    const preview = document.getElementById("preview");

    if (inputImagen && preview) {
        inputImagen.addEventListener("change", () => {
            preview.innerHTML = "";

            const file = inputImagen.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.style.width = "100px";
                    img.style.height = "100px";
                    img.style.objectFit = "cover";
                    img.style.borderRadius = "8px";
                    preview.appendChild(img);
                };

                reader.readAsDataURL(file);
            }
        });
    }

    // ========== 2. BOTÓN AGREGAR PRODUCTO ==========
    const botonAgregar = document.querySelector(".add-product");

    if (!botonAgregar) {
        console.error("❌ No se encontró el botón de agregar");
        return;
    }

    botonAgregar.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("🖱️ Click en agregar producto");

        // Obtener valores del formulario
        const nombre = document.getElementById("nombre")?.value.trim();
        const descripcion = document.getElementById("descripcion")?.value.trim();
        const categoria = document.getElementById("categoria")?.value;
        const marca = document.getElementById("marca")?.value.trim();
        const material = document.getElementById("material")?.value.trim();
        const color = document.getElementById("color")?.value.trim();
        const precio = document.getElementById("precio")?.value;
        const imagenFile = document.getElementById("imagen")?.files[0];

        // Validar campos obligatorios
        if (!nombre) {
            mostrarNotificacion("❌ Por favor, ingresa el nombre del producto", "error");
            return;
        }
        if (!descripcion) {
            mostrarNotificacion("❌ Por favor, ingresa una descripción", "error");
            return;
        }
        if (!categoria) {
            mostrarNotificacion("❌ Por favor, selecciona una categoría", "error");
            return;
        }
        if (!marca) {
            mostrarNotificacion("❌ Por favor, ingresa la marca", "error");
            return;
        }
        if (!material) {
            mostrarNotificacion("❌ Por favor, ingresa el material", "error");
            return;
        }
        if (!color) {
            mostrarNotificacion("❌ Por favor, ingresa el color", "error");
            return;
        }
        if (!precio || isNaN(precio) || precio <= 0) {
            mostrarNotificacion("❌ Por favor, ingresa un precio válido", "error");
            return;
        }

        // Función para guardar el producto (con o sin imagen)
        const guardarProductoFinal = (imagenUrl) => {
            // Obtener productos existentes
            let productos = JSON.parse(localStorage.getItem("productos")) || [];
            
            // Generar ID único (timestamp + número aleatorio)
            const nuevoId = Date.now();
            
            // Verificar si ya existe un producto con ese nombre (opcional)
            const productoExistente = productos.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
            if (productoExistente) {
                if (!confirm("⚠️ Ya existe un producto con este nombre. ¿Deseas agregarlo de todas formas?")) {
                    return;
                }
            }
            
            // Crear nuevo producto con todos los campos necesarios
            const nuevoProducto = {
                id: nuevoId,
                nombre: nombre,
                descripcion: descripcion,
                categoria: categoria,
                marca: marca,
                material: material,
                color: color,
                precio: parseInt(precio),
                imagen: imagenUrl || "/img/default-product.jpg",
                vendidos: 0,           // Inicialmente 0 vendidos
                nuevo: true,           // Marcar como nuevo producto
                fechaAgregado: new Date().toISOString()
            };
            
            // Agregar al array
            productos.push(nuevoProducto);
            
            // Guardar en localStorage (ambas claves para compatibilidad)
            localStorage.setItem("productos", JSON.stringify(productos));
            localStorage.setItem("productos_db", JSON.stringify(productos));
            
            console.log("✅ Producto guardado:", nuevoProducto);
            console.log("📦 Total de productos:", productos.length);
            
            // Mostrar notificación de éxito
            mostrarNotificacion(`✅ ¡${nombre} agregado exitosamente!`, "exito");
            
            // Redirigir al inventario después de 1.5 segundos
            setTimeout(() => {
                window.location.href = "inventario.html";
            }, 1500);
        };
        
        // Procesar imagen si existe
        if (imagenFile) {
            // Validar que sea una imagen
            if (!imagenFile.type.startsWith("image/")) {
                mostrarNotificacion("❌ El archivo debe ser una imagen", "error");
                return;
            }
            
            // Validar tamaño máximo (5MB)
            if (imagenFile.size > 5 * 1024 * 1024) {
                mostrarNotificacion("❌ La imagen no debe superar los 5MB", "error");
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                guardarProductoFinal(e.target.result);
            };
            
            reader.onerror = function() {
                mostrarNotificacion("❌ Error al leer la imagen", "error");
                guardarProductoFinal(""); // Guardar sin imagen
            };
            
            reader.readAsDataURL(imagenFile);
        } else {
            // Guardar sin imagen (usará la imagen por defecto)
            guardarProductoFinal("");
        }
    });
});

// ========== FUNCIÓN PARA MOSTRAR NOTIFICACIONES ==========
function mostrarNotificacion(mensaje, tipo) {
    // Eliminar notificaciones anteriores
    const notificacionesPrevias = document.querySelectorAll('.notificacion-agregar');
    notificacionesPrevias.forEach(notif => notif.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-agregar';
    
    // Colores según tipo
    const colores = {
        exito: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    
    const iconos = {
        exito: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notificacion.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${colores[tipo] || '#333'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        max-width: 350px;
        text-align: center;
    `;
    
    notificacion.innerHTML = `${iconos[tipo] || '📢'} ${mensaje}`;
    document.body.appendChild(notificacion);
    
    // Animación de salida
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// ========== AGREGAR ANIMACIONES CSS ==========
if (!document.querySelector('#animaciones-agregar')) {
    const style = document.createElement('style');
    style.id = 'animaciones-agregar';
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
}