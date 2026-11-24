// src/shared/components/ui/CatalogoUI.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CatalogoUI = ({ 
  catalogo, 
  titulo, 
  subtitulo, 
  icono, 
  botonHeader, 
  renderAcciones 
}) => {
  const navigate = useNavigate();
  const c = catalogo;

  if (c.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <i className={`fa-solid ${icono} text-2xl text-[#B90F0F]`}></i>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{titulo}</h1>
                <p className="text-sm text-gray-500 mt-1">{subtitulo}</p>
              </div>
            </div>
            {botonHeader}
          </div>
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="busqueda-producto" className="block text-xs font-semibold text-gray-500 mb-2">Buscar producto</label>
              <div className="flex items-center h-12 border border-gray-300 rounded-xl px-4 bg-white focus-within:border-[#B90F0F] transition">
                <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
                <input
                  id="busqueda-producto"
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={c.busqueda}
                  onChange={(e) => c.setBusqueda(e.target.value)}
                  maxLength={100}
                  className="flex-1 outline-none text-sm ml-3 text-gray-700"
                />
                {c.busqueda && (
                  <button onClick={() => c.setBusqueda('')} className="text-gray-400 hover:text-gray-600" aria-label="Limpiar búsqueda">
                    <i className="fa-solid fa-circle-xmark"></i>
                  </button>
                )}
                {c.buscando && <div className="ml-3 w-4 h-4 border-2 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>}
              </div>
            </div>

            <div className="lg:w-48">
              <p className="block text-xs font-semibold text-gray-500 mb-2">Categoría</p>
              <button onClick={() => c.setMostrarCategorias(true)} className="w-full h-12 flex items-center justify-between gap-2 border border-gray-300 rounded-xl px-4 hover:border-[#B90F0F] transition">
                <div className="flex items-center gap-2 min-w-0">
                  <i className="fa-solid fa-grip text-[#B90F0F]"></i>
                  <span className="text-sm text-gray-700 truncate">{c.categoriaSeleccionada}</span>
                </div>
                <i className="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
              </button>
            </div>

            <div className="lg:w-48">
              <p className="block text-xs font-semibold text-gray-500 mb-2">Marca</p>
              <button onClick={() => c.setMostrarMarcas(true)} className="w-full h-12 flex items-center justify-between gap-2 border border-gray-300 rounded-xl px-4 hover:border-[#B90F0F] transition">
                <div className="flex items-center gap-2 min-w-0">
                  <i className="fa-solid fa-tag text-[#B90F0F]"></i>
                  <span className="text-sm text-gray-700 truncate">{c.marcaSeleccionada}</span>
                </div>
                <i className="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
              </button>
            </div>

            <div className="lg:w-auto">
              <p className="block text-xs font-semibold text-gray-500 mb-2">Más filtros</p>
              <button onClick={() => c.setMostrarFiltros(true)} className="w-full lg:w-12 h-12 flex items-center justify-center gap-2 border border-[#B90F0F] text-[#B90F0F] rounded-xl hover:bg-red-50 transition">
                <i className="fa-solid fa-sliders"></i>
                <span className="lg:hidden text-sm font-semibold">Precio</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {c.buscando ? 'Buscando productos...' : <>Mostrando <span className="font-bold text-gray-900">{c.productosFiltrados.length}</span> de <span className="font-bold text-gray-900">{c.productos.length}</span> productos</>}
            </p>
            <button onClick={() => c.setMostrarOrden(true)} className="flex items-center justify-between sm:justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
              <i className="fa-solid fa-arrow-up-arrow-down text-[#B90F0F]"></i>
              <span>Ordenar: <strong>{c.ordenSeleccionado}</strong></span>
              <i className="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
            </button>
          </div>
        </div>

        {/* PRODUCTOS */}
        {c.productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 sm:p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
              <i className="fa-solid fa-magnifying-glass text-gray-300 text-3xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mt-5">No encontramos productos</h3>
            <p className="text-sm text-gray-500 mt-2">Intenta con otro término de búsqueda o modifica los filtros.</p>
            <button onClick={c.limpiarFiltros} className="mt-5 border border-[#B90F0F] text-[#B90F0F] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 transition">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Productos</h2>
                <p className="text-sm text-gray-500 mt-1">Selecciona un producto para consultar sus detalles.</p>
              </div>
            </div>

            <div ref={c.gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
              {c.productosPaginados.map((item) => {
                const imagenProducto = item.imagen_url || item.imagen_thumbnail || item.imagen;
                return (
                  <div key={item.id_producto} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-gray-300 transition group flex flex-col">
                    <button onClick={() => void navigate(`/admin/productos/${item.id_producto}`)} className="w-full h-56 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                      {imagenProducto ? (
                        <img src={imagenProducto} alt={item.nombre} className="w-[90%] h-[90%] object-contain group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <i className="fa-solid fa-image text-gray-300 text-4xl"></i>
                          <span className="text-xs text-gray-400 mt-2">Sin imagen</span>
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-[#B90F0F] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {item.tipo_categoria || 'Producto'}
                      </span>
                    </button>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[40px]">{item.nombre}</h3>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-500"><span className="font-semibold text-gray-600">Marca:</span> {item.marca || 'Sin marca'}</p>
                        </div>
                        <p className="text-xl font-black text-[#B90F0F] mt-3">{item.precioFormateado}</p>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                         {renderAcciones(item)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINACIÓN */}
            {c.totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">Página <span className="font-bold text-gray-900">{c.paginaActual}</span> de <span className="font-bold text-gray-900">{c.totalPaginas}</span></p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button onClick={() => c.setPaginaActual((p) => Math.max(1, p - 1))} disabled={c.paginaActual === 1} className={`h-10 px-4 rounded-xl border text-sm font-bold flex items-center gap-2 transition ${c.paginaActual === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    <i className="fa-solid fa-chevron-left text-xs"></i>
                    <span className="hidden sm:inline">Anterior</span>
                  </button>
                  <div className="flex items-center gap-1">
                    {c.generarPaginas().map((num, idx) =>
                      num === '...' ? (
                        <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm font-bold select-none">…</span>
                      ) : (
                        <button key={num} onClick={() => c.setPaginaActual(num)} className={`w-10 h-10 rounded-xl text-sm font-bold transition ${c.paginaActual === num ? 'bg-[#B90F0F] text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>{num}</button>
                      )
                    )}
                  </div>
                  <button onClick={() => c.setPaginaActual((p) => Math.min(c.totalPaginas, p + 1))} disabled={c.paginaActual === c.totalPaginas} className={`h-10 px-4 rounded-xl border text-sm font-bold flex items-center gap-2 transition ${c.paginaActual === c.totalPaginas ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    <span className="hidden sm:inline">Siguiente</span>
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {c.mostrarCategorias && (
        <div role="presentation" className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={() => c.setMostrarCategorias(false)} onKeyDown={(e) => e.key === 'Escape' && c.setMostrarCategorias(false)}>
          <div role="presentation" className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[75vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div><h3 className="text-lg font-bold text-gray-900">Categorías</h3><p className="text-xs text-gray-500 mt-1">Selecciona una categoría.</p></div>
              <button onClick={() => c.setMostrarCategorias(false)} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"><i className="fa-solid fa-xmark text-xl text-gray-600"></i></button>
            </div>
            <button onClick={() => c.filtrarPorCategoria('Todos')} className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${c.categoriaSeleccionada === 'Todos' ? 'bg-red-50 text-[#B90F0F]' : 'hover:bg-gray-50 text-gray-700'}`}>
              <span className="text-sm font-semibold">Todos</span>
              {c.categoriaSeleccionada === 'Todos' && <i className="fa-solid fa-check text-[#B90F0F]"></i>}
            </button>
            {c.categorias.map((cat) => (
              <button key={cat} onClick={() => c.filtrarPorCategoria(cat)} className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${c.categoriaSeleccionada === cat ? 'bg-red-50 text-[#B90F0F]' : 'hover:bg-gray-50 text-gray-700'}`}>
                <span className="text-sm font-semibold">{cat}</span>
                {c.categoriaSeleccionada === cat && <i className="fa-solid fa-check text-[#B90F0F]"></i>}
              </button>
            ))}
          </div>
        </div>
      )}

      {c.mostrarMarcas && (
        <div role="presentation" className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={() => c.setMostrarMarcas(false)} onKeyDown={(e) => e.key === 'Escape' && c.setMostrarMarcas(false)}>
          <div role="presentation" className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[75vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div><h3 className="text-lg font-bold text-gray-900">Marcas</h3><p className="text-xs text-gray-500 mt-1">Filtra por marca.</p></div>
              <button onClick={() => c.setMostrarMarcas(false)} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"><i className="fa-solid fa-xmark text-xl text-gray-600"></i></button>
            </div>
            <button onClick={() => c.filtrarPorMarca('Todas')} className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${c.marcaSeleccionada === 'Todas' ? 'bg-red-50 text-[#B90F0F]' : 'hover:bg-gray-50 text-gray-700'}`}>
              <span className="text-sm font-semibold">Todas las marcas</span>
              {c.marcaSeleccionada === 'Todas' && <i className="fa-solid fa-check text-[#B90F0F]"></i>}
            </button>
            {c.marcas.map((marca) => (
              <button key={marca} onClick={() => c.filtrarPorMarca(marca)} className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${c.marcaSeleccionada === marca ? 'bg-red-50 text-[#B90F0F]' : 'hover:bg-gray-50 text-gray-700'}`}>
                <span className="text-sm font-semibold">{marca}</span>
                {c.marcaSeleccionada === marca && <i className="fa-solid fa-check text-[#B90F0F]"></i>}
              </button>
            ))}
          </div>
        </div>
      )}

      {c.mostrarFiltros && (
        <div role="presentation" className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={() => c.setMostrarFiltros(false)} onKeyDown={(e) => e.key === 'Escape' && c.setMostrarFiltros(false)}>
          <div role="presentation" className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div><h3 className="text-lg font-bold text-gray-900">Filtrar por precio</h3><p className="text-xs text-gray-500 mt-1">Define un rango de precios.</p></div>
              <button onClick={() => c.setMostrarFiltros(false)} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"><i className="fa-solid fa-xmark text-xl text-gray-600"></i></button>
            </div>
            <p className="text-sm font-bold text-gray-700 mb-3">Precio</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="precio-min" className="block text-xs font-semibold text-gray-500 mb-2">Mínimo</label>
                <input id="precio-min" type="number" placeholder="$0" value={c.precioMin} onChange={(e) => c.setPrecioMin(e.target.value)} className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#B90F0F]" />
              </div>
              <div>
                <label htmlFor="precio-max" className="block text-xs font-semibold text-gray-500 mb-2">Máximo</label>
                <input id="precio-max" type="number" placeholder="$500.000" value={c.precioMax} onChange={(e) => c.setPrecioMax(e.target.value)} className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#B90F0F]" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={c.limpiarFiltros} className="flex-1 h-11 border border-[#B90F0F] rounded-xl text-[#B90F0F] font-bold text-sm hover:bg-red-50 transition">Limpiar</button>
              <button onClick={c.aplicarFiltrosAvanzados} className="flex-1 h-11 bg-[#B90F0F] rounded-xl text-white font-bold text-sm hover:bg-[#9f0d0d] transition">Aplicar filtros</button>
            </div>
          </div>
        </div>
      )}

      {c.mostrarOrden && (
        <div role="presentation" className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={() => c.setMostrarOrden(false)} onKeyDown={(e) => e.key === 'Escape' && c.setMostrarOrden(false)}>
          <div role="presentation" className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div><h3 className="text-lg font-bold text-gray-900">Ordenar productos</h3><p className="text-xs text-gray-500 mt-1">Selecciona el orden que prefieras.</p></div>
              <button onClick={() => c.setMostrarOrden(false)} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"><i className="fa-solid fa-xmark text-xl text-gray-600"></i></button>
            </div>
            {[{ label: 'Nuevo', value: 'Nuevo' }, { label: 'Precio: menor a mayor', value: 'Precio: menor a mayor' }, { label: 'Precio: mayor a menor', value: 'Precio: mayor a menor' }, { label: 'Nombre A-Z', value: 'Nombre A-Z' }].map((op) => (
              <button key={op.value} onClick={() => c.ordenarProductos(op.value)} className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${c.ordenSeleccionado === op.value ? 'bg-red-50 text-[#B90F0F]' : 'hover:bg-gray-50 text-gray-700'}`}>
                <span className="text-sm font-semibold">{op.label}</span>
                {c.ordenSeleccionado === op.value && <i className="fa-solid fa-check text-[#B90F0F]"></i>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};