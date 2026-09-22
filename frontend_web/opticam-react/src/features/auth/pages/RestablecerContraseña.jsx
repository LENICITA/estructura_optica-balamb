// src/features/auth/pages/RestablecerContraseña.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthController } from '../../../core/controllers/AuthController';

export const RestablecerContraseña = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const authController = new AuthController();

  // Si hay token en la URL, ya lo tenemos en el estado inicial
  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const extraerToken = (texto) => {
    if (texto.includes('token=')) {
      const match = texto.match(/token=([^&]+)/);
      if (match) return match[1];
    }
    return texto;
  };

  const handleTokenChange = (text) => {
    const tokenExtraido = extraerToken(text);
    setToken(tokenExtraido);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || token.trim() === '') {
      alert('Debes ingresar el enlace de recuperación que recibiste en el correo');
      return;
    }

    if (newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const result = await authController.resetearPassword(token, newPassword);

      if (result.success) {
        alert('Contraseña actualizada exitosamente');
        navigate('/login');
      } else {
        alert(result.message || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-[calc(100vh-94px)] bg-gray-50 flex items-center justify-center px-6 py-12">
    <div className="w-full max-w-[500px]">

      {/* HEADER */}
      <div className="bg-[#B90F0F] py-7 px-10 rounded-2xl flex flex-col items-center mb-6">
        <i className="fa-solid fa-key text-white text-5xl"></i>

        <h2 className="text-white text-[24px] font-bold mt-3 text-center">
          Nueva contraseña
        </h2>
      </div>

      {/* CARD */}
      <div className="bg-white w-full p-8 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit}>

          {/* ENLACE DE RECUPERACIÓN */}
          <div>
            <label className="block text-sm text-black mb-2 font-medium">
              Enlace de recuperación
            </label>

            <textarea
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="Pega aquí el enlace que recibiste en el correo"
              autoCapitalize="none"
              rows={3}
              className="w-full px-4 py-3 border-2 border-[#B90F0F] bg-red-50 rounded-xl text-base outline-none resize-none focus:border-[#B90F0F] transition"
            />

            <p className="text-xs text-gray-500 mt-2 mb-6">
              Copia el enlace del correo y pégalo aquí
            </p>
          </div>

          {/* NUEVA CONTRASEÑA */}
          <div>
            <label className="block text-sm text-black mb-2 font-medium">
              Nueva contraseña
            </label>

            <div className="flex items-center border border-gray-300 rounded-xl bg-white focus-within:border-[#B90F0F] transition">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 px-4 py-3 text-base outline-none bg-transparent"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-gray-500 hover:text-gray-700 transition"
                aria-label="Mostrar contraseña"
              >
                <i
                  className={`fa-solid ${
                    showPassword ? 'fa-eye-slash' : 'fa-eye'
                  } text-xl`}
                ></i>
              </button>
            </div>
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="mt-5">
            <label className="block text-sm text-black mb-2 font-medium">
              Confirmar contraseña
            </label>

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Repite tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
            />
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
              'Actualizar contraseña'
            )}
          </button>

          {/* VOLVER */}
          <Link
            to="/login"
            className="block text-center text-[#B90F0F] text-sm mt-5 underline hover:text-red-800"
          >
            ← Volver al inicio de sesión
          </Link>

        </form>
      </div>
    </div>
  </div>
);
};