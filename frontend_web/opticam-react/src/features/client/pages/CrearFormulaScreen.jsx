// src/features/client/pages/CrearFormulaScreen.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { useAuth } from '../../auth/context/AuthContext';
import { validarFormularioFormula } from '../../../shared/validators/formulaValidators';

const condiciones = ['ASTIGMATISMO', 'MIOPIA', 'DALTONISMO', 'BAJA VISION'];

export const CrearFormulaScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formulaController = new FormulaController();
  const { user } = useAuth();

  const idUsuario = location.state?.id_usuario ?? user?.id_usuario;
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [descripcion, setDescripcion] = useState('');
  const [condicion, setCondicion] = useState('');
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [dropdown, setDropdown] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const subirFormula = async () => {
    const check = validarFormularioFormula({
      id_usuario: idUsuario ? Number(idUsuario) : undefined,
      condicion: condicion,
      imagen_formula: imagen ? imagen.name : '',
      observaciones: descripcion.trim(),
    });

    if (!check.valido) return alert(check.mensaje || 'Datos inválidos');

    try {
      setSubiendo(true);

      const resultado = await formulaController.crearFormula({
        id_usuario: Number(idUsuario),
        condicion: condicion,
        imagen_formula: imagen,
        observaciones: descripcion.trim(),
        fecha_creacion: fecha,
      });

      if (!resultado.success) return alert(resultado.message);

      alert('La fórmula fue registrada correctamente y está en revisión.');
      navigate('/cliente/mis-formulas');
    } catch (error) {
      console.error('Error subiendo fórmula:', error);
      alert(error?.message || 'No fue posible subir la fórmula.');
    } finally {
      setSubiendo(false);
    }
  };

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
                Crear fórmula
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Registra y envía tu fórmula óptica para revisión.
              </p>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

          {/* INFORMACIÓN */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Información de la fórmula
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Completa los datos solicitados y adjunta una imagen legible de tu fórmula.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">

            {/* FECHA */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de creación
              </label>

              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 min-h-[48px]">
                <i className="fa-solid fa-calendar text-[#B90F0F]"></i>
                <span className="text-sm text-gray-700">
                  {fecha}
                </span>
              </div>
            </div>

            {/* CONDICIÓN */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ¿Cuál es tu condición?
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdown(!dropdown)}
                  className="w-full flex items-center justify-between gap-3 bg-white border border-gray-300 rounded-xl px-4 min-h-[48px] text-left hover:border-gray-400 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <i className="fa-solid fa-eye text-[#B90F0F]"></i>

                    <span
                      className={`text-sm truncate ${
                        condicion ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {condicion || 'Seleccionar condición'}
                    </span>
                  </div>

                  <i
                    className={`fa-solid ${
                      dropdown ? 'fa-chevron-up' : 'fa-chevron-down'
                    } text-gray-500`}
                  ></i>
                </button>

                {dropdown && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {condiciones.map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          setCondicion(item);
                          setDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-[#B90F0F] border-b border-gray-100 last:border-b-0 transition"
                      >
                        <div className="flex items-center gap-3">
                          <i className="fa-solid fa-eye text-[#B90F0F] text-xs"></i>
                          {item}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="md:col-span-2 mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>

              <button
                type="button"
                onClick={() => setMostrarDescripcion(true)}
                className="w-full flex items-center gap-3 bg-white border border-gray-300 rounded-xl px-4 min-h-[48px] text-left hover:border-gray-400 transition"
              >
                <i className="fa-solid fa-file-lines text-[#B90F0F]"></i>

                <span
                  className={`flex-1 text-sm truncate ${
                    descripcion ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  {descripcion || 'Ej: Fórmula reciente'}
                </span>

                <i className="fa-solid fa-pen text-gray-400 text-xs"></i>
              </button>
            </div>
          </div>

          {/* IMAGEN */}
          <div className="mt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagen de la fórmula
            </label>

            <label className="flex flex-col items-center justify-center min-h-[190px] border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 cursor-pointer hover:bg-red-50 hover:border-[#B90F0F] transition">
              <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-3">
                <i className="fa-solid fa-cloud-arrow-up text-[#B90F0F] text-2xl"></i>
              </div>

              <span className="text-sm font-semibold text-gray-700">
                Seleccionar imagen
              </span>

              <span className="text-xs text-gray-400 mt-1">
                Adjunta una imagen clara de tu fórmula óptica
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagenPreview && (
              <div className="relative mt-4 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={imagenPreview}
                  alt="Preview"
                  className="w-full h-[220px] sm:h-[280px] object-contain"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImagen(null);
                    setImagenPreview(null);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <i className="fa-solid fa-trash text-[#B90F0F]"></i>
                </button>
              </div>
            )}
          </div>

          {/* AVISO */}
          <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
            <i className="fa-solid fa-circle-info text-[#B90F0F] mt-0.5"></i>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Una vez enviada, tu fórmula quedará en revisión. El administrador
              podrá verificar la información y posteriormente actualizar su estado.
            </p>
          </div>

          {/* BOTÓN */}
          <div className="mt-6">
            {subiendo ? (
              <div className="h-12 rounded-xl bg-[#B90F0F] flex items-center justify-center gap-2.5 opacity-70">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white font-bold text-sm">
                  Enviando...
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={subirFormula}
                className="w-full bg-[#B90F0F] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#9f0d0d] transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-paper-plane"></i>
                SUBIR FÓRMULA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DESCRIPCIÓN */}
      {mostrarDescripcion && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
          onClick={() => setMostrarDescripcion(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Descripción
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Agrega información adicional sobre tu fórmula.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarDescripcion(false)}
                className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition"
              >
                <i className="fa-solid fa-xmark text-xl text-gray-600"></i>
              </button>
            </div>

            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Fórmula reciente"
              maxLength={200}
              autoFocus
              className="w-full min-h-[140px] border border-gray-300 rounded-xl p-4 text-sm text-gray-700 outline-none resize-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]"
            />

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                Máximo 200 caracteres
              </span>

              <span className="text-xs text-gray-400">
                {descripcion.length}/200
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMostrarDescripcion(false)}
              className="w-full mt-5 bg-[#B90F0F] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#9f0d0d] transition"
            >
              Guardar descripción
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearFormulaScreen;