// src/features/delivery/pages/HistorialEntregas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { useAuth } from '../../auth/context/AuthContext';

const distribucionController = new DistribucionController();

const HistorialEntregas = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  const esAdmin = user?.isAdmin || false;

  const cargarHistorial = useCallback(async () => {
    try {
      setLoading(true);
      const data = await distribucionController.getHistorial();
      const filtrado = data.filter((item) => item.estado === 'ENTREGADO');
      setHistorial(filtrado);
    } catch (error) {
      console.error('Error cargando historial:', error);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-600 text-sm">Cargando historial...</p>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

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
                <i className="fa-solid fa-clock-rotate-left text-[#B90F0F] text-2xl"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {esAdmin ? 'Historial externo' : 'Historial de entregas'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Consulta las entregas que ya fueron completadas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <i className="fa-solid fa-box-open text-[#B90F0F]"></i>
              <span className="text-sm font-semibold text-gray-700">
                {historial.length}{' '}
                {historial.length === 1 ? 'entrega completada' : 'entregas completadas'}
              </span>
            </div>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-green-600 text-xl"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500">Entregas completadas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {historial.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-calendar-check text-[#B90F0F] text-xl"></i>
              </div>

              <div>
                <p className="text-xs text-gray-500">Estado del historial</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  Todas las entregas finalizadas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TÍTULO DE RESULTADOS */}
        {historial.length > 0 && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Entregas realizadas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Registro histórico de pedidos entregados.
              </p>
            </div>
          </div>
        )}

        {/* ESTADO VACÍO */}
        {historial.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 sm:p-14 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
              <i className="fa-solid fa-box-open text-gray-400 text-4xl"></i>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-5">
              {esAdmin ? 'Sin entregas externas' : 'Sin entregas completadas'}
            </h2>

            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2 leading-6">
              {esAdmin
                ? 'Cuando se entreguen pedidos fuera de Bogotá aparecerán aquí.'
                : 'Cuando completes tus entregas aparecerán aquí.'}
            </p>

            <button
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center justify-center gap-2 bg-[#B90F0F] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#9f0d0d] transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Volver
            </button>
          </div>
        ) : (
          /* LISTA */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {historial.map((item) => (
              <div
                key={item.id_distribucion}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition"
              >
                {/* CABECERA DE TARJETA */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-gray-900">
                        Entrega #{item.id_distribucion}
                      </span>

                      <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        <i className="fa-solid fa-circle-check"></i>
                        {item.estadoDisplay}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1.5">
                      Pedido #{item.id_pedido}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <i className="fa-solid fa-calendar-check text-[#B90F0F]"></i>
                    {item.fechaEntregaFormateada}
                  </div>
                </div>

                {/* INFORMACIÓN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5">

                  {/* DIRECCIÓN */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-location-dot text-[#B90F0F]"></i>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Dirección</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1 break-words">
                        {item.pedido?.direccion_entrega || 'No especificada'}
                      </p>
                    </div>
                  </div>

                  {/* CIUDAD */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-building text-[#B90F0F]"></i>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Ciudad</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {item.pedido?.ciudad_envio || 'No especificada'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* OBSERVACIÓN */}
                {item.tieneObservacion && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-comment-dots text-gray-500"></i>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-500">
                          Observación
                        </p>

                        <p className="text-sm text-gray-800 leading-5 mt-1 break-words">
                          {item.observaciones}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TOTAL */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                      <i className="fa-solid fa-money-bill-wave text-[#B90F0F]"></i>
                    </div>

                    <span className="text-sm text-gray-500">
                      Total del pedido
                    </span>
                  </div>

                  <span className="text-xl font-black text-[#B90F0F]">
                    {item.totalFormateado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default HistorialEntregas;