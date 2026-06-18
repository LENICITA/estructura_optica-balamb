// ========== FORMULAS.JS - ADMINISTRADOR ==========
// Para gestionar fórmulas enviadas por clientes

document.addEventListener('DOMContentLoaded', function() {
    cargarFormulasAdmin();
    setupEventListeners();
});

let formulaSeleccionada = null;

// ========== CARGAR FÓRMULAS EN TABLA ==========
function cargarFormulasAdmin() {
    const tbody = document.getElementById('tablaBody');
    if (!tbody) return;
    
    let formulas = JSON.parse(localStorage.getItem('formulas_admin')) || [];
    // También buscar en formulas_cliente por si acaso
    const formulasCliente = JSON.parse(localStorage.getItem('formulas_cliente')) || [];
    
    // Combinar y eliminar duplicados por ID
    const todasFormulas = [...formulas, ...formulasCliente];
    const formulasUnicas = [];
    const idsVistos = new Set();
    
    for (const f of todasFormulas) {
        if (!idsVistos.has(f.id)) {
            idsVistos.add(f.id);
            formulasUnicas.push(f);
        }
    }
    
    // Guardar versión unificada
    localStorage.setItem('formulas_admin', JSON.stringify(formulasUnicas));
    
    // Filtrar solo pendientes para mostrar en tabla
    const pendientes = formulasUnicas.filter(f => f.estado === 'pendiente');
    
    if (pendientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <i class="fa-regular fa-check-circle" style="font-size: 48px; color: #4CAF50;"></i>
                    <p style="margin-top: 10px;">No hay fórmulas pendientes</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pendientes.map(formula => `
        <tr onclick="seleccionarFormula(${formula.id})" style="cursor: pointer;">
            <td><img src="${formula.imagen}" width="60" height="60" style="object-fit: cover; border-radius: 8px;" onerror="this.src='/img/default.jpg'"></td>
            <td><strong>${escapeHtml(formula.condicion)}</strong><br><small>${formula.cliente?.nombre || 'Cliente'}</small></td>
            <td>${escapeHtml(formula.descripcion.substring(0, 50))}...</td>
            <td>${formatearFecha(formula.fecha)}</td>
            <td><button class="ver" onclick="event.stopPropagation(); seleccionarFormula(${formula.id})">Ver</button></td>
        </tr>
    `).join('');
}

// ========== SELECCIONAR FÓRMULA ==========
window.seleccionarFormula = function(id) {
    const formulas = JSON.parse(localStorage.getItem('formulas_admin')) || [];
    formulaSeleccionada = formulas.find(f => f.id === id);
    
    if (!formulaSeleccionada) return;
    
    // Mostrar en el panel de detalles
    const imgFormula = document.getElementById('img-formula');
    const condicionSpan = document.getElementById('condicion');
    const observacionSpan = document.getElementById('observacion');
    const fechaSpan = document.getElementById('fecha');
    
    if (imgFormula) imgFormula.src = formulaSeleccionada.imagen;
    if (condicionSpan) condicionSpan.textContent = formulaSeleccionada.condicion;
    if (observacionSpan) observacionSpan.textContent = formulaSeleccionada.descripcion;
    if (fechaSpan) fechaSpan.textContent = formatearFecha(formulaSeleccionada.fecha);
    
    // Mostrar información del cliente
    const clienteInfo = document.getElementById('cliente-info');
    if (clienteInfo) {
        clienteInfo.innerHTML = `
            <strong>👤 Cliente:</strong> ${escapeHtml(formulaSeleccionada.cliente?.nombre || 'Desconocido')}<br>
            <strong>📧 Email:</strong> ${escapeHtml(formulaSeleccionada.cliente?.email || 'No disponible')}
        `;
    }
    
    // Limpiar y mostrar formulario de precio
    const precioInput = document.getElementById('precio');
    if (precioInput) precioInput.value = formulaSeleccionada.precio || '';
    
    // Scroll al panel de detalles
    const detalleDiv = document.querySelector('.detalle-formula');
    if (detalleDiv) detalleDiv.scrollIntoView({ behavior: 'smooth' });
};

// ========== ENVIAR PRECIO Y APROBAR/RECHAZAR ==========
document.addEventListener('DOMContentLoaded', function() {
    const precioForm = document.getElementById('precioForm');
    if (precioForm) {
        precioForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!formulaSeleccionada) {
                alert('❌ Selecciona una fórmula primero');
                return;
            }
            
            const precio = document.getElementById('precio')?.value;
            const accion = document.querySelector('input[name="accion"]:checked')?.value || 'aprobar';
            const motivoRechazo = document.getElementById('motivo-rechazo')?.value;
            
            if (accion === 'aprobar') {
                if (!precio || precio <= 0) {
                    alert('❌ Ingresa un precio válido');
                    return;
                }
                
                formulaSeleccionada.estado = 'aprobada';
                formulaSeleccionada.precio = parseInt(precio);
                formulaSeleccionada.fechaAprobacion = new Date().toISOString();
                mostrarNotificacion(`✅ Fórmula aprobada por $${parseInt(precio).toLocaleString('es-CO')}`, 'exito');
            } else {
                formulaSeleccionada.estado = 'rechazada';
                formulaSeleccionada.motivoRechazo = motivoRechazo || 'No especificado';
                formulaSeleccionada.fechaRechazo = new Date().toISOString();
                mostrarNotificacion(`❌ Fórmula rechazada`, 'error');
            }
            
            // Actualizar en ambas bases de datos
            actualizarFormulaEnStorage(formulaSeleccionada);
            
            // Limpiar selección
            formulaSeleccionada = null;
            
            // Limpiar formulario
            const precioInput = document.getElementById('precio');
            if (precioInput) precioInput.value = '';
            const motivoInput = document.getElementById('motivo-rechazo');
            if (motivoInput) motivoInput.value = '';
            
            // Recargar tablas
            cargarFormulasAdmin();
            
            // Limpiar panel de detalles
            document.getElementById('img-formula').src = 'img/default.jpg';
            document.getElementById('condicion').innerText = '';
            document.getElementById('observacion').innerText = '';
            document.getElementById('fecha').innerText = '';
        });
    }
});

// ========== ACTUALIZAR FÓRMULA EN STORAGE ==========
function actualizarFormulaEnStorage(formulaActualizada) {
    // Actualizar formulas_admin
    let formulasAdmin = JSON.parse(localStorage.getItem('formulas_admin')) || [];
    const indexAdmin = formulasAdmin.findIndex(f => f.id === formulaActualizada.id);
    if (indexAdmin !== -1) {
        formulasAdmin[indexAdmin] = formulaActualizada;
        localStorage.setItem('formulas_admin', JSON.stringify(formulasAdmin));
    }
    
    // Actualizar formulas_cliente
    let formulasCliente = JSON.parse(localStorage.getItem('formulas_cliente')) || [];
    const indexCliente = formulasCliente.findIndex(f => f.id === formulaActualizada.id);
    if (indexCliente !== -1) {
        formulasCliente[indexCliente] = formulaActualizada;
        localStorage.setItem('formulas_cliente', JSON.stringify(formulasCliente));
    }
}

// ========== CONFIGURAR EVENTOS ==========
function setupEventListeners() {
    // Mostrar/ocultar motivo de rechazo según selección
    const radioRechazar = document.getElementById('rechazar');
    const motivoDiv = document.getElementById('motivo-rechazo-div');
    
    if (radioRechazar && motivoDiv) {
        radioRechazar.addEventListener('change', function() {
            motivoDiv.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    const radioAprobar = document.getElementById('aprobar');
    if (radioAprobar && motivoDiv) {
        radioAprobar.addEventListener('change', function() {
            motivoDiv.style.display = 'none';
        });
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';
    try {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES');
    } catch(e) {
        return fechaISO;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${tipo === 'exito' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: fadeInOut 3s ease;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.remove(), 3000);
}

// Agregar estilos para el admin
if (!document.querySelector('#estilos-admin-formulas')) {
    const style = document.createElement('style');
    style.id = 'estilos-admin-formulas';
    style.textContent = `
        #motivo-rechazo-div {
            margin-top: 10px;
            display: none;
        }
        #motivo-rechazo {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-top: 5px;
        }
        .radio-group {
            margin: 15px 0;
            display: flex;
            gap: 20px;
        }
        .radio-group label {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
        }
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(100px); }
            15% { opacity: 1; transform: translateX(0); }
            85% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(100px); }
        }
    `;
    document.head.appendChild(style);
}