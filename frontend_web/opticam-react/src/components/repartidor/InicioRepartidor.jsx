import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const InicioRepartidor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('all');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualizando, setActualizando] = useState(false);


  // CARGAR PEDIDOS DESDE LA API
  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Cargar pedidos pendientes
      const pendientesResponse = await api.get('/distribucion/pendientes');

      // Cargar pedidos en entrega
      const enEntregaResponse = await api.get('/distribucion/en-entrega');

      // Procesar pendientes
      let pendientesData = pendientesResponse.data;
      if (pendientesResponse.data && pendientesResponse.data.data) {
        pendientesData = pendientesResponse.data.data;
      }
      if (pendientesResponse.data && pendientesResponse.data.pedidos) {
        pendientesData = pendientesResponse.data.pedidos;
      }
      if (!Array.isArray(pendientesData)) {
        pendientesData = [];
      }

      // Procesar en entrega
      let enEntregaData = enEntregaResponse.data;
      if (enEntregaResponse.data && enEntregaResponse.data.data) {
        enEntregaData = enEntregaResponse.data.data;
      }
      if (enEntregaResponse.data && enEntregaResponse.data.pedidos) {
        enEntregaData = enEntregaResponse.data.pedidos;
      }
      if (!Array.isArray(enEntregaData)) {
        enEntregaData = [];
      }

      // Mapear datos
      const pendientesMapeados = pendientesData.map(p => ({
        id: p.id_distribucion || p.id || p.id_pedido,
        cliente: p.pedido?.cliente || p.cliente || p.nombre_cliente || 'Cliente',
        direccion: p.pedido?.direccion_entrega || p.direccion || p.direccion_entrega || 'Sin dirección',
        estado: p.estado?.toLowerCase() === 'pendiente' ? 'pendiente' : 'pendiente',
        articulos: p.pedido?.total_productos || p.total_productos || 1,
        distancia: p.distancia || '30 min',
        fecha_estimada: p.pedido?.fecha_estimada || p.fecha_estimada,
        ...p
      }));

      const enEntregaMapeados = enEntregaData.map(p => ({
        id: p.id_distribucion || p.id || p.id_pedido,
        cliente: p.pedido?.cliente || p.cliente || p.nombre_cliente || 'Cliente',
        direccion: p.pedido?.direccion_entrega || p.direccion || p.direccion_entrega || 'Sin dirección',
        estado: 'en-entrega',
        articulos: p.pedido?.total_productos || p.total_productos || 1,
        distancia: p.distancia || '15 min',
        fecha_estimada: p.pedido?.fecha_estimada || p.fecha_estimada,
        ...p
      }));

      // Combinar y establecer estado
      const todosLosPedidos = [...pendientesMapeados, ...enEntregaMapeados];
      setPedidos(todosLosPedidos);

    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      
      let mensajeError = 'Error al cargar tus pedidos. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Redirigiendo al login...';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };


  // ACTUALIZAR PEDIDOS
  const actualizarPedidos = async () => {
    setActualizando(true);
    await cargarPedidos();
    setActualizando(false);
  };


  // INICIAR ENTREGA
  const iniciarEntrega = async (id) => {
    if (!window.confirm('¿Estás seguro de iniciar la entrega? Debes cumplir con la entrega en el tiempo establecido para evitar sanciones.')) {
      return;
    }

    try {
      const response = await api.patch(`/distribucion/${id}/iniciar`);

      if (response.data.success) {
        alert('Entrega iniciada correctamente');
        await cargarPedidos(); // Recargar lista
        navigate(`/detalles-pedido/${id}`);
      } else {
        throw new Error(response.data.message || 'Error al iniciar la entrega');
      }

    } catch (err) {
      console.error('Error al iniciar entrega:', err);
      alert(`Error al iniciar la entrega: ${err.response?.data?.message || err.message}`);
    }
  };


  // FILTRAR PEDIDOS
  const pedidosFiltrados = filtro === 'all' 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtro);

  const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const pedidosEnEntrega = pedidos.filter(p => p.estado === 'en-entrega').length;


  // RENDERIZADO CONDICIONAL

  if (loading) {
    return (
      <main className="relative p-10 flex flex-col gap-4 min-h-[650px] max-md:p-5">
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
      <main className="relative p-10 flex flex-col gap-4 min-h-[650px] max-md:p-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={cargarPedidos}
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
    <main className="relative p-10 flex flex-col gap-4 min-h-[650px] max-md:p-5">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold max-md:text-2xl">
            ¡Bienvenido, {user?.nombre_completo || 'Repartidor'}!
          </h1>
          <h2 className="text-lg text-gray-700">Estos son tus pedidos del día de hoy</h2>
        </div>
        <button 
          onClick={actualizarPedidos}
          className="bg-[#B90F0F] text-white px-4 py-2 rounded-lg hover:bg-[#8a0b0b] transition disabled:opacity-50"
          disabled={actualizando}
        >
          {actualizando ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i> Actualizando...
            </>
          ) : (
            <>
              <i className="fa-solid fa-rotate mr-2"></i> Actualizar
            </>
          )}
        </button>
      </div>

      {/* Resumen */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm text-gray-500">Total pedidos</span>
          <p className="text-xl font-bold">{pedidos.length}</p>
        </div>
        <div className="bg-yellow-50 px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm text-yellow-600">Pendientes</span>
          <p className="text-xl font-bold text-yellow-600">{pedidosPendientes}</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm text-blue-600">En entrega</span>
          <p className="text-xl font-bold text-blue-600">{pedidosEnEntrega}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-5 flex-wrap">
        <button 
          onClick={() => setFiltro('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            filtro === 'all' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'
          }`}
        >
          Todo ({pedidos.length})
        </button>
        <button 
          onClick={() => setFiltro('pendiente')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            filtro === 'pendiente' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'
          }`}
        >
          Pendiente ({pedidosPendientes})
        </button>
        <button 
          onClick={() => setFiltro('en-entrega')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            filtro === 'en-entrega' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'
          }`}
        >
          En entrega ({pedidosEnEntrega})
        </button>
      </div>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <i className="fa-regular fa-circle-check text-5xl text-green-400 mb-4"></i>
          <p className="text-gray-500 text-lg">¡No hay pedidos {filtro !== 'all' ? filtro : ''}!</p>
          <p className="text-gray-400 text-sm">Disfruta de tu descanso</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6 justify-center">
          {pedidosFiltrados.map((pedido) => (
            <div key={pedido.id} className="w-[280px] bg-white rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all">
              <img 
                src="/img/maps.png" 
                alt="Mapa" 
                className="w-full h-[150px] object-cover"
                onError={(e) => e.target.src = '/img/default-map.png'}
              />
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-bold">{pedido.cliente}</h3>
                <p className="text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-location-dot"></i> {pedido.direccion}
                </p>
                <p className="text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-boxes-packing"></i> {pedido.articulos} artículos
                </p>
                <p className="text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-clock"></i> {pedido.distancia}
                </p>
                {pedido.fecha_estimada && (
                  <p className="text-sm flex items-center gap-1.5 text-gray-500">
                    <i className="fa-regular fa-calendar"></i> Est. {pedido.fecha_estimada}
                  </p>
                )}
                <p className={`font-bold text-sm flex items-center gap-1.5 ${
                  pedido.estado === 'pendiente' ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  <i className={`fa-solid ${
                    pedido.estado === 'pendiente' ? 'fa-clock' : 'fa-truck-moving'
                  }`}></i>
                  {pedido.estado === 'pendiente' ? 'Pendiente' : 'En entrega'}
                </p>
                
                {pedido.estado === 'pendiente' ? (
                  <button 
                    onClick={() => iniciarEntrega(pedido.id)}
                    className="w-full mt-2.5 py-2.5 bg-[#B90F0F] text-white rounded-md font-bold cursor-pointer hover:bg-[#8a0b0b] transition"
                  >
                    Iniciar Entrega
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/detalles-pedido/${pedido.id}`)}
                    className="w-full mt-2.5 py-2.5 bg-blue-600 text-white rounded-md font-bold cursor-pointer hover:bg-blue-700 transition"
                  >
                    Ver detalles
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default InicioRepartidor;