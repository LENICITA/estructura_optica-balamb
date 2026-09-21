// src/features/admin/pages/DetalleFormula.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { validarAsignarPrecio } from '../../../shared/validators/formulaValidators';

const DetalleFormula = () => {
  const { id_formula } = useParams();
  const navigate = useNavigate();
  const formulaController = new FormulaController();

  const [formula, setFormula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [costo, setCosto] = useState('');
  const [editandoCosto, setEditandoCosto] = useState(false);
  const [imagenModalVisible, setImagenModalVisible] = useState(false);

  useEffect(() => {
    cargarFormula();
  }, [id_formula]);

  const cargarFormula = async () => {
    try {
      setLoading(true);
      if (!id_formula) {
        console.error('No se recibió el ID de la fórmula');
        return;
      }

      const resultado = await formulaController.getFormulaById(Number(id_formula));

      if (resultado) {
        setFormula(resultado);
        if (resultado.costo) setCosto(resultado.costo.toString());
      }
    } catch (error) {
      console.error('Error cargando fórmula:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirImagen = () => setImagenModalVisible(true);
  const cerrarImagen = () => setImagenModalVisible(false);

  const cambiarCosto = async () => {
    try {
      const check = validarAsignarPrecio({
        id_formula: id_formula ? Number(id_formula) : undefined,
        costo: costo,
        estadoActualFormula: formula?.estado,
      });

      if (!check.valido) {
        alert(check.mensaje || 'Datos inválidos');
        return;
      }

      setLoading(true);

      const resultadoCosto = await formulaController.actualizarCostoFormula(Number(id_formula), Number(costo));

      if (resultadoCosto.success) {
        if (formula?.estado === 'Pendiente') {
          const resultadoEstado = await formulaController.actualizarEstadoFormula(Number(id_formula), 'Aprobado');

          if (resultadoEstado.success) {
            setCosto('');
            await cargarFormula();
            setEditandoCosto(false);
          } else {
            alert(resultadoEstado.message || 'No se pudo aprobar la fórmula');
          }
        } else {
          await cargarFormula();
          setEditandoCosto(false);
        }
      } else {
        alert(resultadoCosto.message || 'No se pudo actualizar el costo');
      }
    } catch (error) {
      console.error('Error al cargar valor de formula', error);
      alert('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarCosto = () => {
    if (formula?.estado === 'Aprobado') {
      if (window.confirm('¿Está seguro que desea modificar el precio de esta fórmula?')) {
        setEditandoCosto(true);
      }
    } else {
      setEditandoCosto(true);
    }
  };

  const cancelarEdicion = () => {
    setEditandoCosto(false);
    if (formula?.costo) setCosto(formula.costo.toString());
    else setCosto('');
  };

  const renderCostoSection = () => {
    if (formula?.estado === 'Rechazado') {
      return (
        <div className="flex items-center gap-2 bg-red-100 p-3 rounded-lg mt-1">
          <i className="fa-solid fa-circle-xmark text-red-600 text-xl"></i>
          <span className="text-sm font-semibold text-red-600">Fórmula Rechazada - No se puede asignar precio</span>
        </div>
      );
    }

    if (formula?.estado === 'Aprobado' && !editandoCosto) {
      return (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg mt-1">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-green-700">${formula.costo}</span>
            <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Aprobado</span>
          </div>
          <button
            onClick={handleEditarCosto}
            className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-[#2563EB] text-xs font-semibold"
          >
            <i className="fa-solid fa-pen text-xs"></i>
            Modificar
          </button>
        </div>
      );
    }

    return (
      <>
        <p className="text-red-500 italic text-sm mb-2 mt-1">
          {formula?.estado === 'Pendiente' ? 'Pendiente de asignar costo' : 'Sin costo asignado'}
        </p>
        <input
          type="text"
          value={costo}
          onChange={(e) => setCosto(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Ingrese el costo"
          className="w-[98%] h-12 border border-gray-300 rounded-lg px-4 mt-1 mb-2 outline-none mx-auto block"
        />
        <div className="flex gap-2.5 mt-1">
          <button
            onClick={cambiarCosto}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#B90F0F] text-white rounded-xl font-bold"
          >
            <i className="fa-solid fa-pen"></i>
            {formula?.estado === 'Aprobado' ? 'Actualizar Precio' : 'Asignar y Aprobar'}
          </button>
          {editandoCosto && (
            <button
              onClick={cancelarEdicion}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-500 text-white rounded-xl font-bold"
            >
              <i className="fa-solid fa-xmark"></i>
              Cancelar
            </button>
          )}
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando fórmula...</p>
      </div>
    );
  }

  return (
  <>
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto pb-10">

        {/* BOTÓN VOLVER */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#B90F0F] font-semibold mb-5 px-1 py-2 hover:opacity-80 transition"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Volver
        </button>

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-file-lines text-[#B90F0F] text-xl"></i>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Datos de la formula #{id_formula}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Información y gestión de la fórmula registrada
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* IMAGEN */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-image text-[#B90F0F]"></i>
              Imagen de la fórmula
            </h3>

            <button
              onClick={abrirImagen}
              className="relative w-full h-[350px] sm:h-[420px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center group"
            >
              <img
                src={formula?.imagen_formula}
                alt="Fórmula"
                className="w-full h-full object-contain p-3 group-hover:scale-[1.02] transition-transform duration-200"
              />

              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-[20px]">
                <i className="fa-solid fa-expand text-white"></i>
                <span className="text-white text-xs">Toca para ampliar</span>
              </div>
            </button>
          </div>

          {/* INFORMACIÓN */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

            <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-[#B90F0F]"></i>
              Información de la fórmula
            </h3>

            {/* CONDICIÓN */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900 mb-2">
                Condición:
              </p>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                <p className="text-gray-700 text-sm">
                  {formula?.condicion}
                </p>
              </div>
            </div>

            {/* OBSERVACIÓN */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900 mb-2">
                Observación:
              </p>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 min-h-[70px]">
                <p className="text-gray-700 text-sm">
                  {formula?.observaciones}
                </p>
              </div>
            </div>

            {/* FECHA */}
            <div className="mb-5 pb-5 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900 mb-2">
                Fecha:
              </p>
              <div className="flex items-center gap-2 text-gray-700">
                <i className="fa-regular fa-calendar text-[#B90F0F]"></i>
                <p className="text-sm">
                  {formula?.fecha_creacion}
                </p>
              </div>
            </div>

            {/* COSTO */}
            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">
                Costo:
              </p>

              {renderCostoSection()}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* MODAL IMAGEN */}
    {imagenModalVisible && (
      <div
        className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-4"
        onClick={cerrarImagen}
      >
        <button
          onClick={cerrarImagen}
          className="absolute top-6 right-5 sm:top-10 sm:right-8 z-10 hover:scale-110 transition-transform"
        >
          <i className="fa-solid fa-circle-xmark text-white text-4xl"></i>
        </button>

        <img
          src={formula?.imagen_formula}
          alt="Fórmula ampliada"
          className="max-w-[95%] max-h-[75vh] w-auto h-auto object-contain"
        />

        <div className="absolute bottom-8 flex items-center gap-2 bg-black/50 px-4 py-2 rounded-[20px]">
          <i className="fa-solid fa-hand text-white/70"></i>
          <span className="text-white/70 text-sm">
            Desliza para acercar/alejar
          </span>
        </div>
      </div>
    )}
  </>
);
};

export default DetalleFormula;