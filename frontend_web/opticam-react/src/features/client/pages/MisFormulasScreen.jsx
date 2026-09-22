// src/features/client/pages/MisFormulasScreen.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { useAuth } from '../../auth/context/AuthContext';

export const MisFormulasScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const formulaController = new FormulaController();

  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState(null);

  useEffect(() => {
    cargarFormulas();
  }, []);

  const cargarFormulas = async () => {
    if (!user?.id_usuario) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const resultado = await formulaController.getFormulasByUsuario(user.id_usuario);
      setFormulas(resultado);
    } catch (error) {
      console.error('Error cargando fórmulas:', error);
      alert('No fue posible cargar tus fórmulas.');
    } finally {
      setLoading(false);
    }
  };

  const actualizarFormulas = async () => {
    try {
      setActualizando(true);
      await cargarFormulas();
    } catch (error) {
      console.error('Error actualizando fórmulas:', error);
    } finally {
      setActualizando(false);
    }
  };

  const estadoFondo = (estado) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO': return '#D4EDDA';
      case 'RECHAZADO': return '#F8D7DA';
      default: return '#FFF3CD';
    }
  };

  const obtenerEstadoTexto = (estado) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO': return 'Aprobado';
      case 'RECHAZADO': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO': return 'fa-circle-check';
      case 'RECHAZADO': return 'fa-circle-xmark';
      default: return 'fa-clock';
    }
  };

  const obtenerColorIcono = (estado) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO': return '#28a745';
      case 'RECHAZADO': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const eliminarFormula = async (formula) => {
    const estadoTexto = obtenerEstadoTexto(formula.estado);
    const mensajeAdvertencia = estadoTexto === 'Aprobado'
      ? '\n\nEsta fórmula está APROBADA. ¿Estás seguro de eliminarla?'
      : '';

    if (!window.confirm(
      `¿Estás seguro de eliminar esta fórmula?\n\nEstado: ${estadoTexto}${mensajeAdvertencia}\nEsta acción no se puede deshacer.`
    )) return;

    try {
      const response = await formulaController.eliminarFormula(formula.id_formula);

      if (!response.success) {
        return alert(response.message || 'No se pudo eliminar la fórmula.');
      }

      setFormulas((prev) => prev.filter((f) => f.id_formula !== formula.id_formula));
      alert('La fórmula fue eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar fórmula:', error);
      let mensajeError = 'No se pudo eliminar la fórmula. Intenta nuevamente.';
      if (error?.response?.data?.message) mensajeError = error.response.data.message;
      else if (error?.message) mensajeError = error.message;
      alert(mensajeError);
    }
  };

  const mostrarMenu = (formula) => {
    setSelectedFormula(formula);
    setMenuVisible(true);
  };

  const cerrarMenu = () => {
    setMenuVisible(false);
    setSelectedFormula(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando tus fórmulas...</p>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>

              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-file-medical text-2xl text-[#B90F0F]"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Mis fórmulas
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Consulta y administra tus fórmulas ópticas.
                </p>
              </div>
            </div>

            <button
              onClick={actualizarFormulas}
              disabled={actualizando}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#B90F0F] px-5 py-3 rounded-xl font-bold text-sm hover:bg-red-50 transition disabled:opacity-60"
            >
              {actualizando ? (
                <div className="w-5 h-5 border-2 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="fa-solid fa-rotate-right"></i>
              )}
              Actualizar
            </button>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formulas.length}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-file-lines text-xl text-[#B90F0F]"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Aprobadas
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    formulas.filter(
                      (f) => String(f.estado).toUpperCase() === 'APROBADO'
                    ).length
                  }
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Pendientes
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {
                    formulas.filter(
                      (f) =>
                        String(f.estado).toUpperCase() !== 'APROBADO' &&
                        String(f.estado).toUpperCase() !== 'RECHAZADO'
                    ).length
                  }
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-yellow-50 flex items-center justify-center">
                <i className="fa-solid fa-clock text-xl text-yellow-600"></i>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Mis fórmulas ópticas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Selecciona una fórmula para consultar sus detalles.
              </p>
            </div>

            {formulas.length > 0 && (
              <span className="text-sm font-semibold text-gray-500">
                {formulas.length} {formulas.length === 1 ? 'fórmula' : 'fórmulas'}
              </span>
            )}
          </div>

          {formulas.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-2xl p-10 sm:p-14 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto">
                <i className="fa-solid fa-file-lines text-gray-400 text-3xl"></i>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mt-5">
                Aún no has subido fórmulas
              </h3>

              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                Presiona el botón "Crear fórmula" para agregar tu información
                óptica y enviarla para revisión.
              </p>

              <button
                onClick={() =>
                  navigate('/cliente/crear-formula', {
                    state: { id_usuario: user?.id_usuario },
                  })
                }
                className="mt-6 inline-flex items-center justify-center gap-2 bg-[#B90F0F] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#9f0d0d] transition"
              >
                <i className="fa-solid fa-circle-plus"></i>
                Crear fórmula
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {formulas.map((item) => (
                <div
                  key={item.id_formula}
                  onClick={() =>
                    navigate(`/cliente/mis-formulas/${item.id_formula}`)
                  }
                  className="bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-gray-300 transition relative"
                >
                  {/* MENÚ */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      mostrarMenu(item);
                    }}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition"
                  >
                    <i className="fa-solid fa-ellipsis-vertical text-gray-500"></i>
                  </button>

                  {/* ESTADO */}
                  <div className="pr-10">
                    <span
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                      style={{
                        backgroundColor: estadoFondo(item.estado),
                        color: obtenerColorIcono(item.estado),
                      }}
                    >
                      <i
                        className={`fa-solid ${obtenerIconoEstado(item.estado)}`}
                      ></i>
                      {obtenerEstadoTexto(item.estado)}
                    </span>
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="mt-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-glasses text-[#B90F0F]"></i>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                          Fórmula
                        </p>

                        <p className="text-base font-bold text-gray-900 mt-1 line-clamp-2">
                          {item.condicion || 'Sin condición registrada'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DETALLE */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Consulta los detalles de tu fórmula
                    </span>

                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                      <i className="fa-solid fa-arrow-right text-[#B90F0F] text-sm"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CREAR FÓRMULA */}
        {formulas.length > 0 && (
          <div className="bg-[#B90F0F] rounded-2xl shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-white">
                <h2 className="text-lg font-bold">
                  ¿Necesitas registrar una nueva fórmula?
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  Agrega una nueva fórmula para que pueda ser revisada.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate('/cliente/crear-formula', {
                    state: { id_usuario: user?.id_usuario },
                  })
                }
                className="w-full sm:w-auto bg-white text-[#B90F0F] px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition"
              >
                <i className="fa-solid fa-circle-plus"></i>
                Crear fórmula
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL MENÚ */}
      {menuVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
          onClick={cerrarMenu}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedFormula && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Opciones
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Gestiona esta fórmula.
                    </p>
                  </div>

                  <button
                    onClick={cerrarMenu}
                    className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition"
                  >
                    <i className="fa-solid fa-xmark text-xl text-gray-600"></i>
                  </button>
                </div>

                <button
                  onClick={() => {
                    cerrarMenu();
                    setTimeout(
                      () => eliminarFormula(selectedFormula),
                      300
                    );
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <i className="fa-solid fa-trash text-red-500"></i>
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-bold text-red-600">
                      Eliminar fórmula
                    </p>
                    <p className="text-xs text-red-400 mt-0.5">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisFormulasScreen;