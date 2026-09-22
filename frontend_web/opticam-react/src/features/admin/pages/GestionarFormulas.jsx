// src/features/admin/pages/GestionarFormulas.jsx
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { checkId } from '../../../shared/validators/formulaValidators';

const formulaController = new FormulaController();

const GestionarFormulas = () => {
  const navigate = useNavigate();

  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODAS');

  const cargarFormulas = useCallback(async () => {
    try {
      setError(null);
      const data = await formulaController.getTodasLasFormulas();
      if (!Array.isArray(data)) return setFormulas([]);
      setFormulas(data);
    } catch (err) {
      console.error('Error cargando fórmulas:', err);
      setError(err?.message || 'No fue posible cargar las fórmulas');
      setFormulas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    cargarFormulas();
  }, [cargarFormulas]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarFormulas();
  };

  const formulasFiltradas = useMemo(() => {
    let resultado = [...formulas];

    if (filtroEstado !== 'TODAS') {
      resultado = resultado.filter((f) => f.estado === filtroEstado);
    }

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();
      resultado = resultado.filter((f) => {
        return (
          String(f.id_formula).includes(texto) ||
          String(f.id_usuario).includes(texto) ||
          f.condicion?.toLowerCase().includes(texto) ||
          f.nombre_completo?.toLowerCase().includes(texto) ||
          f.email?.toLowerCase().includes(texto) ||
          f.telefono?.toLowerCase().includes(texto)
        );
      });
    }

    return resultado;
  }, [formulas, busqueda, filtroEstado]);

  const totalFormulas = formulas.length;
  const pendientes = formulas.filter((f) => f.estado === 'Pendiente').length;
  const aprobadas = formulas.filter((f) => f.estado === 'Aprobado').length;
  const rechazadas = formulas.filter((f) => f.estado === 'Rechazado').length;

  const abrirFormula = (formula) => {
    navigate(`/admin/formulas/${formula.id_formula}`);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Aprobado': return '#16A34A';
      case 'Rechazado': return '#DC2626';
      default: return '#D97706';
    }
  };

  const getEstadoBackground = (estado) => {
    switch (estado) {
      case 'Aprobado': return '#DCFCE7';
      case 'Rechazado': return '#FEE2E2';
      default: return '#FEF3C7';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Aprobado': return 'fa-circle-check';
      case 'Rechazado': return 'fa-circle-xmark';
      default: return 'fa-clock';
    }
  };

  const rechazarFormula = async (item) => {
    const checkIdResult = checkId(item.id_formula);
    if (!checkIdResult.valido) return alert(checkIdResult.mensaje || 'ID inválido');

    try {
      const resultado = await formulaController.actualizarEstadoFormula(item.id_formula, 'Rechazado');

      if (resultado.success) {
        cargarFormulas();
      } else {
        alert(resultado.message || 'No se pudo rechazar la fórmula');
      }
    } catch (error) {
      console.error('Error al rechazar fórmula:', error);
      alert('Ocurrió un error al rechazar la fórmula');
    }
  };

  const mostrarMenuOpciones = (item) => {
    const estado = item.estado || 'Pendiente';

    if (estado === 'Rechazado' || estado === 'Aprobado') {
      return alert('Esta fórmula ya ha sido procesada');
    }

    if (window.confirm(`¿Rechazar la fórmula #${item.id_formula}?`)) {
      rechazarFormula(item);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando fórmulas...</p>
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
          onClick={() => { setLoading(true); cargarFormulas(); }}
          className="mt-5 bg-[#B90F0F] flex items-center gap-2 px-[18px] py-2.5 rounded-lg text-white font-semibold"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-file-prescription text-[#B90F0F] text-xl"></i>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Gestionar fórmulas
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Consulta y administra las fórmulas de los clientes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50"
        >
          <i
            className={`fa-solid fa-rotate-right ${
              refreshing ? 'animate-spin' : ''
            }`}
          ></i>
          Actualizar
        </button>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

        {/* TOTAL */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Total
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {totalFormulas}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-file-lines text-[#B90F0F] text-lg"></i>
            </div>
          </div>
        </div>

        {/* PENDIENTES */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Pendientes
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {pendientes}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
              <i className="fa-solid fa-clock text-amber-500 text-lg"></i>
            </div>
          </div>
        </div>

        {/* APROBADAS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Aprobadas
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {aprobadas}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <i className="fa-solid fa-circle-check text-green-600 text-lg"></i>
            </div>
          </div>
        </div>

        {/* RECHAZADAS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Rechazadas
              </p>

              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                {rechazadas}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-circle-xmark text-red-600 text-lg"></i>
            </div>
          </div>
        </div>

      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-5">

        <div className="flex flex-col lg:flex-row gap-4">

          {/* BUSCADOR */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Buscar fórmula
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition">
              <i className="fa-solid fa-magnifying-glass text-gray-400 mr-2.5"></i>

              <input
                type="text"
                placeholder="Buscar por fórmula, cliente, condición, email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />

              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="text-gray-400 hover:text-[#B90F0F] transition"
                >
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* FILTRO */}
          <div className="lg:w-72">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Filtrar por estado
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px]">
              <i className="fa-solid fa-filter text-gray-400 mr-2.5"></i>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-gray-700 py-2.5 cursor-pointer"
              >
                <option value="TODAS">Todas las fórmulas</option>
                <option value="Pendiente">Pendientes</option>
                <option value="Aprobado">Aprobadas</option>
                <option value="Rechazado">Rechazadas</option>
              </select>
            </div>
          </div>

        </div>

        {/* CONTADOR */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">
              {formulasFiltradas.length}
            </span>{' '}
            {formulasFiltradas.length === 1
              ? 'fórmula encontrada'
              : 'fórmulas encontradas'}
          </p>

          {(busqueda || filtroEstado !== 'TODAS') && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('TODAS');
              }}
              className="text-xs sm:text-sm font-semibold text-[#B90F0F] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

      </div>

      {/* LISTA */}
      {formulasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 px-6">

          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-file-lines text-4xl text-gray-300"></i>
          </div>

          <p className="mt-4 text-lg font-bold text-gray-700">
            No hay fórmulas
          </p>

          <p className="mt-1 text-center text-sm text-gray-500 max-w-md">
            No se encontraron fórmulas con los filtros seleccionados.
          </p>

          {(busqueda || filtroEstado !== 'TODAS') && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('TODAS');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-red-50 text-[#B90F0F] text-sm font-semibold hover:bg-red-100 transition"
            >
              Limpiar filtros
            </button>
          )}

        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {formulasFiltradas.map((item) => {
            const estado = item.estado || 'Pendiente';
            const estadoColor = getEstadoColor(estado);
            const estadoBackground = getEstadoBackground(estado);
            const estadoIcon = getEstadoIcon(estado);

            return (
              <div
                key={item.id_formula}
                onClick={() => abrirFormula(item)}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition"
              >

                {/* ENCABEZADO DE LA FÓRMULA */}
                <div className="p-4 sm:p-5">

                  <div className="flex items-start gap-3">

                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-file-prescription text-[#B90F0F] text-lg"></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-base font-bold text-gray-900">
                          Fórmula #{item.id_formula}
                        </h2>

                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
                          style={{
                            backgroundColor: estadoBackground,
                            color: estadoColor,
                          }}
                        >
                          <i className={`fa-solid ${estadoIcon}`}></i>
                          {estado}
                        </span>

                      </div>

                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {item.condicion || 'Sin condición registrada'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        mostrarMenuOpciones(item);
                      }}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                        estado === 'Pendiente'
                          ? 'text-gray-500 hover:bg-gray-100'
                          : 'text-gray-300'
                      }`}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                  </div>

                </div>

                <div className="h-px bg-gray-100"></div>

                {/* CLIENTE */}
                <div className="p-4 sm:p-5">

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <i className="fa-solid fa-user text-[#B90F0F] text-sm"></i>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        Cliente
                      </p>

                      <p className="text-xs text-gray-400">
                        Información del solicitante
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <div className="flex items-center gap-2 min-w-0">
                      <i className="fa-solid fa-user text-gray-400 text-xs"></i>

                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400">
                          Nombre
                        </p>

                        <p className="text-xs font-medium text-gray-700 truncate">
                          {item.nombre_completo || 'Sin nombre'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <i className="fa-solid fa-envelope text-gray-400 text-xs"></i>

                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400">
                          Email
                        </p>

                        <p className="text-xs font-medium text-gray-700 truncate">
                          {item.email || 'Sin email'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <i className="fa-solid fa-phone text-gray-400 text-xs"></i>

                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400">
                          Teléfono
                        </p>

                        <p className="text-xs font-medium text-gray-700 truncate">
                          {item.telefono || 'Sin teléfono'}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="h-px bg-gray-100"></div>

                {/* INFORMACIÓN INFERIOR */}
                <div className="px-4 sm:px-5 py-3 flex flex-wrap items-center gap-4">

                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-calendar text-gray-400 text-xs"></i>

                    <span className="text-xs text-gray-500">
                      {item.fecha_creacion
                        ? new Date(item.fecha_creacion).toLocaleDateString(
                            'es-CO'
                          )
                        : 'Sin fecha'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-money-bill text-[#B90F0F] text-xs"></i>

                    <span className="text-xs font-bold text-[#B90F0F]">
                      {item.costoFormateado}
                    </span>
                  </div>

                  <div className="ml-auto flex items-center gap-1 text-[#B90F0F]">
                    <span className="text-xs font-semibold">
                      Ver fórmula
                    </span>

                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </div>

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

export default GestionarFormulas;