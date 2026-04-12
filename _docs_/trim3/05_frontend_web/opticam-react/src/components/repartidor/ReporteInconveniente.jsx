import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReporteInconveniente = () => {
  const navigate = useNavigate();
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!asunto || !mensaje) {
      alert('❌ Completa todos los campos');
      return;
    }
    alert('✅ Reporte enviado. Nos pondremos en contacto contigo pronto.');
    navigate('/');
  };

  return (
    <div className="max-w-[500px] mx-auto my-[60px] p-5 bg-white rounded-xl shadow-md">
      <h3 className="text-center text-xl font-bold text-[#B90F0F] mb-4">Reportar inconveniente</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="font-bold text-sm">Asunto</label>
        <input 
          type="text" 
          placeholder="Ej: Problema con entrega" 
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          className="p-2.5 rounded-lg border border-gray-300"
          required
        />

        <label className="font-bold text-sm">Mensaje</label>
        <textarea 
          rows="4" 
          placeholder="Describe el inconveniente..." 
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="p-2.5 rounded-lg border border-gray-300 resize-none"
          required
        ></textarea>

        <button 
          type="submit"
          className="bg-[#B90F0F] text-white border-none py-3 rounded-xl font-bold cursor-pointer hover:bg-[#8a0b0b] transition mt-2"
        >
          Enviar reporte
        </button>
      </form>
    </div>
  );
};

export default ReporteInconveniente;