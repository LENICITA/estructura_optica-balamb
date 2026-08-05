import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';

const CatalogoCliente = () => {
  const navigate = useNavigate();
  
  // ESTADOS
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FILTROS
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMaterial, setFiltroMaterial] = useState([]);
  const [presupuestoMax, setPresupuestoMax] = useState(500000);
  const [orden, setOrden] = useState('nuevo');

  const materiales = ['Plastico', 'Metal', 'Titanio'];

  // CARGAR PRODUCTOS DESDE LA API
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/inventario/productos');
                
        // Procesar la respuesta
        let productosData = response.data;
        
        // Si la API devuelve un objeto con propiedad 'data'
        if (response.data && response.data.data) {
          productosData = response.data.data;
        }
        
        // Si la API devuelve con propiedad 'productos'
        if (response.data && response.data.productos) {
          productosData = response.data.productos;
        }
                
        // Si no hay datos, usar array vacío
        if (!Array.isArray(productosData)) {
          console.warn('Datos no son un array:', productosData);
          productosData = [];
        }

        // Mapear datos para que coincidan con lo que espera el frontend
        const productosMapeados = productosData.map((p, index) => ({
          id: p.id_producto || p.id || p.productoId || index,
          nombre: p.nombre || p.Nombre || p.name || 'Sin nombre',
          precio: p.precio || p.Precio || p.price || 0,
          material: p.material || p.Material || p.tipo || 'No especificado',
          imagen: p.imagen || p.Imagen || p.image || p.imagen_url || '/img/default.png',
          descripcion: p.descripcion || p.Descripcion || '',
          marca: p.marca || p.Marca || '',
          color: p.color || p.Color || '',
          vendidos: p.vendidos || p.Vendidos || p.ventas || Math.floor(Math.random() * 200) + 1,
          nuevo: p.nuevo !== undefined ? p.nuevo : (p.estado === 'nuevo' || index % 2 === 0),
          // Mantener datos originales por si se necesitan
          ...p
        }));
        
        setProductos(productosMapeados);
        
      } catch (err) {
        console.error('Error al cargar productos:', err);
        
        let mensajeError = 'Error al cargar los productos. ';
        if (err.response?.status === 404) {
          mensajeError += 'La ruta /inventario/productos no existe.';
        } else if (err.response?.status === 500) {
          mensajeError += 'Error interno del servidor.';
        } else {
          mensajeError += err.response?.data?.message || err.message;
        }
        
        setError(mensajeError);
        setProductos(productosEjemplo);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, []);

  // FILTRO MATERIAL
  const toggleMaterial = (material) => {
    if (filtroMaterial.includes(material)) {
      setFiltroMaterial(filtroMaterial.filter((m) => m !== material));
    } else {
      setFiltroMaterial([...filtroMaterial, material]);
    }
  };

  // LIMPIAR FILTROS
  const limpiarFiltros = () => {
    setFiltroMaterial([]);
    setPresupuestoMax(500000);
    setSearchTerm('');
    setOrden('nuevo');
  };

  // AGREGAR AL CARRITO
  const agregarAlCarrito = (producto) => {
    // Verificar si ya existe en el carrito
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
      existe.cantidad = (existe.cantidad || 1) + 1;
    } else {
      carrito.push({
        ...producto,
        cantidad: 1,
        seleccionado: true,
        fecha: new Date().toISOString()
      });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${producto.nombre} añadido al carrito`);
  };

  // PRODUCTOS FILTRADOS
  const productosFiltrados = productos
    .filter((p) =>
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) =>
      filtroMaterial.length === 0 || filtroMaterial.includes(p.material)
    )
    .filter((p) =>
      Number(p.precio) <= presupuestoMax
    )
    .sort((a, b) => {
      if (orden === 'precio-asc') {
        return a.precio - b.precio;
      }
      if (orden === 'precio-desc') {
        return b.precio - a.precio;
      }
      if (orden === 'mas-vendidos') {
        return (b.vendidos || 0) - (a.vendidos || 0);
      }
      // 'nuevo' - mostrar productos nuevos primero
      return (b.nuevo ? 1 : 0) - (a.nuevo ? 1 : 0);
    });

  // Mostrar loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#B90F0F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-[30px] p-5 max-w-[1200px] mx-auto max-md:flex-col">
        {/* SIDEBAR */}
        <aside className="flex-[0_0_250px]">
          {/* Palabras clave */}
          <section className="mb-6">
            <h3 className="text-base mb-4 text-[#222] relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[3px] after:bg-[#B90F0F] after:rounded-sm">
              Palabras clave
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block bg-red-50 border border-[#B90F0F] text-[#B90F0F] px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-[#B90F0F] hover:text-white">
                Gafas ✕
              </span>
              <span className="inline-block bg-red-50 border border-[#B90F0F] text-[#B90F0F] px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-[#B90F0F] hover:text-white">
                Transitions ✕
              </span>
              <span className="inline-block bg-red-50 border border-[#B90F0F] text-[#B90F0F] px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-[#B90F0F] hover:text-white">
                Modernas ✕
              </span>
            </div>
          </section>

          {/* Categorías */}
          <section className="mb-6">
            <h3 className="text-base mb-4 text-[#222] relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[3px] after:bg-[#B90F0F] after:rounded-sm">
              Categorías
            </h3>
            <label className="flex items-center p-2 rounded-md cursor-pointer hover:bg-red-50 hover:text-[#B90F0F] hover:pl-4 transition-all">
              <input
                type="checkbox"
                defaultChecked
                className="accent-[#B90F0F] w-4 h-4 mr-2.5"
              />
              Material (Bueno)
            </label>
            <label className="flex items-center p-2 rounded-md cursor-pointer hover:bg-red-50 hover:text-[#B90F0F] hover:pl-4 transition-all">
              <input
                type="checkbox"
                defaultChecked
                className="accent-[#B90F0F] w-4 h-4 mr-2.5"
              />
              Lente (Transitions)
            </label>
            <label className="flex items-center p-2 rounded-md cursor-pointer hover:bg-red-50 hover:text-[#B90F0F] hover:pl-4 transition-all">
              <input
                type="checkbox"
                defaultChecked
                className="accent-[#B90F0F] w-4 h-4 mr-2.5"
              />
              Accesorios
            </label>
          </section>

          {/* PRESUPUESTO */}
          <section className="mb-6">
            <h3 className="text-base mb-4 text-[#222] relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[3px] after:bg-[#B90F0F] after:rounded-sm">
              Presupuesto
            </h3>
            <input
              type="range"
              min="0"
              max="500000"
              step="10000"
              value={presupuestoMax}
              onChange={(e) => setPresupuestoMax(parseInt(e.target.value))}
              className="w-full h-1.5 bg-gray-300 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#B90F0F] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs mt-2 text-gray-500">
              <span>$0</span>
              <span>${presupuestoMax.toLocaleString("es-CO")}</span>
            </div>
          </section>

          {/* MATERIAL */}
          <section className="mb-6">
            <h3 className="text-base mb-4 text-[#222] relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[3px] after:bg-[#B90F0F] after:rounded-sm">
              Material
            </h3>
            {materiales.map((mat) => (
              <label
                key={mat}
                className="flex items-center p-2 rounded-md cursor-pointer hover:bg-red-50 hover:text-[#B90F0F] hover:pl-4 transition-all"
              >
                <input
                  type="checkbox"
                  checked={filtroMaterial.includes(mat)}
                  onChange={() => toggleMaterial(mat)}
                  className="accent-[#B90F0F] w-4 h-4 mr-2.5"
                />
                {mat}
              </label>
            ))}
          </section>

          {/* LIMPIAR */}
          <button
            onClick={limpiarFiltros}
            className="w-full bg-gray-100 text-[#333] border-none py-3 px-4 mt-5 rounded-lg text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-[#B90F0F] hover:text-white transition-all"
          >
            <i className="fa-solid fa-eraser"></i>
            Limpiar todos los filtros
          </button>
        </aside>

        {/* MAIN */}
        <main className="flex-1">
          {/* SEARCH + ORDEN */}
          <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
            <input
              type="text"
              placeholder="Buscar productos..."
              className="p-2.5 px-4 w-[300px] border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#B90F0F] focus:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setOrden('nuevo')}
                className={`border border-gray-300 text-gray-500 cursor-pointer px-4 py-2 rounded-full text-sm transition-all ${
                  orden === 'nuevo'
                    ? 'bg-[#B90F0F] text-white border-[#B90F0F]'
                    : 'hover:text-[#B90F0F] hover:bg-red-50'
                }`}
              >
                ✓ Nuevo
              </button>
              <button
                onClick={() => setOrden('precio-asc')}
                className={`border border-gray-300 text-gray-500 cursor-pointer px-4 py-2 rounded-full text-sm transition-all ${
                  orden === 'precio-asc'
                    ? 'bg-[#B90F0F] text-white border-[#B90F0F]'
                    : 'hover:text-[#B90F0F] hover:bg-red-50'
                }`}
              >
                Precio ascendente
              </button>
              <button
                onClick={() => setOrden('precio-desc')}
                className={`border border-gray-300 text-gray-500 cursor-pointer px-4 py-2 rounded-full text-sm transition-all ${
                  orden === 'precio-desc'
                    ? 'bg-[#B90F0F] text-white border-[#B90F0F]'
                    : 'hover:text-[#B90F0F] hover:bg-red-50'
                }`}
              >
                Precio descendente
              </button>
              <button
                onClick={() => setOrden('mas-vendidos')}
                className={`border border-gray-300 text-gray-500 cursor-pointer px-4 py-2 rounded-full text-sm transition-all ${
                  orden === 'mas-vendidos'
                    ? 'bg-[#B90F0F] text-white border-[#B90F0F]'
                    : 'hover:text-[#B90F0F] hover:bg-red-50'
                }`}
              >
                Más comprados
              </button>
            </div>
          </div>

          {/* CONTADOR DE PRODUCTOS */}
          <p className="text-sm text-gray-500 mb-4">
            Mostrando {productosFiltrados.length} de {productos.length} productos
          </p>

          {/* PRODUCTOS */}
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No se encontraron productos con los filtros seleccionados</p>
              <button
                onClick={limpiarFiltros}
                className="mt-4 text-[#B90F0F] hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 py-5">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl overflow-hidden flex flex-col transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl shadow-md"
                  onClick={() => navigate(`/producto/${producto.id}`)}
                >
                  <div className="bg-gray-50 flex justify-center items-center p-5 min-h-[180px]">
                    <img
                      src={producto.imagen || "/img/default.png"}
                      alt={producto.nombre}
                      className="max-w-[80%] h-auto transition-all hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/img/default.png";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <span className="font-bold text-lg text-[#B90F0F] block mb-2">
                      ${Number(producto.precio).toLocaleString("es-CO")}
                    </span>
                    <h4 className="my-1 text-base text-[#222]">
                      {producto.nombre}
                    </h4>
                    <p className="text-xs text-gray-500 my-1">
                      Material - {producto.material || 'No especificado'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {producto.vendidos || 0} vendidos
                    </p>
                    {producto.nuevo && (
                      <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        ¡Nuevo!
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        agregarAlCarrito(producto);
                      }}
                      className="w-full mt-3 bg-[#B90F0F] text-white py-2 rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogoCliente;