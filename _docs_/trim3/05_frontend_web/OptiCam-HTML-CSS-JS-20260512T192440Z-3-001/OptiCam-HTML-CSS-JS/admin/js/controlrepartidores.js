// ========== CONTROL DE REPARTIDORES ==========
// Ahora lee los datos desde localStorage (donde se guardan al registrarlos)

let repartidores = [];
let repartidorSeleccionado = null;

// Función para cargar repartidores desde localStorage
function cargarRepartidoresDesdeLocalStorage() {
    const guardados = localStorage.getItem("repartidores");
    if (guardados) {
        repartidores = JSON.parse(guardados);
        // Agregar campo 'pedidos' si no existe (para compatibilidad)
        repartidores.forEach(r => {
            if (r.pedidos === undefined) {
                r.pedidos = 0;
            }
        });
    } else {
        // Si no hay datos, array vacío (sin datos de ejemplo)
        repartidores = [];
    }
    console.log("Repartidores cargados:", repartidores.length);
}

// Función para guardar cambios en localStorage
function guardarRepartidoresEnLocalStorage() {
    localStorage.setItem("repartidores", JSON.stringify(repartidores));
    console.log("Repartidores guardados en localStorage");
}

// Renderizar tabla
function renderizarTabla() {
    const tbody = document.getElementById("tablaBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    if (repartidores.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 2;
        cell.textContent = "No hay repartidores registrados";
        cell.style.textAlign = "center";
        cell.style.padding = "20px";
        return;
    }
    
    repartidores.forEach(repartidor => {
        const row = tbody.insertRow();
        row.setAttribute("data-id", repartidor.id);
        
        const cellNombre = row.insertCell(0);
        cellNombre.textContent = repartidor.nombre;
        
        const cellEstado = row.insertCell(1);
        const spanEstado = document.createElement("span");
        const estadoLower = (repartidor.estado || "activo").toLowerCase();
        spanEstado.className = `estado ${estadoLower}`;
        // Mostrar estado con primera letra mayúscula
        const estadoMostrar = repartidor.estado || "Activo";
        spanEstado.textContent = estadoMostrar.charAt(0).toUpperCase() + estadoMostrar.slice(1).toLowerCase();
        cellEstado.appendChild(spanEstado);
        
        row.addEventListener("click", function() {
            seleccionarRepartidor(repartidor.id);
        });
        
        if (repartidorSeleccionado && repartidorSeleccionado.id === repartidor.id) {
            row.classList.add("seleccionado");
        }
    });
}

// Seleccionar repartidor
function seleccionarRepartidor(id) {
    const repartidor = repartidores.find(r => r.id === id);
    if (!repartidor) return;
    
    repartidorSeleccionado = repartidor;
    
    document.getElementById("detalleNombre").textContent = repartidor.nombre;
    document.getElementById("detallePedidos").textContent = repartidor.pedidos || 0;
    
    const spanEstado = document.getElementById("detalleEstado");
    const estadoMostrar = repartidor.estado || "Activo";
    spanEstado.textContent = estadoMostrar.charAt(0).toUpperCase() + estadoMostrar.slice(1).toLowerCase();
    spanEstado.className = `estado ${(repartidor.estado || "activo").toLowerCase()}`;
    
    // Valor del select (asegurar que coincida)
    const estadoSelectValue = (repartidor.estado || "Activo").charAt(0).toUpperCase() + (repartidor.estado || "Activo").slice(1).toLowerCase();
    document.getElementById("estadoSelect").value = estadoSelectValue;
    
    const filas = document.querySelectorAll("#tablaBody tr");
    filas.forEach(fila => {
        fila.classList.remove("seleccionado");
    });
    
    const filaSeleccionada = document.querySelector(`#tablaBody tr[data-id="${id}"]`);
    if (filaSeleccionada) {
        filaSeleccionada.classList.add("seleccionado");
    }
}

// Cambiar estado
function cambiarEstadoRepartidor() {
    if (!repartidorSeleccionado) {
        alert("❌ Primero selecciona un repartidor de la lista");
        return;
    }
    
    const nuevoEstado = document.getElementById("estadoSelect").value;
    const estadoAnterior = repartidorSeleccionado.estado || "Activo";
    const estadoAnteriorNormalizado = estadoAnterior.charAt(0).toUpperCase() + estadoAnterior.slice(1).toLowerCase();
    const nuevoEstadoNormalizado = nuevoEstado.charAt(0).toUpperCase() + nuevoEstado.slice(1).toLowerCase();
    
    if (nuevoEstadoNormalizado === estadoAnteriorNormalizado) {
        alert(`⚠️ El repartidor ya está en estado "${nuevoEstadoNormalizado}"`);
        return;
    }
    
    const confirmar = confirm(`¿Estás seguro de cambiar el estado de "${repartidorSeleccionado.nombre}" de ${estadoAnteriorNormalizado} a ${nuevoEstadoNormalizado}?`);
    
    if (confirmar) {
        // Actualizar el estado (guardar en minúsculas o como venga)
        repartidorSeleccionado.estado = nuevoEstadoNormalizado;
        
        // Actualizar en el array original
        const index = repartidores.findIndex(r => r.id === repartidorSeleccionado.id);
        if (index !== -1) {
            repartidores[index].estado = nuevoEstadoNormalizado;
        }
        
        // Guardar en localStorage
        guardarRepartidoresEnLocalStorage();
        
        // Actualizar el panel de detalles
        const spanEstado = document.getElementById("detalleEstado");
        spanEstado.textContent = nuevoEstadoNormalizado;
        spanEstado.className = `estado ${nuevoEstadoNormalizado.toLowerCase()}`;
        
        // RECARGAR LA TABLA
        renderizarTabla();
        
        // Volver a seleccionar el mismo repartidor
        seleccionarRepartidor(repartidorSeleccionado.id);
        
        alert(`✅ Estado actualizado correctamente a "${nuevoEstadoNormalizado}" para ${repartidorSeleccionado.nombre}`);
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", function() {
    console.log("Página cargada - Inicializando control de repartidores");
    
    // Cargar repartidores desde localStorage
    cargarRepartidoresDesdeLocalStorage();
    
    // Renderizar la tabla
    renderizarTabla();
    
    // Seleccionar el primer repartidor si hay alguno
    if (repartidores.length > 0) {
        seleccionarRepartidor(repartidores[0].id);
    } else {
        // Limpiar detalle si no hay repartidores
        document.getElementById("detalleNombre").textContent = "---";
        document.getElementById("detallePedidos").textContent = "0";
        document.getElementById("detalleEstado").textContent = "---";
    }
    
    // Asignar evento al botón guardar
    const btnGuardar = document.getElementById("btnGuardarEstado");
    if (btnGuardar) {
        btnGuardar.removeEventListener("click", cambiarEstadoRepartidor);
        btnGuardar.addEventListener("click", cambiarEstadoRepartidor);
        console.log("Evento del botón guardar asignado");
    } else {
        console.error("No se encontró el botón con id 'btnGuardarEstado'");
    }
});