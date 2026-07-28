import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ControlPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedidoActual, setPedidoActual] = useState(null);
  const [pedidosDisponibles, setPedidosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const estadosOrden = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado'];
  const estadosNombres = {
    'pendiente': '⏳ Pendiente',
    'confirmado': '✅ Confirmado',
    'preparando': '📦 En preparación',
    'enviado': '🚚 En camino',
    'entregado': '🏠 Entregado'
  };
  const estadosIconos = {
    'pendiente': 'fa-clock',
    'confirmado': 'fa-check-circle',
    'preparando': 'fa-boxes',
    'enviado': 'fa-truck',
    'entregado': 'fa-home'
  };

  const estacionesRecorrido = [
    { nombre: "Centro de distribución - Bogotá", icono: "fa-warehouse" },
    { nombre: "Centro de clasificación", icono: "fa-sitemap" },
    { nombre: "Oficina de reparto local", icono: "fa-truck-fast" },
    { nombre: "Ruta de entrega", icono: "fa-road" },
    { nombre: "Dirección del cliente", icono: "fa-home" }
  ];

  useEffect(() => {
    cargarPedidosDelCliente();
    iniciarActualizacionEnTiempoReal();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const cargarPedidosDelCliente = () => {
    const emailUsuario = localStorage.getItem('email');
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    
    const pedidosFiltrados = pedidos.filter(p => p.cliente?.email === emailUsuario);
    setPedidosDisponibles(pedidosFiltrados);
    
    if (pedidosFiltrados.length === 0) {
      setLoading(false);
      return;
    }
    
    if (id) {
      const pedidoEncontrado = pedidosFiltrados.find(p => p.id === id);
      if (pedidoEncontrado) {
        setPedidoActual(pedidoEncontrado);
      } else if (pedidosFiltrados.length > 0) {
        setPedidoActual(pedidosFiltrados[0]);
      }
    } else if (pedidosFiltrados.length > 0) {
      setPedidoActual(pedidosFiltrados[0]);
    }
    
    setLoading(false);
  };

  // ... todas las funciones permanecen igual ...

  if (loading) {
    return <div className="loading">Cargando seguimiento...</div>;
  }

  if (pedidosDisponibles.length === 0) {
    return (
      <div className="control-pedido-main">
        <div className="control-container">
          <div className="sin-pedidos" style={{ textAlign: 'center', padding: '60px' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '64px', color: '#ccc' }}></i>
            <h2>No tienes pedidos activos</h2>
            <p>Aún no has realizado ninguna compra.</p>
            {/* ✅ Cambiar navegación */}
            <button 
              onClick={() => navigate('/catalogo')} 
              className="btn-comprar-ahora" 
              style={{ marginTop: '20px', padding: '12px 30px', background: '#B90F0F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              <i className="fa-solid fa-store"></i> Ir a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const estadoActual = pedidoActual?.estado || 'pendiente';
  const estadoIndex = estadosOrden.indexOf(estadoActual);

  return (
    <div className="control-pedido-main">
      <div className="control-container">
        <div className="control-header">
          <h1><i className="fa-solid fa-truck-fast"></i> Seguimiento de Pedido</h1>
          <p>Visualiza el estado actual de tu pedido en tiempo real</p>
        </div>

        {/* Selector de pedido */}
        {pedidosDisponibles.length > 1 && (
          <div className="selector-pedido">
            <label>Selecciona tu pedido:</label>
            <select onChange={handleSelectPedido} value={pedidoActual?.id || ''}>
              <option value="">Selecciona un pedido</option>
              {pedidosDisponibles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id} - {new Date(p.fecha).toLocaleDateString('es-ES')} - ${(p.total || 0).toLocaleString('es-CO')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tarjeta principal */}
        {pedidoActual && (
          <>
            {/* ... todo el contenido del pedido queda igual ... */}

            {/* Acciones */}
            <div className="acciones-pedido">
              <button className="btn-actualizar" onClick={actualizarPedido}>
                <i className="fa-solid fa-rotate-right"></i> Actualizar estado
              </button>
              {/* ✅ Cambiar navegación */}
              <button className="btn-volver" onClick={() => navigate('/perfil-cliente')}>
                <i className="fa-solid fa-arrow-left"></i> Volver a mis pedidos
              </button>
              {/* ✅ Cambiar navegación */}
              <button className="btn-soporte" onClick={() => navigate('/contacto')}>
                <i className="fa-solid fa-headset"></i> Contactar soporte
              </button>
            </div>
          </>
        )}
      </div>

      {/* ... estilos quedan igual ... */}
    </div>
  );
};

export default ControlPedido;