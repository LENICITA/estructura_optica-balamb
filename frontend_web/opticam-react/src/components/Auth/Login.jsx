// components/Auth/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ ESTADO PARA MOSTRAR CONTRASEÑA
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // REF para controlar navegación - SOLO UNA VEZ
  const navegacionRealizada = useRef(false);

  // useEffect para redirigir
  useEffect(() => {
    if (navegacionRealizada.current || !user) {
      return;
    }
    
    navegacionRealizada.current = true;
    
    if (user.roles?.includes('ADMIN')) {
      navigate('/admin/dashboard', { replace: true });
    } else if (user.roles?.includes('REPARTIDOR')) {
      navigate('/repartidor/inicio', { replace: true });
    } else if (user.roles?.includes('CLIENTE')) {
      navigate('/principal-cliente', { replace: true });
    }
  }, [user, navigate]);

  // Resetear al desmontar
  useEffect(() => {
    return () => {
      navegacionRealizada.current = false;
    };
  }, []);

  // TOGGLE PARA MOSTRAR/OCULTAR CONTRASEÑA
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(email, password);

      if (!result.success) {
        setError(result.message || 'Credenciales incorrectas');
        setLoading(false);
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  // Si ya hay usuario y no hemos navegado, mostrar loading
  if (user && !navegacionRealizada.current) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F]"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4">
      <h1 className="text-5xl font-bold text-center text-black">
        Iniciar <br /><span className="text-3xl font-medium">Sesion</span>
      </h1>

      <div className="bg-white p-8 w-[370px] max-w-[90%] rounded-xl shadow-lg mt-5">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <label className="block text-black mt-4 mb-1">Email</label>
          <input 
            type="email" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="admin@opticam.com"
            required 
          />

          <label className="block text-black mt-4 mb-1">Contraseña</label>
          {/* CAMPO DE CONTRASEÑA CON BOTÓN DE MOSTRAR */}
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F] pr-12" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#B90F0F] transition"
              tabIndex="-1"
            >
              <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl`}></i>
            </button>
          </div>

          <Link to="/recuperar-password" className="block mt-2.5 text-[#B90F0F] text-sm no-underline hover:underline">
            Recuperar contraseña
          </Link>

          <button 
            type="submit" 
            className="w-full mt-4 py-3 bg-[#B90F0F] text-white border-none rounded-xl text-base cursor-pointer transition-all hover:opacity-85 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center mt-4 text-sm">
            Si no tiene cuenta <Link to="/register" className="text-[#B90F0F] no-underline hover:underline">registrese aqui</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;