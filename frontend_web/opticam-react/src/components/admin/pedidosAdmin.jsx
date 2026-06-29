// components/admin/PedidosAdmin.jsx
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalAsignar, setModalAsignar] = useState({ show: false, pedidoId: null, pedido: null });
  const [modalDetalles, setModalDetalles] = useState({ show: false, pedido: null });
  const [repartidorSeleccionado, setRepartidorSeleccionado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const pedidosResponse = await api.get('/pedidos/admin/todos');

      let pedidosData = pedidosResponse.data;
      if (pedidosResponse.data && pedidosResponse.data.data) {
        pedidosData = pedidosResponse.data.data;
      }
      if (pedidosResponse.data && pedidosResponse.data.pedidos) {
        pedidosData = pedidosResponse.data.pedidos;
      }
      if (!Array.isArray(pedidosData)) {
        pedidosData = [];
      }

      const pedidosMapeados = pedidosData.map((p) => ({
        id: p.id_pedido || p.id || p._id,
        cliente: p.Usuario?.nombre_completo || p.cliente || p.nombre_cliente || 'Sin cliente',
        direccion: p.direccion_entrega || p.direccion || 'Sin dirección',
        estado: p.estado || p.estado_pedido || 'pendiente',
        repartidor: p.repartidor_asignado || p.Repartidor?.nombre_completo || 'No asignado',
        total: p.total || p.total_pedido || 0,
        productos: p.DetallesPedidos || p.productos || [],
        id_pedido: p.id_pedido || p.id,
        ...p
      }));

      setPedidos(pedidosMapeados);

      const repartidoresResponse = await api.get('/usuarios/repartidores');

      let repartidoresData = repartidoresResponse.data;
      if (repartidoresResponse.data && repartidoresResponse.data.data) {
        repartidoresData = repartidoresResponse.data.data;
      }
      if (repartidoresResponse.data && repartidoresResponse.data.repartidores) {
        repartidoresData = repartidoresResponse.data.repartidores;
      }
      if (!Array.isArray(repartidoresData)) {
        repartidoresData = [];
      }

      const repartidoresMapeados = repartidoresData.map(r => ({
        id: r.id_usuario || r.id || r._id,
        nombre: r.nombre_completo || r.nombre || 'Sin nombre'
      }));

      setRepartidores(repartidoresMapeados);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoClass = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-500';
      case 'listo': return 'bg-blue-500';
      case 'en camino': return 'bg-orange-500';
      case 'entregado': return 'bg-green-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const verDetalles = (pedido) => {
    setModalDetalles({ show: true, pedido });
  };

  const cerrarDetalles = () => {
    setModalDetalles({ show: false, pedido: null });
  };

  const abrirModalAsignar = (pedido) => {
    
    const pedidoId = pedido.id_pedido || pedido.id;
    
    if (!pedidoId) {
      alert('Error: ID de pedido no válido');
      return;
    }
    
    setModalAsignar({ 
      show: true, 
      pedidoId: pedidoId,
      pedido: pedido
    });
    setRepartidorSeleccionado('');
  };

  const cerrarModalAsignar = () => {
    setModalAsignar({ show: false, pedidoId: null, pedido: null });
  };

  const asignarRepartidor = async () => {
    
    if (!modalAsignar.pedidoId) {
      alert('No se pudo identificar el pedido');
      return;
    }

    if (!repartidorSeleccionado) {
      alert('Selecciona un repartidor');
      return;
    }

    try {
      
      const response = await api.post('/distribucion', {
        id_pedido: parseInt(modalAsignar.pedidoId),
        id_usuario: parseInt(repartidorSeleccionado)
      });

      if (response.data.success) {
        alert('Repartidor asignado correctamente');
        cerrarModalAsignar();
        cargarDatos();
      } else {
        throw new Error(response.data.message || 'Error al asignar repartidor');
      }

    } catch (err) {
      console.error('Error al asignar repartidor:', err);
      
      let mensajeError = 'Error al asignar repartidor. ';
      if (err.response?.status === 404) {
        mensajeError += 'La ruta no existe.';
      } else if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada.';
        localStorage.removeItem('token');
        setTimeout(() => window.location.href = '/login', 2000);
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      alert(`${mensajeError}`);
    }
  };

  const marcarListo = async () => {
    if (!modalDetalles.pedido) return;

    try {
      
      const response = await api.put(`/pedidos/${modalDetalles.pedido.id}/listo`);

      if (response.data.success || response.status === 200) {
        alert('Pedido marcado como listo');
        cerrarDetalles();
        cargarDatos();
      }

    } catch (err) {
      console.error('Error al marcar pedido como listo:', err);
      alert(`Error al marcar pedido como listo: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <main className="p-[30px] max-md:p-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando pedidos...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-[30px] max-md:p-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={cargarDatos}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-[30px] max-md:p-5">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
        <button 
          onClick={cargarDatos}
          className="bg-[#B90F0F] text-white px-4 py-2 rounded-lg hover:bg-[#8a0b0b] transition"
        >
          <i className="fa-solid fa-rotate mr-2"></i> Actualizar
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Total: {pedidos.length} pedidos
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2.5">
          <thead>
            <tr className="[&_th]:p-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-gray-500">
              <th>ID</th>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Repartidor</th>
              <th>Total</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No hay pedidos registrados
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => (
                <tr key={pedido.id} className="bg-white shadow-md rounded-xl hover:-translate-y-0.5 transition-all [&_td]:p-4 [&_td]:align-middle first:[&_td]:rounded-l-xl last:[&_td]:rounded-r-xl">
                  <td className="font-bold">#{pedido.id}</td>
                  <td>{pedido.cliente}</td>
                  <td>{pedido.direccion}</td>
                  <td>
                    <span className={`${getEstadoClass(pedido.estado)} text-white px-3 py-1.5 rounded-full text-xs font-bold`}>
                      {pedido.estado?.charAt(0).toUpperCase() + pedido.estado?.slice(1) || 'Pendiente'}
                    </span>
                  </td>
                  <td className="text-gray-500">{pedido.repartidor || 'No asignado'}</td>
                  <td className="font-semibold">${pedido.total?.toLocaleString('es-CO') || 0}</td>
                  <td className="flex gap-2">
                    <button 
                      onClick={() => verDetalles(pedido)} 
                      className="bg-[#B90F0F] text-white px-3 py-2 rounded-lg text-xs cursor-pointer hover:opacity-90 transition"
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => abrirModalAsignar(pedido)} 
                      className="bg-[#B90F0F] text-white px-3 py-2 rounded-lg text-xs cursor-pointer hover:opacity-90 transition"
                    >
                      Asignar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL ASIGNAR */}
      {modalAsignar.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl text-center w-96 max-w-full">
            <h2 className="text-xl font-bold mb-4">Asignar Repartidor</h2>
            <p className="text-sm text-gray-500 mb-4">Pedido #{modalAsignar.pedidoId}</p>
            
            {repartidores.length === 0 ? (
              <p className="text-yellow-600 mb-4">No hay repartidores disponibles</p>
            ) : (
              <select 
                className="w-full p-2.5 my-4 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F]"
                value={repartidorSeleccionado}
                onChange={(e) => setRepartidorSeleccionado(e.target.value)}
              >
                <option value="">Seleccionar repartidor</option>
                {repartidores.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            )}
            
            <div className="flex gap-3">
              <button 
                onClick={asignarRepartidor} 
                className="flex-1 bg-[#B90F0F] text-white py-2 rounded-lg cursor-pointer hover:opacity-90 transition"
                disabled={repartidores.length === 0}
              >
                Confirmar
              </button>
              <button 
                onClick={cerrarModalAsignar} 
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLES */}
      {modalDetalles.show && modalDetalles.pedido && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-[450px] max-w-full">
            <h2 className="text-xl font-bold mb-4">Pedido #{modalDetalles.pedido.id}</h2>
            
            <div className="space-y-2">
              <p><strong>Cliente:</strong> {modalDetalles.pedido.cliente}</p>
              <p><strong>Dirección:</strong> {modalDetalles.pedido.direccion}</p>
              <p><strong>Estado:</strong> {modalDetalles.pedido.estado}</p>
              <p><strong>Repartidor:</strong> {modalDetalles.pedido.repartidor || 'No asignado'}</p>
              <p><strong>Total:</strong> ${modalDetalles.pedido.total?.toLocaleString('es-CO') || 0}</p>
            </div>
            
            <h3 className="font-bold mt-4 mb-2">Productos</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-3 max-h-40 overflow-y-auto">
              {!modalDetalles.pedido.productos || modalDetalles.pedido.productos.length === 0 ? (
                <p className="text-gray-500 text-center py-2">No hay productos</p>
              ) : (
                modalDetalles.pedido.productos.map((producto, index) => (
                  <div key={index} className="flex justify-between p-2.5 bg-white rounded-lg mb-2">
                    <span className="font-bold">{producto.nombre || 'Producto'}</span>
                    <span className="text-gray-500">x{producto.cantidad || 1}</span>
                    <span className="text-gray-500">${(producto.precio || 0).toLocaleString('es-CO')}</span>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex flex-col gap-2.5 mt-4">
              <button 
                onClick={marcarListo} 
                className="bg-blue-500 text-white py-2.5 rounded-lg w-full font-bold cursor-pointer hover:opacity-90 transition"
              >
                <i className="fa-solid fa-check mr-2"></i> Marcar como listo
              </button>
              <button 
                onClick={cerrarDetalles} 
                className="bg-gray-500 text-white py-2.5 rounded-lg w-full cursor-pointer hover:bg-gray-600 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PedidosAdmin;