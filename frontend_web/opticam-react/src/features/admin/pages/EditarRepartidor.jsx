// src/features/admin/pages/EditarRepartidor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserController } from '../../../core/controllers/UserController';
import {
  checkNombre,
  checkEmail,
  checkTelefono,
  checkDocumento,
  checkCiudad,
  checkVehiculo,
} from '../../../shared/validators/userValidators';

const EditarRepartidor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userController = new UserController();

  const [formData, setFormData] = useState({
    datosPersonales: {
      nombre_completo: '',
      telefono: '',
      email: '',
      documento: '',
      ciudad: '',
      direccion: '',
      fecha_nacimiento: '',
      estado: 'ACTIVO',
    },
    datosVehiculo: {
      tipo: '',
      modelo: '',
      placa: '',
      color: '',
    },
  });

  const [errores, setErrores] = useState({});
  const [formModificado, setFormModificado] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarRepartidor = async () => {
      if (!id) return alert('No se encontró el ID del repartidor.');

      try {
        setLoading(true);
        const response = await userController.getRepartidorById(Number(id));

        if (!response) return alert('No se encontró el repartidor.');

        const r = response;
        setFormData({
          datosPersonales: {
            nombre_completo: r.nombre_completo || '',
            telefono: r.telefono || '',
            email: r.email || '',
            documento: r.documento ? String(r.documento) : '',
            ciudad: r.ciudad || '',
            direccion: r.direccion || '',
            fecha_nacimiento: r.fecha_nacimiento || '',
            estado: r.estado || 'ACTIVO',
          },
          datosVehiculo: {
            tipo: r.vehiculo?.tipo || '',
            modelo: r.vehiculo?.modelo || '',
            placa: r.vehiculo?.placa || '',
            color: r.vehiculo?.color || '',
          },
        });
        setFormModificado(false);
      } catch (error) {
        console.error('Error al cargar repartidor:', error);
        alert('No se pudieron cargar los datos del repartidor.');
      } finally {
        setLoading(false);
      }
    };

    cargarRepartidor();
  }, [id]);

  const handleInputChange = (seccion, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      [seccion]: { ...prev[seccion], [campo]: valor },
    }));
    setFormModificado(true);
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: null }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const { datosPersonales, datosVehiculo } = formData;

    const nombreCheck = checkNombre(datosPersonales.nombre_completo);
    if (!nombreCheck.valido) nuevosErrores.nombre_completo = nombreCheck.mensaje;

    const emailCheck = checkEmail(datosPersonales.email);
    if (!emailCheck.valido) nuevosErrores.email = emailCheck.mensaje;

    const telCheck = checkTelefono(datosPersonales.telefono);
    if (!telCheck.valido) nuevosErrores.telefono = telCheck.mensaje;

    const docCheck = checkDocumento(datosPersonales.documento);
    if (!docCheck.valido) nuevosErrores.documento = docCheck.mensaje;

    const ciudadCheck = checkCiudad(datosPersonales.ciudad);
    if (!ciudadCheck.valido) nuevosErrores.ciudad = ciudadCheck.mensaje;

    const vehiculoCheck = checkVehiculo(datosVehiculo);
    if (!vehiculoCheck.valido) {
      if (!datosVehiculo.tipo?.trim()) nuevosErrores.tipo = vehiculoCheck.mensaje;
      else if (!datosVehiculo.modelo?.trim()) nuevosErrores.modelo = vehiculoCheck.mensaje;
      else if (!datosVehiculo.placa?.trim() || datosVehiculo.placa.trim().length < 5) nuevosErrores.placa = vehiculoCheck.mensaje;
      else if (!datosVehiculo.color?.trim()) nuevosErrores.color = vehiculoCheck.mensaje;
      else nuevosErrores.color = vehiculoCheck.mensaje;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const actualizarRepartidor = async () => {
    if (!id) return alert('No se encontró el ID del repartidor.');

    try {
      setLoading(true);

      const datos = {
        nombre_completo: formData.datosPersonales.nombre_completo,
        telefono: formData.datosPersonales.telefono,
        email: formData.datosPersonales.email,
        documento: formData.datosPersonales.documento,
        ciudad: formData.datosPersonales.ciudad,
        direccion: formData.datosPersonales.direccion,
        fecha_nacimiento: formData.datosPersonales.fecha_nacimiento,
        estado: formData.datosPersonales.estado,
        vehiculo: {
          tipo: formData.datosVehiculo.tipo,
          modelo: formData.datosVehiculo.modelo,
          placa: formData.datosVehiculo.placa,
          color: formData.datosVehiculo.color,
        },
      };

      const response = await userController.actualizarRepartidor(Number(id), datos);

      if (!response || !response.success) {
        return alert(response?.message || 'No se pudo actualizar el repartidor.');
      }

      setFormModificado(false);
      navigate('/admin/repartidores');
    } catch (error) {
      console.error('ERROR ACTUALIZANDO REPARTIDOR:', error);
      alert(error?.message || 'No se pudo actualizar el repartidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarFormulario()) return alert('Por favor, completa todos los campos obligatorios');

    if (!window.confirm(`¿Estás seguro de actualizar los datos de "${formData.datosPersonales.nombre_completo}"?`)) return;

    actualizarRepartidor();
  };

  const handleCancel = () => {
    if (formModificado) {
      if (window.confirm('¿Seguro que quieres descartar los cambios?')) navigate(-1);
    } else {
      navigate(-1);
    }
  };

  const ESTADOS_REPARTIDOR = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' },
  ];

  const TIPOS_VEHICULO = [
    { label: 'Selecciona un tipo', value: '' },
    { label: 'Carro', value: 'CARRO' },
    { label: 'Moto', value: 'MOTO' },
  ];

  const InputField = ({ label, icon, value, onChange, error, type = 'text', required = false, placeholder = '' }) => (
    <div className="mb-3.5">
      <div className="flex items-center gap-1 mb-1.5">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {required && <span className="text-[#B90F0F] text-base font-bold">*</span>}
      </div>
      <div
        className={`flex items-center bg-gray-50 border rounded-lg px-3 min-h-[46px] ${
          error ? 'border-2 border-[#B90F0F]' : 'border-gray-200'
        }`}
      >
        <i className={`fa-solid ${icon} text-gray-400 mr-2.5`}></i>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 py-2.5"
        />
      </div>
      {error && (
        <div className="flex items-center mt-1 gap-1">
          <i className="fa-solid fa-circle-exclamation text-[#B90F0F] text-xs"></i>
          <span className="text-[#B90F0F] text-xs">{error}</span>
        </div>
      )}
    </div>
  );

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-5xl mx-auto">

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#B90F0F] transition"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Volver
        </button>
      </div>

      {/* ENCABEZADO DE EDICIÓN */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-user-pen text-[#B90F0F] text-xl"></i>
          </div>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Editar repartidor
            </h1>

            <p className="text-sm text-gray-500 mt-1 truncate">
              {formData.datosPersonales.nombre_completo
                ? `Editando: ${formData.datosPersonales.nombre_completo}`
                : 'Actualiza la información del repartidor'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* CONTENIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* DATOS PERSONALES */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-user text-[#B90F0F]"></i>
              </div>

              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Datos Personales
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Información básica del repartidor
                </p>
              </div>

              <span className="bg-red-50 text-[#B90F0F] text-xs font-bold px-2.5 py-1 rounded-full">
                *
              </span>
            </div>

            <InputField
              label="Nombre completo"
              icon="fa-user"
              value={formData.datosPersonales.nombre_completo}
              onChange={(v) =>
                handleInputChange('datosPersonales', 'nombre_completo', v)
              }
              error={errores.nombre_completo}
              required
              placeholder="Ej: Saida Rozo"
            />

            <InputField
              label="Teléfono"
              icon="fa-phone"
              value={formData.datosPersonales.telefono}
              onChange={(v) =>
                handleInputChange('datosPersonales', 'telefono', v)
              }
              error={errores.telefono}
              required
              placeholder="Ej: 3123456789"
            />

            <InputField
              label="Email"
              icon="fa-envelope"
              value={formData.datosPersonales.email}
              onChange={(v) =>
                handleInputChange('datosPersonales', 'email', v)
              }
              error={errores.email}
              type="email"
              required
              placeholder="Ej: juan@email.com"
            />

            <InputField
              label="Documento"
              icon="fa-id-card"
              value={formData.datosPersonales.documento}
              onChange={(v) =>
                handleInputChange('datosPersonales', 'documento', v)
              }
              error={errores.documento}
              required
              placeholder="Ej: 1234567890"
            />

            <InputField
              label="Ciudad"
              icon="fa-location-dot"
              value={formData.datosPersonales.ciudad}
              onChange={(v) =>
                handleInputChange('datosPersonales', 'ciudad', v)
              }
              error={errores.ciudad}
              required
              placeholder="Ej: Bogotá"
            />

            <InputField
              label="Dirección"
              icon="fa-home"
              value={formData.datosPersonales.direccion}
              onChange={(v) =>
                handleInputChange('datosPersonales', 'direccion', v)
              }
              placeholder="Ej: Calle 123 # 45-67"
            />

            <InputField
              label="Fecha de Nacimiento"
              icon="fa-calendar"
              value={formData.datosPersonales.fecha_nacimiento}
              onChange={(v) =>
                handleInputChange(
                  'datosPersonales',
                  'fecha_nacimiento',
                  v
                )
              }
              type="date"
            />

            {/* ESTADO */}
            <div className="mb-3.5">
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Estado
              </label>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition">
                <i className="fa-solid fa-circle-dot text-[#B90F0F] mr-2.5"></i>

                <select
                  value={formData.datosPersonales.estado}
                  onChange={(e) =>
                    handleInputChange(
                      'datosPersonales',
                      'estado',
                      e.target.value
                    )
                  }
                  className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 py-2.5"
                >
                  {ESTADOS_REPARTIDOR.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* DATOS DEL VEHÍCULO */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-motorcycle text-[#B90F0F]"></i>
              </div>

              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Datos del Vehículo
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Información del vehículo asignado
                </p>
              </div>

              <span className="bg-red-50 text-[#B90F0F] text-xs font-bold px-2.5 py-1 rounded-full">
                *
              </span>
            </div>

            {/* TIPO */}
            <div className="mb-3.5">
              <div className="flex items-center gap-1 mb-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Tipo de vehículo
                </label>

                <span className="text-[#B90F0F] text-base font-bold">
                  *
                </span>
              </div>

              <div
                className={`flex items-center bg-gray-50 border rounded-xl px-3 min-h-[46px] ${
                  errores.tipo
                    ? 'border-2 border-[#B90F0F]'
                    : 'border-gray-200'
                }`}
              >
                <i className="fa-solid fa-car text-gray-400 mr-2.5"></i>

                <select
                  value={formData.datosVehiculo.tipo}
                  onChange={(e) =>
                    handleInputChange(
                      'datosVehiculo',
                      'tipo',
                      e.target.value
                    )
                  }
                  className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 py-2.5"
                >
                  {TIPOS_VEHICULO.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {errores.tipo && (
                <div className="flex items-center gap-1 mt-1">
                  <i className="fa-solid fa-circle-exclamation text-[#B90F0F] text-xs"></i>
                  <span className="text-[#B90F0F] text-xs">
                    {errores.tipo}
                  </span>
                </div>
              )}
            </div>

            <InputField
              label="Modelo"
              icon="fa-wrench"
              value={formData.datosVehiculo.modelo}
              onChange={(v) =>
                handleInputChange('datosVehiculo', 'modelo', v)
              }
              error={errores.modelo}
              required
              placeholder="Ej: Yamaha XTZ 150"
            />

            <InputField
              label="Placa"
              icon="fa-key"
              value={formData.datosVehiculo.placa}
              onChange={(v) =>
                handleInputChange(
                  'datosVehiculo',
                  'placa',
                  v.toUpperCase()
                )
              }
              error={errores.placa}
              required
              placeholder="Ej: ABC-123"
            />

            <div className="flex items-center gap-1 text-xs text-gray-400 -mt-2 mb-3">
              <i className="fa-solid fa-circle-info"></i>
              <span>La placa debe ser única en el sistema</span>
            </div>

            <InputField
              label="Color"
              icon="fa-palette"
              value={formData.datosVehiculo.color}
              onChange={(v) =>
                handleInputChange('datosVehiculo', 'color', v)
              }
              error={errores.color}
              required
              placeholder="Ej: Rojo"
            />

          </div>

        </div>

        {/* CAMBIOS SIN GUARDAR */}
        {formModificado && (
          <div className="flex items-center justify-center gap-2 mt-5 py-3 px-4 bg-orange-50 border border-orange-100 rounded-xl">
            <i className="fa-solid fa-pen text-orange-600"></i>
            <span className="text-orange-700 text-sm font-medium">
              Tienes cambios sin guardar
            </span>
          </div>
        )}

        {/* BOTONES */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50"
          >
            <i className="fa-solid fa-xmark"></i>
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#B90F0F] text-white font-semibold text-sm hover:bg-[#9f0d0d] transition disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i>
                Guardar cambios
              </>
            )}
          </button>

        </div>

        {/* NOTA */}
        <div className="flex items-center justify-center gap-2 mt-4 mb-2 text-xs text-gray-400">
          <i className="fa-solid fa-circle-info"></i>
          <span>Los campos marcados con * son obligatorios</span>
        </div>

      </form>
    </div>
  </div>
);
};

export default EditarRepartidor;