import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const DetallesPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [distribucion, setDistribucion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entregando, setEntregando] = useState(false);


  // CARGAR DETALLES DEL PEDIDO
  useEffect(() => {
    cargarDetalles();
  }, [id]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get(`/distribucion/${id}`);

      let data = response.data;
      if (response.data && response.data.data) {
        data = response.data.data;
      }

      setDistribucion(data);
      setError(null);

    } catch (err) {
      console.error('Error al cargar detalles:', err);
      
      let mensajeError = 'Error al cargar los detalles del pedido. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Redirigiendo al login...';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 404) {
        mensajeError += 'Pedido no encontrado.';
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };


  // INICIAR ENTREGA
  const iniciarEntrega = async () => {
    if (!window.confirm('¿Estás seguro de iniciar la entrega? Debes cumplir con la entrega en el tiempo establecido para evitar sanciones.')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.patch(`/distribucion/${id}/iniciar`);

      if (response.data.success) {
        alert('Entrega iniciada correctamente');
        await cargarDetalles();
      } else {
        throw new Error(response.data.message || 'Error al iniciar la entrega');
      }

    } catch (err) {
      console.error('Error al iniciar entrega:', err);
      alert(`Error al iniciar la entrega: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };


  // MARCAR COMO ENTREGADO
  const marcarEntregado = async () => {
    if (!window.confirm('¿Estás seguro de marcar este pedido como entregado?')) {
      return;
    }

    try {
      setEntregando(true);
      
      const response = await api.patch(`/distribucion/${id}/entregar`);

      if (response.data.success) {
        alert('Pedido marcado como entregado exitosamente');
        navigate('/repartidor/inicio');
      } else {
        throw new Error(response.data.message || 'Error al marcar como entregado');
      }

    } catch (err) {
      console.error('Error al marcar entregado:', err);
      alert(`Error al marcar como entregado: ${err.response?.data?.message || err.message}`);
    } finally {
      setEntregando(false);
    }
  };


  // IR A QR
  const irAQR = () => {
    navigate(`/qr/${id}`);
  };


  // RENDERIZADO CONDICIONAL
  
  if (loading) {
    return (
      <main className="max-w-[900px] mx-auto my-[30px] p-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando detalles del pedido...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-[900px] mx-auto my-[30px] p-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={cargarDetalles}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
          <button 
            onClick={() => navigate('/repartidor/inicio')}
            className="mt-2 ml-2 bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 transition"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  if (!distribucion) {
    return (
      <main className="max-w-[900px] mx-auto my-[30px] p-5">
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <i className="fa-solid fa-box-open text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No se encontró el pedido</p>
          <button 
            onClick={() => navigate('/repartidor/inicio')}
            className="mt-4 bg-[#B90F0F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  const pedido = distribucion.pedido || {};
  const clienteNombre = pedido.cliente || 'Cliente';
  const direccion = pedido.direccion_entrega || 'Sin dirección';


  // RENDER PRINCIPAL

  return (
    <main className="max-w-[900px] mx-auto my-[30px] p-5">
      <h2 className="text-center mb-6 text-3xl font-bold">
        <i className="fa-regular fa-calendar-days text-[#B90F0F] mr-2"></i>
        Entrega estimada: {pedido.fecha_estimada || 'Por confirmar'}
      </h2>

      {/* Mapa */}
      <div className="w-full mb-5">
        <iframe 
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(direccion)}`}
          className="w-full h-[300px] rounded-xl border-0"
          allowFullScreen 
          loading="lazy"
          title="Mapa"
        ></iframe>
      </div>

      {/* Información de entrega */}
      <div className="bg-gray-100 p-4 rounded-xl mb-5">
        <h3 className="mb-2.5 text-[#B90F0F] font-bold">Entrega para {clienteNombre}</h3>
        <p className="text-base mb-1"><i className="fa-solid fa-location-dot text-[#B90F0F] mr-2"></i> {direccion}</p>
        <p className="text-base mb-1"><i className="fa-solid fa-phone text-[#B90F0F] mr-2"></i> Teléfono: No disponible</p>
        {distribucion.observaciones && (
          <p className="text-base"><i className="fa-solid fa-note-sticky text-[#B90F0F] mr-2"></i> Nota: {distribucion.observaciones}</p>
        )}
        <p className="text-base mt-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            distribucion.estado === 'PENDIENTE' ? 'bg-yellow-500 text-white' :
            distribucion.estado === 'EN_ENTREGA' ? 'bg-blue-500 text-white' :
            distribucion.estado === 'ENTREGADO' ? 'bg-green-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {distribucion.estado || 'Pendiente'}
          </span>
        </p>
      </div>

      {/* Artículos */}
      <div className="mb-[30px]">
        <h3 className="text-xl font-bold mb-2.5">Artículos</h3>
        <div className="flex gap-3 mb-4 flex-wrap">
          {pedido.productos && pedido.productos.length > 0 ? (
            pedido.productos.map((producto, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                <img 
                  src={producto.imagen || '/img/default.png'} 
                  alt={producto.nombre} 
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => e.target.src = '/img/default.png'}
                />
                <div>
                  <p className="text-sm font-semibold">{producto.nombre}</p>
                  <p className="text-xs text-gray-500">x{producto.cantidad || 1}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay productos disponibles</p>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-3">
        {distribucion.estado === 'PENDIENTE' && (
          <button 
            onClick={iniciarEntrega}
            className="block w-full text-center bg-[#B90F0F] text-white py-4 rounded-xl no-underline font-bold transition-all hover:bg-[#8a0b0b]"
          >
            <i className="fa-solid fa-play mr-2"></i> Iniciar Entrega
          </button>
        )}
        
        {distribucion.estado === 'EN_ENTREGA' && (
          <>
            <button 
              onClick={irAQR}
              className="block w-full text-center bg-blue-600 text-white py-4 rounded-xl no-underline font-bold transition-all hover:bg-blue-700"
            >
              <i className="fa-solid fa-qrcode mr-2"></i> Leer QR del cliente
            </button>
            <button 
              onClick={marcarEntregado}
              className="block w-full text-center bg-green-600 text-white py-4 rounded-xl no-underline font-bold transition-all hover:bg-green-700"
              disabled={entregando}
            >
              {entregando ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check-circle mr-2"></i> Marcar como entregado
                </>
              )}
            </button>
          </>
        )}
        
        {distribucion.estado === 'ENTREGADO' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-center">
            <i className="fa-solid fa-check-circle mr-2"></i>
            Pedido entregado exitosamente
          </div>
        )}
        
        <button 
          onClick={() => navigate('/repartidor/inicio')}
          className="block w-full text-center bg-gray-500 text-white py-3 rounded-xl no-underline font-bold transition-all hover:bg-gray-600"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i> Volver al inicio
        </button>
        
        <button 
          onClick={() => navigate('/reportar-inconveniente')}
          className="block w-full text-center bg-orange-500 text-white py-3 rounded-xl no-underline font-bold transition-all hover:bg-orange-600"
        >
          <i className="fa-solid fa-circle-exclamation mr-2"></i> Reportar inconveniente
        </button>
      </div>
    </main>
  );
};

export default DetallesPedido;