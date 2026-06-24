import React, { useState } from 'react';

const CatalogoCliente = () => {
  const [productos] = useState([
    { id: 1, nombre: "Ángel Gold", precio: 250000, material: "Plastico", imagen: "../../../public/img/producto1.png", vendidos: 150, nuevo: true },
    { id: 2, nombre: "Sky Blue", precio: 180000, material: "Metal", imagen: "./../../public/img/producto2.png", vendidos: 89, nuevo: false },
    { id: 3, nombre: "Titanium Pro", precio: 350000, material: "Titanio", imagen: "./../../public/img/producto3.png", vendidos: 45, nuevo: true },
    { id: 4, nombre: "Gafas Ámbar", precio: 250000, material: "Plastico", imagen: "./../../public/img/producto4.png", vendidos: 200, nuevo: true }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMaterial, setFiltroMaterial] = useState([]);
  const [presupuestoMax, setPresupuestoMax] = useState(500000);
  const [orden, setOrden] = useState('nuevo');

  const materiales = ['Plastico', 'Metal', 'Titanio'];

  const toggleMaterial = (material) => {
    if (filtroMaterial.includes(material)) {
      setFiltroMaterial(filtroMaterial.filter(m => m !== material));
    } else {
      setFiltroMaterial([...filtroMaterial, material]);
    }
  };

  const limpiarFiltros = () => {
    setFiltroMaterial([]);
    setPresupuestoMax(500000);
    setSearchTerm('');
    setOrden('nuevo');
  };

  const productosFiltrados = productos
    .filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => filtroMaterial.length === 0 || filtroMaterial.includes(p.material))
    .filter(p => p.precio <= presupuestoMax)
    .sort((a, b) => {
      if (orden === 'precio-asc') return a.precio - b.precio;
      if (orden === 'precio-desc') return b.precio - a.precio;
      if (orden === 'mas-vendidos') return b.vendidos - a.vendidos;
      return b.nuevo - a.nuevo;
    });

  const agregarAlCarrito = (producto) => {
    alert(`✅ ${producto.nombre} añadido al carrito`);
  };

  return (
    <div className="flex flex-col">
      {/* Header del catálogo */}
      <div className="flex gap-[30px] p-5 max-w-[1200px] mx-auto max-md:flex-col">
        {/* Sidebar filtros */}
        <aside className="flex-[0_0_250px]">
          <section className="mb-6">
            <h3 className="text-base mb-4 text-[#222] relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[3px] after:bg-[#B90F0F] after:rounded-sm">Palabras clave</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block bg-red-50 border border-[#B90F0F] text-[#B90F0F] px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-[#B90F0F] hover:text-white">Gafas ✕</span>
              <span className="inline-block bg-red-50 border border-[#B90F0F] text-[#B90F0F] px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-[#B90F0F] hover:text-white">Transitions ✕</span>
              <span className="inline-block bg-red-50 border border-[#B90F0F] text-[#B90F0F] px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-[#B90F0F] hover:text-white">Modernas ✕</span>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-base mb-4 text-[#222] relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[3px] after:bg-[#B90F0F] after:rounded-sm">Categorías</h3>
            <label className="flex items-center p-2 rounded-md cursor-pointer hover:bg-red-50 hover:text-[#B90F0F] hover:pl-4 transition-all">
              <input type="checkbox" defaultChecked className="accent-[#B90F0F] w-4 h-4 mr-2.5" /> Material (Bueno)
            </label>
            <label className="flex items-center p-2 rounded-md cursor-pointer hover:bg-red-50 hover:text-[#B90F0F] hover:pl-4 transition-all">
              <input type="checkbox" defaultChecked className="accent-[#B90F0F] w-4 h-4 mr-2.5" /> Lente (Transitions)
            </label>
            <label className="flex items-center p-2 rounded-md cursor-pointer hover:bg-red-50 hover:text-[#B90F0F] hover:pl-4 transition-all">
              <input type="checkbox" defaultChecked className="accent-[#B90F0F] w-4 h-4 mr-2.5" /> Accesorios
            </label>
          </section>

          <section className="mb-6">
            <h3 className="text-base mb-4 text-[#222] relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[3px] after:bg-[#B90F0F] after:rounded-sm">Presupuesto</h3>
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
              <span>${presupuestoMax.toLocaleString()}</span>
            </div>
          </section>

          <section className="mb-6">
            <h3 className="text-base mb-4 text-[#222] relative pb-1 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-[30px] after:h-[3px] after:bg-[#B90F0F] after:rounded-sm">Material</h3>
            {materiales.map(mat => (
              <label key={mat} className="flex items-center p-2 rounded-md cursor-pointer hover:bg-red-50 hover:text-[#B90F0F] hover:pl-4 transition-all">
                <input 
                  type="checkbox" 
                  checked={filtroMaterial.includes(mat)}
                  onChange={() => toggleMaterial(mat)}
                  className="accent-[#B90F0F] w-4 h-4 mr-2.5" 
                /> {mat}
              </label>
            ))}
          </section>

          <button 
            onClick={limpiarFiltros}
            className="w-full bg-gray-100 text-[#333] border-none py-3 px-4 mt-5 rounded-lg text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-[#B90F0F] hover:text-white transition-all"
          >
            <i className="fa-solid fa-eraser"></i> Limpiar todos los filtros
          </button>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="p-2.5 px-4 w-[300px] border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#B90F0F] focus:shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => setOrden('nuevo')}
                className={`border border-gray-300 text-gray-500 cursor-pointer px-4 py-2 rounded-full text-sm transition-all ${orden === 'nuevo' ? 'bg-[#B90F0F] text-white border-[#B90F0F]' : 'hover:text-[#B90F0F] hover:bg-red-50'}`}
              >
                ✓ Nuevo
              </button>
              <button 
                onClick={() => setOrden('precio-asc')}
                className={`border border-gray-300 text-gray-500 cursor-pointer px-4 py-2 rounded-full text-sm transition-all ${orden === 'precio-asc' ? 'bg-[#B90F0F] text-white border-[#B90F0F]' : 'hover:text-[#B90F0F] hover:bg-red-50'}`}
              >
                Precio ascendente
              </button>
              <button 
                onClick={() => setOrden('precio-desc')}
                className={`border border-gray-300 text-gray-500 cursor-pointer px-4 py-2 rounded-full text-sm transition-all ${orden === 'precio-desc' ? 'bg-[#B90F0F] text-white border-[#B90F0F]' : 'hover:text-[#B90F0F] hover:bg-red-50'}`}
              >
                Precio descendente
              </button>
              <button 
                onClick={() => setOrden('mas-vendidos')}
                className={`border border-gray-300 text-gray-500 cursor-pointer px-4 py-2 rounded-full text-sm transition-all ${orden === 'mas-vendidos' ? 'bg-[#B90F0F] text-white border-[#B90F0F]' : 'hover:text-[#B90F0F] hover:bg-red-50'}`}
              >
                Más comprados
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 py-5">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white rounded-xl overflow-hidden flex flex-col transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl shadow-md">
                <div className="bg-gray-50 flex justify-center items-center p-5 min-h-[180px]">
                  <img src={producto.imagen} alt={producto.nombre} className="max-w-[80%] h-auto transition-all hover:scale-105" />
                </div>
                <div className="p-4">
                  <span className="font-bold text-lg text-[#B90F0F] block mb-2">${producto.precio.toLocaleString()}</span>
                  <h4 className="my-1 text-base text-[#222]">{producto.nombre}</h4>
                  <p className="text-xs text-gray-500 my-1">Material - {producto.material}</p>
                  <p className="text-xs text-gray-500">⭐ {producto.vendidos} vendidos</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CatalogoCliente;