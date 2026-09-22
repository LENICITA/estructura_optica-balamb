// src/features/client/pages/CarritoCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

export const CarritoCliente = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);

  const CARRITO_KEY = '@carrito';
  const USUARIO_KEY = '@ultimo_usuario_id';

  const cargarCarrito = () => {
    try {
      setLoading(true);

      if (user?.id_usuario) {
        const storedUserId = localStorage.getItem(USUARIO_KEY);
        const userId = String(user.id_usuario);

        if (storedUserId && storedUserId !== userId) {
          localStorage.removeItem(CARRITO_KEY);
          localStorage.removeItem('carrito_seleccionado');
        }

        localStorage.setItem(USUARIO_KEY, userId);
      }

      const carritoGuardado = localStorage.getItem(CARRITO_KEY);
      const datos = carritoGuardado ? JSON.parse(carritoGuardado) : [];

      const carritoConSeleccion = datos.map((item) => ({
        ...item,
        seleccionado: item.seleccionado !== undefined ? item.seleccionado : true,
      }));

      setCarrito(carritoConSeleccion);

      if (carritoConSeleccion.length > 0) {
        setSeleccionarTodos(carritoConSeleccion.every((item) => item.seleccionado));
      }
      setError(null);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCarrito();
  }, []);

  const guardarCarrito = (nuevoCarrito) => {
    try {
      localStorage.setItem(CARRITO_KEY, JSON.stringify(nuevoCarrito));
      setCarrito(nuevoCarrito);

      if (nuevoCarrito.length > 0) {
        setSeleccionarTodos(nuevoCarrito.every((item) => item.seleccionado));
      } else {
        setSeleccionarTodos(false);
      }
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

  const toggleSeleccionarTodos = () => {
    const nuevoEstado = !seleccionarTodos;
    setSeleccionarTodos(nuevoEstado);
    const nuevoCarrito = carrito.map((item) => ({ ...item, seleccionado: nuevoEstado }));
    guardarCarrito(nuevoCarrito);
  };

  const toggleSeleccionItem = (id) => {
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, seleccionado: !item.seleccionado } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  const cambiarCantidad = (id, delta) => {
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  const eliminarItem = (id) => {
    const producto = carrito.find((item) => item.id === id);
    if (!window.confirm(`¿Eliminar "${producto?.nombre}" del carrito?`)) return;

    const nuevoCarrito = carrito.filter((item) => item.id !== id);
    guardarCarrito(nuevoCarrito);
  };

  const eliminarSeleccionados = () => {
    const seleccionados = carrito.filter((item) => item.seleccionado);
    if (seleccionados.length === 0) return alert('No hay productos seleccionados');
    if (!window.confirm(`¿Eliminar ${seleccionados.length} producto(s)?`)) return;

    const nuevoCarrito = carrito.filter((item) => !item.seleccionado);
    guardarCarrito(nuevoCarrito);
  };

  const vaciarCarrito = () => {
    if (carrito.length === 0) return alert('El carrito ya está vacío');
    if (!window.confirm('¿Eliminar todos los productos del carrito?')) return;
    guardarCarrito([]);
  };

  const irACrearPedido = () => {
    const productosSeleccionados = carrito.filter((item) => item.seleccionado);

    if (productosSeleccionados.length === 0) {
      return alert('Selecciona al menos un producto para continuar');
    }

    localStorage.setItem('carrito_seleccionado', JSON.stringify(productosSeleccionados));
    navigate('/cliente/crear-pedido');
  };

  const productosSeleccionados = carrito.filter((item) => item.seleccionado);
  const total = productosSeleccionados.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando carrito...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-5 bg-gray-100">
        <p className="text-red-500 text-base mb-4">{error}</p>
        <button onClick={cargarCarrito} className="bg-[#B90F0F] text-white px-6 py-2.5 rounded-lg font-semibold">
          Reintentar
        </button>
      </div>
    );
  }

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-5 bg-gray-100">
        <i className="fa-solid fa-cart-shopping text-gray-300 text-[80px]"></i>
        <p className="mt-4 text-xl font-bold text-gray-800">Tu carrito está vacío</p>
        <p className="mt-2 text-sm text-gray-400">Agrega productos desde la tienda</p>
        <button
          onClick={() => navigate('/catalogo')}
          className="mt-5 bg-[#B90F0F] text-white px-8 py-3 rounded-full font-semibold text-sm"
        >
          Seguir comprando
        </button>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-cart-shopping text-2xl text-[#B90F0F]"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Mi carrito
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Revisa tus productos antes de crear tu pedido.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500">Productos</p>
              <p className="text-lg font-bold text-gray-900">
                {totalItems}
              </p>
            </div>
          </div>
        </div>

        {/* HERRAMIENTAS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <button
              onClick={toggleSeleccionarTodos}
              className="flex items-center gap-3 text-left"
            >
              <div
                className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition ${
                  seleccionarTodos
                    ? 'bg-[#B90F0F] border-[#B90F0F]'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {seleccionarTodos && (
                  <i className="fa-solid fa-check text-white text-xs"></i>
                )}
              </div>

              <span className="text-sm font-semibold text-gray-700">
                Seleccionar todos
              </span>
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={eliminarSeleccionados}
                className="flex items-center gap-2 border border-gray-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition"
              >
                <i className="fa-solid fa-trash text-xs"></i>
                Eliminar seleccionados
              </button>

              <button
                onClick={vaciarCarrito}
                className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
              >
                <i className="fa-solid fa-trash-can text-xs"></i>
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LISTA DE PRODUCTOS */}
          <div className="xl:col-span-2 space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Productos
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {productosSeleccionados.length} seleccionados de {totalItems}
                </p>
              </div>
            </div>

            {carrito.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border shadow-sm p-4 sm:p-5 transition ${
                  item.seleccionado
                    ? 'border-[#B90F0F]'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4">

                  {/* CHECK + IMAGEN */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSeleccionItem(item.id)}
                      className="shrink-0"
                    >
                      <div
                        className={`w-5 h-5 border-2 rounded-md flex items-center justify-center ${
                          item.seleccionado
                            ? 'bg-[#B90F0F] border-[#B90F0F]'
                            : 'border-gray-300'
                        }`}
                      >
                        {item.seleccionado && (
                          <i className="fa-solid fa-check text-white text-xs"></i>
                        )}
                      </div>
                    </button>

                    <img
                      src={item.imagen || 'https://via.placeholder.com/80'}
                      alt={item.nombre}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 object-contain border border-gray-100"
                    />
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                          {item.nombre}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            {item.color || 'Sin color'}
                          </span>

                          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            {item.material || 'Sin material'}
                          </span>
                        </div>

                        <p className="text-sm text-[#B90F0F] font-semibold mt-3">
                          ${item.precio.toLocaleString()} c/u
                        </p>
                      </div>

                      {/* ELIMINAR */}
                      <button
                        onClick={() => eliminarItem(item.id)}
                        className="self-start w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Eliminar producto"
                      >
                        <i className="fa-solid fa-xmark text-lg"></i>
                      </button>
                    </div>

                    {/* CANTIDAD + SUBTOTAL */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-gray-100">

                      <div>
                        <p className="text-xs text-gray-400 mb-2">
                          Cantidad
                        </p>

                        <div className="flex items-center border border-gray-300 rounded-xl h-10 w-fit overflow-hidden">
                          <button
                            onClick={() => cambiarCantidad(item.id, -1)}
                            disabled={item.cantidad <= 1}
                            className={`w-10 h-full flex items-center justify-center hover:bg-gray-50 ${
                              item.cantidad <= 1
                                ? 'opacity-40 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            <i className="fa-solid fa-minus text-gray-700 text-xs"></i>
                          </button>

                          <span className="w-10 text-center text-sm font-bold text-gray-900">
                            {item.cantidad}
                          </span>

                          <button
                            onClick={() => cambiarCantidad(item.id, 1)}
                            className="w-10 h-full flex items-center justify-center hover:bg-gray-50"
                          >
                            <i className="fa-solid fa-plus text-gray-700 text-xs"></i>
                          </button>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs text-gray-400">
                          Subtotal
                        </p>

                        <p className="text-lg font-bold text-gray-900 mt-1">
                          ${(item.precio * item.cantidad).toLocaleString()}
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 xl:sticky xl:top-6">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-receipt text-[#B90F0F]"></i>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Resumen del pedido
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Productos seleccionados
                  </p>
                </div>
              </div>

              <div className="space-y-4">

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Productos
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {productosSeleccionados.length}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Unidades
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {productosSeleccionados.reduce(
                      (sum, item) => sum + item.cantidad,
                      0
                    )}
                  </span>
                </div>

                <div className="h-px bg-gray-200"></div>

                <div className="flex justify-between items-end gap-4">
                  <span className="text-sm font-semibold text-gray-700">
                    Total
                  </span>

                  <span className="text-2xl font-black text-[#B90F0F]">
                    ${total.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={irACrearPedido}
                  disabled={productosSeleccionados.length === 0}
                  className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition ${
                    productosSeleccionados.length === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#B90F0F] text-white hover:bg-[#9f0d0d]'
                  }`}
                >
                  <i className="fa-solid fa-arrow-right"></i>
                  Crear pedido
                </button>

                {productosSeleccionados.length === 0 && (
                  <p className="text-xs text-red-500 text-center">
                    Selecciona al menos un producto para continuar.
                  </p>
                )}

                <button
                  onClick={() => navigate('/catalogo')}
                  className="w-full h-11 border border-gray-300 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                  Seguir comprando
                </button>
              </div>

              <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4">
                <div className="flex gap-3">
                  <i className="fa-solid fa-circle-info text-[#B90F0F] mt-0.5"></i>

                  <p className="text-xs text-gray-600 leading-5">
                    Solo los productos seleccionados serán incluidos al crear
                    tu pedido.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CarritoCliente;