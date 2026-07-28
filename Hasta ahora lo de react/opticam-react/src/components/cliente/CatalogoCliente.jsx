import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Importar useNavigate

const CatalogoCliente = () => {
  const navigate = useNavigate(); // ✅ Añadir navigate
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMaterial, setFiltroMaterial] = useState([]);
  const [presupuestoMax, setPresupuestoMax] = useState(500000);
  const [orden, setOrden] = useState('nuevo');
  const [materialesDisponibles, setMaterialesDisponibles] = useState([]);

  // Materiales estáticos
  const materiales = ['Plastico', 'Metal', 'Titanio'];

  // Cargar productos al iniciar
  useEffect(() => {
    cargarProductos();
  }, []);

  // Aplicar filtros cuando cambien las dependencias
  useEffect(() => {
    aplicarFiltros();
  }, [productos, searchTerm, filtroMaterial, presupuestoMax, orden]);

  const obtenerProductos = () => {
    let productosInventario = JSON.parse(localStorage.getItem("productos")) || [];
    
    if (productosInventario.length === 0) {
      console.log('📦 No hay productos en inventario, cargando productos por defecto');
      productosInventario = [
        { id: 1, nombre: "Ángel Gold", precio: 250000, material: "Plastico", imagen: "/img/producto1.png", vendidos: 150, nuevo: true, categoria: "Gafas", color: "Dorado", descripcion: "Gafas elegantes con acabado dorado" },
        { id: 2, nombre: "Sky Blue", precio: 180000, material: "Metal", imagen: "/img/producto2.png", vendidos: 89, nuevo: false, categoria: "Gafas", color: "Azul", descripcion: "Diseño moderno en color azul cielo" },
        { id: 3, nombre: "Titanium Pro", precio: 350000, material: "Titanio", imagen: "/img/producto3.png", vendidos: 45, nuevo: true, categoria: "Gafas", color: "Plateado", descripcion: "Ultra ligeras de titanio profesional" },
        { id: 4, nombre: "Gafas Ámbar", precio: 250000, material: "Plastico", imagen: "/img/producto4.png", vendidos: 200, nuevo: true, categoria: "Gafas", color: "Ámbar", descripcion: "Tonos cálidos para un look sofisticado" }
      ];
      localStorage.setItem("productos", JSON.stringify(productosInventario));
      localStorage.setItem("productos_db", JSON.stringify(productosInventario));
    }
    
    return productosInventario;
  };

  const cargarProductos = () => {
    const productosData = obtenerProductos();
    setProductos(productosData);
    
    const materialesUnicos = [...new Set(productosData.map(p => p.material))];
    setMaterialesDisponibles(materialesUnicos);
  };

  const sortProducts = (products, sortType) => {
    const copy = [...products];
    switch(sortType) {
      case 'precio-asc': 
        return copy.sort((a, b) => a.precio - b.precio);
      case 'precio-desc': 
        return copy.sort((a, b) => b.precio - a.precio);
      case 'mas-comprados': 
        return copy.sort((a, b) => (b.vendidos || 0) - (a.vendidos || 0));
      default: 
        return copy.sort((a, b) => (b.nuevo === a.nuevo) ? 0 : b.nuevo ? 1 : -1);
    }
  };

  const aplicarFiltros = () => {
    let filtered = [...productos];
    
    if (filtroMaterial.length > 0) {
      filtered = filtered.filter(p => filtroMaterial.includes(p.material));
    }
    
    filtered = filtered.filter(p => p.precio <= presupuestoMax);
    
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(p => p.nombre.toLowerCase().includes(term));
    }
    
    filtered = sortProducts(filtered, orden);
    setProductosFiltrados(filtered);
  };

  const toggleMaterial = (material) => {
    if (filtroMaterial.includes(material)) {
      setFiltroMaterial(filtroMaterial.filter(m => m !== material));
    } else {
      setFiltroMaterial([...filtroMaterial, material]);
    }
  };

  // ✅ FUNCIÓN limpiarFiltros - ¡ESTA ES LA QUE FALTABA!
  const limpiarFiltros = () => {
    console.log('🧹 Limpiando filtros...');
    setFiltroMaterial([]);
    setPresupuestoMax(500000);
    setSearchTerm('');
    setOrden('nuevo');
  };

  const agregarAlCarrito = (producto, e) => {
    e.stopPropagation();
    
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
    
    mostrarNotificacion(`✅ ${producto.nombre} añadido al carrito`, 'success');
    actualizarContadorCarrito();
  };

  // ✅ Cambiar verProducto para usar React Router
  const verProducto = (productoId) => {
    navigate(`/producto/${productoId}`);
  };

  const actualizarContadorCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    const contadores = document.querySelectorAll('.cart-count');
    contadores.forEach(contador => {
      contador.textContent = totalItems;
    });
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-carrito';
    notificacion.innerHTML = `
      <i class="fa-solid ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${mensaje}</span>
    `;
    
    if (tipo === 'warning') {
      notificacion.style.background = '#ff9800';
    } else if (tipo === 'error') {
      notificacion.style.background = '#f44336';
    }
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notificacion.remove(), 300);
    }, 2500);
  };

  // Escuchar cambios en el inventario
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'productos' || e.key === 'productos_db') {
        console.log('🔄 Inventario actualizado, recargando catálogo...');
        cargarProductos();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="catalogo-container">
      <div className="container">
        {/* Sidebar */}
        <aside className="sidebar">
          <section className="keywords">
            <h3>Palabras clave</h3>
            <div className="tags">
              <span className="tag" onClick={() => setSearchTerm('Gafas')}>Gafas ✕</span>
              <span className="tag" onClick={() => setSearchTerm('Transitions')}>Transitions ✕</span>
              <span className="tag" onClick={() => setSearchTerm('Modernas')}>Modernas ✕</span>
            </div>
          </section>

          <section className="filter-group">
            <h3>Categorías</h3>
            <label><input type="checkbox" defaultChecked /> Material (Bueno)</label>
            <label><input type="checkbox" defaultChecked /> Lente (Transitions)</label>
            <label><input type="checkbox" defaultChecked /> Accesorios</label>
          </section>

          <section className="budget">
            <h3>Presupuesto</h3>
            <input 
              type="range" 
              min="0" 
              max="500000" 
              step="10000" 
              value={presupuestoMax}
              onChange={(e) => setPresupuestoMax(parseInt(e.target.value))}
            />
            <div className="range-labels">
              <span>$0</span>
              <span>${presupuestoMax.toLocaleString('es-CO')}</span>
            </div>
          </section>

          <section className="filter-options">
            <h3>Material</h3>
            {materiales.map(material => (
              <label key={material}>
                <input 
                  type="checkbox" 
                  checked={filtroMaterial.includes(material)}
                  onChange={() => toggleMaterial(material)}
                /> {material}
              </label>
            ))}
          </section>

          <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
            <i className="fa-solid fa-eraser"></i> Limpiar todos los filtros
          </button>
        </aside>

        {/* Contenido principal */}
        <main className="main-content">
          <header className="top-bar">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="sort-buttons">
              <button 
                className={orden === 'nuevo' ? 'active' : ''}
                onClick={() => setOrden('nuevo')}
              >
                ✓ Nuevo
              </button>
              <button 
                className={orden === 'precio-asc' ? 'active' : ''}
                onClick={() => setOrden('precio-asc')}
              >
                Precio ascendente
              </button>
              <button 
                className={orden === 'precio-desc' ? 'active' : ''}
                onClick={() => setOrden('precio-desc')}
              >
                Precio descendente
              </button>
              <button 
                className={orden === 'mas-comprados' ? 'active' : ''}
                onClick={() => setOrden('mas-comprados')}
              >
                Más comprados
              </button>
            </div>
            <span className="resultados-count">
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </header>

          <div className="product-grid">
            {productosFiltrados.length === 0 ? (
              <div className="no-results">
                <i className="fa-solid fa-search" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <p style={{ marginTop: '15px' }}>😕 No se encontraron productos</p>
                <button onClick={limpiarFiltros} className="btn-limpiar-filtros" style={{ marginTop: '10px', width: 'auto' }}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              productosFiltrados.map(producto => (
                <div 
                  key={producto.id} 
                  className="product-card" 
                  data-id={producto.id}
                  onClick={() => verProducto(producto.id)}
                >
                  <div className="product-image">
                    <img 
                      src={producto.imagen || '/img/default-product.jpg'} 
                      alt={producto.nombre} 
                      onError={(e) => e.target.src = '/img/default-product.jpg'}
                    />
                    {producto.nuevo && <span className="badge-nuevo">✨ NUEVO</span>}
                  </div>
                  <div className="product-info">
                    <span className="price">${producto.precio.toLocaleString('es-CO')}</span>
                    <h4>{producto.nombre}</h4>
                    <p>Material: {producto.material || 'No especificado'}</p>
                    <p>⭐ {producto.vendidos || 0} vendidos</p>
                    <button 
                      className="btn-agregar-carrito" 
                      onClick={(e) => agregarAlCarrito(producto, e)}
                    >
                      <i className="fa-solid fa-cart-plus"></i> Agregar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .catalogo-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          display: flex;
          align-items: flex-start;
          gap: 30px;
        }
        .sidebar {
          flex: 0 0 250px;
        }
        .sidebar h3 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #222;
          position: relative;
          padding-bottom: 5px;
        }
        .sidebar h3::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 30px;
          height: 3px;
          background-color: var(--color-primario, #B90F0F);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .sidebar section:hover h3::after {
          width: 60px;
        }
        .keywords {
          margin-bottom: 25px;
        }
        .tags {
          margin-bottom: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag {
          display: inline-block;
          background: #fdf2f2;
          border: 1px solid var(--color-primario, #B90F0F);
          color: var(--color-primario, #B90F0F);
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tag:hover {
          background-color: var(--color-primario, #B90F0F);
          color: white;
          transform: scale(1.02);
        }
        .filter-group, .filter-options {
          margin-bottom: 25px;
        }
        .filter-group label, .filter-options label {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #444;
          margin-bottom: 5px;
        }
        .filter-group label:hover, .filter-options label:hover {
          background-color: #fdf2f2;
          color: var(--color-primario, #B90F0F);
          padding-left: 15px;
        }
        .filter-group input[type="checkbox"],
        .filter-options input[type="checkbox"] {
          accent-color: var(--color-primario, #B90F0F);
          width: 16px;
          height: 16px;
          margin-right: 10px;
          cursor: pointer;
        }
        .budget {
          margin-bottom: 25px;
        }
        .budget input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 6px;
          background: #ddd;
          border-radius: 5px;
          outline: none;
        }
        .budget input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: var(--color-primario, #B90F0F);
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s ease;
          border: 2px solid white;
          box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }
        .budget input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          background: #8a0b0b;
        }
        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 8px;
          color: #666;
        }
        .btn-limpiar-filtros {
          width: 100%;
          background-color: #f0f0f0;
          color: #333;
          border: none;
          padding: 12px 15px;
          margin-top: 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-limpiar-filtros:hover {
          background-color: var(--color-primario, #B90F0F);
          color: white;
        }
        .main-content {
          flex: 1;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .search-input {
          padding: 10px 15px;
          width: 300px;
          border: 1px solid var(--card-border, #e0e0e0);
          border-radius: 25px;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .search-input:focus {
          outline: none;
          border-color: var(--color-primario, #B90F0F);
          box-shadow: 0 0 5px rgba(185,15,15,0.3);
        }
        .sort-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .sort-buttons button {
          background: transparent;
          border: 1px solid var(--card-border, #e0e0e0);
          color: #888;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 25px;
          transition: all 0.3s ease;
          font-size: 13px;
        }
        .sort-buttons button.active {
          background-color: var(--color-primario, #B90F0F);
          color: white;
          border-color: var(--color-primario, #B90F0F);
          box-shadow: 0 4px 10px rgba(185,15,15,0.2);
        }
        .sort-buttons button:hover:not(.active) {
          color: var(--color-primario, #B90F0F);
          background-color: #fdf2f2;
          border-color: var(--color-primario, #B90F0F);
        }
        .resultados-count {
          font-size: 14px;
          color: #666;
          margin-left: 15px;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 25px;
          padding: 20px 0;
        }
        .product-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .product-image {
          background: #f8f8f8;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          min-height: 180px;
          position: relative;
        }
        .product-image img {
          max-width: 80%;
          height: auto;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .product-card:hover .product-image img {
          transform: scale(1.03);
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
        .product-info {
          padding: 15px;
        }
        .price {
          font-weight: bold;
          font-size: 18px;
          color: var(--color-primario, #B90F0F);
          display: block;
          margin-bottom: 8px;
        }
        .product-info h4 {
          margin: 5px 0;
          font-size: 15px;
          color: #222;
        }
        .product-info p {
          font-size: 12px;
          color: #666;
          margin: 3px 0;
        }
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
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px;
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .notificacion-carrito {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 9999;
          animation: slideInRight 0.3s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 992px) {
          .container {
            flex-direction: column;
            padding: 15px;
          }
          .sidebar {
            width: 100%;
            min-width: 100%;
            margin-bottom: 20px;
          }
          .top-bar {
            flex-direction: column;
          }
          .search-input {
            width: 100%;
          }
          .sort-buttons {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 5px;
          }
          .sort-buttons button {
            white-space: nowrap;
          }
        }
        @media (max-width: 480px) {
          .product-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CatalogoCliente;