import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const QrReader = () => {
  const { id } = useParams();
  const [lecturaExitosa, setLecturaExitosa] = useState(false);

  const handleLecturaExitosa = () => {
    setLecturaExitosa(true);
    setTimeout(() => {
      if (window.confirm('¿QR leído con éxito? ¿Desea proceder con la entrega?')) {
        window.location.href = `/subir-evidencia/${id}`;
      }
    }, 500);
  };

  const handleRegistroManual = () => {
    window.location.href = `/registro-manual/${id}`;
  };

  const handleReportarInconveniente = () => {
    window.location.href = '/reportar-inconveniente';
  };

  return (
    <main className="max-w-[900px] mx-auto my-[30px] p-5 text-center">
      <h1 className="text-3xl font-bold mb-6">
        Muestra el siguiente código al cliente para finalizar
      </h1>
      <img src="/img/qr.png" alt="QR" className="w-[250px] mx-auto my-5" />
      
      <a 
        href="/reportar-inconveniente"
        className="inline-block bg-orange-500 text-white no-underline px-5 py-2.5 rounded-md mb-5 hover:bg-orange-600"
      >
        <i className="fa-solid fa-circle-exclamation mr-2"></i> Reportar inconveniente
      </a>

      <div className="flex flex-col gap-3 mt-4">
        <button 
          onClick={handleLecturaExitosa}
          className="bg-[#B90F0F] text-white py-3 rounded-xl cursor-pointer hover:bg-[#8a0b0b]"
        >
          Lectura completada
        </button>
        <button 
          onClick={handleRegistroManual}
          className="bg-gray-500 text-white py-3 rounded-xl cursor-pointer hover:bg-gray-600"
        >
          Registro manual
        </button>
      </div>
    </main>
  );
};

export default QrReader;