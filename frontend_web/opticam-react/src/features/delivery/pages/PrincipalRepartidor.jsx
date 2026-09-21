// src/features/delivery/pages/PrincipalRepartidor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistribucionController } from '../../../core/controllers/DistribucionController';

export const PrincipalRepartidor = () => {
  const navigate = useNavigate();
  const distribucionController = new DistribucionController();

  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODOS');
  const [pedidos, setPedidos] = useState([]);
  const [nombreRepartidor, setNombreRepartidor] = useState('Repartidor');
  const [vehiculoRepartidor, setVehiculoRepartidor] = useState('No asignado');

  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);

      const distribuciones = await distribucionController.getMisDistribuciones();

      if (!distribuciones || !Array.isArray(distribuciones) || distribuciones.length === 0) {
        setPedidos([]);
        return;
      }

      const pedidosMapeados = distribuciones
        .filter((d) => d.estado !== 'CANCELADO')
        .map((d) => {
          const cliente = d.pedido?.cliente?.nombre || 'Cliente';
          const telefono = d.pedido?.cliente?.telefono || '';
          const direccion = d.pedido?.direccion_entrega || '';
          const ciudad = d.pedido?.ciudad_envio || '';
          const repartidor = d.repartidor?.nombre || 'Repartidor';
          const vehiculo = d.repartidor?.vehiculo || 'No asignado';
          const fechaEstimada = d.pedido?.fecha_estimada || '';

          let fechaMostrar = 'Sin fecha';
          if (fechaEstimada) {
            try {
              const fecha = new Date(fechaEstimada);
              if (!isNaN(fecha.getTime())) {
                fechaMostrar = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
              } else {
                fechaMostrar = fechaEstimada;
              }
            } catch {
              fechaMostrar = fechaEstimada;
            }
          }

          const latitudRaw = d.latitud ?? d.latitude;
          const longitudRaw = d.longitud ?? d.longitude;
          const latitud = latitudRaw ? Number(latitudRaw) : NaN;
          const longitud = longitudRaw ? Number(longitudRaw) : NaN;

          let estado = 'PENDIENTE';
          if (d.estado === 'EN_ENTREGA') estado = 'EN_ENTREGA';
          else if (d.estado === 'ENTREGADO') estado = 'ENTREGADO';

          return {
            id: Number(d.id_pedido || d.id_distribucion || 0),
            id_distribucion: Number(d.id_distribucion || 0),
            cliente,
            direccion,
            ciudad,
            repartidor,
            vehiculo,
            latitud,
            longitud,
            estado,
            fecha: fechaMostrar,
            telefono,
            fecha_estimada: fechaEstimada,
          };
        });

      if (pedidosMapeados.length > 0) {
        setNombreRepartidor(pedidosMapeados[0].repartidor);
        setVehiculoRepartidor(pedidosMapeados[0].vehiculo);
      }

      setPedidos(pedidosMapeados);
    } catch (error) {
      console.error('Error al cargar datos del repartidor:', error);
      setPedidos([]);
      alert('No se pudieron cargar las entregas asignadas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const verDetalleDistribucion = (pedido) => {
    if (!pedido.id_distribucion) return alert('No se encontró el ID de la distribución.');
    navigate(`/repartidor/entrega/${pedido.id_distribucion}`);
  };

  const abrirRutaEnMaps = (pedido) => {
    const tieneCoords = Number.isFinite(pedido.latitud) && Number.isFinite(pedido.longitud);
    const destino = tieneCoords
      ? `${pedido.latitud},${pedido.longitud}`
      : `${pedido.direccion || ''}, ${pedido.ciudad || ''}, Colombia`;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
    window.open(url, '_blank');
  };

  const pedidosFiltrados = filtro === 'TODOS' ? pedidos : pedidos.filter((p) => p.estado === filtro);

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_ENTREGA': return 'En entrega';
      case 'ENTREGADO': return 'Entregado';
      default: return estado;
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'fa-clock';
      case 'EN_ENTREGA': return 'fa-motorcycle';
      case 'ENTREGADO': return 'fa-circle-check';
      default: return 'fa-circle-info';
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return '#D97706';
      case 'EN_ENTREGA': return '#B90F0F';
      case 'ENTREGADO': return '#008000';
      default: return '#777';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-base">Cargando pedidos...</p>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-truck text-[#B90F0F] text-xl"></i>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Bienvenido, {nombreRepartidor}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Gestiona y consulta tus entregas asignadas.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={cargarPedidos}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B90F0F] text-white rounded-lg font-semibold hover:bg-[#9f0d0d] transition"
            >
              <i className="fa-solid fa-rotate-right"></i>
              Actualizar
            </button>
          </div>
        </div>

        {/* INFORMACIÓN DEL REPARTIDOR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-user text-[#B90F0F] text-xl"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Repartidor
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {nombreRepartidor}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-car text-[#B90F0F] text-xl"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Vehículo asignado
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {vehiculoRepartidor}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pedidos.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                <i className="fa-solid fa-box text-gray-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pedidos.filter((p) => p.estado === 'PENDIENTE').length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <i className="fa-solid fa-clock text-orange-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En entrega</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pedidos.filter((p) => p.estado === 'EN_ENTREGA').length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-motorcycle text-[#B90F0F]"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Entregados</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pedidos.filter((p) => p.estado === 'ENTREGADO').length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-green-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Mis entregas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Filtra tus pedidos según su estado.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {['TODOS', 'PENDIENTE', 'EN_ENTREGA', 'ENTREGADO'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltro(tipo)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filtro === tipo
                      ? 'bg-[#B90F0F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tipo === 'TODOS'
                    ? 'Todos'
                    : tipo === 'PENDIENTE'
                    ? 'Pendientes'
                    : tipo === 'EN_ENTREGA'
                    ? 'En entrega'
                    : 'Entregados'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTADO */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Mostrando{' '}
            <span className="font-semibold text-gray-800">
              {pedidosFiltrados.length}
            </span>{' '}
            {pedidosFiltrados.length === 1 ? 'entrega' : 'entregas'}
          </p>
        </div>

        {/* LISTA */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-16 px-5 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fa-solid fa-box-open text-gray-400 text-2xl"></i>
            </div>

            <p className="text-lg font-bold text-gray-700 mt-4">
              No hay pedidos
            </p>

            <p className="text-sm text-gray-500 text-center mt-1">
              No hay pedidos para el filtro seleccionado.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {pedidosFiltrados.map((pedido) => (
              <div
                key={pedido.id_distribucion}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* MAPA */}
                <button
                  onClick={() => abrirRutaEnMaps(pedido)}
                  className="w-full h-[220px] relative bg-gray-100 flex flex-col items-center justify-center hover:bg-gray-200 transition"
                >
                  {Number.isFinite(pedido.latitud) &&
                  Number.isFinite(pedido.longitud) ? (
                    <iframe
                      title={`Mapa ${pedido.id_distribucion}`}
                      width="100%"
                      height="220"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${pedido.latitud},${pedido.longitud}&output=embed`}
                    ></iframe>
                  ) : (
                    <>
                      <i className="fa-solid fa-location-dot text-[#B90F0F] text-4xl"></i>

                      <p className="text-sm font-semibold text-gray-800 mt-3 text-center px-5">
                        {pedido.direccion || 'Sin dirección'}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {pedido.ciudad || 'Sin ciudad'}
                      </p>
                    </>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                    <i className="fa-solid fa-location-dot text-[#B90F0F] text-sm"></i>
                    <span className="text-xs font-semibold text-gray-700">
                      Abrir ruta
                    </span>
                  </div>
                </button>

                {/* CONTENIDO */}
                <div className="p-5">
                  {/* CABECERA */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        Distribución #{pedido.id_distribucion}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Fecha estimada: {pedido.fecha}
                      </p>
                    </div>

                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start"
                      style={{
                        backgroundColor:
                          pedido.estado === 'ENTREGADO'
                            ? '#E8F5E9'
                            : pedido.estado === 'PENDIENTE'
                            ? '#FFF4E5'
                            : '#EAF2FF',
                      }}
                    >
                      <i
                        className={`fa-solid ${getEstadoIcon(pedido.estado)} text-sm`}
                        style={{ color: getEstadoColor(pedido.estado) }}
                      ></i>

                      <span
                        className="text-xs font-semibold"
                        style={{ color: getEstadoColor(pedido.estado) }}
                      >
                        {getEstadoTexto(pedido.estado)}
                      </span>
                    </div>
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-user text-[#B90F0F] text-sm"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Cliente</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                            {pedido.cliente}
                          </p>

                          {pedido.telefono && (
                            <p className="text-xs text-gray-500 mt-1">
                              {pedido.telefono}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-location-dot text-[#B90F0F] text-sm"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">
                            Dirección de entrega
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                            {pedido.direccion || 'Sin dirección'}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {pedido.ciudad || 'Sin ciudad'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-user-circle text-[#B90F0F] text-base"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">
                            Repartidor
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                            {pedido.repartidor || 'No asignado'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-car text-[#B90F0F] text-sm"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Vehículo</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                            {pedido.vehiculo || 'No asignado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACCIONES */}
                  <button
                    onClick={() => verDetalleDistribucion(pedido)}
                    className="w-full flex items-center justify-center gap-2 border border-[#B90F0F] text-[#B90F0F] rounded-lg py-2.5 mt-5 font-semibold hover:bg-red-50 transition"
                  >
                    <i className="fa-solid fa-eye"></i>
                    Ver detalle
                  </button>

                  {pedido.estado === 'ENTREGADO' && (
                    <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-100 py-3 rounded-lg mt-4">
                      <i className="fa-solid fa-circle-check text-green-600"></i>
                      <span className="text-green-700 text-sm font-semibold">
                        Pedido entregado
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalRepartidor;