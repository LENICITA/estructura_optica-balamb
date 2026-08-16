import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ReporteInconveniente = () => {
  const navigate = useNavigate();
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!asunto.trim()) {
      setError('Ingresa un asunto');
      return;
    }
    
    if (!mensaje.trim()) {
      setError('Ingresa un mensaje');
      return;
    }

    if (mensaje.trim().length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {

      // Simulación de envío exitoso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/repartidor/inicio');
      }, 2000);

    } catch (err) {
      console.error('Error al enviar reporte:', err);
      setError(err.response?.data?.message || 'Error al enviar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const volverAtras = () => {
    navigate(-1);
  };

  if (success) {
    return (
      <div className="max-w-[500px] mx-auto my-[60px] p-5">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <i className="fa-solid fa-check-circle text-6xl text-green-500 mb-4"></i>
          <h3 className="text-2xl font-bold text-green-700">Reporte enviado</h3>
          <p className="text-gray-600 mt-2">Nos pondremos en contacto contigo pronto.</p>
          <p className="text-sm text-gray-400 mt-4">Redirigiendo al inicio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[500px] mx-auto my-[60px] p-5">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-orange-500 text-white text-center py-4">
          <h3 className="text-xl font-bold">Reportar inconveniente</h3>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-bold text-sm block mb-1">
                Asunto <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Ej: Problema con la entrega" 
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B90F0F]"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="font-bold text-sm block mb-1">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea 
                rows="4" 
                placeholder="Describe el inconveniente con detalle..." 
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 resize-none focus:outline-none focus:border-[#B90F0F]"
                required
                disabled={loading}
                minLength="10"
              />
              <p className="text-xs text-gray-400 mt-1">
                Mínimo 10 caracteres
              </p>
            </div>

            <button 
              type="submit"
              className="bg-orange-500 text-white border-none py-3 rounded-xl font-bold cursor-pointer hover:bg-orange-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i> Enviando...
                </>
              ) : (
                'Enviar reporte'
              )}
            </button>

            <button 
              type="button"
              onClick={volverAtras}
              className="bg-gray-200 text-gray-700 border-none py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-gray-300 transition disabled:opacity-50"
              disabled={loading}
            >
              ← Volver
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReporteInconveniente;