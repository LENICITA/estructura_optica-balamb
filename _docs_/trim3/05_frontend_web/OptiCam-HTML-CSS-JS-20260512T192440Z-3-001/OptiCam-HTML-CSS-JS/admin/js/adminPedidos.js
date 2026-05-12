let pedidoActual = null;
let pedidoDetalleActual = null;

// MODAL ASIGNAR
function abrirModal(id) {
    pedidoActual = id;
    document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modal").style.display = "none";
}

function asignar() {
    const select = document.getElementById("repartidorSelect");
    const repartidorNombre = select.options[select.selectedIndex].text;

    if (select.value === "") {
        alert("Selecciona un repartidor");
        return;
    }

    const estado = document.getElementById("estado-" + pedidoActual);
    estado.textContent = "En camino";

    estado.classList.remove("pendiente", "listo");
    estado.classList.add("en-camino");

    const rep = document.getElementById("repartidor-" + pedidoActual);
    rep.textContent = repartidorNombre;

    cerrarModal();
}

// DATOS SIMULADOS
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
    }
};

// MODAL DETALLES
function verDetalles(id) {

    pedidoDetalleActual = id;

    const pedido = pedidos[id];

    document.getElementById("detalle-id").textContent = "#" + id;
    document.getElementById("detalle-cliente").textContent = pedido.cliente;
    document.getElementById("detalle-direccion").textContent = pedido.direccion;
    document.getElementById("detalle-total").textContent = pedido.total;

    const contenedor = document.getElementById("lista-productos");
    contenedor.innerHTML = "";

    pedido.productos.forEach(p => {
        contenedor.innerHTML += `
            <div class="producto-item">
                <span class="producto-nombre">${p.nombre}</span>
                <span class="producto-cantidad">x${p.cantidad}</span>
            </div>
        `;
    });

    document.getElementById("modalDetalles").style.display = "flex";
}

function cerrarDetalles() {
    document.getElementById("modalDetalles").style.display = "none";
}

// MARCAR COMO LISTO
function marcarListo() {

    if (!pedidoDetalleActual) return;

    const estado = document.getElementById("estado-" + pedidoDetalleActual);

    estado.textContent = "Listo";
    estado.classList.remove("pendiente", "en-camino");
    estado.classList.add("listo");

    cerrarDetalles();
}