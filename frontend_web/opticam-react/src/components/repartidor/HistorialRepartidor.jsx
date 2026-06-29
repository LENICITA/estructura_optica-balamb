import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const HistorialRepartidor = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalDetalles, setModalDetalles] = useState({ show: false, pedido: null });

  // CARGAR HISTORIAL
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get('/distribucion/historial');

      let historialData = response.data;
      if (response.data && response.data.data) {
        historialData = response.data.data;
      }
      if (response.data && response.data.historial) {
        historialData = response.data.historial;
      }

      if (!Array.isArray(historialData)) {
        historialData = [];
      }

      // Mapear datos
      const pedidosMapeados = historialData.map(p => ({
        id: p.id_distribucion || p.id || p.id_pedido,
        cliente: p.pedido?.cliente || p.cliente || p.nombre_cliente || 'Cliente',
        direccion: p.pedido?.direccion_entrega || p.direccion || p.direccion_entrega || 'Sin dirección',
        estado: p.estado?.toLowerCase() === 'entregado' ? 'entregado' : 'entregado',
        fecha: p.fecha_entrega || p.fecha_asignacion || new Date().toISOString(),
        total: p.pedido?.total || p.total || 0,
        ...p
      }));

      setPedidos(pedidosMapeados);

    } catch (err) {
      console.error('Error al cargar historial:', err);
      
      let mensajeError = 'Error al cargar el historial. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Redirigiendo al login...';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      setError(mensajeError);
      
      // Datos de ejemplo en caso de error
      setPedidos([
        { id: 1, cliente: "Valentina", direccion: "Calle 123", estado: "entregado", fecha: "15/04/2024" },
        { id: 2, cliente: "Luisa", direccion: "Carrera 10", estado: "entregado", fecha: "14/04/2024" },
        { id: 3, cliente: "Shariht", direccion: "Calle 123", estado: "entregado", fecha: "13/04/2024" }
      ]);
    } finally {
      setLoading(false);
    }
  };


  // FUNCIONES
  const verDetalles = (pedido) => {
    setModalDetalles({ show: true, pedido });
  };

  const cerrarDetalles = () => {
    setModalDetalles({ show: false, pedido: null });
  };

  const getEstadoClass = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-500';
      case 'listo': return 'bg-blue-500';
      case 'en-camino': return 'bg-orange-500';
      case 'entregado': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'pendiente': return 'Pendiente';
      case 'listo': return 'Listo';
      case 'en-camino': return 'En camino';
      case 'entregado': return 'Entregado';
      default: return estado || 'Desconocido';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };


  // RENDERIZADO CONDICIONAL

  if (loading) {
    return (
      <main className="p-[30px] max-md:p-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando historial...</p>
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
            onClick={cargarHistorial}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }


  // RENDER PRINCIPAL
  return (
    <main className="p-[30px] max-md:p-5">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Historial de Pedidos</h1>
        <button 
          onClick={cargarHistorial}
          className="bg-[#B90F0F] text-white px-4 py-2 rounded-lg hover:bg-[#8a0b0b] transition"
        >
          <i className="fa-solid fa-rotate mr-2"></i> Actualizar
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Total: {pedidos.length} entregas completadas
      </p>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <i className="fa-regular fa-circle-check text-6xl text-green-400 mb-4"></i>
          <p className="text-gray-500 text-lg">No hay entregas completadas aún</p>
          <p className="text-gray-400 text-sm">Los pedidos que entregues aparecerán aquí</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2.5">
            <thead>
              <tr className="[&_th]:p-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-gray-500">
                <th>ID</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="bg-white shadow-md rounded-xl hover:-translate-y-0.5 transition-all [&_td]:p-4 [&_td]:align-middle first:[&_td]:rounded-l-xl last:[&_td]:rounded-r-xl">
                  <td className="font-bold">#{pedido.id}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <img 
                        src="/img/user.jpg" 
                        alt="User" 
                        className="w-10 h-10 rounded-full"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                      />
                      <span>{pedido.cliente}</span>
                    </div>
                  </td>
                  <td className="max-w-[200px] truncate">{pedido.direccion}</td>
                  <td>
                    <span className={`${getEstadoClass(pedido.estado)} text-white px-3 py-1.5 rounded-full text-xs font-bold`}>
                      {getEstadoTexto(pedido.estado)}
                    </span>
                  </td>
                  <td className="text-sm">{formatearFecha(pedido.fecha)}</td>
                  <td className="font-semibold">${pedido.total?.toLocaleString('es-CO') || 0}</td>
                  <td>
                    <button 
                      onClick={() => verDetalles(pedido)} 
                      className="bg-[#B90F0F] text-white px-3 py-2 rounded-lg text-xs cursor-pointer hover:opacity-90 transition"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALLES */}
      {modalDetalles.show && modalDetalles.pedido && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-[450px] max-w-full">
            <h2 className="text-xl font-bold mb-4">Detalle del Pedido</h2>
            
            <div className="space-y-2">
              <p><strong>ID:</strong> #{modalDetalles.pedido.id}</p>
              <p><strong>Cliente:</strong> {modalDetalles.pedido.cliente}</p>
              <p><strong>Dirección:</strong> {modalDetalles.pedido.direccion}</p>
              <p><strong>Estado:</strong> {getEstadoTexto(modalDetalles.pedido.estado)}</p>
              <p><strong>Fecha:</strong> {formatearFecha(modalDetalles.pedido.fecha)}</p>
              <p><strong>Total:</strong> ${modalDetalles.pedido.total?.toLocaleString('es-CO') || 0}</p>
            </div>
            
            <h3 className="font-bold mt-4 mb-2">Productos</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-3 max-h-40 overflow-y-auto">
              {modalDetalles.pedido.productos && modalDetalles.pedido.productos.length > 0 ? (
                modalDetalles.pedido.productos.map((producto, index) => (
                  <div key={index} className="flex justify-between p-2.5 bg-white rounded-lg mb-2">
                    <span className="font-bold">{producto.nombre || 'Producto'}</span>
                    <span className="text-gray-500">x{producto.cantidad || 1}</span>
                    <span className="text-gray-500">${(producto.precio || 0).toLocaleString('es-CO')}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-2">No hay productos disponibles</p>
              )}
            </div>
            
            <button 
              onClick={cerrarDetalles} 
              className="w-full bg-gray-500 text-white py-2.5 rounded-lg font-semibold cursor-pointer hover:bg-gray-600 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default HistorialRepartidor;