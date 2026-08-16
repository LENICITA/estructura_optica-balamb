import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const CarritoCliente = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  // CARGAR CARRITO DESDE LOCALSTORAGE
  useEffect(() => {
    cargarCarrito();
  }, []);

  const cargarCarrito = () => {
    try {
      setLoading(true);
      const carritoGuardado = JSON.parse(localStorage.getItem('carrito') || '[]');
      
      // Asegurar que cada item tenga seleccionado: true por defecto
      const carritoConSeleccion = carritoGuardado.map(item => ({
        ...item,
        seleccionado: item.seleccionado !== undefined ? item.seleccionado : true
      }));
      
      setCarrito(carritoConSeleccion);
      
      // Actualizar seleccionar todos
      if (carritoConSeleccion.length > 0) {
        setSeleccionarTodos(carritoConSeleccion.every(item => item.seleccionado));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  // GUARDAR CARRITO EN LOCALSTORAGE
  const guardarCarrito = (nuevoCarrito) => {
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    setCarrito(nuevoCarrito);
    
    // Actualizar seleccionar todos
    if (nuevoCarrito.length > 0) {
      setSeleccionarTodos(nuevoCarrito.every(item => item.seleccionado));
    } else {
      setSeleccionarTodos(false);
    }
  };

  // FUNCIONES DEL CARRITO 
  const toggleSeleccionarTodos = () => {
    const nuevoEstado = !seleccionarTodos;
    setSeleccionarTodos(nuevoEstado);
    const nuevoCarrito = carrito.map(item => ({ ...item, seleccionado: nuevoEstado }));
    guardarCarrito(nuevoCarrito);
  };

  const toggleSeleccionItem = (id) => {
    const nuevoCarrito = carrito.map(item =>
      item.id === id ? { ...item, seleccionado: !item.seleccionado } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  const cambiarCantidad = (id, delta) => {
    const nuevoCarrito = carrito.map(item =>
      item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  const eliminarItem = (id) => {
    const producto = carrito.find(item => item.id === id);
    if (window.confirm(`¿Eliminar "${producto?.nombre}" del carrito?`)) {
      const nuevoCarrito = carrito.filter(item => item.id !== id);
      guardarCarrito(nuevoCarrito);
    }
  };

  const eliminarSeleccionados = () => {
    const seleccionados = carrito.filter(item => item.seleccionado);
    if (seleccionados.length === 0) {
      alert('No hay productos seleccionados');
      return;
    }
    if (window.confirm(`¿Eliminar ${seleccionados.length} producto(s) seleccionado(s)?`)) {
      const nuevoCarrito = carrito.filter(item => !item.seleccionado);
      guardarCarrito(nuevoCarrito);
    }
  };

  const vaciarCarrito = () => {
    if (carrito.length === 0) {
      alert('El carrito ya está vacío');
      return;
    }
    if (window.confirm('¿Vaciar todo el carrito? Esta acción no se puede deshacer.')) {
      guardarCarrito([]);
    }
  };

  const irAlCatalogo = () => {
    navigate('/catalogo');
  };

  // PROCESAR PAGO
  const procesarPago = () => {
    const productosSeleccionados = carrito.filter(item => item.seleccionado);
    
    if (productosSeleccionados.length === 0) {
      alert('Selecciona al menos un producto para continuar');
      return;
    }

    setProcesandoPago(true);

    try {
      
      // Guardar productos seleccionados en localStorage
      localStorage.setItem('carrito_compra', JSON.stringify(productosSeleccionados));
      
      // También guardar el total calculado
      const total = productosSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      localStorage.setItem('total_compra', JSON.stringify(total));

      // Verificar que se guardó correctamente
      const verificar = localStorage.getItem('carrito_compra');

      // Redirigir al checkout
      navigate('/checkout');

    } catch (err) {
      console.error('Error al procesar pago:', err);
      alert('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setProcesandoPago(false);
    }
  };

  // CALCULAR TOTALES
  const productosSeleccionados = carrito.filter(item => item.seleccionado);
  const total = productosSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);

  // RENDERIZADO CONDICIONAL
  
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto my-10 px-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto my-10 px-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p>{error}</p>
          <button 
            onClick={cargarCarrito}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (carrito.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto my-10 px-5">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="text-center py-20">
            <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-5"></i>
            <h3 className="text-2xl text-gray-700 mb-2.5">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-6">¡Agrega productos desde la tienda!</p>
            <button 
              onClick={irAlCatalogo}
              className="bg-[#B90F0F] text-white border-none py-3 px-7 rounded-full text-sm font-semibold cursor-pointer transition-all hover:bg-[#8a0b0b]"
            >
              <i className="fa-solid fa-store mr-2"></i> Seguir comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER PRINCIPAL
  return (
    <div className="max-w-[1200px] mx-auto my-10 px-5">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <h1 className="text-2xl p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 m-0 text-gray-800">
          <i className="fa-solid fa-cart-shopping text-[#B90F0F] mr-2"></i> Mi Carrito
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
          </span>
        </h1>

        {/* Header del carrito */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 flex-wrap gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-500">
            <input 
              type="checkbox" 
              checked={seleccionarTodos} 
              onChange={toggleSeleccionarTodos}
              className="w-4 h-4 cursor-pointer accent-[#B90F0F]"
            />
            Seleccionar todos
          </label>
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={eliminarSeleccionados} 
              className="bg-transparent border-none text-red-500 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all hover:bg-red-50"
            >
              <i className="fa-solid fa-trash-can mr-1"></i> Eliminar seleccionados
            </button>
            <button 
              onClick={vaciarCarrito} 
              className="bg-transparent border-none text-gray-500 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all hover:bg-gray-100"
            >
              <i className="fa-solid fa-broom mr-1"></i> Vaciar carrito
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="divide-y divide-gray-100">
          {carrito.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center gap-4 p-5 border-b border-gray-100 transition-all flex-wrap md:flex-nowrap ${item.seleccionado ? 'bg-green-50/30' : ''}`}
            >
              <div className="w-12">
                <input 
                  type="checkbox" 
                  checked={item.seleccionado} 
                  onChange={() => toggleSeleccionItem(item.id)}
                  className="w-5 h-5 cursor-pointer accent-[#B90F0F]"
                />
              </div>
              <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                <img 
                  src={item.imagen || '/img/default.png'} 
                  alt={item.nombre} 
                  className="max-w-[90%] max-h-[90%] object-contain"
                  onError={(e) => e.target.src = '/img/default.png'}
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <h3 className="text-base font-semibold text-gray-800 mb-2">{item.nombre}</h3>
                <div className="flex gap-4 mb-2 flex-wrap">
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                    {item.color || 'Sin color'}
                  </span>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">
                    {item.material || 'Sin material'}
                  </span>
                </div>
                <div className="text-sm text-[#B90F0F] font-semibold">
                  ${item.precio.toLocaleString()} c/u
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => cambiarCantidad(item.id, -1)} 
                  disabled={item.cantidad <= 1} 
                  className="w-8 h-8 bg-white border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-[#B90F0F] hover:border-[#B90F0F] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-minus text-sm"></i>
                </button>
                <span className="text-base font-semibold min-w-[30px] text-center">{item.cantidad}</span>
                <button 
                  onClick={() => cambiarCantidad(item.id, 1)} 
                  className="w-8 h-8 bg-white border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-[#B90F0F] hover:border-[#B90F0F] hover:text-white"
                >
                  <i className="fa-solid fa-plus text-sm"></i>
                </button>
              </div>
              <div className="min-w-[100px] text-right">
                <span className="text-base font-bold text-gray-800">
                  ${(item.precio * item.cantidad).toLocaleString()}
                </span>
              </div>
              <div>
                <button 
                  onClick={() => eliminarItem(item.id)} 
                  className="bg-transparent border-none text-gray-400 cursor-pointer text-lg p-2 rounded-lg transition-all hover:text-red-500 hover:bg-red-50"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer del carrito */}
        <div className="bg-gray-50 p-5 border-t border-gray-200 flex justify-between items-center flex-wrap gap-5">
          <div>
            <div className="text-sm text-gray-500">
              {productosSeleccionados.length} de {totalItems} productos seleccionados
            </div>
            <button 
              onClick={irAlCatalogo}
              className="text-[#B90F0F] text-sm hover:underline mt-1"
            >
              <i className="fa-solid fa-arrow-left mr-1"></i> Seguir comprando
            </button>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total a pagar</div>
            <div className="text-2xl font-bold text-[#B90F0F]">
              ${total.toLocaleString()}
            </div>
            <button 
              onClick={procesarPago} 
              className="bg-[#B90F0F] text-white border-none py-3 px-8 rounded-full text-base font-semibold cursor-pointer transition-all mt-2.5 hover:bg-[#8a0b0b] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={procesandoPago || productosSeleccionados.length === 0}
            >
              {procesandoPago ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-credit-card mr-2"></i> Proceder al pago
                </>
              )}
            </button>
            {productosSeleccionados.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Selecciona al menos un producto
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoCliente;