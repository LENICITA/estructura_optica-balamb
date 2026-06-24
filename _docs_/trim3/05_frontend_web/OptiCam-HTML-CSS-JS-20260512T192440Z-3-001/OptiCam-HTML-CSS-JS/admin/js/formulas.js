// Datos de fórmulas
let formulas = [
    { id: 1, img: "../img/formula-progresiva..jpg", condicion: "Miopía", observacion: "Vista borrosa", fecha: "08/04/2026", cobrada: false, precio: null },
    { id: 2, img: "../img/formula-con-prisma.jpg", condicion: "Astigmatismo", observacion: "Dolor de cabeza", fecha: "07/04/2026", cobrada: false, precio: null }
];

let formulaActual = null;

// Mostrar fórmulas en la tabla
function cargarTabla() {
    let tbody = document.getElementById("tablaBody");
    tbody.innerHTML = "";
    
    for (let f of formulas) {
        if (f.cobrada) continue;
        
        let row = `<tr onclick="seleccionar(${f.id})">
            <td><img src="${f.img}" width="60"></td>
            <td>${f.condicion}</td>
            <td>${f.observacion}</td>
            <td>${f.fecha}</td>
            <td><button class="ver">Ver</button></td>
        </tr>`;
        tbody.innerHTML += row;
    }
}

// Seleccionar fórmula
function seleccionar(id) {
    formulaActual = formulas.find(f => f.id === id);
    document.getElementById("img-formula").src = formulaActual.img;
    document.getElementById("condicion").innerText = formulaActual.condicion;
    document.getElementById("observacion").innerText = formulaActual.observacion;
    document.getElementById("fecha").innerText = formulaActual.fecha;
}

// Enviar precio y cobrar
document.getElementById("precioForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (!formulaActual) {
        alert("Selecciona una fórmula");
        return;
    }
    
    if (formulaActual.cobrada) {
        alert("Esta fórmula ya fue cobrada");
        return;
    }
    
    let precio = document.getElementById("precio").value;
    if (precio === "") {
        alert("Ingresa un precio");
        return;
    }
    
    formulaActual.cobrada = true;
    formulaActual.precio = precio;
    
    alert(`✅ Fórmula cobrada por $${precio}`);
    
    cargarTabla();
    
    document.getElementById("img-formula").src = "img/default.jpg";
    document.getElementById("condicion").innerText = "";
    document.getElementById("observacion").innerText = "";
    document.getElementById("fecha").innerText = "";
    document.getElementById("precio").value = "";
    formulaActual = null;
});

// Iniciar
cargarTabla();