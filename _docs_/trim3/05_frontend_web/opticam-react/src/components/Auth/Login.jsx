import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      if (result.rol === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.rol === 'repartidor') {
        navigate('/repartidor/inicio');
      } else {
        navigate('/inicio-cliente');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4">
      <h1 className="text-5xl font-bold text-center text-black">
        Iniciar <br /><span className="text-3xl font-medium">Sesión</span>
      </h1>

      <div className="bg-white p-8 w-[370px] max-w-[90%] rounded-xl shadow-lg mt-5">
        <form onSubmit={handleSubmit}>
          <label className="block text-black mt-4 mb-1">Email</label>
          <input 
            type="email" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />

          <label className="block text-black mt-4 mb-1">Contraseña</label>
          <input 
            type="password" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          <Link to="/recuperar-password" className="block mt-2.5 text-[#B90F0F] text-sm no-underline hover:underline">
            Recuperar contraseña
          </Link>

          <div className="flex items-center my-5 gap-2.5">
            <hr className="flex-1 border-none h-px bg-gray-300" />
            <span className="text-sm text-gray-500">o</span>
            <hr className="flex-1 border-none h-px bg-gray-300" />
          </div>

          <button type="button" className="flex justify-center items-center gap-2.5 w-full mt-3 py-3 border-none rounded-full bg-gray-200 cursor-pointer text-sm transition-all hover:bg-gray-300">
            Continuar con Google <i className="fa-brands fa-google text-red-600"></i>
          </button>

          <button type="button" className="flex justify-center items-center gap-2.5 w-full mt-3 py-3 border-none rounded-full bg-gray-200 cursor-pointer text-sm transition-all hover:bg-gray-300">
            Continuar con Facebook <i className="fa-brands fa-facebook text-blue-700"></i>
          </button>

          <button 
            type="submit" 
            className="w-full mt-4 py-3 bg-[#B90F0F] text-white border-none rounded-xl text-base cursor-pointer transition-all hover:opacity-85"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center mt-4 text-sm">
            Si no tiene cuenta <Link to="/register" className="text-[#B90F0F] no-underline hover:underline">regístrese aquí</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;