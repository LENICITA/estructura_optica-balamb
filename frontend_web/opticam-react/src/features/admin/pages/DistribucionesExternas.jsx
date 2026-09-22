// src/features/admin/pages/DistribucionesExternas.jsx
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistribucionController } from '../../../core/controllers/DistribucionController';

const ESTADO_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: '#B45309', bg: '#FEF3C7', icon: 'fa-clock' },
  EN_ENTREGA: { label: 'En entrega', color: '#1D4ED8', bg: '#DBEAFE', icon: 'fa-motorcycle' },
  ENTREGADO: { label: 'Entregado', color: '#15803D', bg: '#DCFCE7', icon: 'fa-circle-check' },
  CANCELADO: { label: 'Cancelado', color: '#B91C1C', bg: '#FEE2E2', icon: 'fa-circle-xmark' },
};

const getEstadoConfig = (estado) =>
  ESTADO_CONFIG[estado] ?? { label: estado, color: '#6B7280', bg: '#F3F4F6', icon: 'fa-circle-question' };

const ESTADOS_FILTRO = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'PENDIENTE', label: 'Pendiente' },
  { key: 'EN_ENTREGA', label: 'En entrega' },
  { key: 'ENTREGADO', label: 'Entregado' },
];

const DistribucionesExternas = () => {
  const navigate = useNavigate();
  const [distribuciones, setDistribuciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buscar, setBuscar] = useState('');
  const [ciudadFiltro, setCiudadFiltro] = useState('todas');
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');

  const distribucionController = useMemo(() => new DistribucionController(), []);

  const cargarDistribuciones = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const data = await distribucionController.getDistribucionesExternas();
        const BOGOTA = ['bogotá', 'bogota', 'bogotá d.c.', 'bogota d.c.'];
        const externas = data.filter((d) => {
          const ciudad = (d.pedido?.ciudad_envio || d.pedido?.cliente?.ciudad || '').toLowerCase().trim();
          return ciudad !== '' && !BOGOTA.includes(ciudad);
        });

        setDistribuciones(externas);
      } catch (error) {
        console.error('Error al cargar distribuciones externas:', error);
        alert(error?.message || 'No se pudieron cargar las distribuciones externas.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [distribucionController]
  );

  useEffect(() => {
    cargarDistribuciones();
  }, [cargarDistribuciones]);

  const distribucionesActivas = useMemo(
    () => distribuciones.filter((d) => d.estado !== 'CANCELADO'),
    [distribuciones]
  );

  const ciudades = useMemo(() => {
    const set = new Set();
    distribucionesActivas.forEach((d) => {
      const c = d.pedido?.ciudad_envio?.trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [distribucionesActivas]);

  const conteoEstados = useMemo(() => {
    const base = { TODOS: distribucionesActivas.length, PENDIENTE: 0, EN_ENTREGA: 0, ENTREGADO: 0 };
    distribucionesActivas.forEach((d) => {
      if (base[d.estado] !== undefined) base[d.estado] += 1;
    });
    return base;
  }, [distribucionesActivas]);

  const filtradas = useMemo(() => {
    return distribucionesActivas.filter((d) => {
      const ciudad = d.pedido?.ciudad_envio ?? '';
      const cliente = d.pedido?.cliente?.nombre ?? '';
      const direccion = d.pedido?.direccion_entrega ?? '';

      const cumpleCiudad = ciudadFiltro === 'todas' || ciudad === ciudadFiltro;
      const cumpleEstado = estadoFiltro === 'TODOS' || d.estado === estadoFiltro;

      const q = buscar.trim().toLowerCase();
      const cumpleBusqueda =
        q === '' ||
        cliente.toLowerCase().includes(q) ||
        ciudad.toLowerCase().includes(q) ||
        direccion.toLowerCase().includes(q);

      return cumpleCiudad && cumpleEstado && cumpleBusqueda;
    });
  }, [distribucionesActivas, ciudadFiltro, estadoFiltro, buscar]);

  const totalExternas = distribucionesActivas.length;
  const enEntrega = conteoEstados.EN_ENTREGA;
  const entregadas = conteoEstados.ENTREGADO;

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
            >
              <i className="fa-solid fa-arrow-left text-gray-700"></i>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-plane text-[#B90F0F]"></i>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Envíos externos
                </h1>
              </div>

              <p className="text-sm text-gray-500 mt-1 ml-12">
                Gestiona las distribuciones fuera de Bogotá
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/distribuciones/historial')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition"
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
            Historial
          </button>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total externos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {totalExternas}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-plane text-[#B90F0F] text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En entrega</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {enEntrega}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <i className="fa-solid fa-motorcycle text-blue-600 text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Entregadas</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {entregadas}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <i className="fa-solid fa-circle-check text-green-600 text-lg"></i>
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* BUSCADOR */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar distribución
            </label>

            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

              <input
                type="text"
                placeholder="Cliente, ciudad o dirección..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="w-full h-11 pl-11 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#B90F0F] text-sm transition"
              />

              {buscar && (
                <button
                  onClick={() => setBuscar('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* CIUDAD */}
          <div className="w-full lg:w-56">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ciudad
            </label>

            <select
              value={ciudadFiltro}
              onChange={(e) => setCiudadFiltro(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#B90F0F] text-sm"
            >
              <option value="todas">Todas las ciudades</option>
              {ciudades.map((ciudad) => (
                <option key={ciudad} value={ciudad}>
                  {ciudad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ESTADOS */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Estado
          </p>

          <div className="flex flex-wrap gap-2">
            {ESTADOS_FILTRO.map((e) => {
              const activo = estadoFiltro === e.key;
              const count = conteoEstados[e.key] ?? 0;

              return (
                <button
                  key={e.key}
                  onClick={() => setEstadoFiltro(e.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition ${
                    activo
                      ? 'bg-[#B90F0F] border-[#B90F0F] text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-semibold">
                    {e.label}
                  </span>

                  <span
                    className={`min-w-[22px] h-5 px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      activo
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-500">
            Cargando envíos externos...
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && filtradas.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 px-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-plane text-3xl text-gray-300"></i>
          </div>

          <p className="mt-4 text-lg font-bold text-gray-800">
            Sin distribuciones
          </p>

          <p className="mt-1 text-center text-sm text-gray-500 max-w-md">
            {distribucionesActivas.length === 0
              ? 'Aún no hay envíos fuera de Bogotá'
              : 'No se encontraron envíos con esos filtros'}
          </p>
        </div>
      )}

      {/* CONTADOR */}
      {!loading && filtradas.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Distribuciones externas
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {filtradas.length}{' '}
              {filtradas.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          </div>

          {refreshing && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <i className="fa-solid fa-spinner fa-spin"></i>
              Actualizando...
            </div>
          )}
        </div>
      )}

      {/* LISTA */}
      {!loading && filtradas.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtradas.map((d) => {
            const est = getEstadoConfig(d.estado);
            const cliente = d.pedido?.cliente?.nombre || 'Cliente';
            const ciudad = d.pedido?.ciudad_envio || 'Sin ciudad';
            const direccion = d.pedido?.direccion_entrega || 'Sin dirección';
            const adminNombre = d.repartidor?.nombre || 'Sin asignar';
            const vehiculo = d.vehiculoRepartidor;
            const fecha = d.fechaAsignacionFormateada;

            return (
              <div
                key={d.id_distribucion}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
              >
                {/* CARD HEADER */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#B90F0F] text-lg font-bold">
                          {cliente.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {cliente}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                          <i className="fa-solid fa-location-dot text-[#B90F0F] text-xs"></i>
                          <span className="text-sm text-[#B90F0F] font-semibold truncate">
                            {ciudad}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide flex-shrink-0"
                      style={{
                        backgroundColor: est.bg,
                        color: est.color,
                      }}
                    >
                      <i className={`fa-solid ${est.icon}`}></i>
                      {est.label}
                    </span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* DIRECCIÓN */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-location-arrow text-gray-500 text-sm"></i>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                          Dirección
                        </p>
                        <p className="text-sm text-gray-800 font-medium mt-1 break-words">
                          {direccion}
                        </p>
                      </div>
                    </div>

                    {/* ASIGNADO */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-user text-gray-500 text-sm"></i>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                          Asignado a
                        </p>
                        <p className="text-sm text-gray-800 font-medium mt-1">
                          {adminNombre}
                        </p>
                      </div>
                    </div>

                    {/* VEHÍCULO */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-car text-gray-500 text-sm"></i>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                          Vehículo
                        </p>
                        <p
                          className={`text-sm font-medium mt-1 ${
                            vehiculo === 'N/A'
                              ? 'text-gray-400 italic'
                              : 'text-gray-800'
                          }`}
                        >
                          {vehiculo}
                        </p>
                      </div>
                    </div>

                    {/* FECHA */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-calendar text-gray-500 text-sm"></i>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                          Fecha de asignación
                        </p>
                        <p className="text-sm text-gray-800 font-medium mt-1">
                          {fecha}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DETALLES */}
                  <button
                    onClick={() =>
                      navigate(`/delivery/detalle/entrega/${d.id_distribucion}`)
                    }
                    className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-[#B90F0F] transition font-bold text-sm"
                  >
                    Ver detalles
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
};

export default DistribucionesExternas;