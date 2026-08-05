import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const QrReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lecturaExitosa, setLecturaExitosa] = useState(false);

  // VERIFICAR QUE EL PEDIDO EXISTE Y ESTÁ EN ESTADO CORRECTO
  useEffect(() => {
    const verificarPedido = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await api.get(`/distribucion/${id}`);

        let data = response.data;
        if (response.data && response.data.data) {
          data = response.data.data;
        }

        // Verificar que el pedido esté en estado EN_ENTREGA
        if (data.estado !== 'EN_ENTREGA') {
          setError(`El pedido no está en estado de entrega. Estado actual: ${data.estado}`);
        }

      } catch (err) {
        console.error('Error al verificar pedido:', err);
        if (err.response?.status === 404) {
          setError('Pedido no encontrado');
        } else if (err.response?.status === 401) {
          setError('Sesión expirada. Redirigiendo al login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.response?.data?.message || 'Error al verificar el pedido');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      verificarPedido();
    }
  }, [id, navigate]);

  // LECTURA COMPLETADA
  const handleLecturaExitosa = () => {
    setLecturaExitosa(true);
    
    setTimeout(() => {
      if (window.confirm('¿QR leído con éxito? ¿Deseas proceder con la entrega?')) {
        navigate(`/subir-evidencia/${id}`);
      } else {
        setLecturaExitosa(false);
      }
    }, 500);
  };

  // REGISTRO MANUAL
  const handleRegistroManual = () => {
    navigate(`/registro-manual/${id}`);
  };

  // REPORTAR INCONVENIENTE
  const handleReportarInconveniente = () => {
    navigate('/reportar-inconveniente');
  };

  // VOLVER ATRÁS
  const volverAtras = () => {
    navigate(`/detalles-pedido/${id}`);
  };

  // RENDERIZADO CONDICIONAL

  if (loading) {
    return (
      <main className="max-w-[900px] mx-auto my-[30px] p-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando pedido...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-[900px] mx-auto my-[30px] p-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={volverAtras}
            className="mt-2 bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600 transition"
          >
            Volver atrás
          </button>
        </div>
      </main>
    );
  }

  // RENDER PRINCIPAL
  return (
    <main className="max-w-[900px] mx-auto my-[30px] p-5 text-center">
      <h1 className="text-3xl font-bold mb-4">
        Lectura QR
      </h1>
      <p className="text-gray-600 mb-6">
        Muestra el siguiente código al cliente para finalizar la entrega
      </p>

      {/* Simulación de QR */}
      <div className="bg-white p-8 rounded-2xl shadow-lg inline-block mb-6">
        <div className="w-[250px] h-[250px] bg-gray-100 rounded-xl flex items-center justify-center mx-auto border-4 border-[#B90F0F]">
          <div className="text-center">
            <i className="fa-solid fa-qrcode text-7xl text-[#B90F0F]"></i>
            <p className="text-sm text-gray-500 mt-4">Código QR del pedido #{id}</p>
            <p className="text-xs text-gray-400">Escanea con la cámara del cliente</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          ID de verificación: {id}
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {/* Botón Lectura completada */}
        {!lecturaExitosa ? (
          <button 
            onClick={handleLecturaExitosa}
            className="bg-[#B90F0F] text-white py-4 rounded-xl font-bold hover:bg-[#8a0b0b] transition cursor-pointer"
          >
            <i className="fa-solid fa-check-circle mr-2"></i>
            Lectura completada
          </button>
        ) : (
          <button 
            disabled
            className="bg-green-500 text-white py-4 rounded-xl font-bold cursor-not-allowed opacity-75"
          >
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            Procesando...
          </button>
        )}

        {/* Botón Registro manual */}
        <button 
          onClick={handleRegistroManual}
          className="bg-gray-500 text-white py-4 rounded-xl font-bold hover:bg-gray-600 transition cursor-pointer"
        >
          <i className="fa-solid fa-pen mr-2"></i>
          Registro manual
        </button>

        {/* Botón Reportar inconveniente */}
        <button 
          onClick={handleReportarInconveniente}
          className="bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition cursor-pointer"
        >
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          Reportar inconveniente
        </button>

        {/* Botón Volver */}
        <button 
          onClick={volverAtras}
          className="bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>
          Volver al pedido
        </button>
      </div>

      {/* Instrucciones */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl text-left">
        <h4 className="font-bold text-blue-800 mb-2">📋 Instrucciones:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>1️. Muestra el código QR al cliente.</li>
          <li>2️. El cliente debe escanear el QR desde la aplicación.</li>
          <li>3️. Haz clic en "Lectura completada" cuando el cliente confirme.</li>
          <li>4️. Si hay problemas, usa "Registro manual".</li>
        </ul>
      </div>
    </main>
  );
};

export default QrReader;