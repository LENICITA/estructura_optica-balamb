import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ControlPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedidoActual, setPedidoActual] = useState(null);
  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const estadosOrden = ['Pendiente', 'Abonado', 'Listo', 'Pagado', 'En Proceso', 'Enviado', 'Entregado', 'Cancelado'];
  const estadosNombres = {
    'Pendiente': 'Pendiente',
    'Abonado': 'Abonado 50%',
    'Listo': 'Listo para pagar',
    'Pagado': 'Pagado',
    'En Proceso': 'En preparación',
    'Enviado': 'En camino',
    'Entregado': 'Entregado',
    'Cancelado': 'Cancelado'
  };
  const estadosIconos = {
    'Pendiente': 'fa-clock',
    'Abonado': 'fa-money-bill',
    'Listo': 'fa-check-circle',
    'Pagado': 'fa-check-circle',
    'En Proceso': 'fa-boxes',
    'Enviado': 'fa-truck',
    'Entregado': 'fa-home',
    'Cancelado': 'fa-times-circle'
  };
  const estadosColores = {
    'Pendiente': 'bg-yellow-500',
    'Abonado': 'bg-blue-500',
    'Listo': 'bg-green-500',
    'Pagado': 'bg-green-600',
    'En Proceso': 'bg-orange-500',
    'Enviado': 'bg-purple-500',
    'Entregado': 'bg-green-700',
    'Cancelado': 'bg-red-500'
  };

  const estacionesRecorrido = [
    { nombre: "Centro de distribución - Bogotá", icono: "fa-warehouse" },
    { nombre: "Centro de clasificación", icono: "fa-sitemap" },
    { nombre: "Oficina de reparto local", icono: "fa-truck-fast" },
    { nombre: "Ruta de entrega", icono: "fa-road" },
    { nombre: "Dirección del cliente", icono: "fa-home" }
  ];


  // CARGAR PEDIDOS DESDE LA API
  useEffect(() => {
    cargarPedidosDelCliente();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const cargarPedidosDelCliente = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get('/pedidos/mis-pedidos');

      let pedidosData = response.data;
      if (response.data && response.data.data) {
        pedidosData = response.data.data;
      }
      if (response.data && response.data.pedidos) {
        pedidosData = response.data.pedidos;
      }

      if (!Array.isArray(pedidosData)) {
        pedidosData = [];
      }

      // Mapear datos incluyendo productos
      const pedidosMapeados = pedidosData.map(p => ({
        id: p.id_pedido || p.id,
        fecha: p.fecha_pedido || p.fecha,
        estado: p.estado || 'Pendiente',
        total: p.total || 0,
        direccion: p.direccion_entrega || p.direccion,
        fecha_estimada: p.fecha_estimada,
        // Asegurar que productos sea un array
        productos: p.productos && Array.isArray(p.productos) ? p.productos.map(prod => ({
          nombre: prod.nombre || prod.producto_nombre || 'Producto',
          cantidad: prod.cant_productos || prod.cantidad || 1,
          precio: prod.precio || 0,
          imagen: prod.imagen || '/img/default.png'
        })) : [],
        ...p
      }));
    
      setPedidosDisponibles(pedidosMapeados);

      // Seleccionar pedido
      if (pedidosMapeados.length > 0) {
        if (id) {
          const pedidoEncontrado = pedidosMapeados.find(p => p.id == id);
          setPedidoActual(pedidoEncontrado || pedidosMapeados[0]);
        } else {
          setPedidoActual(pedidosMapeados[0]);
        }
      }

    } catch (err) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // ACTUALIZAR ESTADO DEL PEDIDO (SIMULADO)
  const actualizarPedido = async () => {
    if (!pedidoActual) return;

    try {
      setLoading(true);      
      // Recargar desde la API
      await cargarPedidosDelCliente();
      
      alert('Estado actualizado correctamente');
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPedido = (e) => {
    const pedidoId = parseInt(e.target.value);
    const pedido = pedidosDisponibles.find(p => p.id === pedidoId);
    setPedidoActual(pedido);
  };


  // RENDERIZADO CONDICIONAL

  if (loading) {
    return (
      <div className="control-pedido-main">
        <div className="control-container">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando pedidos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="control-pedido-main">
        <div className="control-container">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={cargarPedidosDelCliente}
              className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pedidosDisponibles.length === 0) {
    return (
      <div className="control-pedido-main">
        <div className="control-container">
          <div className="text-center py-16 bg-white rounded-2xl shadow-md">
            <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-700">No tienes pedidos</h2>
            <p className="text-gray-500 mt-2">Aún no has realizado ninguna compra.</p>
            <button 
              onClick={() => navigate('/catalogo')}
              className="mt-6 bg-[#B90F0F] text-white px-8 py-3 rounded-full hover:bg-[#8a0b0b] transition"
            >
              <i className="fa-solid fa-store mr-2"></i> Ir a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const estadoActual = pedidoActual?.estado || 'Pendiente';
  const estadoIndex = estadosOrden.indexOf(estadoActual);

  return (
    <div className="control-pedido-main max-w-[1200px] mx-auto p-5">
      <div className="control-container bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="control-header border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            <i className="fa-solid fa-truck-fast text-[#B90F0F] mr-3"></i>
            Seguimiento de Pedido
          </h1>
          <p className="text-gray-500 mt-1">Visualiza el estado actual de tu pedido en tiempo real</p>
        </div>

        {/* Selector de pedido */}
        {pedidosDisponibles.length > 1 && (
          <div className="selector-pedido mb-6">
            <label className="block font-semibold text-sm mb-2 text-gray-700">
              Selecciona tu pedido:
            </label>
            <select 
              onChange={seleccionarPedido} 
              value={pedidoActual?.id || ''}
              className="w-full max-w-md p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
            >
              <option value="">Selecciona un pedido</option>
              {pedidosDisponibles.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.id} - {p.fecha ? new Date(p.fecha).toLocaleDateString('es-CO') : 'N/A'} - ${(p.total || 0).toLocaleString('es-CO')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tarjeta principal del pedido */}
        {pedidoActual && (
          <>
            {/* Información del pedido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Número de pedido</p>
                <p className="text-lg font-bold text-[#B90F0F]">#{pedidoActual.id}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Fecha del pedido</p>
                <p className="text-lg font-semibold">
                  {pedidoActual.fecha ? new Date(pedidoActual.fecha).toLocaleDateString('es-CO') : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-lg font-bold text-[#B90F0F]">
                  ${(pedidoActual.total || 0).toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            {/* Estado actual */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Estado actual</p>
              <div className="flex items-center gap-3">
                <span className={`${estadosColores[estadoActual] || 'bg-gray-500'} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                  <i className={`fa-solid ${estadosIconos[estadoActual] || 'fa-clock'} mr-2`}></i>
                  {estadosNombres[estadoActual] || estadoActual}
                </span>
                <span className="text-sm text-gray-400">
                  {estadoIndex + 1} de {estadosOrden.length}
                </span>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-[#B90F0F] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${((estadoIndex + 1) / estadosOrden.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Inicio</span>
                <span>{Math.round(((estadoIndex + 1) / estadosOrden.length) * 100)}%</span>
                <span>Completado</span>
              </div>
            </div>

            {/* Detalle del pedido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Dirección de entrega</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {pedidoActual.direccion || 'No especificada'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Fecha estimada</h3>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {pedidoActual.fecha_estimada || 'Por confirmar'}
                </p>
              </div>
            </div>

            {/* Productos */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Productos</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                {pedidoActual.productos && pedidoActual.productos.length > 0 ? (
                  <div className="space-y-2">
                    {pedidoActual.productos.map((producto, index) => (
                      <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0">
                        <span className="text-gray-700">{producto.nombre || 'Producto'}</span>
                        <span className="text-gray-500">x{producto.cantidad || 1}</span>
                        <span className="font-semibold text-[#B90F0F]">
                          ${((producto.precio || 0) * (producto.cantidad || 1)).toLocaleString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay productos disponibles</p>
                )}
                <div className="flex justify-between font-bold text-lg pt-3 mt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#B90F0F]">${(pedidoActual.total || 0).toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={actualizarPedido}
                className="bg-[#B90F0F] text-white px-6 py-3 rounded-xl hover:bg-[#8a0b0b] transition flex items-center gap-2"
                disabled={loading}
              >
                <i className="fa-solid fa-rotate-right"></i>
                {loading ? 'Actualizando...' : 'Actualizar estado'}
              </button>
              <button 
                onClick={() => navigate('/principal-cliente')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Volver al inicio
              </button>
              <button 
                onClick={() => navigate('/contacto')}
                className="border border-[#B90F0F] text-[#B90F0F] px-6 py-3 rounded-xl hover:bg-[#B90F0F] hover:text-white transition flex items-center gap-2"
              >
                <i className="fa-solid fa-headset"></i>
                Contactar soporte
              </button>
            </div>
          </>
        )}
      </div>

      {/* Estilos adicionales */}
      <style jsx>{`
        .control-pedido-main {
          min-height: calc(100vh - 200px);
        }
        .control-container {
          max-width: 800px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
};

export default ControlPedido;