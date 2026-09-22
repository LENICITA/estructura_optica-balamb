// src/features/auth/pages/RecuperarContraseña.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthController } from '../../../core/controllers/AuthController';

export const RecuperarContraseña = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const authController = new AuthController();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert('Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      const result = await authController.solicitarRecuperacion(email);

      if (result.success) {
        alert(`Se ha enviado un enlace de recuperación a ${email}. Revisa tu correo.`);
        setEmail('');
        navigate('/restablecer-contrasena');
      } else {
        alert(result.message || 'Error al enviar el correo');
      }
    } catch (error) {
      let msg = 'Error al procesar la solicitud';
      if (error.response?.status === 404) {
        msg = 'No existe una cuenta con este email';
      } else if (error.response?.status === 400) {
        msg = error.response?.data?.message || 'Datos inválidos';
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-[calc(100vh-94px)] bg-gray-50 flex items-center justify-center px-6 py-12">
    <div className="w-full max-w-[480px]">

      {/* HEADER */}
      <div className="bg-[#B90F0F] py-7 px-10 rounded-2xl flex flex-col items-center mb-6">
        <i className="fa-solid fa-lock text-white text-5xl"></i>

        <h2 className="text-white text-[24px] font-bold mt-3 text-center">
          Restablecer contraseña
        </h2>
      </div>

      {/* CARD */}
      <div className="bg-white w-full p-8 rounded-2xl shadow-lg">
        
        <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
          Ingresa tu correo electrónico y te enviaremos las instrucciones
          para restablecer tu contraseña.
        </p>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <label className="block text-sm text-black mb-2 font-medium">
            Correo electrónico
          </label>

          <input
            type="email"
            placeholder="tucorreo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition mb-5"
          />

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#B90F0F] text-white rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Enviar enlace de recuperación'
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