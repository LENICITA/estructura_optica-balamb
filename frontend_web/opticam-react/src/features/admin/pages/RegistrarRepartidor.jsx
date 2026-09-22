// src/features/admin/pages/RegistrarRepartidor.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserController } from '../../../core/controllers/UserController';
import { validarFormularioRepartidor } from '../../../shared/validators/userValidators';

export const RegistrarRepartidor = () => {
  const navigate = useNavigate();
  const userController = new UserController();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [documento, setDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  const [vehiculo, setVehiculo] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [color, setColor] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tiposVehiculo = ['CARRO', 'MOTO'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const check = validarFormularioRepartidor({
      nombre_completo: nombre,
      telefono: telefono,
      fecha_nacimiento: fechaNacimiento,
      documento: documento,
      ciudad: ciudad,
      direccion: direccion,
      email: email,
      contrasena: password,
      vehiculo: { tipo: vehiculo, modelo, placa, color },
    });

    if (!check.valido) {
      setError(check.mensaje || 'Datos inválidos');
      return;
    }

    try {
      setLoading(true);

      const result = await userController.registrarRepartidor({
        nombre_completo: nombre.trim(),
        telefono: telefono.trim(),
        fecha_nacimiento: fechaNacimiento,
        documento: documento.trim(),
        ciudad: ciudad.trim(),
        direccion: direccion.trim(),
        email: email.trim().toLowerCase(),
        contrasena: password,
        vehiculo: {
          tipo: vehiculo,
          modelo: modelo.trim(),
          placa: placa.trim().toUpperCase(),
          color: color.trim(),
        },
      });

      if (result.success) {
        setSuccess('Repartidor registrado exitosamente.');
        alert('El repartidor ha sido registrado correctamente.');
        navigate('/admin/repartidores');
      } else {
        setError(result.message || 'No se pudo registrar el repartidor.');
      }
    } catch (error) {
      console.error('Error al registrar repartidor:', error);
      setError(error.response?.data?.message || 'Error al registrar repartidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-5xl mx-auto">

      {/* VOLVER */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate('/admin/repartidores')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#B90F0F] transition"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Volver a repartidores
        </button>
      </div>

      {/* ENCABEZADO */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-user-plus text-[#B90F0F] text-xl"></i>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Registrar repartidor
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Registra un nuevo repartidor y asigna su vehículo
            </p>
          </div>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-[#B90F0F]"></i>

          <span className="text-[#B90F0F] text-sm font-medium flex-1">
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 mb-5 flex items-center gap-3">
          <i className="fa-solid fa-circle-check text-green-700"></i>

          <span className="text-green-700 text-sm font-medium flex-1">
            {success}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* FORMULARIOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* DATOS PERSONALES */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-user text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Datos personales
                </h2>

                <p className="text-xs text-gray-400 mt-0.5">
                  Información del repartidor
                </p>
              </div>
            </div>

            {/* NOMBRES */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nombres y Apellidos <span className="text-[#B90F0F]">*</span>
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition mb-3.5">
              <i className="fa-solid fa-user text-gray-400 mr-2.5"></i>

              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />
            </div>

            {/* EMAIL */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email <span className="text-[#B90F0F]">*</span>
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition mb-3.5">
              <i className="fa-solid fa-envelope text-gray-400 mr-2.5"></i>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />
            </div>

            {/* DOCUMENTO */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Documento
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition mb-3.5">
              <i className="fa-solid fa-id-card text-gray-400 mr-2.5"></i>

              <input
                type="text"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Número de documento"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />
            </div>

            {/* FECHA */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Fecha de nacimiento
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition mb-3.5">
              <i className="fa-solid fa-calendar text-gray-400 mr-2.5"></i>

              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 py-2.5"
              />
            </div>

            {/* CIUDAD */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ciudad
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition mb-3.5">
              <i className="fa-solid fa-location-dot text-gray-400 mr-2.5"></i>

              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ej. Bogotá"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />
            </div>

            {/* DIRECCIÓN */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Dirección
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition mb-3.5">
              <i className="fa-solid fa-house text-gray-400 mr-2.5"></i>

              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección de residencia"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />
            </div>

            {/* TELÉFONO */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Teléfono
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition mb-3.5">
              <i className="fa-solid fa-phone text-gray-400 mr-2.5"></i>

              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Número de teléfono"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />
            </div>

            {/* CONTRASEÑA */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Contraseña <span className="text-[#B90F0F]">*</span>
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition">
              <i className="fa-solid fa-lock text-gray-400 mr-2.5"></i>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-[#B90F0F] transition ml-2"
              >
                <i
                  className={`fa-solid ${
                    showPassword ? 'fa-eye-slash' : 'fa-eye'
                  }`}
                ></i>
              </button>
            </div>

          </div>

          {/* DATOS DEL VEHÍCULO */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-motorcycle text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Datos del vehículo
                </h2>

                <p className="text-xs text-gray-400 mt-0.5">
                  Información del vehículo asignado
                </p>
              </div>
            </div>

            {/* TIPO DE VEHÍCULO */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tipo de vehículo
            </label>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {tiposVehiculo.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setVehiculo(tipo)}
                  className={`min-h-[48px] rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition ${
                    vehiculo === tipo
                      ? 'bg-[#B90F0F] text-white border-[#B90F0F]'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#B90F0F] hover:text-[#B90F0F] hover:bg-red-50'
                  }`}
                >
                  <i
                    className={`fa-solid ${
                      tipo === 'MOTO' ? 'fa-motorcycle' : 'fa-car'
                    }`}
                  ></i>

                  {tipo === 'MOTO' ? 'Moto' : 'Carro'}
                </button>
              ))}
            </div>

            {/* MODELO */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Modelo del vehículo
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition mb-3.5">
              <i className="fa-solid fa-wrench text-gray-400 mr-2.5"></i>

              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej. 2024"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />
            </div>

            {/* PLACA */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Placa
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition">
              <i className="fa-solid fa-key text-gray-400 mr-2.5"></i>

              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="Ej. ABC123"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5 uppercase"
              />
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5 mb-3.5">
              <i className="fa-solid fa-circle-info"></i>
              <span>La placa debe ser única en el sistema</span>
            </div>

            {/* COLOR */}
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Color del vehículo
            </label>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 min-h-[46px] focus-within:border-[#B90F0F] transition">
              <i className="fa-solid fa-palette text-gray-400 mr-2.5"></i>

              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej. Negro"
                className="flex-1 bg-transparent outline-none text-[15px] text-gray-700 placeholder-gray-400 py-2.5"
              />
            </div>

            {/* INFORMACIÓN */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-circle-info text-[#B90F0F] mt-0.5"></i>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Información
                  </p>

                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    El vehículo quedará asociado al repartidor que estás
                    registrando.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* BOTONES */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">

          <button
            type="button"
            onClick={() => navigate('/admin/repartidores')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-600 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50"
          >
            <i className="fa-solid fa-xmark"></i>
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#B90F0F] text-white font-semibold text-sm hover:bg-[#9f0d0d] transition disabled:opacity-60 shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <i className="fa-solid fa-user-plus"></i>
                Crear cuenta
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

export default RegistrarRepartidor;