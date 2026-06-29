import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const SubirEvidencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
        e.target.value = '';
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen es demasiado grande. Máximo 5MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => setImagenPreview(event.target.result);
      reader.readAsDataURL(file);
      setImagenFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imagenFile) {
      setError('Sube una foto como evidencia');
      return;
    }

    setCargando(true);
    setError(null);

    try {

      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('imagen', imagenFile);
      formData.append('observaciones', observaciones || '');
      
      // Marcar como entregado con observaciones
      const response = await api.patch(`/distribucion/${id}/entregar`, {
        observaciones: `Entregado con evidencia. ${observaciones || ''}`
      });


      if (response.data.success) {
        alert('Pedido completado exitosamente. ¡Gracias por tu excelente trabajo!');
        navigate('/repartidor/inicio');
      } else {
        throw new Error(response.data.message || 'Error al completar el pedido');
      }

    } catch (err) {
      console.error('Error al completar pedido:', err);
      setError(err.response?.data?.message || 'Error al completar el pedido');
    } finally {
      setCargando(false);
    }
  };

  const volverAtras = () => {
    navigate(`/qr/${id}`);
  };

  return (
    <div className="max-w-[500px] mx-auto my-[60px] p-5">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#B90F0F] text-white text-center py-4">
          <h3 className="text-xl font-bold">Evidencia de entrega</h3>
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
                Foto de evidencia <span className="text-red-500">*</span>
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  imagenPreview ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-[#B90F0F]'
                }`}
                onClick={() => document.getElementById('imagen-input').click()}
              >
                {imagenPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={imagenPreview} 
                      alt="Preview" 
                      className="max-h-[150px] rounded-lg"
                    />
                    <p className="text-sm text-green-600">Imagen seleccionada</p>
                    <button 
                      type="button"
                      className="text-xs text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagenPreview(null);
                        setImagenFile(null);
                        document.getElementById('imagen-input').value = '';
                      }}
                    >
                      <i className="fa-solid fa-times mr-1"></i> Quitar imagen
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-400"></i>
                    <p className="font-bold m-0">Sube tu evidencia</p>
                    <span className="text-xs text-gray-500">Haz clic o arrastra aquí (máx 5MB)</span>
                    <span className="text-xs text-gray-400">Formatos: JPG, PNG, WEBP, GIF</span>
                  </div>
                )}
                <input 
                  id="imagen-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handleImagenChange} 
                  className="hidden"
                  disabled={cargando}
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-sm block mb-1">
                Observaciones
              </label>
              <textarea 
                rows="2" 
                placeholder="Opcional: Notas adicionales sobre la entrega..." 
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-300 resize-none focus:outline-none focus:border-[#B90F0F]"
                disabled={cargando}
              />
            </div>

            <button 
              type="submit"
              className="bg-[#B90F0F] text-white border-none py-3 rounded-xl font-bold cursor-pointer hover:bg-[#8a0b0b] transition disabled:opacity-50"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i> Completando...
                </>
              ) : (
                'Completar entrega'
              )}
            </button>

            <button 
              type="button"
              onClick={volverAtras}
              className="bg-gray-200 text-gray-700 border-none py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-gray-300 transition disabled:opacity-50"
              disabled={cargando}
            >
              ← Volver al QR
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubirEvidencia;