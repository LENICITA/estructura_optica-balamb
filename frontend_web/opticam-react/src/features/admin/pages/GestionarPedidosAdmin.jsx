// src/features/admin/pages/GestionarPedidosAdmin.jsx
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { PedidoController } from '../../../core/controllers/PedidoController';
import { UserController } from '../../../core/controllers/UserController';
import { AuthController } from '../../../core/controllers/AuthController';

const ESTADOS_VALIDOS = ['TODOS', 'Abonado', 'Listo', 'Pagado', 'En Proceso', 'Enviado', 'Entregado'];

const ESTADOS_MAP = {
  'Abonado': 'Abonado (50%)',
  'Listo': 'Listo para pagar',
  'Pagado': 'Pagado (100%)',
  'En Proceso': 'En proceso',
  'Enviado': 'Enviado',
  'Entregado': 'Entregado',
};

const GestionarPedidosAdmin = () => {
  const navigate = useNavigate();
  const pedidoController = new PedidoController();
  const userController = new UserController();
  const authController = new AuthController();
  const distribucionController = new DistribucionController();

  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const [mostrarRepartidores, setMostrarRepartidores] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const cargarPedidos = useCallback(async () => {
    try {
      setError(null);
      const data = await pedidoController.getTodosLosPedidos();
      if (!Array.isArray(data)) return setPedidos([]);
      setPedidos(data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
      setError(err?.message || 'No fue posible cargar los pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const cargarRepartidores = useCallback(async () => {
    try {
      const repartidoresData = await userController.getRepartidores();
      const admin = await authController.loadUser();

      let listaUsuarios = [];

      if (repartidoresData && repartidoresData.length > 0) {
        listaUsuarios = [...repartidoresData];
      }

      if (admin) {
        const adminExiste = listaUsuarios.some((u) => u.id_usuario === admin.id_usuario);
        if (!adminExiste) {
          const adminConFlag = { ...admin, esAdmin: true };
          if (!adminConFlag.vehiculo) {
            adminConFlag.vehiculo = { tipo: 'Distribuidora externa', modelo: '', placa: 'N/A', color: '' };
          }
          listaUsuarios.push(adminConFlag);
        }
      }

      setRepartidores(listaUsuarios);
    } catch (err) {
      console.error('Error cargando repartidores:', err);
      setRepartidores([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    cargarPedidos();
    cargarRepartidores();
  }, [cargarPedidos, cargarRepartidores]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarPedidos();
    cargarRepartidores();
  };

  const pedidosFiltrados = useMemo(() => {
    let resultado = [...pedidos];

    if (filtroEstado !== 'TODOS') {
      resultado = resultado.filter((p) => p.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();
      resultado = resultado.filter((p) =>
        String(p.id_pedido).includes(texto) ||
        p.cliente?.nombre?.toLowerCase().includes(texto) ||
        p.ciudad_envio?.toLowerCase().includes(texto) ||
        p.direccion_entrega?.toLowerCase().includes(texto)
      );
    }

    return resultado;
  }, [pedidos, busqueda, filtroEstado]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Abonado': return '#2563EB';
      case 'Listo': return '#7C3AED';
      case 'Pagado': return '#059669';
      case 'En Proceso': return '#0284C7';
      case 'Enviado': return '#6366F1';
      case 'Entregado': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const getEstadoBackground = (estado) => `${getEstadoColor(estado)}20`;

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Abonado': return 'fa-money-bill';
      case 'Listo': return 'fa-circle-check';
      case 'Pagado': return 'fa-credit-card';
      case 'En Proceso': return 'fa-rotate';
      case 'Enviado': return 'fa-rocket';
      case 'Entregado': return 'fa-check-double';
      default: return 'fa-circle-question';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha estimada';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleAsignar = async (usuario) => {
    if (!pedidoSeleccionado) return alert('No hay pedido seleccionado');

    if (pedidoSeleccionado.estado !== 'Pagado') {
      alert(`El pedido debe estar en estado "Pagado". Estado actual: ${pedidoSeleccionado.estado}`);
      setMostrarRepartidores(false);
      return;
    }

    const nombreUsuario = usuario.nombre_completo;
    const esAdmin = usuario.esAdmin || false;
    const tipo = esAdmin ? 'administrador (distribuidora externa)' : 'repartidor';

    if (!window.confirm(`¿Asignar pedido #${pedidoSeleccionado.id_pedido} a ${nombreUsuario} (${tipo})?`)) return;

    try {
      const result = await distribucionController.asignarPedido({
        id_pedido: pedidoSeleccionado.id_pedido,
        id_usuario: usuario.id_usuario,
        observaciones: `Asignado por ${tipo}`,
      });

      if (result.success) {
        let mensaje = `Pedido #${pedidoSeleccionado.id_pedido} asignado a ${nombreUsuario}`;
        if (result.data?.tipo_asignacion === 'DISTRIBUIDORA_EXTERNA') mensaje += '\n\nEnvío externo (fuera de Bogotá)';
        else mensaje += '\n\nEnvío en Bogotá';

        alert(mensaje);
        setMostrarRepartidores(false);
        setPedidoSeleccionado(null);
        cargarPedidos();
      } else {
        alert(result.message || 'No se pudo asignar el pedido');
      }
    } catch (error) {
      console.error('Error asignando pedido:', error);
      alert(error.message || 'Error al asignar el pedido');
      setMostrarRepartidores(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] px-8 bg-gray-50">
        <i className="fa-solid fa-circle-exclamation text-5xl text-red-500"></i>
        <p className="mt-3 text-xl font-bold text-gray-700">Ocurrió un error</p>
        <p className="mt-2 text-center text-gray-500 text-[13px]">{error}</p>
        <button
          onClick={() => { setLoading(true); cargarPedidos(); }}
          className="mt-5 bg-[#B90F0F] flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-white font-semibold"
        >
          <i className="fa-solid fa-rotate-right"></i>
          Intentar nuevamente
        </button>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">

      {/* ENCABEZADO */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-receipt text-[#B90F0F] text-xl"></i>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Gestionar pedidos
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Consulta y administra los pedidos realizados.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            <i className={`fa-solid fa-rotate-right ${refreshing ? 'animate-spin' : ''}`}></i>
            Actualizar
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <i className="fa-solid fa-receipt text-gray-600"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{pedidos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <i className="fa-solid fa-credit-card text-green-600"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pagados</p>
              <p className="text-xl font-bold text-gray-900">
                {pedidos.filter((p) => p.estado === 'Pagado').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <i className="fa-solid fa-truck text-blue-600"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500">En proceso</p>
              <p className="text-xl font-bold text-gray-900">
                {pedidos.filter(
                  (p) => p.estado === 'En Proceso' || p.estado === 'Enviado'
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <i className="fa-solid fa-circle-check text-green-600"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500">Entregados</p>
              <p className="text-xl font-bold text-gray-900">
                {pedidos.filter((p) => p.estado === 'Entregado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">

          <div className="flex-1 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

            <input
              type="text"
              placeholder="Buscar pedido, cliente o ciudad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-12 pl-11 pr-10 border border-gray-300 rounded-xl outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition"
            />

            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <i className="fa-solid fa-circle-xmark text-gray-400 hover:text-gray-600"></i>
              </button>
            )}
          </div>

          <div className="lg:w-[220px]">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full h-12 border border-gray-300 rounded-xl px-4 bg-white text-gray-700 outline-none focus:border-[#B90F0F] transition"
            >
              {ESTADOS_VALIDOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado === 'TODOS' ? 'Todos los estados' : ESTADOS_MAP[estado] || estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {ESTADOS_VALIDOS.map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                filtroEstado === estado
                  ? 'bg-[#B90F0F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {estado === 'TODOS' ? 'Todos' : ESTADOS_MAP[estado] || estado}
            </button>
          ))}
        </div>
      </div>

      {/* CONTADOR */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">
            {pedidosFiltrados.length}
          </span>{' '}
          {pedidosFiltrados.length === 1
            ? 'pedido encontrado'
            : 'pedidos encontrados'}
        </p>
      </div>

      {/* LISTA */}
      {pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-receipt text-3xl text-gray-300"></i>
          </div>

          <p className="mt-4 text-lg font-bold text-gray-700">
            No hay pedidos
          </p>

          <p className="mt-1 text-center text-sm text-gray-500">
            No se encontraron pedidos con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {pedidosFiltrados.map((item) => {
            const estado = item.estado || 'Pendiente';
            const estadoColor = getEstadoColor(estado);
            const estadoBackground = getEstadoBackground(estado);
            const estadoIcon = getEstadoIcon(estado);
            const repartidorAsignado =
              item.repartidor_nombre || item.repartidor?.nombre || null;
            const puedeAsignar = estado === 'Pagado';
            const nombreCliente =
              item.cliente || item.nombre_completo || 'Sin nombre';

            return (
              <div
                key={item.id_pedido}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* CABECERA */}
                <div
                  onClick={() =>
                    navigate(`/admin/pedidos/${item.id_pedido}`, {
                      state: { esAdmin: true },
                    })
                  }
                  className="cursor-pointer"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-receipt text-[#B90F0F] text-lg"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-base font-bold text-gray-900">
                            Pedido #{item.id_pedido}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {item.fechaFormateada}
                          </p>
                        </div>
                      </div>

                      <span
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: estadoBackground,
                          color: estadoColor,
                        }}
                      >
                        <i className={`fa-solid ${estadoIcon}`}></i>
                        {ESTADOS_MAP[estado] || estado}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100"></div>

                  {/* CLIENTE */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-circle-user text-[#B90F0F]"></i>
                      <span className="text-sm font-bold text-gray-800">
                        Cliente
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <i className="fa-solid fa-user text-gray-400 text-sm w-4"></i>
                        <span className="text-sm text-gray-600 truncate">
                          {nombreCliente}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        <i className="fa-solid fa-building text-gray-400 text-sm w-4"></i>
                        <span className="text-sm text-gray-600 truncate">
                          {item.ciudad_envio || 'Sin ciudad'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 min-w-0 sm:col-span-2">
                        <i className="fa-solid fa-location-dot text-gray-400 text-sm w-4"></i>
                        <span className="text-sm text-gray-600 truncate">
                          {item.direccion_entrega || 'Sin dirección'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100"></div>

                  {/* REPARTIDOR */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="fa-solid fa-motorcycle text-[#B90F0F]"></i>
                      <span className="text-sm font-bold text-gray-800">
                        Repartidor
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-user text-gray-400 text-sm w-4"></i>
                      <span className="text-sm text-gray-600 truncate">
                        {repartidorAsignado || 'No asignado'}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100"></div>

                  {/* INFORMACIÓN INFERIOR */}
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-calendar text-gray-400 text-sm"></i>
                      <span className="text-xs text-gray-500">
                        {formatearFecha(item.fecha_estimada)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-money-bill text-[#B90F0F] text-sm"></i>
                      <span className="text-sm font-bold text-[#B90F0F]">
                        {item.totalFormateado}
                      </span>
                    </div>

                    <div className="sm:ml-auto flex items-center gap-1">
                      <span className="text-sm font-semibold text-[#B90F0F]">
                        Ver
                      </span>
                      <i className="fa-solid fa-chevron-right text-[#B90F0F] text-xs"></i>
                    </div>
                  </div>
                </div>

                {/* ASIGNAR */}
                {puedeAsignar && (
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => {
                        setPedidoSeleccionado(item);
                        setMostrarRepartidores(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#B90F0F] text-white font-semibold hover:bg-[#8a0b0b] transition"
                    >
                      <i className="fa-solid fa-users"></i>
                      <span>
                        {repartidorAsignado
                          ? 'Cambiar asignación'
                          : 'Asignar a'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL REPARTIDORES */}
      {mostrarRepartidores && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setMostrarRepartidores(false)}
        >
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Asignar pedido a:
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona un repartidor o administrador disponible.
                </p>
              </div>

              <button
                onClick={() => setMostrarRepartidores(false)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              >
                <i className="fa-solid fa-xmark text-xl text-gray-600"></i>
              </button>
            </div>

            {repartidores.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="fa-solid fa-users-slash text-gray-400 text-xl"></i>
                </div>

                <p className="mt-4 text-sm text-gray-500">
                  No hay repartidores ni administradores disponibles
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {repartidores.map((usuario) => {
                  const esAdmin = usuario.esAdmin || false;

                  return (
                    <button
                      key={usuario.id_usuario}
                      onClick={() => handleAsignar(usuario)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <i
                          className={`fa-solid ${
                            esAdmin ? 'fa-briefcase' : 'fa-circle-user'
                          } text-[#B90F0F] text-lg`}
                        ></i>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {usuario.nombre_completo}

                          {esAdmin && (
                            <span className="text-xs font-normal text-[#B90F0F]">
                              {' '}
                              (Admin - Distribuidor externo)
                            </span>
                          )}
                        </p>

                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {usuario.vehiculo
                            ? `${usuario.vehiculo.tipo}${
                                usuario.vehiculo.placa &&
                                usuario.vehiculo.placa !== 'N/A'
                                  ? ` - ${usuario.vehiculo.placa}`
                                  : ''
                              }`
                            : 'Sin vehículo asignado'}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold shrink-0 ${
                          usuario.estado === 'ACTIVO'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {usuario.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default GestionarPedidosAdmin;