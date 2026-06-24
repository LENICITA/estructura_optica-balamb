const lupa = document.querySelector('.lupa');
const button = document.getElementById('search-btn');

if (button && lupa) {
    button.addEventListener('click', () => {
        lupa.classList.toggle('scale');
    });
}
$(function () {

    $('.categoria-item').click(function (e) {
        e.preventDefault();

        let categoria = $(this).data('category');

        $('.categoria-item').removeClass('ct_item-active');
        $(this).addClass('ct_item-active');

        if (categoria === "all") {
            $('tbody tr').fadeIn();
        } else {
            $('tbody tr').hide();
            $('tbody tr[data-category="' + categoria + '"]').fadeIn();
        }
    });

});

const form = document.querySelector('.generador form');
const tabla = document.querySelector('.tabla-reportes tbody');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const tipo = document.getElementById('report-type').value;
    const periodo = document.getElementById('report-period').value;

    const nombres = {
        sales: "Ventas",
        inventory: "Inventario",
        repartidor: "Repartidores",
        clientes: "Clientes"
    };

    const descripciones = {
        sales: "Resumen de ventas realizadas",
        inventory: "Estado actual del inventario",
        repartidor: "Actividad de los repartidores",
        clientes: "Información de clientes registrados"
    };

    const periodos = {
        daily: "Diario",
        weekly: "Semanal",
        monthly: "Mensual",
        yearly: "Anual"
    };

    // Fecha automática
    const fecha = new Date().toLocaleDateString('es-CO');

    // Datos dinámicos
    const nombre = `Reporte de ${nombres[tipo]}`;
    const descripcion = descripciones[tipo];
    const periodoTexto = periodos[periodo];

    const fila = document.createElement('tr');
    fila.setAttribute('data-category', tipo);

    fila.innerHTML = `
        <td>${nombre}</td>
        <td>${descripcion}</td>
        <td>${periodoTexto}</td>
        <td>${fecha}</td>
        <td>
            <i class="fa-solid fa-trash eliminar-btn"></i>
            <i class="fa-solid fa-folder-open ver-btn"></i>
            <i class="fa-solid fa-download descargar-btn"></i>
        </td>
    `;

    tabla.appendChild(fila);
});

document.addEventListener('click', function(e) {

    const btn = e.target.closest('i');

    if (!btn) return;

    if (btn.classList.contains('eliminar-btn')) {
        btn.closest('tr').remove();
    }

    if (btn.classList.contains('ver-btn')) {
        const nombre = btn.closest('tr').children[0].textContent;
        alert("Viendo: " + nombre);
    }

    if (btn.classList.contains('descargar-btn')) {
        const nombre = btn.closest('tr').children[0].textContent;

        const blob = new Blob([`Reporte: ${nombre}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = nombre + '.txt';
        a.click();

        URL.revokeObjectURL(url);
    }
});

const nombres = {
    sales: "Ventas",
    inventory: "Inventario",
    repartidor: "Repartidores",
    clientes: "Clientes"
};