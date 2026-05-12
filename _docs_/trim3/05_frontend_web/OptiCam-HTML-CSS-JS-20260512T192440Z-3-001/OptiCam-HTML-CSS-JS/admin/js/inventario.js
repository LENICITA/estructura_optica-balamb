document.addEventListener("DOMContentLoaded", () => {

    //Filtro tabla
    const buscadorTable = document.getElementById('buscador-table');

    if (buscadorTable) {
        buscadorTable.addEventListener("keyup", function() {
            let filter = buscadorTable.value.toLowerCase();
            let rows = document.querySelectorAll("#tabla tbody tr");

            rows.forEach(row => {
                let texto = row.textContent.toLowerCase();
                row.style.display = texto.includes(filter) ? "" : "none";
            });
        });
    }

    cargarProductos();
});

//ACTUALIZAR CARDS
function actualizarCards(productos) {
    const totalProductos = document.getElementById("total-productos");
    const totalInventario = document.getElementById("total-inventario");

    if (!totalProductos || !totalInventario) return;

    totalProductos.textContent = productos.length;

    let suma = 0;
    productos.forEach(p => {
        suma += Number(p.precio);
    });

    totalInventario.textContent = "$" + suma.toLocaleString("es-CO");
}

//CARGAR PRODUCTOS
function cargarProductos() {
    const tabla = document.querySelector("#tabla tbody");
    tabla.innerHTML = "";

    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    productos.forEach((producto, index) => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td class="product">
                <img class="product-image" src="${producto.imagen || 'img/default.png'}">
                <span>${producto.nombre}</span>
            </td>
            <td>${producto.descripcion || ""}</td>
            <td>${producto.categoria}</td>
            <td>${producto.marca || ""}</td>
            <td>${producto.material || ""}</td>
            <td>${producto.color || ""}</td>
            <td>$${producto.precio}</td>
            <td>
                <i class="fa-solid fa-pen-to-square edit-btn" data-id="${index}"></i>
                <i class="fa-solid fa-trash-can delete-btn" data-id="${index}"></i>
            </td>
        `;

        tabla.appendChild(fila);
    });

    actualizarCards(productos);
}

//VARIABLE GLOBAL PARA EDITAR
let productoEditando = null;

//EVENTOS CLICK (EDITAR + ELIMINAR)
document.addEventListener("click", (e) => {

    let productos = JSON.parse(localStorage.getItem("productos")) || [];

    //ELIMINAR
    if (e.target.classList.contains("delete-btn")) {

        const id = e.target.getAttribute("data-id");

        productos.splice(id, 1);

        localStorage.setItem("productos", JSON.stringify(productos));

        cargarProductos();
    }

    //ABRIR MODAL EDITAR
    if (e.target.classList.contains("edit-btn")) {

        const id = e.target.getAttribute("data-id");

        const producto = productos[id];

        productoEditando = id;

        document.getElementById("edit-nombre").value = producto.nombre;
        document.getElementById("edit-descripcion").value = producto.descripcion || "";
        document.getElementById("edit-categoria").value = producto.categoria;
        document.getElementById("edit-marca").value = producto.marca || "";
        document.getElementById("edit-material").value = producto.material || "";
        document.getElementById("edit-color").value = producto.color || "";
        document.getElementById("edit-precio").value = producto.precio;

        document.getElementById("modal-edit").style.display = "flex";
    }
});

// GUARDAR CAMBIOS
const btnGuardar = document.getElementById("guardar-cambios");

if (btnGuardar) {
    btnGuardar.addEventListener("click", () => {

        let productos = JSON.parse(localStorage.getItem("productos")) || [];

        productos[productoEditando] = {
            ...productos[productoEditando],
            nombre: document.getElementById("edit-nombre").value,
            descripcion: document.getElementById("edit-descripcion").value,
            categoria: document.getElementById("edit-categoria").value,
            marca: document.getElementById("edit-marca").value,
            material: document.getElementById("edit-material").value,
            color: document.getElementById("edit-color").value,
            precio: document.getElementById("edit-precio").value
        };

        localStorage.setItem("productos", JSON.stringify(productos));

        document.getElementById("modal-edit").style.display = "none";

        cargarProductos();
    });
}

//CERRAR MODAL
const btnCerrar = document.getElementById("cerrar-modal");

if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
        document.getElementById("modal-edit").style.display = "none";
    });
}