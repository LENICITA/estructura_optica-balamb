import React, { useState } from 'react';
import api from '../../utils/api';

const ReportesAdmin = () => {
  const [tipo, setTipo] = useState('ventas');
  const [periodo, setPeriodo] = useState('diario');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nombres = { 
    ventas: 'Ventas', 
    inventario: 'Inventario', 
    repartidores: 'Repartidores', 
    clientes: 'Clientes',
    'productos-mas-vendidos': 'Productos Más Vendidos',
    'estado-pedidos': 'Estado de Pedidos',
    'ventas-categoria': 'Ventas por Categoría'
  };

  const periodos = { 
    diario: 'Diario', 
    semanal: 'Semanal', 
    mensual: 'Mensual', 
    anual: 'Anual',
    personalizado: 'Personalizado'
  };

  const generarReporte = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Preparar datos para el backend
      const datosReporte = {
        tipo: tipo,
        periodo: periodo
      };

      // Si es personalizado, enviar fechas
      if (periodo === 'personalizado') {
        if (!fechaInicio || !fechaFin) {
          setError('Selecciona ambas fechas para el período personalizado');
          setLoading(false);
          return;
        }
        datosReporte.fecha_inicio = fechaInicio;
        datosReporte.fecha_fin = fechaFin;
      }
      
      // Solicitar el reporte en PDF
      const response = await api.post('/reportes/generar-pdf', datosReporte, {
        responseType: 'blob'
      });

      // Verificar que la respuesta sea un PDF
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/pdf')) {
        // Crear URL del blob y abrir en nueva pestaña
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        const text = await response.data.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || 'Error al generar el reporte');
        } catch {
          throw new Error('Error al generar el reporte');
        }
      }

    } catch (err) {
      console.error('Error al generar reporte:', err);
      
      let mensajeError = 'Error al generar el reporte. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Redirigiendo al login...';
        localStorage.removeItem('token');
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (err.response?.status === 404) {
        mensajeError += 'La ruta /reportes/generar-pdf no existe.';
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar campos de fecha si es personalizado
  const mostrarFechas = periodo === 'personalizado';

  return (
    <main className="p-5 max-md:p-3">
      <div className="flex justify-between items-center mb-8 max-md:flex-col max-md:gap-4">
        <h1 className="text-3xl font-bold text-[#B90F0F]">Generador de Reportes</h1>
        <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
          <i className="fa-regular fa-file-pdf mr-2"></i>
          Los reportes se generan en PDF
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Generador de reportes */}
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-[#000000] mb-6">
          Generar Nuevo Reporte
        </h2>
        
        <form onSubmit={generarReporte} className="flex flex-col gap-5">
          {/* Tipo de Reporte */}
          <div>
            <label className="block text-[#000000] font-bold mb-2">
              <i className="fa-regular fa-file-lines mr-2"></i>
              Tipo de Reporte:
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]"
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
              disabled={loading}
            >
              <option value="ventas">Reporte de Ventas</option>
              <option value="inventario">Reporte de Inventario</option>
              <option value="repartidores">Reporte de Repartidores</option>
              <option value="clientes">Reporte de Clientes</option>
              <option value="productos-mas-vendidos">Productos Más Vendidos</option>
              <option value="estado-pedidos">Estado de Pedidos</option>
              <option value="ventas-categoria">Ventas por Categoría</option>
            </select>
          </div>

          {/* Período */}
          <div>
            <label className="block text-[#000000] font-bold mb-2">
              <i className="fa-regular fa-calendar mr-2"></i>
              Período:
            </label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]"
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
              disabled={loading}
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
              <option value="anual">Anual</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>

          {/* Fechas personalizadas */}
          {mostrarFechas && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#000000] font-bold mb-2">
                  Fecha Inicio:
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  disabled={loading}
                  required={mostrarFechas}
                />
              </div>
              <div>
                <label className="block text-[#000000] font-bold mb-2">
                  Fecha Fin:
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  disabled={loading}
                  required={mostrarFechas}
                />
              </div>
            </div>
          )}

          {/* Botón Generar */}
          <button 
            type="submit" 
            className="w-full bg-[#B90F0F] text-white py-3 px-5 rounded-md cursor-pointer hover:bg-[#8a0b0b] transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Generando reporte...
              </>
            ) : (
              <>
                <i className="fa-solid fa-file-pdf"></i>
                Generar Reporte PDF
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          El reporte se abrirá en una nueva pestaña para que puedas descargarlo o imprimirlo
        </div>
      </div>
    </main>
  );
};

export default ReportesAdmin;