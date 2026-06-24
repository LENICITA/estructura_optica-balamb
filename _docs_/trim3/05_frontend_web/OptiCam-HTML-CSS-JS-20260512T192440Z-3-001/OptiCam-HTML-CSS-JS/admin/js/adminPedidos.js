// ========== GESTIÓN DE PEDIDOS ==========
let pedidoActual = null;
let pedidoDetalleActual = null;

// Cargar repartidores desde localStorage
function cargarRepartidores() {
    const repartidoresGuardados = localStorage.getItem("repartidores");
    if (repartidoresGuardados) {
        return JSON.parse(repartidoresGuardados);
    }
    return [];
}

// Actualizar el select de repartidores en el modal
function actualizarSelectRepartidores() {
    const select = document.getElementById("repartidorSelect");
    if (!select) return;
    
    // Limpiar select (excepto primera opción)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    const repartidores = cargarRepartidores();
    
    if (repartidores.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "⚠️ No hay repartidores registrados";
        option.disabled = true;
        select.appendChild(option);
        return;
    }
    
    // Filtrar solo repartidores ACTIVOS
    const repartidoresActivos = repartidores.filter(r => 
        r.estado && r.estado.toLowerCase() === "activo"
    );
    
    if (repartidoresActivos.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "⚠️ No hay repartidores activos";
        option.disabled = true;
        select.appendChild(option);
        return;
    }
    
    // Agregar cada repartidor activo al select
    repartidoresActivos.forEach(repartidor => {
        const option = document.createElement("option");
        option.value = repartidor.id;
        option.textContent = repartidor.nombre;
        // Guardar datos adicionales como atributo
        option.setAttribute("data-telefono", repartidor.telefono || "");
        option.setAttribute("data-vehiculo", repartidor.vehiculo || "");
        select.appendChild(option);
    });
}

// MODAL ASIGNAR
function abrirModal(id) {
    pedidoActual = id;
    // Actualizar la lista de repartidores antes de abrir
    actualizarSelectRepartidores();
    document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}

function asignar() {
    const select = document.getElementById("repartidorSelect");
    const selectedOption = select.options[select.selectedIndex];
    const repartidorId = select.value;
    const repartidorNombre = selectedOption.textContent;
    
    // Validaciones
    if (!repartidorId) {
        // Verificar si el mensaje es de "no hay repartidores"
        if (selectedOption.textContent.includes("No hay repartidores")) {
            alert("❌ No hay repartidores registrados o activos. Registra un repartidor primero.");
        } else {
            alert("❌ Selecciona un repartidor válido");
        }
        return;
    }
    
    // Verificar que el repartidor exista y esté activo
    const repartidores = cargarRepartidores();
    const repartidorAsignado = repartidores.find(r => r.id == repartidorId);
    
    if (!repartidorAsignado) {
        alert("❌ El repartidor ya no existe en el sistema");
        cerrarModal();
        return;
    }
    
    if (repartidorAsignado.estado && repartidorAsignado.estado.toLowerCase() !== "activo") {
        alert(`❌ El repartidor "${repartidorAsignado.nombre}" no está activo. Su estado actual es: ${repartidorAsignado.estado}`);
        return;
    }
    
    // Actualizar estado del pedido
    const estadoSpan = document.getElementById("estado-" + pedidoActual);
    const repartidorCelda = document.getElementById("repartidor-" + pedidoActual);
    
    if (estadoSpan) {
        estadoSpan.textContent = "En camino";
        estadoSpan.classList.remove("pendiente", "listo");
        estadoSpan.classList.add("en-camino");
    }
    
    if (repartidorCelda) {
        repartidorCelda.textContent = repartidorNombre;
        // Guardar el ID del repartidor como dato adicional
        repartidorCelda.setAttribute("data-repartidor-id", repartidorId);
    }
    
    // Guardar la asignación en localStorage (para persistencia)
    guardarAsignacionPedido(pedidoActual, repartidorId, repartidorNombre);
    
    // Mostrar mensaje de éxito con info del repartidor
    alert(`✅ Pedido #${pedidoActual} asignado a:\n📦 Repartidor: ${repartidorNombre}\n🚗 Vehículo: ${repartidorAsignado.vehiculo || 'No especificado'}\n📞 Teléfono: ${repartidorAsignado.telefono || 'No disponible'}`);
    
    cerrarModal();
}

// Guardar asignaciones de pedidos en localStorage
function guardarAsignacionPedido(pedidoId, repartidorId, repartidorNombre) {
    let asignaciones = JSON.parse(localStorage.getItem("asignacionesPedidos")) || {};
    asignaciones[pedidoId] = {
        repartidorId: repartidorId,
        repartidorNombre: repartidorNombre,
        fechaAsignacion: new Date().toISOString(),
        estado: "en-camino"
    };
    localStorage.setItem("asignacionesPedidos", JSON.stringify(asignaciones));
}

// Cargar asignaciones previas al iniciar
function cargarAsignacionesPrevias() {
    const asignaciones = JSON.parse(localStorage.getItem("asignacionesPedidos")) || {};
    
    for (const [pedidoId, data] of Object.entries(asignaciones)) {
        const estadoSpan = document.getElementById("estado-" + pedidoId);
        const repartidorCelda = document.getElementById("repartidor-" + pedidoId);
        
        if (estadoSpan && data.estado === "en-camino") {
            estadoSpan.textContent = "En camino";
            estadoSpan.classList.remove("pendiente", "listo");
            estadoSpan.classList.add("en-camino");
        }
        
        if (repartidorCelda) {
            repartidorCelda.textContent = data.repartidorNombre;
            repartidorCelda.setAttribute("data-repartidor-id", data.repartidorId);
        }
    }
}

// DATOS DE PEDIDOS (puedes ampliarlos)
const pedidos = {
    1: {
        cliente: "Valentina",
        direccion: "Calle 123",
        total: 50000,
        productos: [
            { nombre: "Gafas negras", cantidad: 1 },
            { nombre: "Lentes formulados", cantidad: 2 }
        ]
    },
    2: {
        cliente: "Luisa",
        direccion: "Carrera 10",
        total: 30000,
        productos: [
            { nombre: "Gafas azules", cantidad: 1 }
        ]
    },
    3: {
        cliente: "Shariht",
        direccion: "Calle 123",
        total: 75000,
        productos: [
            { nombre: "Gafas de sol", cantidad: 1 },
            { nombre: "Estuche", cantidad: 1 }
        ]
    },
    4: {
        cliente: "Saida",
        direccion: "Calle 123",
        total: 45000,
        productos: [
            { nombre: "Lentes de lectura", cantidad: 2 }
        ]
    },
    5: {
        cliente: "Laura",
        direccion: "Calle 123",
        total: 89000,
        productos: [
            { nombre: "Gafas premium", cantidad: 1 },
            { nombre: "Limpia lentes", cantidad: 2 }
        ]
    },
    6: {
        cliente: "Juan",
        direccion: "Calle 123",
        total: 35000,
        productos: [
            { nombre: "Gafas infantiles", cantidad: 1 }
        ]
    }
};

// MODAL DETALLES
function verDetalles(id) {
    pedidoDetalleActual = id;
    const pedido = pedidos[id];
    
    if (!pedido) {
        alert("❌ Pedido no encontrado");
        return;
    }
    
    document.getElementById("detalle-id").textContent = "#" + id;
    document.getElementById("detalle-cliente").textContent = pedido.cliente;
    document.getElementById("detalle-direccion").textContent = pedido.direccion;
    document.getElementById("detalle-total").textContent = pedido.total;
    
    const contenedor = document.getElementById("lista-productos");
    contenedor.innerHTML = "";
    
    if (pedido.productos && pedido.productos.length > 0) {
        pedido.productos.forEach(p => {
            contenedor.innerHTML += `
                <div class="producto-item">
                    <span class="producto-nombre">${p.nombre}</span>
                    <span class="producto-cantidad">x${p.cantidad}</span>
                </div>
            `;
        });
    } else {
        contenedor.innerHTML = "<p>No hay productos registrados</p>";
    }
    
    document.getElementById("modalDetalles").style.display = "flex";
}

function cerrarDetalles() {
    document.getElementById("modalDetalles").style.display = "none";
}

// MARCAR COMO LISTO
function marcarListo() {
    if (!pedidoDetalleActual) return;
    
    const estado = document.getElementById("estado-" + pedidoDetalleActual);
    
    if (estado) {
        estado.textContent = "Listo";
        estado.classList.remove("pendiente", "en-camino");
        estado.classList.add("listo");
        
        // Actualizar en localStorage
        let asignaciones = JSON.parse(localStorage.getItem("asignacionesPedidos")) || {};
        if (asignaciones[pedidoDetalleActual]) {
            asignaciones[pedidoDetalleActual].estado = "listo";
            localStorage.setItem("asignacionesPedidos", JSON.stringify(asignaciones));
        }
    }
    
    cerrarDetalles();
    alert(`✅ Pedido #${pedidoDetalleActual} marcado como listo`);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", function() {
    console.log("Admin Pedidos - Inicializando");
    
    // Cargar asignaciones previas
    cargarAsignacionesPrevias();
    
    // Opcional: Mostrar estadísticas de repartidores en consola
    const repartidores = cargarRepartidores();
    const activos = repartidores.filter(r => r.estado && r.estado.toLowerCase() === "activo");
    console.log(`📊 Repartidores totales: ${repartidores.length}`);
    console.log(`✅ Repartidores activos: ${activos.length}`);
    console.log(`❌ Repartidores inactivos: ${repartidores.length - activos.length}`);
});