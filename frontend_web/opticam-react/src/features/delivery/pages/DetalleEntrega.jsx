// src/features/delivery/pages/DetalleEntrega.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { checkObservacion } from '../../../shared/validators/distribucionValidators';

const DetalleEntrega = () => {
  const { id_distribucion } = useParams();
  const navigate = useNavigate();
  const distribucionController = new DistribucionController();

  const [distribucion, setDistribucion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [observacionModalVisible, setObservacionModalVisible] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const cargarDistribucion = useCallback(async () => {
    try {
      setLoading(true);

      if (!id_distribucion) {
        alert('No se recibió el ID de la distribución.');
        return;
      }

      const resultado = await distribucionController.getDistribucionById(Number(id_distribucion));

      if (!resultado) {
        alert('No se encontró la distribución o no tienes acceso a ella.');
        setDistribucion(null);
        return;
      }

      setDistribucion(resultado);
    } catch (error) {
      console.error('Error al cargar detalle de entrega:', error);
      alert('No se pudo cargar la información de la entrega.');
    } finally {
      setLoading(false);
    }
  }, [id_distribucion]);

  useEffect(() => {
    cargarDistribucion();
  }, [cargarDistribucion]);

  const iniciarEntrega = async () => {
    try {
      setActionLoading(true);
      const resultado = await distribucionController.iniciarEntrega(Number(id_distribucion));
      if (!resultado.success) {
        alert(resultado.message || 'Intenta nuevamente.');
        return;
      }
      await cargarDistribucion();
    } finally {
      setActionLoading(false);
    }
  };

  const marcarEntregado = async (textoObservacion) => {
    const check = checkObservacion(textoObservacion);
    if (!check.valido) return alert(check.mensaje || 'Observación inválida');

    try {
      setActionLoading(true);
      const resultado = await distribucionController.marcarEntregado(
        Number(id_distribucion),
        textoObservacion?.trim() || undefined
      );
      if (!resultado.success) {
        alert(resultado.message || 'Intenta nuevamente.');
        return;
      }
      setObservacion('');
      setObservacionModalVisible(false);
      await cargarDistribucion();
    } finally {
      setActionLoading(false);
    }
  };

  const confirmarEntrega = () => {
    if (!window.confirm('¿El pedido ya fue entregado al cliente?')) return;
    setObservacionModalVisible(true);
  };

  const abrirRuta = () => {
    const direccion = `${distribucion?.pedido?.direccion_entrega || ''}, ${distribucion?.pedido?.ciudad_envio || ''}, Colombia`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`, '_blank');
  };

  const formatearPrecio = (precio) => `$${Number(precio || 0).toLocaleString('es-CO')}`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando detalle de distribución...</p>
      </div>
    );
  }

  if (!distribucion) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-8 bg-white">
        <i className="fa-solid fa-circle-exclamation text-gray-400 text-5xl"></i>
        <p className="mt-3 text-[19px] font-bold text-gray-800">Distribución no encontrada</p>
        <p className="mt-2 text-sm text-gray-500 text-center leading-5">
          No fue posible encontrar esta distribución.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-5 bg-[#B90F0F] text-white px-7 py-2.5 rounded-lg font-bold"
        >
          Volver
        </button>
      </div>
    );
  }

  const pedido = distribucion.pedido;
  const cliente = pedido?.cliente;
  const repartidor = distribucion.repartidor;

  const estadoBgColor =
    distribucion.estado === 'PENDIENTE' ? '#FFF4E5' :
    distribucion.estado === 'EN_ENTREGA' ? '#EEF4FF' :
    distribucion.estado === 'ENTREGADO' ? '#E8F5E9' : '#FDECEC';

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-11 h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition"
              >
                <i className="fa-solid fa-arrow-left text-gray-700"></i>
              </button>

              <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-motorcycle text-[#B90F0F] text-2xl"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Detalle de distribución
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Entrega #{distribucion.id_distribucion} · Pedido #{distribucion.id_pedido}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full self-start sm:self-center"
              style={{ backgroundColor: estadoBgColor }}
            >
              <i
                className={`fa-solid ${
                  distribucion.estadoIcon === 'time-outline'
                    ? 'fa-clock'
                    : distribucion.estadoIcon === 'bicycle-outline'
                    ? 'fa-motorcycle'
                    : distribucion.estadoIcon === 'checkmark-circle-outline'
                    ? 'fa-circle-check'
                    : 'fa-circle-xmark'
                }`}
                style={{ color: distribucion.estadoColor }}
              ></i>

              <span
                className="text-sm font-bold"
                style={{ color: distribucion.estadoColor }}
              >
                {distribucion.estadoDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* RESUMEN DEL PEDIDO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-hashtag text-[#B90F0F]"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500">Número de pedido</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  #{distribucion.id_pedido}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-user text-[#B90F0F]"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {cliente?.nombre || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-money-bill text-[#B90F0F]"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500">Total del pedido</p>
                <p className="text-lg font-bold text-[#B90F0F] mt-1">
                  {formatearPrecio(pedido?.total || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* DATOS DEL PEDIDO Y CLIENTE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* DATOS DEL PEDIDO */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-box text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Datos del pedido
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Información relacionada con la entrega.
                </p>
              </div>
            </div>

            <div className="space-y-5">

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Dirección de entrega</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {pedido?.direccion_entrega || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-building text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Ciudad</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {pedido?.ciudad_envio || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-calendar text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Fecha estimada de entrega
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {pedido?.fecha_estimada || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-money-bill-wave text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Total del pedido</p>
                  <p className="text-base font-extrabold text-[#B90F0F] mt-1">
                    {formatearPrecio(pedido?.total || 0)}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* CLIENTE */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-user text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Datos del cliente
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Información de contacto del destinatario.
                </p>
              </div>
            </div>

            <div className="space-y-5">

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {cliente?.nombre || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-phone text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {cliente?.telefono || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Dirección</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {pedido?.direccion_entrega || 'N/A'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* REPARTIDOR */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-motorcycle text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Datos del repartidor o administrador
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Persona responsable de realizar la entrega.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-user-circle text-[#B90F0F]"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500">Repartidor</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {repartidor?.nombre || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-phone text-[#B90F0F]"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {repartidor?.telefono || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-car text-[#B90F0F]"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500">Vehículo</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {(() => {
                    const ciudad = pedido?.ciudad_envio?.toLowerCase().trim();

                    return ciudad === 'bogotá' || ciudad === 'bogota'
                      ? distribucion.vehiculoRepartidor
                      : 'N/A';
                  })()}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* OBSERVACIONES */}
        {(distribucion.estado === 'EN_ENTREGA' ||
          distribucion.estado === 'ENTREGADO') && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-comment-dots text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Observaciones
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comentarios registrados durante la entrega.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-6">
                {distribucion.observaciones || 'Sin observaciones'}
              </p>
            </div>
          </div>
        )}

        {/* INFORMACIÓN DE LA DISTRIBUCIÓN */}
        {distribucion.estado === 'ENTREGADO' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-clock-rotate-left text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Información de la distribución
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registro de fechas de la entrega.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                    <i className="fa-solid fa-calendar text-[#B90F0F]"></i>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Fecha de asignación
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {distribucion.fechaAsignacionFormateada}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                    <i className="fa-solid fa-check-double text-[#B90F0F]"></i>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Fecha de entrega
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {distribucion.fecha_entrega
                        ? new Date(
                            distribucion.fecha_entrega
                          ).toLocaleDateString('es-CO')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ESTADO ACTUAL */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: estadoBgColor }}
            >
              <i
                className={`fa-solid ${
                  distribucion.estadoIcon === 'time-outline'
                    ? 'fa-clock'
                    : distribucion.estadoIcon === 'bicycle-outline'
                    ? 'fa-motorcycle'
                    : distribucion.estadoIcon === 'checkmark-circle-outline'
                    ? 'fa-circle-check'
                    : 'fa-circle-xmark'
                } text-2xl`}
                style={{ color: distribucion.estadoColor }}
              ></i>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Estado actual de la entrega
              </p>

              <p
                className="text-xl font-bold mt-1"
                style={{ color: distribucion.estadoColor }}
              >
                {distribucion.estadoDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-bolt text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Acciones
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Gestiona el estado y la ruta de la entrega.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={abrirRuta}
              className="w-full flex items-center justify-center gap-2 bg-[#B90F0F] text-white py-3 rounded-xl font-bold hover:bg-[#9f0d0d] transition"
            >
              <i className="fa-solid fa-map"></i>
              Ver mapa
            </button>

            {distribucion.estado === 'PENDIENTE' && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      '¿Deseas iniciar la entrega de este pedido?'
                    )
                  ) {
                    iniciarEntrega();
                  }
                }}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 border border-[#B90F0F] text-[#B90F0F] py-3 rounded-xl font-bold hover:bg-red-50 transition disabled:opacity-60"
              >
                <i className="fa-solid fa-play"></i>
                {actionLoading ? 'Procesando...' : 'Iniciar entrega'}
              </button>
            )}

            {distribucion.estado === 'EN_ENTREGA' && (
              <button
                onClick={confirmarEntrega}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 border border-[#B90F0F] text-[#B90F0F] py-3 rounded-xl font-bold hover:bg-red-50 transition disabled:opacity-60"
              >
                <i className="fa-solid fa-check"></i>
                {actionLoading ? 'Procesando...' : 'Marcar como entregado'}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* MODAL OBSERVACIÓN */}
      {observacionModalVisible && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-comment-dots text-[#B90F0F]"></i>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Agregar observación
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Puedes registrar un comentario sobre la entrega.
                </p>
              </div>
            </div>

            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Escribe una observación (opcional)"
              maxLength={5000}
              className="w-full min-h-[120px] border border-gray-300 rounded-xl p-3 outline-none resize-none text-sm focus:ring-2 focus:ring-red-100 focus:border-[#B90F0F]"
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-5">
              <button
                onClick={() => setObservacionModalVisible(false)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                onClick={() => marcarEntregado(observacion)}
                disabled={actionLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#B90F0F] text-white font-bold hover:bg-[#9f0d0d] transition disabled:opacity-60"
              >
                {actionLoading ? 'Guardando...' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetalleEntrega;