import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const RegistroManual = () => {
  const { id } = useParams();
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!descripcion) {
      alert('❌ Completa la descripción');
      return;
    }
    alert('✅ Registro enviado correctamente');
    window.location.href = `/subir-evidencia/${id}`;
  };

  return (
    <div className="max-w-[500px] mx-auto my-[60px] p-5 bg-white rounded-xl shadow-md">
      <h3 className="text-center text-xl font-bold text-[#B90F0F] mb-4">Registro manual</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="font-bold text-sm"># pedido</label>
        <input 
          type="text" 
          value={`#${id}`} 
          disabled 
          className="p-2.5 rounded-lg border border-gray-300 bg-gray-100"
        />

        <label className="font-bold text-sm">Descripción</label>
        <textarea 
          rows="4" 
          placeholder="Describe la entrega..." 
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="p-2.5 rounded-lg border border-gray-300 resize-none"
          required
        ></textarea>

        <button 
          type="submit"
          className="bg-[#B90F0F] text-white border-none py-3 rounded-xl font-bold cursor-pointer hover:bg-[#8a0b0b] transition mt-2"
        >
          Completar entrega
        </button>
      </form>
    </div>
  );
};

export default RegistroManual;