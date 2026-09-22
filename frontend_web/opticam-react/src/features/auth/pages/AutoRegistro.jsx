// src/features/auth/pages/AutoRegistro.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validarFormularioCliente } from '../../../shared/validators/userValidators';

export const AutoRegistro = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    documento: '',
    fecha_nacimiento: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    contrasena: '',
    confirmar_contrasena: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validar formulario completo con el validador compartido
    const check = validarFormularioCliente({
      nombre_completo: formData.nombre_completo,
      telefono: formData.telefono,
      fecha_nacimiento: formData.fecha_nacimiento,
      documento: formData.documento,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      email: formData.email,
      contrasena: formData.contrasena,
    });

    if (!check.valido) {
      setError(check.mensaje || 'Datos inválidos');
      return;
    }

    // 2. Validar que las contraseñas coincidan
    if (formData.contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email.trim().toLowerCase(),
        documento: formData.documento.trim(),
        fecha_nacimiento: formData.fecha_nacimiento,
        ciudad: formData.ciudad.trim(),
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim(),
        contrasena: formData.contrasena,
      };

      const result = await register(userData);

      console.log('Registro exitoso en AutoRegistro:', result);

      if (result.success) {
        alert('¡Éxito! Cuenta creada correctamente. Por favor inicia sesión.');
        navigate('/login');
      } else {
        console.log('Error en registro:', result.message);
        setError(result.message || 'Error al registrar usuario.');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-[calc(100vh-94px)] bg-white flex items-center justify-center px-6 py-12">
    <div className="w-full max-w-[820px]">

      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-black">
          Registro
        </h1>

        <h2 className="text-xl font-medium text-black mt-2">
          Regístrate gratis y seguro!
        </h2>
      </div>

      {/* ERROR */}
      {error && (
        <div className="w-full bg-red-50 border border-red-200 p-3 rounded-lg mb-5">
          <p className="text-red-700 text-sm text-center">
            {error}
          </p>
        </div>
      )}

      {/* FORMULARIO */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <form onSubmit={handleRegister}>

          {/* FILA 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

            {/* NOMBRE */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Nombres y Apellidos <span className="text-red-600">*</span>
              </label>

              <input
                type="text"
                value={formData.nombre_completo}
                onChange={(e) =>
                  handleChange('nombre_completo', e.target.value)
                }
                placeholder="Juan Perez"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Email <span className="text-red-600">*</span>
              </label>

              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  handleChange('email', e.target.value)
                }
                placeholder="juan@email.com"
                autoCapitalize="none"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
              />
            </div>

            {/* DOCUMENTO */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Documento
              </label>

              <input
                type="text"
                value={formData.documento}
                onChange={(e) =>
                  handleChange('documento', e.target.value)
                }
                placeholder="123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
              />
            </div>

            {/* FECHA DE NACIMIENTO */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Fecha de nacimiento
              </label>

              <input
                type="date"
                value={formData.fecha_nacimiento}
                onChange={(e) =>
                  handleChange('fecha_nacimiento', e.target.value)
                }
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
              />
            </div>

            {/* CIUDAD */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Ciudad
              </label>

              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) =>
                  handleChange('ciudad', e.target.value)
                }
                placeholder="Bogotá"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
              />
            </div>

            {/* TELÉFONO */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Teléfono
              </label>

              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) =>
                  handleChange('telefono', e.target.value)
                }
                placeholder="3001234567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
              />
            </div>

          </div>

          {/* DIRECCIÓN */}
          <div className="mt-5">
            <label className="block text-black text-sm font-medium mb-2">
              Dirección
            </label>

            <input
              type="text"
              value={formData.direccion}
              onChange={(e) =>
                handleChange('direccion', e.target.value)
              }
              placeholder="Calle 123 #45-67"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
            />
          </div>

          {/* CONTRASEÑAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-5">

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Contraseña <span className="text-red-600">*</span>
              </label>

              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.contrasena}
                  onChange={(e) =>
                    handleChange('contrasena', e.target.value)
                  }
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  aria-label="Mostrar contraseña"
                >
                  <i
                    className={`fa-solid ${
                      showPassword
                        ? 'fa-eye-slash'
                        : 'fa-eye'
                    } text-xl`}
                  ></i>
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Debe tener: mayúscula, minúscula y número
              </p>
            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div>
              <label className="block text-black text-sm font-medium mb-2">
                Confirmar Contraseña{' '}
                <span className="text-red-600">*</span>
              </label>

              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmar_contrasena}
                  onChange={(e) =>
                    handleChange(
                      'confirmar_contrasena',
                      e.target.value
                    )
                  }
                  placeholder="Repite la contraseña"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  aria-label="Mostrar contraseña"
                >
                  <i
                    className={`fa-solid ${
                      showConfirmPassword
                        ? 'fa-eye-slash'
                        : 'fa-eye'
                    } text-xl`}
                  ></i>
                </button>
              </div>
            </div>

          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-7 py-3.5 bg-[#B90F0F] text-white rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Crear cuenta'
            )}
          </button>

          {/* LOGIN */}
          <p className="text-center mt-5 text-sm text-gray-700">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-[#B90F0F] font-medium hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </p>

        </form>
      </div>
    </div>
  </div>
);
};