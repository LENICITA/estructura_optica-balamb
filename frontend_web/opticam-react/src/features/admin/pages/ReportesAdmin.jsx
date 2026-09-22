// src/features/admin/pages/ReportesAdmin.jsx
import React, { useState } from 'react';
import { ReporteController } from '../../../core/controllers/ReporteController';

export const ReportesAdmin = () => {
  const [tipo, setTipo] = useState('ventas');
  const [periodo, setPeriodo] = useState('diario');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reporteController = new ReporteController();

  const tiposList = [
    { label: 'Ventas', value: 'ventas' },
    { label: 'Inventario', value: 'inventario' },
    { label: 'Repartidores', value: 'repartidores' },
    { label: 'Clientes', value: 'clientes' },
    { label: 'Productos Mas Vendidos', value: 'productos-mas-vendidos' },
    { label: 'Estado de Pedidos', value: 'estado-pedidos' },
    { label: 'Ventas por Categoria', value: 'ventas-categoria' },
  ];

  const periodosList = [
    { label: 'Diario', value: 'diario' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' },
    { label: 'Anual', value: 'anual' },
    { label: 'Personalizado', value: 'personalizado' },
  ];

  const mostrarFechas = periodo === 'personalizado';

  const formatearFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const descargarPDF = (blob, nombre) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generarReporte = async () => {
    try {
      setLoading(true);
      setError(null);

      if (periodo === 'personalizado') {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(0, 0, 0, 0);

        if (inicio > fin) {
          setError('La fecha de inicio no puede ser posterior a la fecha fin');
          setLoading(false);
          return;
        }
      }

      const datosReporte = {
        tipo: tipo,
        periodo: periodo,
        fecha_inicio: periodo === 'personalizado' ? formatearFecha(fechaInicio) : undefined,
        fecha_fin: periodo === 'personalizado' ? formatearFecha(fechaFin) : undefined,
      };

      const result = await reporteController.generarPDF(datosReporte);

      if (result && result.success && result.blob) {
        const nombrePDF = `Reporte_${tipo}_${new Date().toISOString().slice(0, 10)}.pdf`;
        descargarPDF(result.blob, nombrePDF);
        alert('Reporte generado correctamente. Se descargará automáticamente.');
      } else {
        setError(result?.message || 'Error al generar el reporte');
      }
    } catch (err) {
      console.error('Error al generar reporte:', err);
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-file-lines text-[#B90F0F] text-xl"></i>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Generador de Reportes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Genera reportes de la información del sistema en formato PDF.
            </p>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-circle-exclamation text-red-600"></i>
            </div>

            <div>
              <p className="font-bold text-red-700">Error</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FORMULARIO */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <i className="fa-solid fa-sliders text-gray-600"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Configurar reporte
              </h2>
              <p className="text-sm text-gray-500">
                Selecciona el tipo y periodo de información.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">

            {/* TIPO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Reporte
              </label>

              <div className="relative">
                <i className="fa-solid fa-chart-column absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#B90F0F] text-sm transition disabled:opacity-60"
                >
                  {tiposList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PERIODO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Periodo
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {periodosList.map((item) => {
                  const activo = periodo === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPeriodo(item.value)}
                      disabled={loading}
                      className={`min-h-[44px] px-3 rounded-xl border text-sm font-semibold transition disabled:opacity-60 ${
                        activo
                          ? 'bg-[#B90F0F] border-[#B90F0F] text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FECHAS */}
            {mostrarFechas && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <i className="fa-solid fa-calendar-days text-[#B90F0F] text-sm"></i>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Rango personalizado
                    </p>
                    <p className="text-xs text-gray-500">
                      Selecciona las fechas del reporte.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha Inicio
                    </label>

                    <input
                      type="date"
                      value={formatearFecha(fechaInicio)}
                      onChange={(e) => setFechaInicio(new Date(e.target.value))}
                      disabled={loading}
                      className="w-full h-11 border border-gray-200 rounded-xl px-3 bg-white outline-none text-sm focus:ring-2 focus:ring-red-100 focus:border-[#B90F0F] transition disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha Fin
                    </label>

                    <input
                      type="date"
                      value={formatearFecha(fechaFin)}
                      onChange={(e) => setFechaFin(new Date(e.target.value))}
                      disabled={loading}
                      className="w-full h-11 border border-gray-200 rounded-xl px-3 bg-white outline-none text-sm focus:ring-2 focus:ring-red-100 focus:border-[#B90F0F] transition disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BOTÓN */}
            <button
              onClick={generarReporte}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-[#B90F0F] text-white py-3.5 rounded-xl font-bold hover:bg-[#9f0d0d] transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generando reporte...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-pdf"></i>
                  <span>Generar Reporte PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* INFORMACIÓN */}
        <div className="space-y-6">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-file-pdf text-[#B90F0F]"></i>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Formato PDF
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Documento listo para consultar
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-check text-green-600 mt-0.5"></i>
                <p className="text-sm text-gray-600">
                  El reporte se genera automáticamente.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <i className="fa-solid fa-download text-blue-600 mt-0.5"></i>
                <p className="text-sm text-gray-600">
                  La descarga inicia al finalizar la generación.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <i className="fa-solid fa-calendar text-gray-500 mt-0.5"></i>
                <p className="text-sm text-gray-600">
                  Puedes seleccionar diferentes periodos de información.
                </p>
              </div>
            </div>
          </div>

          {/* TIPO SELECCIONADO */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Reporte seleccionado
            </p>

            <div className="flex items-center gap-3 mt-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-chart-pie text-[#B90F0F]"></i>
              </div>

              <div>
                <p className="font-bold text-gray-900">
                  {tiposList.find((item) => item.value === tipo)?.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Periodo: {periodosList.find((item) => item.value === periodo)?.label}
                </p>
              </div>
            </div>
          </div>

          {/* NOTA */}
          <div className="bg-gray-100 rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-circle-info text-gray-500 mt-0.5"></i>

              <p className="text-xs text-gray-600 leading-relaxed">
                El reporte se descargará automáticamente al finalizar.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);
};

export default ReportesAdmin;