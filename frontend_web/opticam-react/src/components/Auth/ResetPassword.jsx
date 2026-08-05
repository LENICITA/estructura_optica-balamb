// components/Auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      
      if (!token) {
        setError('No se proporcionó un token de recuperación');
        setVerifying(false);
        return;
      }

      try {
        const response = await api.get(`/auth/verificar-token/${token}`);
        
        if (response.data.success) {
          setTokenValid(true);
          setUserEmail(response.data.data.email);
          setError('');
        } else {
          setError('Token inválido o expirado');
        }
      } catch (err) {
        console.error('Error al verificar token:', err);
        setError('Error al verificar el token. Solicita un nuevo enlace.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/resetear-password', {
        token,
        nueva_contrasena: newPassword
      });


      if (response.data.success) {
        setMessage('Contraseña actualizada exitosamente');
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.' }
          });
        }, 3000);
      } else {
        setError(response.data.message || 'Error al actualizar la contraseña');
      }
    } catch (err) {
      console.error('Error al resetear:', err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F]"></div>
        <p className="mt-4 text-gray-600">Verificando token...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#B90F0F] text-white text-center py-6">
          <i className="fa-solid fa-key text-3xl mb-2"></i>
          <h2 className="text-xl font-bold">Nueva contraseña</h2>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
              {!tokenValid && (
                <div className="mt-3">
                  <Link 
                    to="/recuperar-password" 
                    className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                  >
                    Solicitar nuevo enlace
                  </Link>
                </div>
              )}
            </div>
          )}

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {message}
            </div>
          )}

          {tokenValid && (
            <>
              <p className="text-gray-600 text-center text-sm mb-6">
                Establece una nueva contraseña para <span className="font-semibold text-[#B90F0F]">{userEmail}</span>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold text-sm mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F] transition pr-12"
                      placeholder="Mínimo 8 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#B90F0F] transition"
                      tabIndex="-1"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold text-sm mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F] transition"
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#B90F0F] text-white py-3 rounded-xl font-semibold hover:bg-[#8a0b0b] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Actualizando...
                    </>
                  ) : (
                    'Actualizar contraseña'
                  )}
                </button>
              </form>
            </>
          )}

          <div className="text-center mt-6">
            <Link to="/login" className="text-[#B90F0F] text-sm hover:underline">
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;