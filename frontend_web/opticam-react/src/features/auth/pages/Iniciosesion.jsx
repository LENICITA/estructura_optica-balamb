// src/features/auth/pages/Iniciosesion.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Iniciosesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // ===== REDIRECCIÓN SEGÚN ROL =====
  const handleRedirectByRole = (usuario) => {
    try {
      if (!usuario) {
        console.log(' No hay usuario para redirigir');
        navigate('/');
        return;
      }

      console.log(' Usuario para redirección:', usuario);

      // OBTENER ROLES
      let rolesArray = [];

      if (Array.isArray(usuario.roles)) {
        rolesArray = usuario.roles.map((r) =>
          typeof r === 'string' ? r : r.nombre || r.rol || r
        );
      } else if (typeof usuario.roles === 'string') {
        rolesArray = [usuario.roles];
      } else if (usuario.rol) {
        rolesArray = [usuario.rol];
      }

      rolesArray = rolesArray.map((role) => role.toUpperCase());
      console.log('🎭 Roles:', rolesArray);

      // ADMIN
      if (rolesArray.includes('ADMIN') || rolesArray.includes('ADMINISTRADOR')) {
        console.log(' Redirigiendo a Administrador');
        navigate('/admin/dashboard');
        return;
      }

      // REPARTIDOR
      if (rolesArray.includes('REPARTIDOR')) {
        console.log(' Redirigiendo a Repartidor');
        navigate('/repartidor/inicio');
        return;
      }

      // CLIENTE
      if (rolesArray.includes('CLIENTE')) {
        console.log(' Redirigiendo a Cliente');
        navigate('/cliente/inicio');
        return;
      }

      console.log(' Rol no reconocido');
      navigate('/');
    } catch (error) {
      console.error(' Error al redirigir:', error);
      navigate('/');
    }
  };

  // ===== LOGIN =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log(' Intentando iniciar sesión...');

      const result = await login(email.trim(), password);

      console.log(' Resultado del login:', result);

      if (!result.success) {
        setError(result.message || 'Credenciales incorrectas');
        return;
      }

      console.log(' Inicio de sesión exitoso');
      handleRedirectByRole(result.user);
    } catch (err) {
      console.error(' Error en login:', err);
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-[calc(100vh-94px)] bg-white flex items-center justify-center px-6 py-12">
    <div className="w-full max-w-[460px]">
      
      {/* TÍTULO */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-black">
          Iniciar
        </h1>
        <h2 className="text-[30px] font-medium text-black">
          Sesión
        </h2>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
            <p className="text-red-700 text-sm text-center">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <label className="block text-black text-sm font-medium mb-2">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@opticam.com"
            autoCapitalize="none"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
          />

          {/* CONTRASEÑA */}
          <label className="block text-black text-sm font-medium mt-5 mb-2">
            Contraseña
          </label>

          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-base outline-none focus:border-[#B90F0F] transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              aria-label="Mostrar contraseña"
            >
              <i
                className={`fa-solid ${
                  showPassword ? 'fa-eye-slash' : 'fa-eye'
                } text-xl`}
              ></i>
            </button>
          </div>

          {/* RECUPERAR */}
          <div className="mt-4 flex justify-start">
            <Link
              to="/recuperar-contrasena"
              className="text-[#B90F0F] text-sm hover:underline"
            >
              Recuperar contraseña
            </Link>
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-[#B90F0F] text-white rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Ingresar'
            )}
          </button>

          {/* REGISTRO */}
          <p className="text-center mt-5 text-sm text-gray-700">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/registro"
              className="text-[#B90F0F] font-medium hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>

        </form>
      </div>
    </div>
  </div>
);
};