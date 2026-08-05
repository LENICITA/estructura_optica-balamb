import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const RegistroManual = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!descripcion.trim()) {
      setError('Completa la descripción');
      return;
    }

    if (descripcion.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      
      const response = await api.patch(`/distribucion/${id}/entregar`, {
        observaciones: descripcion.trim()
      });


      if (response.data.success) {
        alert('Pedido registrado exitosamente');
        navigate('/repartidor/inicio');
      } else {
        throw new Error(response.data.message || 'Error al registrar la entrega');
      }

    } catch (err) {
      console.error('Error al registrar entrega:', err);
      setError(err.response?.data?.message || 'Error al registrar la entrega');
    } finally {
      setLoading(false);
    }
  };

  const volverAtras = () => {
    navigate(`/qr/${id}`);
  };

  return (
    <div className="max-w-[500px] mx-auto my-[60px] p-5">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#B90F0F] text-white text-center py-4">
          <h3 className="text-xl font-bold">Registro manual</h3>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="font-bold text-sm block mb-1"># Pedido</label>
              <input 
                type="text" 
                value={`#${id}`} 
                disabled 
                className="w-full p-2.5 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>

            <div>
              <label className="font-bold text-sm block mb-1">
                Descripción de la entrega <span className="text-red-500">*</span>
              </label>
              <textarea 
                rows="4" 
                placeholder="Describe cómo se realizó la entrega..." 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
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
              className="bg-[#B90F0F] text-white border-none py-3 rounded-xl font-bold cursor-pointer hover:bg-[#8a0b0b] transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i> Registrando...
                </>
              ) : (
                'Completar entrega'
              )}
            </button>

            <button 
              type="button"
              onClick={volverAtras}
              className="bg-gray-200 text-gray-700 border-none py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-gray-300 transition disabled:opacity-50"
              disabled={loading}
            >
              ← Volver al QR
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroManual;