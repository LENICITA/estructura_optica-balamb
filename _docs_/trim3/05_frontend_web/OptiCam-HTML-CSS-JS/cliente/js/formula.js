// ========== DROPDOWN DE CONDICIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.dropdown');
    const title = dropdown.querySelector('.title');
    const menu = dropdown.querySelector('.menu');
    const arrow = title.querySelector('.fa-angle-right');
    const options = dropdown.querySelectorAll('.option');
    const condicionInput = document.createElement('input');
    condicionInput.type = 'hidden';
    condicionInput.id = 'condicion';
    condicionInput.name = 'condicion';
    dropdown.appendChild(condicionInput);
    
    // Toggle menú
    title.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Alternar clase active en el dropdown
        dropdown.classList.toggle('active');
        
        // Alternar rotación de flecha
        arrow.classList.toggle('rotate-90');
        
        // Mostrar/ocultar menú
        if (dropdown.classList.contains('active')) {
            menu.style.maxHeight = '20em';
            menu.classList.remove('hide');
        } else {
            menu.style.maxHeight = '0';
            menu.classList.add('hide');
        }
    });
    
    // Seleccionar opción
    options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const valor = this.textContent;
            title.innerHTML = `${valor} <i class="fa fa-angle-right"></i>`;
            condicionInput.value = valor;
            
            // Cerrar menú
            dropdown.classList.remove('active');
            menu.style.maxHeight = '0';
            menu.classList.add('hide');
            title.querySelector('.fa-angle-right').classList.remove('rotate-90');
        });
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
            menu.style.maxHeight = '0';
            menu.classList.add('hide');
            title.querySelector('.fa-angle-right')?.classList.remove('rotate-90');
        }
    });
});

// ========== GESTIÓN DE FÓRMULAS ==========

// Array para almacenar fórmulas
let formulas = JSON.parse(localStorage.getItem('formulas')) || [];

// ========== DROPDOWN DE CONDICIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    inicializarDropdown();
    renderizarFormulas();
    configurarPreviewImagen();
});

function inicializarDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const title = dropdown.querySelector('.title');
    const menu = dropdown.querySelector('.menu');
    const arrow = title.querySelector('.fa-angle-right');
    const options = dropdown.querySelectorAll('.option');
    
    // Crear input hidden para la condición
    let condicionInput = document.getElementById('condicion-hidden');
    if (!condicionInput) {
        condicionInput = document.createElement('input');
        condicionInput.type = 'hidden';
        condicionInput.id = 'condicion-hidden';
        dropdown.appendChild(condicionInput);
    }
    
    // Toggle menú
    title.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
        arrow.classList.toggle('rotate-90');
        
        if (dropdown.classList.contains('active')) {
            menu.style.maxHeight = menu.scrollHeight + 'px';
            menu.classList.remove('hide');
        } else {
            menu.style.maxHeight = '0';
            setTimeout(() => menu.classList.add('hide'), 300);
        }
    });
    
    // Seleccionar opción
    options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const valor = this.textContent;
            title.innerHTML = `${valor} <i class="fa fa-angle-right"></i>`;
            condicionInput.value = valor;
            
            dropdown.classList.remove('active');
            arrow.classList.remove('rotate-90');
            menu.style.maxHeight = '0';
            setTimeout(() => menu.classList.add('hide'), 300);
        });
    });
    
    // Cerrar al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
            arrow.classList.remove('rotate-90');
            menu.style.maxHeight = '0';
            setTimeout(() => menu.classList.add('hide'), 300);
        }
    });
}

// ========== PREVIEW DE IMAGEN ==========
function configurarPreviewImagen() {
    const imagenInput = document.getElementById('imagen');
    const preview = document.getElementById('preview');
    
    imagenInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

// ========== ENVIAR FORMULARIO ==========
function enviarFormulario() {
    const fecha = document.getElementById('fecha').value;
    const descripcion = document.getElementById('descripcion').value;
    const condicion = document.getElementById('condicion-hidden')?.value || 'No especificada';
    const imagenInput = document.getElementById('imagen');
    
    // Validaciones
    if (!fecha) {
        alert('❌ Selecciona una fecha');
        return;
    }
    
    if (!descripcion.trim()) {
        alert('❌ Ingresa una descripción');
        return;
    }
    
    if (condicion === 'Condición' || !condicion) {
        alert('❌ Selecciona una condición');
        return;
    }
    
    if (!imagenInput.files[0]) {
        alert('❌ Selecciona una imagen');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const nuevaFormula = {
            id: Date.now(),
            fecha: fecha,
            descripcion: descripcion,
            condicion: condicion,
            imagen: event.target.result,
            estado: 'en-revision', // en-revision, valorada, rechazada
            precio: null,
            fechaSubida: new Date().toLocaleDateString()
        };
        
        formulas.push(nuevaFormula);
        localStorage.setItem('formulas', JSON.stringify(formulas));
        
        // Limpiar formulario
        document.getElementById('formula-form').reset();
        document.getElementById('preview').style.display = 'none';
        document.querySelector('.dropdown .title').innerHTML = 'Condición <i class="fa fa-angle-right"></i>';
        
        // Recargar lista
        renderizarFormulas();
        
        alert('✅ Fórmula subida correctamente');
    };
    
    reader.readAsDataURL(imagenInput.files[0]);
}

// ========== RENDERIZAR FÓRMULAS ==========
function renderizarFormulas() {
    const container = document.getElementById('lista-formulas');
    
    if (formulas.length === 0) {
        container.innerHTML = `
            <div class="sin-formulas">
                <i class="fa-regular fa-file-lines"></i>
                <p>No hay fórmulas subidas aún</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por fecha más reciente
    const formulasOrdenadas = [...formulas].reverse();
    
    container.innerHTML = formulasOrdenadas.map(formula => {
        const estadoClase = formula.estado;
        const estadoTexto = formatearEstado(formula.estado);
        
        return `
            <div class="card-formula" data-id="${formula.id}">
                <div class="card-imagen">
                    <img src="${formula.imagen}" alt="Fórmula">
                </div>
                
                <div class="card-contenido">
                    <div class="card-fecha">
                        <i class="fa-regular fa-calendar"></i>
                        ${formatearFecha(formula.fecha)}
                    </div>
                    
                    <h4 class="card-descripcion">${formula.descripcion}</h4>
                    
                    <div class="card-condicion">
                        <i class="fa-regular fa-eye"></i>
                        ${formula.condicion}
                    </div>
                    
                    <div class="card-estado ${estadoClase}">
                        <i class="fa-solid ${getIconoEstado(formula.estado)}"></i>
                        ${estadoTexto}
                    </div>
                    
                    ${formula.precio ? `
                        <div class="card-precio">
                            Precio: $${formula.precio.toLocaleString()}
                        </div>
                    ` : ''}
                    
                    <button class="btn-eliminar-formula" onclick="eliminarFormula(${formula.id})">
                        <i class="fa-regular fa-trash-can"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ========== ELIMINAR FÓRMULA ==========
function eliminarFormula(id) {
    if (confirm('¿Eliminar esta fórmula?')) {
        formulas = formulas.filter(f => f.id !== id);
        localStorage.setItem('formulas', JSON.stringify(formulas));
        renderizarFormulas();
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatearEstado(estado) {
    const estados = {
        'en-revision': 'En revisión',
        'valorada': 'Valorada',
        'rechazada': 'Rechazada'
    };
    return estados[estado] || estado;
}

function getIconoEstado(estado) {
    const iconos = {
        'en-revision': 'fa-clock',
        'valorada': 'fa-circle-check',
        'rechazada': 'fa-circle-xmark'
    };
    return iconos[estado] || 'fa-circle';
}

// ========== FUNCIÓN PARA ADMINISTRADOR (actualizar estado/precio) ==========
function actualizarEstadoFormula(id, nuevoEstado, precio = null) {
    const formula = formulas.find(f => f.id === id);
    if (formula) {
        formula.estado = nuevoEstado;
        if (precio !== null) {
            formula.precio = precio;
        }
        localStorage.setItem('formulas', JSON.stringify(formulas));
        renderizarFormulas();
    }
}