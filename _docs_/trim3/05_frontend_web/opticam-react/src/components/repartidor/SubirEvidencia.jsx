import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SubirEvidencia = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagenPreview, setImagenPreview] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImagenPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagenPreview) {
      alert('❌ Sube una foto como evidencia');
      return;
    }
    setCargando(true);
    setTimeout(() => {
      alert('✅ Pedido completado exitosamente. ¡Gracias por tu excelente trabajo!');
      navigate('/');
      setCargando(false);
    }, 1500);
  };

  return (
    <div className="max-w-[500px] mx-auto my-[60px] p-5">
      <div className="bg-white p-5 rounded-xl shadow-md">
        <h3 className="text-center text-xl font-bold mb-4">Evidencia Pedido</h3>
        
        <form onSubmit={handleSubmit}>
          <label className="upload-box border-2 border-dashed border-gray-300 rounded-xl p-[30px] cursor-pointer transition-colors hover:border-[#B90F0F] hover:bg-gray-50 flex flex-col items-center justify-center gap-2.5 text-center mb-4">
            <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-500"></i>
            <p className="font-bold m-0">Sube tus imágenes</p>
            <span className="text-xs text-gray-500">Haz clic o arrastra aquí</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleImagenChange} />
          </label>
          
          {imagenPreview && (
            <div className="text-center mb-4">
              <img src={imagenPreview} alt="Preview" className="max-h-[150px] mx-auto rounded-lg" />
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full bg-[#B90F0F] text-white border-none py-3 rounded-xl font-bold cursor-pointer hover:bg-[#8a0b0b] transition disabled:opacity-50"
            disabled={cargando}
          >
            {cargando ? 'Completando...' : 'Completar entrega'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubirEvidencia;