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
    
    // Si hay un ID en la URL, cargar ese pedido
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

  const cargarPedido = (pedido) => {
    setPedidoActual(pedido);
    localStorage.setItem('pedido_seguimiento', JSON.stringify(pedido));
  };

  const handleSelectPedido = (e) => {
    const pedido = pedidosDisponibles.find(p => p.id === e.target.value);
    if (pedido) {
      cargarPedido(pedido);
    }
  };

  const actualizarBarraProgreso = (estado) => {
    const estadoIndex = estadosOrden.indexOf(estado);
    return (estadoIndex / (estadosOrden.length - 1)) * 100;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const actualizarPedido = () => {
    if (!pedidoActual) return;
    
    const estadoActual = pedidoActual.estado || 'pendiente';
    const estadoIndex = estadosOrden.indexOf(estadoActual);
    
    if (estadoIndex < estadosOrden.length - 1) {
      const nuevoEstado = estadosOrden[estadoIndex + 1];
      const ahora = new Date().toISOString();
      
      const pedidoActualizado = { ...pedidoActual, estado: nuevoEstado };
      
      if (nuevoEstado === 'confirmado') pedidoActualizado.fechaConfirmado = ahora;
      else if (nuevoEstado === 'preparando') pedidoActualizado.fechaPreparando = ahora;
      else if (nuevoEstado === 'enviado') pedidoActualizado.fechaEnviado = ahora;
      else if (nuevoEstado === 'entregado') pedidoActualizado.fechaEntregado = ahora;
      
      // Actualizar en localStorage
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const index = pedidos.findIndex(p => p.id === pedidoActualizado.id);
      if (index !== -1) {
        pedidos[index] = pedidoActualizado;
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
      }
      
      setPedidoActual(pedidoActualizado);
      mostrarNotificacion(`📦 Tu pedido ahora está ${estadosNombres[nuevoEstado]}`, 'success');
    } else {
      mostrarNotificacion('✅ Este pedido ya ha sido entregado', 'success');
    }
  };

  const iniciarActualizacionEnTiempoReal = () => {
    intervalRef.current = setInterval(() => {
      if (pedidoActual) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        const pedidoActualizado = pedidos.find(p => p.id === pedidoActual.id);
        
        if (pedidoActualizado && pedidoActualizado.estado !== pedidoActual.estado) {
          setPedidoActual(pedidoActualizado);
          mostrarNotificacion(`📦 Tu pedido ${pedidoActual.id} ahora está ${estadosNombres[pedidoActualizado.estado]}`, 'info');
        }
      }
    }, 10000);
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    // Implementar notificación
    console.log(`${tipo}: ${mensaje}`);
  };

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
            <button onClick={() => navigate('/catalogo.html')} className="btn-comprar-ahora" style={{ marginTop: '20px', padding: '12px 30px', background: '#B90F0F', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
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
            <div className="pedido-card-principal">
              <div className="pedido-status">
                <div className="status-icon">
                  <i className={`fa-solid ${estadosIconos[estadoActual] || 'fa-receipt'}`}></i>
                </div>
                <div className="status-info">
                  <h2>{pedidoActual.id}</h2>
                  <p className="fecha-pedido">Fecha: {new Date(pedidoActual.fecha).toLocaleDateString('es-ES')}</p>
                  <div className="status-badge">
                    <span className={`badge ${estadoActual}`}>{estadosNombres[estadoActual]}</span>
                  </div>
                </div>
                <div className="pedido-total">
                  <span>Total:</span>
                  <strong>${(pedidoActual.total || 0).toLocaleString('es-CO')}</strong>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="progress-section">
              <h3><i className="fa-solid fa-chart-line"></i> Estado del Pedido</h3>
              <div className="progress-timeline">
                {estadosOrden.map((estado, idx) => (
                  <div key={estado} className={`progress-step ${idx < estadoIndex ? 'completed' : idx === estadoIndex ? 'active' : ''}`}>
                    <div className="step-icon">
                      <i className={`fa-solid ${estadosIconos[estado]}`}></i>
                    </div>
                    <div className="step-info">
                      <span className="step-label">{estadosNombres[estado]}</span>
                      <span className="step-date">
                        {idx === 0 && pedidoActual.fechaConfirmado && formatearFecha(pedidoActual.fechaConfirmado)}
                        {idx === 1 && pedidoActual.fechaPreparando && formatearFecha(pedidoActual.fechaPreparando)}
                        {idx === 2 && pedidoActual.fechaEnviado && formatearFecha(pedidoActual.fechaEnviado)}
                        {idx === 3 && pedidoActual.fechaEntregado && formatearFecha(pedidoActual.fechaEntregado)}
                        {idx === 0 && !pedidoActual.fechaConfirmado && '-'}
                        {idx === 1 && !pedidoActual.fechaPreparando && '-'}
                        {idx === 2 && !pedidoActual.fechaEnviado && '-'}
                        {idx === 3 && !pedidoActual.fechaEntregado && '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${actualizarBarraProgreso(estadoActual)}%` }}></div>
              </div>
            </div>

            {/* Mapa de recorrido */}
            <div className="map-section">
              <h3><i className="fa-solid fa-map-location-dot"></i> Recorrido del Pedido</h3>
              <div className="map-container">
                <div className="map-route">
                  {estacionesRecorrido.map((estacion, idx) => (
                    <div key={idx} className={`route-station ${idx <= estadoIndex ? 'completed' : ''}`}>
                      <div className="station-marker">
                        <i className={`fa-solid ${estacion.icono}`}></i>
                      </div>
                      <div className="station-info">
                        <span className="station-name">{estacion.nombre}</span>
                        <span className="station-time">
                          {idx <= estadoIndex ? (idx === estadoIndex ? 'En proceso' : 'Completado') : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detalles del pedido */}
            <div className="detalles-pedido">
              <h3><i className="fa-solid fa-box-open"></i> Detalles del Pedido</h3>
              <div className="productos-lista">
                {pedidoActual.productos?.map((producto, idx) => {
                  let precio = producto.precio;
                  if (typeof precio === 'string') {
                    precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
                  }
                  const cantidad = producto.cantidad || 1;
                  return (
                    <div key={idx} className="producto-item">
                      <img src={producto.imagen || '/img/default-product.jpg'} className="producto-imagen" alt={producto.nombre} />
                      <div className="producto-info">
                        <div className="producto-nombre">{producto.nombre}</div>
                        <div className="producto-detalles">Color: {producto.color || '-'} | Material: {producto.material || '-'}</div>
                        <div className="producto-detalles">Cantidad: {cantidad}</div>
                      </div>
                      <div className="producto-precio">${(precio * cantidad).toLocaleString('es-CO')}</div>
                    </div>
                  );
                })}
              </div>
              <div className="direccion-entrega">
                <h4><i className="fa-solid fa-location-dot"></i> Dirección de entrega</h4>
                <p>{pedidoActual.cliente?.direccion || 'Dirección no disponible'}{pedidoActual.cliente?.ciudad ? `, ${pedidoActual.cliente.ciudad}` : ''}</p>
                {pedidoActual.cliente?.notas && <p><small>📝 Notas: {pedidoActual.cliente.notas}</small></p>}
              </div>
            </div>

            {/* Acciones */}
            <div className="acciones-pedido">
              <button className="btn-actualizar" onClick={actualizarPedido}>
                <i className="fa-solid fa-rotate-right"></i> Actualizar estado
              </button>
              <button className="btn-volver" onClick={() => navigate('/mis-pedidos.html')}>
                <i className="fa-solid fa-arrow-left"></i> Volver a mis pedidos
              </button>
              <button className="btn-soporte" onClick={() => navigate('/contactenos.html')}>
                <i className="fa-solid fa-headset"></i> Contactar soporte
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .control-pedido-main {
          max-width: 1200px;
          margin: 120px auto 60px;
          padding: 0 20px;
        }
        .control-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .control-header h1 {
          font-size: 32px;
          color: var(--color-texto, #000);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .control-header h1 i {
          color: var(--color-primario, #B90F0F);
        }
        .selector-pedido {
          background: var(--color-fondo, #fff);
          border-radius: 12px;
          padding: 15px 20px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .selector-pedido select {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        .pedido-card-principal {
          background: linear-gradient(135deg, #fff 0%, #f8f8f8 100%);
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        .pedido-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .status-icon {
          width: 70px;
          height: 70px;
          background: var(--color-primario, #B90F0F);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 32px;
        }
        .badge {
          display: inline-block;
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge.pendiente { background: #ff9800; color: white; }
        .badge.confirmado { background: #2196F3; color: white; }
        .badge.preparando { background: #9C27B0; color: white; }
        .badge.enviado { background: #00BCD4; color: white; }
        .badge.entregado { background: #4CAF50; color: white; }
        .pedido-total strong {
          font-size: 28px;
          color: var(--color-primario, #B90F0F);
        }
        .progress-section {
          background: #fff;
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
        }
        .progress-timeline {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .progress-step {
          flex: 1;
          text-align: center;
          opacity: 0.4;
          transition: all 0.3s;
        }
        .progress-step.completed, .progress-step.active {
          opacity: 1;
        }
        .step-icon {
          width: 60px;
          height: 60px;
          background: var(--color-primario, #B90F0F);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          color: white;
          font-size: 24px;
        }
        .progress-bar-container {
          background: #e0e0e0;
          border-radius: 10px;
          height: 8px;
          overflow: hidden;
        }
        .progress-bar-fill {
          background: linear-gradient(90deg, var(--color-primario, #B90F0F), #ff6b6b);
          height: 100%;
          border-radius: 10px;
          transition: width 0.5s ease;
        }
        .map-section {
          background: #fff;
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
        }
        .map-route {
          padding: 20px;
        }
        .route-station {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          border-left: 3px solid #e0e0e0;
          position: relative;
          margin-left: 20px;
        }
        .route-station.completed {
          border-left-color: var(--color-primario, #B90F0F);
        }
        .station-marker {
          width: 40px;
          height: 40px;
          background: #e0e0e0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          left: -20px;
          top: 10px;
        }
        .route-station.completed .station-marker {
          background: var(--color-primario, #B90F0F);
          color: white;
        }
        .detalles-pedido {
          background: #fff;
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
        }
        .producto-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        .producto-imagen {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 10px;
        }
        .producto-precio {
          font-weight: 600;
          color: var(--color-primario, #B90F0F);
        }
        .acciones-pedido {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-actualizar, .btn-volver, .btn-soporte {
          padding: 12px 25px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-actualizar {
          background: var(--color-primario, #B90F0F);
          color: white;
        }
        .btn-volver {
          background: #666;
          color: white;
        }
        .btn-soporte {
          background: #2196F3;
          color: white;
        }
        @media (max-width: 768px) {
          .progress-timeline {
            flex-direction: column;
          }
          .progress-step {
            display: flex;
            align-items: center;
            gap: 15px;
            text-align: left;
          }
          .step-icon {
            margin: 0;
          }
          .acciones-pedido {
            flex-direction: column;
          }
          .btn-actualizar, .btn-volver, .btn-soporte {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ControlPedido;