// src/features/client/pages/DetalleFormulaCliente.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormulaController } from '../../../core/controllers/FormulaController';

export const DetalleFormulaCliente = () => {
  const { id_formula } = useParams();
  const navigate = useNavigate();
  const formulaController = new FormulaController();

  const [formula, setFormula] = useState(null);
  const [loading, setLoading] = useState(true);

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
      if (resultado) setFormula(resultado);
    } catch (error) {
      console.error('Error cargando fórmula:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
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
                Detalle de fórmula
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Consulta la información registrada de tu fórmula óptica.
              </p>
            </div>
          </div>
        </div>

        {/* IMAGEN */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-image text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Imagen de la fórmula
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Documento registrado en la plataforma.
              </p>
            </div>
          </div>

          <div className="w-full min-h-[300px] sm:min-h-[450px] rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            {formula?.imagen_formula ? (
              <img
                src={formula.imagen_formula}
                alt="Fórmula"
                className="w-full h-full max-h-[550px] object-contain p-4"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
                  <i className="fa-solid fa-image text-gray-300 text-3xl"></i>
                </div>

                <p className="text-sm font-semibold text-gray-500 mt-4">
                  Sin imagen
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  No se registró una imagen para esta fórmula.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* INFORMACIÓN */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-file-lines text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Información de la fórmula
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Datos asociados a la fórmula registrada.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* CONDICIÓN */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <i className="fa-solid fa-eye text-[#B90F0F]"></i>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Condición
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {formula?.condicion || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

            {/* FECHA */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <i className="fa-solid fa-calendar text-[#B90F0F]"></i>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Fecha de creación
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {formula?.fecha_creacion || 'No disponible'}
                  </p>
                </div>
              </div>
            </div>

            {/* OBSERVACIÓN */}
            <div className="md:col-span-2 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-comment text-[#B90F0F]"></i>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Observación
                  </p>

                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {formula?.observaciones || 'Sin observaciones'}
                  </p>
                </div>
              </div>
            </div>

            {/* COSTO */}
            <div className="md:col-span-2 bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                  <i className="fa-solid fa-dollar-sign text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Costo
                  </p>

                  <p className="text-xl font-bold text-[#B90F0F] mt-1">
                    {formula?.costoFormateado || `$${formula?.costo || 0}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VOLVER */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-[#B90F0F] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#9f0d0d] transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver a mis fórmulas
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetalleFormulaCliente;