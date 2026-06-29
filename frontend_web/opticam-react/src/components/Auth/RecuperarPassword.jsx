import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError('Ingresa tu correo electrónico');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/recuperar-password', { email });

      if (response.data.success) {
        setMessage(`Se ha enviado un enlace de recuperación a ${email}`);
        
        setEmail('');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Error al enviar el correo');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 404) {
        setError('No existe una cuenta con este email');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message);
      } else {
        setError('Error al procesar la solicitud. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#B90F0F] text-white text-center py-6">
          <i className="fa-solid fa-lock text-3xl mb-2"></i>
          <h2 className="text-xl font-bold">Restablecer contraseña</h2>
        </div>

        <div className="p-8">
          <p className="text-gray-600 text-center text-sm mb-6">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm whitespace-pre-line">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold text-sm mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F] transition"
                placeholder="tucorreo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#B90F0F] text-white py-3 rounded-xl font-semibold hover:bg-[#8a0b0b] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

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

export default RecuperarPassword;