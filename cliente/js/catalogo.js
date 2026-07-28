// ========== CATÁLOGO ÓPTICA BALAMB - VERSIÓN MEJORADA ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Catálogo iniciado');

    // Base de datos de productos (ampliada)
    const productos = [
        { 
            id: 1, 
            nombre: "Ángel Gold", 
            precio: 250000, 
            material: "Plastico", 
            imagen: "/img/producto1.png", 
            vendidos: 150, 
            nuevo: true,
            categoria: "Gafas",
            color: "Dorado",
            descripcion: "Gafas elegantes con acabado dorado"
        },
        { 
            id: 2, 
            nombre: "Sky Blue", 
            precio: 180000, 
            material: "Metal", 
            imagen: "/img/producto2.png", 
            vendidos: 89, 
            nuevo: false,
            categoria: "Gafas",
            color: "Azul",
            descripcion: "Diseño moderno en color azul cielo"
        },
        { 
            id: 3, 
            nombre: "Titanium Pro", 
            precio: 350000, 
            material: "Titanio", 
            imagen: "/img/producto3.png", 
            vendidos: 45, 
            nuevo: true,
            categoria: "Gafas",
            color: "Plateado",
            descripcion: "Ultra ligeras de titanio profesional"
        },
        { 
            id: 4, 
            nombre: "Gafas Ámbar", 
            precio: 250000, 
            material: "Plastico", 
            imagen: "/img/producto4.png", 
            vendidos: 200, 
            nuevo: true,
            categoria: "Gafas",
            color: "Ámbar",
            descripcion: "Tonos cálidos para un look sofisticado"
        },
        
    ];
    
    // Guardar productos en localStorage para otras páginas
    localStorage.setItem('productos_db', JSON.stringify(productos));
    
    // Seleccionar elementos
    const productGrid = document.querySelector('.product-grid');
    const sortButtons = document.querySelectorAll('.sort-buttons button');
    const materialCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const categoryCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    const budgetRange = document.querySelector('.budget input[type="range"]');
    const budgetValue = document.querySelector('.budget .range-labels span:last-child');
    const searchInput = document.querySelector('.search-input');
    const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
    
    // Variables de estado
    let currentProducts = [...productos];
    let currentSort = 'nuevo';
    let filtrosActivos = {
        materiales: [],
        categorias: [],
        presupuestoMax: 500000,
        busqueda: ''
    };

    // ========== FUNCIÓN RENDERIZAR PRODUCTOS ==========
    function renderProducts(products) {
        if (!productGrid) return;
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px;">
                    <i class="fa-solid fa-search" style="font-size: 48px; color: #ccc;"></i>
                    <p style="margin-top: 15px;">😕 No se encontraron productos</p>
                    <button onclick="limpiarFiltrosCatalogo()" style="margin-top: 10px; padding: 10px 20px; background: var(--color-primario); color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Limpiar filtros
                    </button>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}" style="cursor:pointer;">
                <div class="product-image">
                    <img src="${product.imagen}" alt="${product.nombre}" onerror="this.src='/img/default-product.jpg'">
                    ${product.nuevo ? '<span class="badge-nuevo">✨ NUEVO</span>' : ''}
                </div>
                <div class="product-info">
                    <span class="price">$${product.precio.toLocaleString('es-CO')}</span>
                    <h4>${product.nombre}</h4>
                    <p>Material: ${product.material}</p>
                    <p>⭐ ${product.vendidos} vendidos</p>
                    <button class="btn-agregar-carrito" onclick="event.stopPropagation(); agregarProductoAlCarrito(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `).join('');
        
        // Evento de clic para ver producto
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Evitar que el clic en el botón agregar dispare la navegación
                if (e.target.closest('.btn-agregar-carrito')) return;
                const productId = this.dataset.id;
                if (productId) {
                    window.location.href = `producto.html?id=${productId}`;
                }
            });
        });
    }

    // ========== FUNCIÓN PARA AGREGAR AL CARRITO (DESDE CATÁLOGO) ==========
    window.agregarProductoAlCarrito = function(productId) {
        const producto = productos.find(p => p.id === productId);
        if (producto) {
            // Usar la función global del script.js
            if (typeof agregarAlCarritoGlobal === 'function') {
                agregarAlCarritoGlobal({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imagen: producto.imagen,
                    color: producto.color || 'Estándar',
                    material: producto.material
                });
            } else {
                // Fallback si no existe la función global
                console.warn('agregarAlCarritoGlobal no está definida');
                let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
                carrito.push({
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: producto.precio,
                    imagen: producto.imagen,
                    color: producto.color || 'Estándar',
                    material: producto.material,
                    cantidad: 1,
                    seleccionado: true,
                    fecha: new Date().toISOString()
                });
                localStorage.setItem('carrito', JSON.stringify(carrito));
                
                // Mostrar notificación
                if (typeof mostrarNotificacionGlobal === 'function') {
                    mostrarNotificacionGlobal(`✅ ${producto.nombre} añadido al carrito`, 'success');
                } else {
                    alert(`✅ ${producto.nombre} añadido al carrito`);
                }
            }
        }
    };

    // ========== FUNCIÓN ORDENAR ==========
    function sortProducts(products, sortType) {
        const copy = [...products];
        switch(sortType) {
            case 'precio-asc': 
                return copy.sort((a, b) => a.precio - b.precio);
            case 'precio-desc': 
                return copy.sort((a, b) => b.precio - a.precio);
            case 'mas-comprados': 
                return copy.sort((a, b) => b.vendidos - a.vendidos);
            case 'nombre-asc':
                return copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
            default: 
                return copy.sort((a, b) => (b.nuevo === a.nuevo) ? 0 : b.nuevo ? 1 : -1);
        }
    }

    // ========== FUNCIÓN APLICAR FILTROS ==========
    function aplicarFiltros() {
        let filtered = [...productos];
        
        // 1. Filtrar por materiales seleccionados
        const selectedMaterials = [];
        materialCheckboxes.forEach(cb => {
            if (cb.checked) {
                const label = cb.closest('label');
                const materialText = label ? label.textContent.trim() : cb.parentElement.textContent.trim();
                selectedMaterials.push(materialText.toLowerCase());
            }
        });
        
        if (selectedMaterials.length > 0) {
            filtered = filtered.filter(p => selectedMaterials.includes(p.material.toLowerCase()));
        }
        
        // 2. Filtrar por categorías (opcional)
        const selectedCategories = [];
        categoryCheckboxes.forEach(cb => {
            if (cb.checked) {
                const label = cb.closest('label');
                const categoryText = label ? label.textContent.trim() : cb.parentElement.textContent.trim();
                selectedCategories.push(categoryText.toLowerCase());
            }
        });
        
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(p => {
                const categoria = p.categoria || 'Gafas';
                return selectedCategories.includes(categoria.toLowerCase());
            });
        }
        
        // 3. Filtrar por presupuesto
        if (budgetRange) {
            const presupuestoMax = parseInt(budgetRange.value);
            filtered = filtered.filter(p => p.precio <= presupuestoMax);
            filtrosActivos.presupuestoMax = presupuestoMax;
        }
        
        // 4. Filtrar por búsqueda
        if (searchInput && searchInput.value.trim()) {
            const term = searchInput.value.trim().toLowerCase();
            filtered = filtered.filter(p => p.nombre.toLowerCase().includes(term));
            filtrosActivos.busqueda = term;
        }
        
        // 5. Ordenar
        filtered = sortProducts(filtered, currentSort);
        currentProducts = filtered;
        renderProducts(currentProducts);
        
        // Mostrar número de resultados
        const resultadosMsg = document.querySelector('.resultados-count');
        if (resultadosMsg) {
            resultadosMsg.textContent = `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`;
        }
    }

    // ========== LIMPIAR FILTROS ==========
    window.limpiarFiltrosCatalogo = function() {
        console.log('🧹 Limpiando filtros...');
        
        // 1. Desmarcar checkboxes de materiales
        materialCheckboxes.forEach(cb => {
            cb.checked = false;
        });
        
        // 2. Desmarcar checkboxes de categorías
        categoryCheckboxes.forEach(cb => {
            cb.checked = false;
        });
        
        // 3. Resetear presupuesto
        if (budgetRange) {
            const maxValue = budgetRange.max || 500000;
            budgetRange.value = maxValue;
            if (budgetValue) {
                budgetValue.textContent = `$${parseInt(maxValue).toLocaleString('es-CO')}`;
            }
        }
        
        // 4. Limpiar buscador
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 5. Resetear ordenamiento
        currentSort = 'nuevo';
        sortButtons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes('nuevo') || text.includes('✓')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 6. Resetear filtros activos
        filtrosActivos = {
            materiales: [],
            categorias: [],
            presupuestoMax: 500000,
            busqueda: ''
        };
        
        // 7. Aplicar filtros nuevamente
        aplicarFiltros();
        
        // Mostrar notificación
        if (typeof mostrarNotificacionGlobal === 'function') {
            mostrarNotificacionGlobal('Filtros limpiados', 'info');
        }
        
        console.log('✅ Todos los filtros han sido limpiados');
    };

    // ========== CONFIGURAR EVENTOS ==========
    function setupEvents() {
        // Botones de ordenamiento
        sortButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                sortButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const text = this.textContent.trim().toLowerCase();
                
                if (text.includes('ascendente')) {
                    currentSort = 'precio-asc';
                } else if (text.includes('descendente')) {
                    currentSort = 'precio-desc';
                } else if (text.includes('comprados')) {
                    currentSort = 'mas-comprados';
                } else {
                    currentSort = 'nuevo';
                }
                
                aplicarFiltros();
            });
        });
        
        // Checkboxes de materiales
        materialCheckboxes.forEach(cb => cb.addEventListener('change', aplicarFiltros));
        
        // Checkboxes de categorías
        categoryCheckboxes.forEach(cb => cb.addEventListener('change', aplicarFiltros));
        
        // Slider de presupuesto
        if (budgetRange) {
            budgetRange.addEventListener('input', function() {
                if (budgetValue) {
                    budgetValue.textContent = `$${parseInt(this.value).toLocaleString('es-CO')}`;
                }
                aplicarFiltros();
            });
        }
        
        // Búsqueda
        if (searchInput) {
            searchInput.addEventListener('input', aplicarFiltros);
        }
        
        // Botón limpiar filtros
        if (btnLimpiarFiltros) {
            btnLimpiarFiltros.addEventListener('click', limpiarFiltrosCatalogo);
        }
    }

    // ========== AGREGAR ESTILOS PARA EL BOTÓN AGREGAR ==========
    const estiloBotones = document.createElement('style');
    estiloBotones.textContent = `
        .btn-agregar-carrito {
            width: 100%;
            background: var(--color-primario, #B90F0F);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            margin-top: 10px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn-agregar-carrito:hover {
            background: var(--color-secundario, #000000);
            transform: translateY(-2px);
        }
        
        .badge-nuevo {
            position: absolute;
            top: 10px;
            left: 10px;
            background: #4CAF50;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
        }
        
        .product-image {
            position: relative;
        }
        
        .resultados-count {
            font-size: 14px;
            color: #666;
            margin-left: 15px;
        }
    `;
    document.head.appendChild(estiloBotones);
    
    // ========== AGREGAR CONTADOR DE RESULTADOS ==========
    const topBar = document.querySelector('.top-bar');
    if (topBar && !document.querySelector('.resultados-count')) {
        const resultadosSpan = document.createElement('span');
        resultadosSpan.className = 'resultados-count';
        topBar.appendChild(resultadosSpan);
    }

    // ========== INICIALIZAR ==========
    setupEvents();
    aplicarFiltros();
    
    console.log('✅ Catálogo inicializado correctamente');
});