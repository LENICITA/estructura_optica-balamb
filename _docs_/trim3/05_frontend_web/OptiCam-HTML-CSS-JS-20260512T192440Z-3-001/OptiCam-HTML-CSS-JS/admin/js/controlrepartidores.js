// ========== CONTROL DE REPARTIDORES ==========

// Datos de ejemplo
let repartidores = [
    { id: 1, nombre: "Juan Pérez", estado: "Activo", pedidos: 15 },
    { id: 2, nombre: "Ana López", estado: "Inactivo", pedidos: 8 },
    { id: 3, nombre: "Carlos Mendoza", estado: "Activo", pedidos: 22 },
    { id: 4, nombre: "María García", estado: "Suspendido", pedidos: 5 },
    { id: 5, nombre: "Luis Rodríguez", estado: "Activo", pedidos: 18 }
];

let repartidorSeleccionado = null;

// Renderizar tabla
function renderizarTabla() {
    const tbody = document.getElementById("tablaBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    repartidores.forEach(repartidor => {
        const row = tbody.insertRow();
        row.setAttribute("data-id", repartidor.id);
        
        const cellNombre = row.insertCell(0);
        cellNombre.textContent = repartidor.nombre;
        
        const cellEstado = row.insertCell(1);
        const spanEstado = document.createElement("span");
        spanEstado.className = `estado ${repartidor.estado.toLowerCase()}`;
        spanEstado.textContent = repartidor.estado;
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
    document.getElementById("detallePedidos").textContent = repartidor.pedidos;
    
    const spanEstado = document.getElementById("detalleEstado");
    spanEstado.textContent = repartidor.estado;
    spanEstado.className = `estado ${repartidor.estado.toLowerCase()}`;
    
    document.getElementById("estadoSelect").value = repartidor.estado;
    
    const filas = document.querySelectorAll("#tablaBody tr");
    filas.forEach(fila => {
        fila.classList.remove("seleccionado");
    });
    
    const filaSeleccionada = document.querySelector(`#tablaBody tr[data-id="${id}"]`);
    if (filaSeleccionada) {
        filaSeleccionada.classList.add("seleccionado");
    }
}

// Cambiar estado - FUNCIÓN CORREGIDA
function cambiarEstadoRepartidor() {
    // Verificar que haya un repartidor seleccionado
    if (!repartidorSeleccionado) {
        alert("❌ Primero selecciona un repartidor de la lista");
        return;
    }
    
    const nuevoEstado = document.getElementById("estadoSelect").value;
    const estadoAnterior = repartidorSeleccionado.estado;
    
    // Verificar si el estado es diferente
    if (nuevoEstado === estadoAnterior) {
        alert(`⚠️ El repartidor ya está en estado "${nuevoEstado}"`);
        return;
    }
    
    // Confirmar el cambio
    const confirmar = confirm(`¿Estás seguro de cambiar el estado de "${repartidorSeleccionado.nombre}" de ${estadoAnterior} a ${nuevoEstado}?`);
    
    if (confirmar) {
        // Actualizar el estado del repartidor seleccionado
        repartidorSeleccionado.estado = nuevoEstado;
        
        // También actualizar en el array original
        const index = repartidores.findIndex(r => r.id === repartidorSeleccionado.id);
        if (index !== -1) {
            repartidores[index].estado = nuevoEstado;
        }
        
        // Actualizar el panel de detalles
        const spanEstado = document.getElementById("detalleEstado");
        spanEstado.textContent = nuevoEstado;
        spanEstado.className = `estado ${nuevoEstado.toLowerCase()}`;
        
        // Actualizar el select
        document.getElementById("estadoSelect").value = nuevoEstado;
        
        // RECARGAR LA TABLA para mostrar el nuevo estado
        renderizarTabla();
        
        // Volver a seleccionar el mismo repartidor para mantenerlo seleccionado
        seleccionarRepartidor(repartidorSeleccionado.id);
        
        // Mensaje de éxito
        alert(`✅ Estado actualizado correctamente a "${nuevoEstado}" para ${repartidorSeleccionado.nombre}`);
    }
}

// ========== INICIALIZACIÓN ==========
// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function() {
    console.log("Página cargada - Inicializando control de repartidores");
    
    // Renderizar la tabla
    renderizarTabla();
    
    // Seleccionar el primer repartidor por defecto
    if (repartidores.length > 0) {
        seleccionarRepartidor(repartidores[0].id);
    }
    
    // ASIGNAR EL EVENTO AL BOTÓN GUARDAR
    const btnGuardar = document.getElementById("btnGuardarEstado");
    
    if (btnGuardar) {
        console.log("Botón guardar encontrado");
        // Remover eventos anteriores para evitar duplicados
        btnGuardar.removeEventListener("click", cambiarEstadoRepartidor);
        // Agregar el evento
        btnGuardar.addEventListener("click", cambiarEstadoRepartidor);
    } else {
        console.error("No se encontró el botón con id 'btnGuardarEstado'");
    }
});