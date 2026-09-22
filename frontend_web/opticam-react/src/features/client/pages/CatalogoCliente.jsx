// src/features/client/pages/CatalogoCliente.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductController } from '../../../core/controllers/ProductController';

export const CatalogoCliente = () => {
  const navigate = useNavigate();
  const productController = new ProductController();

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [mostrarMarcas, setMostrarMarcas] = useState(false);
  const [mostrarOrden, setMostrarOrden] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [marcas, setMarcas] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('Todas');
  const [ordenSeleccionado, setOrdenSeleccionado] = useState('Nuevo');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarMarcas();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productController.getProductos();
      setProductos(data);
      const ordenados = [...data].sort((a, b) => b.id_producto - a.id_producto);
      setProductosFiltrados(ordenados);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await productController.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const cargarMarcas = async () => {
    try {
      const data = await productController.getMarcas();
      setMarcas(data);
    } catch (error) {
      console.error('Error cargando marcas:', error);
    }
  };

  useEffect(() => {
    const texto = busqueda.trim();

    if (texto === '') {
      let base = categoriaSeleccionada === 'Todos'
        ? [...productos]
        : productos.filter((p) => p.tipo_categoria === categoriaSeleccionada);

      const ordenados = ordenar(base, ordenSeleccionado);
      setProductosFiltrados(ordenados);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setBuscando(true);
        const resultados = await productController.buscarProductos(texto);
        let base = categoriaSeleccionada === 'Todos'
          ? resultados
          : resultados.filter((p) => p.tipo_categoria === categoriaSeleccionada);

        setProductosFiltrados(ordenar(base, ordenSeleccionado));
      } catch (error) {
        console.error('Error buscando productos:', error);
        setProductosFiltrados([]);
      } finally {
        setBuscando(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [busqueda, productos, categoriaSeleccionada, ordenSeleccionado]);

  const ordenar = (lista, orden) => {
    const copy = [...lista];
    switch (orden) {
      case 'Nuevo': return copy.sort((a, b) => b.id_producto - a.id_producto);
      case 'Precio: menor a mayor': return copy.sort((a, b) => a.precio - b.precio);
      case 'Precio: mayor a menor': return copy.sort((a, b) => b.precio - a.precio);
      case 'Nombre A-Z': return copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
      default: return copy;
    }
  };

  const filtrarPorCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarCategorias(false);
    let base = categoria === 'Todos' ? [...productos] : productos.filter((p) => p.tipo_categoria === categoria);
    setProductosFiltrados(ordenar(base, ordenSeleccionado));
  };

  const filtrarPorMarca = (marca) => {
    setMarcaSeleccionada(marca);
    setMostrarMarcas(false);
    if (marca === 'Todas') setProductosFiltrados(productos);
    else setProductosFiltrados(productos.filter((p) => p.marca === marca));
  };

  const ordenarProductos = (tipo) => {
    setOrdenSeleccionado(tipo);
    setMostrarOrden(false);
    let base = categoriaSeleccionada === 'Todos'
      ? [...productos]
      : productos.filter((p) => p.tipo_categoria === categoriaSeleccionada);
    setProductosFiltrados(ordenar(base, tipo));
  };

  const aplicarFiltrosAvanzados = async () => {
    try {
      setLoading(true);
      const filtros = {};
      if (precioMin && !isNaN(Number(precioMin))) filtros.precio_min = Number(precioMin);
      if (precioMax && !isNaN(Number(precioMax))) filtros.precio_max = Number(precioMax);

      const resultados = await productController.filtrarProductos(filtros);
      setProductosFiltrados(resultados);
      setMostrarFiltros(false);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
      alert('Error al aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setPrecioMin('');
    setPrecioMax('');
    cargarProductos();
    setMostrarFiltros(false);
  };

  const agregarAlCarrito = (producto) => {
    try {
      const carritoGuardado = localStorage.getItem('@carrito');
      const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];

      const indexExistente = carrito.findIndex((item) => item.id_producto === producto.id_producto);

      if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += 1;
      } else {
        carrito.push({
          id: Date.now(),
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          imagen: producto.imagen_url || producto.imagen || '',
          color: producto.color,
          material: producto.material,
          seleccionado: true,
        });
      }

      localStorage.setItem('@carrito', JSON.stringify(carrito));
      alert(`✅ ${producto.nombre} agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('No se pudo agregar el producto');
    }
  };

  if (loading) {
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
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-glasses text-2xl text-[#B90F0F]"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Catálogo de productos
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Encuentra monturas, gafas de sol y accesorios.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="w-full lg:w-auto flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Volver
            </button>
          </div>
        </div>

        {/* BUSCADOR Y FILTROS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col lg:flex-row gap-4">

            {/* BUSCADOR */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Buscar producto
              </label>

              <div className="flex items-center h-12 border border-gray-300 rounded-xl px-4 bg-white focus-within:border-[#B90F0F] transition">
                <i className="fa-solid fa-magnifying-glass text-gray-400"></i>

                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  maxLength={100}
                  className="flex-1 outline-none text-sm ml-3 text-gray-700"
                />

                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fa-solid fa-circle-xmark"></i>
                  </button>
                )}

                {buscando && (
                  <div className="ml-3 w-4 h-4 border-2 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>

            {/* CATEGORÍAS */}
            <div className="lg:w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Categoría
              </label>

              <button
                onClick={() => setMostrarCategorias(true)}
                className="w-full h-12 flex items-center justify-between gap-2 border border-gray-300 rounded-xl px-4 hover:border-[#B90F0F] transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <i className="fa-solid fa-grip text-[#B90F0F]"></i>
                  <span className="text-sm text-gray-700 truncate">
                    {categoriaSeleccionada}
                  </span>
                </div>

                <i className="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
              </button>
            </div>

            {/* MARCAS */}
            <div className="lg:w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Marca
              </label>

              <button
                onClick={() => setMostrarMarcas(true)}
                className="w-full h-12 flex items-center justify-between gap-2 border border-gray-300 rounded-xl px-4 hover:border-[#B90F0F] transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <i className="fa-solid fa-tag text-[#B90F0F]"></i>
                  <span className="text-sm text-gray-700 truncate">
                    {marcaSeleccionada}
                  </span>
                </div>

                <i className="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
              </button>
            </div>

            {/* FILTROS */}
            <div className="lg:w-auto">
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Más filtros
              </label>

              <button
                onClick={() => setMostrarFiltros(true)}
                className="w-full lg:w-12 h-12 flex items-center justify-center gap-2 border border-[#B90F0F] text-[#B90F0F] rounded-xl hover:bg-red-50 transition"
              >
                <i className="fa-solid fa-sliders"></i>
                <span className="lg:hidden text-sm font-semibold">
                  Precio
                </span>
              </button>
            </div>
          </div>

          {/* ORDEN */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {buscando ? (
                'Buscando productos...'
              ) : (
                <>
                  Mostrando{' '}
                  <span className="font-bold text-gray-900">
                    {productosFiltrados.length}
                  </span>{' '}
                  de{' '}
                  <span className="font-bold text-gray-900">
                    {productos.length}
                  </span>{' '}
                  productos
                </>
              )}
            </p>

            <button
              onClick={() => setMostrarOrden(true)}
              className="flex items-center justify-between sm:justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <i className="fa-solid fa-arrow-up-arrow-down text-[#B90F0F]"></i>
              <span>
                Ordenar: <strong>{ordenSeleccionado}</strong>
              </span>
              <i className="fa-solid fa-chevron-down text-gray-400 text-xs"></i>
            </button>
          </div>
        </div>

        {/* PRODUCTOS */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 sm:p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
              <i className="fa-solid fa-magnifying-glass text-gray-300 text-3xl"></i>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mt-5">
              No encontramos productos
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Intenta con otro término de búsqueda o modifica los filtros.
            </p>

            <button
              onClick={limpiarFiltros}
              className="mt-5 border border-[#B90F0F] text-[#B90F0F] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-50 transition"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Productos
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Selecciona un producto para consultar sus detalles.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {productosFiltrados.map((item) => {
                const imagenProducto =
                  item.imagen_url ||
                  item.imagen_thumbnail ||
                  item.imagen;

                return (
                  <div
                    key={item.id_producto}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition group"
                  >
                    {/* IMAGEN */}
                    <button
                      onClick={() =>
                        navigate(`/producto/${item.id_producto}`)
                      }
                      className="w-full h-56 bg-gray-50 flex items-center justify-center relative overflow-hidden"
                    >
                      {imagenProducto ? (
                        <img
                          src={imagenProducto}
                          alt={item.nombre}
                          className="w-[90%] h-[90%] object-contain group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <i className="fa-solid fa-image text-gray-300 text-4xl"></i>
                          <span className="text-xs text-gray-400 mt-2">
                            Sin imagen
                          </span>
                        </div>
                      )}

                      <span className="absolute top-3 left-3 bg-[#B90F0F] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        Nuevo
                      </span>
                    </button>

                    {/* INFORMACIÓN */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[40px]">
                          {item.nombre}
                        </h3>
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-600">
                            Marca:
                          </span>{' '}
                          {item.marca || 'Sin marca'}
                        </p>

                        <p className="text-xs text-gray-500">
                          <span className="font-semibold text-gray-600">
                            Categoría:
                          </span>{' '}
                          {item.tipo_categoria || 'Producto'}
                        </p>
                      </div>

                      <p className="text-xl font-black text-[#B90F0F] mt-3">
                        {item.precioFormateado}
                      </p>

                      {/* ACCIONES */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() =>
                            navigate(`/producto/${item.id_producto}`)
                          }
                          className="flex-1 h-10 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                        >
                          <i className="fa-solid fa-eye text-gray-700 text-xs"></i>
                          <span className="text-xs text-gray-700 font-bold">
                            Ver detalle
                          </span>
                        </button>

                        <button
                          onClick={() => agregarAlCarrito(item)}
                          className="w-10 h-10 rounded-xl bg-[#B90F0F] flex items-center justify-center hover:bg-[#9f0d0d] transition"
                          title="Agregar al carrito"
                        >
                          <i className="fa-solid fa-cart-shopping text-white"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* MODAL CATEGORÍAS */}
      {mostrarCategorias && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
          onClick={() => setMostrarCategorias(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[75vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Categorías
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona una categoría.
                </p>
              </div>

              <button
                onClick={() => setMostrarCategorias(false)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl text-gray-600"></i>
              </button>
            </div>

            <button
              onClick={() => filtrarPorCategoria('Todos')}
              className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${
                categoriaSeleccionada === 'Todos'
                  ? 'bg-red-50 text-[#B90F0F]'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-sm font-semibold">Todos</span>

              {categoriaSeleccionada === 'Todos' && (
                <i className="fa-solid fa-check text-[#B90F0F]"></i>
              )}
            </button>

            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => filtrarPorCategoria(categoria)}
                className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${
                  categoriaSeleccionada === categoria
                    ? 'bg-red-50 text-[#B90F0F]'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-sm font-semibold">
                  {categoria}
                </span>

                {categoriaSeleccionada === categoria && (
                  <i className="fa-solid fa-check text-[#B90F0F]"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL MARCAS */}
      {mostrarMarcas && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
          onClick={() => setMostrarMarcas(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[75vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Marcas
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Filtra los productos por marca.
                </p>
              </div>

              <button
                onClick={() => setMostrarMarcas(false)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl text-gray-600"></i>
              </button>
            </div>

            <button
              onClick={() => filtrarPorMarca('Todas')}
              className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${
                marcaSeleccionada === 'Todas'
                  ? 'bg-red-50 text-[#B90F0F]'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="text-sm font-semibold">
                Todas las marcas
              </span>

              {marcaSeleccionada === 'Todas' && (
                <i className="fa-solid fa-check text-[#B90F0F]"></i>
              )}
            </button>

            {marcas.map((marca) => (
              <button
                key={marca}
                onClick={() => filtrarPorMarca(marca)}
                className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${
                  marcaSeleccionada === marca
                    ? 'bg-red-50 text-[#B90F0F]'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-sm font-semibold">
                  {marca}
                </span>

                {marcaSeleccionada === marca && (
                  <i className="fa-solid fa-check text-[#B90F0F]"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FILTROS */}
      {mostrarFiltros && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
          onClick={() => setMostrarFiltros(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Filtrar por precio
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Define un rango de precios.
                </p>
              </div>

              <button
                onClick={() => setMostrarFiltros(false)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl text-gray-600"></i>
              </button>
            </div>

            <p className="text-sm font-bold text-gray-700 mb-3">
              Precio
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Mínimo
                </label>

                <input
                  type="number"
                  placeholder="$0"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#B90F0F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">
                  Máximo
                </label>

                <input
                  type="number"
                  placeholder="$500.000"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#B90F0F]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={limpiarFiltros}
                className="flex-1 h-11 border border-[#B90F0F] rounded-xl text-[#B90F0F] font-bold text-sm hover:bg-red-50 transition"
              >
                Limpiar
              </button>

              <button
                onClick={aplicarFiltrosAvanzados}
                className="flex-1 h-11 bg-[#B90F0F] rounded-xl text-white font-bold text-sm hover:bg-[#9f0d0d] transition"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ORDEN */}
      {mostrarOrden && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
          onClick={() => setMostrarOrden(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Ordenar productos
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona el orden que prefieras.
                </p>
              </div>

              <button
                onClick={() => setMostrarOrden(false)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl text-gray-600"></i>
              </button>
            </div>

            {[
              { label: 'Nuevo', value: 'Nuevo' },
              {
                label: 'Precio: menor a mayor',
                value: 'Precio: menor a mayor',
              },
              {
                label: 'Precio: mayor a menor',
                value: 'Precio: mayor a menor',
              },
              {
                label: 'Nombre A-Z',
                value: 'Nombre A-Z',
              },
            ].map((op) => (
              <button
                key={op.value}
                onClick={() => ordenarProductos(op.value)}
                className={`w-full flex justify-between items-center p-4 rounded-xl mb-2 transition ${
                  ordenSeleccionado === op.value
                    ? 'bg-red-50 text-[#B90F0F]'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-sm font-semibold">
                  {op.label}
                </span>

                {ordenSeleccionado === op.value && (
                  <i className="fa-solid fa-check text-[#B90F0F]"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoCliente;