// ========== CATÁLOGO ÓPTICA BALAMB ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Catálogo iniciado');

    // Base de datos de productos
    const productos = [
    { 
        id: 1, 
        nombre: "Ángel Gold", 
        precio: 250000, 
        material: "Plastico", 
        imagen: "/img/Opera Captura de pantalla_2026-04-09_213050_www.figma.com.png", 
        vendidos: 150, 
        nuevo: true 
    },
    { 
        id: 2, 
        nombre: "Sky Blue", 
        precio: 180000, 
        material: "Metal", 
        imagen: "/img/Opera Captura de pantalla_2026-04-09_213113_www.figma.com.png", 
        vendidos: 89, 
        nuevo: false 
    },
    { 
        id: 3, 
        nombre: "Titanium Pro", 
        precio: 350000, 
        material: "Titanio", 
        imagen: "/img/Opera Captura de pantalla_2026-04-09_213126_www.figma.com.png", 
        vendidos: 45, 
        nuevo: true 
    },
    { 
        id: 4, 
        nombre: "Gafas Ámbar", 
        precio: 250000, 
        material: "Plastico", 
        imagen: "/img/Gafas ámbar sobre fondo rojo.png", 
        vendidos: 200, 
        nuevo: true 
    }
];
    // Seleccionar elementos
    const productGrid = document.querySelector('.product-grid');
    const sortButtons = document.querySelectorAll('.sort-buttons button');
    const materialCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    const budgetRange = document.querySelector('.budget input[type="range"]');
    const budgetValue = document.querySelector('.budget .range-labels span:last-child');
    const searchInput = document.querySelector('.search-input');

    let currentProducts = [...productos];
    let currentSort = 'nuevo';

    // ========== FUNCIÓN RENDERIZAR (con redirección) ==========
    function renderProducts(products) {
        if (!productGrid) return;
        
        if (products.length === 0) {
            productGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px;">😕 No se encontraron productos</div>`;
            return;
        }
        
        productGrid.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}" style="cursor:pointer;">
                <div class="product-image">
                    <img src="${product.imagen}" alt="${product.nombre}">
                </div>
                <div class="product-info">
                    <span class="price">$${product.precio.toLocaleString('es-CO')}</span>
                    <h4>${product.nombre}</h4>
                    <p>Material - ${product.material}</p>
                    <p>⭐ ${product.vendidos} vendidos</p>
                </div>
            </div>
        `).join('');
        
        // REDIRECCIÓN: Al hacer clic en un producto
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', function() {
                const productId = this.dataset.id;
                if (productId) {
                    window.location.href = `producto.html?id=${productId}`;
                }
            });
        });
    }

    // ========== RESTO DE FUNCIONES (ordenar, filtrar, etc.) ==========
    function sortProducts(products, sortType) {
        const copy = [...products];
        switch(sortType) {
            case 'precio-asc': return copy.sort((a, b) => a.precio - b.precio);
            case 'precio-desc': return copy.sort((a, b) => b.precio - a.precio);
            case 'mas-comprados': return copy.sort((a, b) => b.vendidos - a.vendidos);
            default: return copy.sort((a, b) => (b.nuevo === a.nuevo) ? 0 : b.nuevo ? 1 : -1);
        }
    }

    function filterProducts() {
        let filtered = [...productos];
        
        const selectedMaterials = [];
        materialCheckboxes.forEach(cb => {
            if (cb.checked) selectedMaterials.push(cb.parentElement.textContent.trim().toLowerCase());
        });
        
        if (selectedMaterials.length > 0 && selectedMaterials.length < 3) {
            filtered = filtered.filter(p => selectedMaterials.includes(p.material.toLowerCase()));
        }
        
        if (budgetRange) {
            filtered = filtered.filter(p => p.precio <= parseInt(budgetRange.value));
        }
        
        if (searchInput && searchInput.value.trim()) {
            const term = searchInput.value.trim().toLowerCase();
            filtered = filtered.filter(p => p.nombre.toLowerCase().includes(term));
        }
        
        filtered = sortProducts(filtered, currentSort);
        currentProducts = filtered;
        renderProducts(currentProducts);
    }

    // ========== EVENTOS ==========
    function setupEvents() {
        sortButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                sortButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const text = this.textContent.trim().toLowerCase();
                if (text.includes('ascendente')) currentSort = 'precio-asc';
                else if (text.includes('descendente')) currentSort = 'precio-desc';
                else if (text.includes('comprados')) currentSort = 'mas-comprados';
                else currentSort = 'nuevo';
                filterProducts();
            });
        });
        
        materialCheckboxes.forEach(cb => cb.addEventListener('change', filterProducts));
        
        if (budgetRange) {
            budgetRange.addEventListener('input', function() {
                if (budgetValue) budgetValue.textContent = `$${parseInt(this.value).toLocaleString('es-CO')}`;
                filterProducts();
            });
        }
        
        if (searchInput) searchInput.addEventListener('input', filterProducts);
    }

    setupEvents();
    filterProducts();
});
// ========== LIMPIAR FILTROS (DESMARCAR TODO) ==========
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

function limpiarFiltros() {
    // 1. DESMARCAR checkboxes de categorías
    const filterCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    filterCheckboxes.forEach(cb => {
        cb.checked = false;  // ← Desmarcar
    });
    
    // 2. DESMARCAR checkboxes de materiales
    const materialCheckboxes = document.querySelectorAll('.filter-options input[type="checkbox"]');
    materialCheckboxes.forEach(cb => {
        cb.checked = false;  // ← Desmarcar
    });
    
    // 3. Resetear presupuesto a su valor MÁXIMO (para mostrar todos)
    const budgetRange = document.querySelector('.budget input[type="range"]');
    const budgetValue = document.querySelector('.budget .range-labels span:last-child');
    if (budgetRange) {
        budgetRange.value = budgetRange.max || 500000;  // Valor máximo
        if (budgetValue) {
            budgetValue.textContent = `$${parseInt(budgetRange.value).toLocaleString('es-CO')}`;
        }
    }
    
    // 4. Limpiar buscador
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // 5. Resetear ordenamiento a "Nuevo"
    const sortButtons = document.querySelectorAll('.sort-buttons button');
    sortButtons.forEach(btn => {
        if (btn.textContent.includes('Nuevo') || btn.textContent.includes('✓')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 6. Aplicar filtros nuevamente
    if (typeof aplicarFiltros === 'function') {
        aplicarFiltros();
    }
    
    console.log('✅ Todos los filtros han sido limpiados (desmarcados)');
}

// Evento del botón
if (btnLimpiarFiltros) {
    btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
}