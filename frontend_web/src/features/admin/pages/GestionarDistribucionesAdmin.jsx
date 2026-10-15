// src/features/admin/pages/GestionarDistribucionesAdmin.jsx
import React, { useCallback, useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { alertError, alertSuccess, alertConfirm } from '../../../shared/utils/alert';
=======
import { Link, useNavigate } from 'react-router-dom';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e

const ESTADOS_FILTRO = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'En entrega', value: 'EN_ENTREGA' },
  { label: 'Entregado', value: 'ENTREGADO' },
];

export const GestionarDistribucionesAdmin = () => {
<<<<<<< HEAD
=======
  const navigate = useNavigate();
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
  const distribucionController = new DistribucionController();

  const [distribuciones, setDistribuciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [menuVisible, setMenuVisible] = useState(false);
  const [distribucionSeleccionada, setDistribucionSeleccionada] = useState(null);

  const cargarDistribuciones = useCallback(async () => {
    try {
      setError(null);
      const data = await distribucionController.getTodasDistribuciones();
      setDistribuciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando distribuciones:', err);
      setError(err?.message || 'No fue posible cargar las distribuciones');
      setDistribuciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    cargarDistribuciones();
  }, [cargarDistribuciones]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDistribuciones();
  };

  const distribucionesFiltradas = distribuciones.filter((item) => {
    if (item.estado === 'CANCELADO') return false;
<<<<<<< HEAD

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();
      const cliente = item.pedido?.cliente?.nombre?.toLowerCase() || '';
      const ciudad = item.pedido?.ciudad_envio?.toLowerCase() || '';
      const repartidor = item.repartidor?.nombre?.toLowerCase() || '';
      if (!cliente.includes(texto) && !ciudad.includes(texto) && !repartidor.includes(texto)) return false;
    }

    if (filtroEstado !== 'TODOS') return item.estado === filtroEstado;

    return true;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return '#D97706';
      case 'EN_ENTREGA': return '#2563EB';
      case 'ENTREGADO': return '#22C55E';
      case 'CANCELADO': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoBackground = (estado) => `${getEstadoColor(estado)}20`;

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'fa-clock';
      case 'EN_ENTREGA': return 'fa-motorcycle';
      case 'ENTREGADO': return 'fa-circle-check';
      case 'CANCELADO': return 'fa-circle-xmark';
      default: return 'fa-circle-question';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_ENTREGA': return 'En entrega';
      case 'ENTREGADO': return 'Entregado';
      case 'CANCELADO': return 'Cancelado';
      default: return estado;
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const abrirMenu = (distribucion) => {
    setDistribucionSeleccionada(distribucion);
    setMenuVisible(true);
  };

  const cerrarMenu = () => {
    setMenuVisible(false);
    setDistribucionSeleccionada(null);
  };

  const handleCancelar = async () => {
    if (!distribucionSeleccionada) return;

    const id = distribucionSeleccionada.id_distribucion;
    cerrarMenu();

    const confirmado = await alertConfirm({
      title: '¿Cancelar distribución?',
      text: `¿Estás seguro de cancelar la distribución #${id}? El pedido volverá a estado "Pagado".`,
      confirmButtonText: 'Sí, cancelar',
    });
    if (!confirmado) return;

    try {
      const result = await distribucionController.cancelarEntrega(id);

      if (result.success) {
        alertSuccess(result.message || 'Distribución cancelada exitosamente');
        cargarDistribuciones();
      } else {
        alertError(result.message || 'No se pudo cancelar la distribución');
      }
    } catch (error) {
      console.error('Error al cancelar:', error);
      alertError(error.message || 'Error al cancelar la distribución');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando distribuciones...</p>
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
          onClick={cargarDistribuciones}
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
=======

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();
      const cliente = item.pedido?.cliente?.nombre?.toLowerCase() || '';
      const ciudad = item.pedido?.ciudad_envio?.toLowerCase() || '';
      const repartidor = item.repartidor?.nombre?.toLowerCase() || '';
      if (!cliente.includes(texto) && !ciudad.includes(texto) && !repartidor.includes(texto)) return false;
    }

    if (filtroEstado !== 'TODOS') return item.estado === filtroEstado;

    return true;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return '#D97706';
      case 'EN_ENTREGA': return '#2563EB';
      case 'ENTREGADO': return '#22C55E';
      case 'CANCELADO': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoBackground = (estado) => `${getEstadoColor(estado)}20`;

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'fa-clock';
      case 'EN_ENTREGA': return 'fa-motorcycle';
      case 'ENTREGADO': return 'fa-circle-check';
      case 'CANCELADO': return 'fa-circle-xmark';
      default: return 'fa-circle-question';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_ENTREGA': return 'En entrega';
      case 'ENTREGADO': return 'Entregado';
      case 'CANCELADO': return 'Cancelado';
      default: return estado;
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const abrirMenu = (distribucion) => {
    setDistribucionSeleccionada(distribucion);
    setMenuVisible(true);
  };

  const cerrarMenu = () => {
    setMenuVisible(false);
    setDistribucionSeleccionada(null);
  };

  const handleCancelar = async () => {
    if (!distribucionSeleccionada) return;

    const id = distribucionSeleccionada.id_distribucion;
    cerrarMenu();

    if (!window.confirm(`¿Estás seguro de cancelar la distribución #${id}? El pedido volverá a estado "Pagado".`)) return;

    try {
      const result = await distribucionController.cancelarEntrega(id);

      if (result.success) {
        alert(result.message || 'Distribución cancelada exitosamente');
        cargarDistribuciones();
      } else {
        alert(result.message || 'No se pudo cancelar la distribución');
      }
    } catch (error) {
      console.error('Error al cancelar:', error);
      alert(error.message || 'Error al cancelar la distribución');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando distribuciones...</p>
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
          onClick={cargarDistribuciones}
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
        {/* HEADER */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-truck text-[#B90F0F] text-xl"></i>
            </div>

            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                Gestionar distribuciones
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Consulta y administra las distribuciones de los pedidos.
              </p>
            </div>

            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-60"
            >
              <i
                className={`fa-solid fa-rotate-right ${
                  refreshing ? 'animate-spin' : ''
                }`}
              ></i>
              Actualizar
            </button>
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* ESTADÍSTICAS */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">
                  {distribuciones.filter((item) => item.estado !== 'CANCELADO').length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-cube text-[#B90F0F] text-lg"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">
<<<<<<< HEAD
                  {distribuciones.filter((item) => item.estado === 'PENDIENTE').length}
=======
                  {
                    distribuciones.filter(
                      (item) => item.estado === 'PENDIENTE'
                    ).length
                  }
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <i className="fa-solid fa-clock text-amber-600 text-lg"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En entrega</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">
<<<<<<< HEAD
                  {distribuciones.filter((item) => item.estado === 'EN_ENTREGA').length}
=======
                  {
                    distribuciones.filter(
                      (item) => item.estado === 'EN_ENTREGA'
                    ).length
                  }
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <i className="fa-solid fa-motorcycle text-blue-600 text-lg"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Entregadas</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">
<<<<<<< HEAD
                  {distribuciones.filter((item) => item.estado === 'ENTREGADO').length}
=======
                  {
                    distribuciones.filter(
                      (item) => item.estado === 'ENTREGADO'
                    ).length
                  }
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-green-600 text-lg"></i>
              </div>
            </div>
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* BUSCADOR Y FILTROS */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

              <input
                type="text"
                placeholder="Buscar por cliente, ciudad o repartidor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-lg border border-gray-200 bg-gray-50 outline-none text-sm text-gray-800 focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]"
              />

              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>

            <Link
              to="/admin/distribuciones/externas"
              className="h-11 px-4 rounded-lg bg-[#B90F0F] text-white flex items-center justify-center gap-2 font-semibold hover:bg-[#9f0d0d] transition"
            >
              <i className="fa-solid fa-briefcase"></i>
              <span className="text-sm">Ver distribuciones externas</span>
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {ESTADOS_FILTRO.map((estado) => (
              <button
                key={estado.value}
                onClick={() => setFiltroEstado(estado.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  filtroEstado === estado.value
                    ? 'bg-[#B90F0F] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {estado.label}
              </button>
            ))}
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* CONTADOR */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-800">
              {distribucionesFiltradas.length}
            </span>{' '}
            {distribucionesFiltradas.length === 1
              ? 'distribución'
              : 'distribuciones'}
          </p>
        </div>

<<<<<<< HEAD
=======
        {/* LISTA */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
        {distribucionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 px-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fa-solid fa-cube text-3xl text-gray-300"></i>
            </div>

            <p className="mt-4 text-lg font-bold text-gray-600">
              No hay distribuciones
            </p>

            <p className="mt-1 text-center text-sm text-gray-500">
              No se encontraron distribuciones registradas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {distribucionesFiltradas.map((item) => {
              const estado = item.estado || 'PENDIENTE';
              const estadoColor = getEstadoColor(estado);
              const estadoBackground = getEstadoBackground(estado);
              const estadoIcon = getEstadoIcon(estado);

              const clienteNombre =
                item.pedido?.cliente?.nombre || 'Sin cliente';
              const ciudad = item.pedido?.ciudad_envio || 'Sin ciudad';
              const repartidorNombre =
                item.repartidor?.nombre || 'No asignado';
              const vehiculo = item.repartidor?.vehiculo || 'N/A';

              return (
                <div
                  key={item.id_distribucion}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition"
                >
<<<<<<< HEAD
=======
                  {/* HEADER CARD */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-cube text-[#B90F0F] text-xl"></i>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">
                          Distribución
                        </p>
                        <p className="text-base font-extrabold text-gray-800">
                          #{item.id_distribucion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          backgroundColor: estadoBackground,
                          color: estadoColor,
                        }}
                      >
                        <i className={`fa-solid ${estadoIcon}`}></i>
                        {getEstadoTexto(estado)}
                      </span>

                      {estado === 'PENDIENTE' && (
                        <button
                          onClick={() => abrirMenu(item)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
<<<<<<< HEAD
                          title="Opciones"
=======
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100 my-4"></div>

<<<<<<< HEAD
=======
                  {/* INFORMACIÓN */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-user text-gray-500"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Cliente
                          </p>
                          <p className="text-sm text-gray-800 font-semibold mt-0.5 break-words">
                            {clienteNombre}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-location-dot text-gray-500"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Ciudad de envío
                          </p>
                          <p className="text-sm text-gray-800 font-semibold mt-0.5 break-words">
                            {ciudad}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-motorcycle text-gray-500"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Repartidor
                          </p>
                          <p className="text-sm text-gray-800 font-semibold mt-0.5 break-words">
                            {repartidorNombre}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-car text-gray-500"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Vehículo
                          </p>
                          <p className="text-sm text-gray-800 font-semibold mt-0.5 break-words">
                            {vehiculo}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

<<<<<<< HEAD
=======
                  {/* FECHA */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
                  <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-calendar text-gray-500"></i>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                        Fecha asignación
                      </p>
                      <p className="text-sm text-gray-800 font-semibold mt-0.5">
                        {formatearFecha(item.fecha_asignacion)}
                      </p>
                    </div>
                  </div>

<<<<<<< HEAD
=======
                  {/* OBSERVACIONES */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
                  {item.observaciones && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                        Observaciones
                      </p>
                      <p className="text-sm text-gray-600 leading-5">
                        {item.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

<<<<<<< HEAD
=======
        {/* MODAL MENÚ */}
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
        {menuVisible && (
          <div
            className="fixed inset-0 bg-black/40 z-[1000] flex items-end sm:items-center justify-center px-4"
            onClick={cerrarMenu}
          >
            <div
              className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Distribución</p>
                  <p className="text-lg font-extrabold text-gray-800">
                    #{distribucionSeleccionada?.id_distribucion}
                  </p>
                </div>

                <button
                  onClick={cerrarMenu}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
                >
                  <i className="fa-solid fa-xmark text-xl text-gray-700"></i>
                </button>
              </div>

              <button
                onClick={handleCancelar}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-circle-xmark text-red-500 text-xl"></i>
                </div>

                <span className="text-sm font-semibold text-red-500">
                  Cancelar distribución
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default GestionarDistribucionesAdmin;
=======
export default GestionarDistribucionesAdmin;
>>>>>>> 621fce9553a2c9994c3ee6d05abfb56ff0db106e
