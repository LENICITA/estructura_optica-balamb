import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const PruebaMontura = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [stream, setStream] = useState(null);
  const [gafas, setGafas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gafaSeleccionada, setGafaSeleccionada] = useState(null);
  const [tamano, setTamano] = useState(100);
  const [posicionY, setPosicionY] = useState(0);
  const [fotos, setFotos] = useState([]);
  const [mostrarTerminos, setMostrarTerminos] = useState(true);
  const [terminosAceptados, setTerminosAceptados] = useState({ terminos: false, privacidad: false });


  // CARGAR PRODUCTOS PARA PRUEBA DE MONTURA
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get('/inventario/productos');

      let productosData = response.data;
      if (response.data && response.data.data) {
        productosData = response.data.data;
      }
      if (response.data && response.data.productos) {
        productosData = response.data.productos;
      }

      if (!Array.isArray(productosData)) {
        productosData = [];
      }

      // Filtrar solo productos con imágenes y mapear para la prueba
      const gafasMapeadas = productosData
        .filter(p => p.imagen && p.imagen !== '')
        .slice(0, 10) // Tomar máximo 10 productos
        .map(p => ({
          id: p.id_producto || p.id,
          nombre: p.nombre || 'Producto',
          imagen: p.imagen || p.imagen_url || '/img/default.png',
          precio: p.precio || 0,
          ...p
        }));
      
      if (gafasMapeadas.length === 0) {
      } else {
        setGafas(gafasMapeadas);
      }

      // Seleccionar gafa específica si viene por ID
      if (id) {
        const productoId = parseInt(id);
        const encontrado = gafasMapeadas.find(g => g.id === productoId);
        if (encontrado) {
          setGafaSeleccionada(encontrado);
        } else if (gafasMapeadas.length > 0) {
          setGafaSeleccionada(gafasMapeadas[0]);
        }
      } else if (gafasMapeadas.length > 0) {
        setGafaSeleccionada(gafasMapeadas[0]);
      }

    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('Error al cargar productos para la prueba de montura');
      if (gafas.length > 0) {
        setGafaSeleccionada(gafas[0]);
      }
    } finally {
      setLoading(false);
    }
  };


  // CÁMARA
  useEffect(() => {
    return () => { 
      if (stream) stream.getTracks().forEach(track => track.stop()); 
    };
  }, [stream]);

  const activarCamara = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setCamaraActiva(true);
      setMostrarTerminos(false);
    } catch (error) {
      alert("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  const dibujarGafa = () => {
    if (!canvasRef.current || !videoRef.current || !gafaSeleccionada || !camaraActiva) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const img = new Image();
    img.src = gafaSeleccionada.imagen;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ancho = canvas.width * 0.5 * (tamano / 100);
      const alto = (img.height / img.width) * ancho;
      const x = (canvas.width - ancho) / 2;
      const y = (canvas.height / 2) - (alto / 2) + posicionY;
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(img, -x - ancho, y, ancho, alto);
      ctx.restore();
    };
  };

  useEffect(() => {
    if (camaraActiva && gafaSeleccionada) {
      const intervalo = setInterval(dibujarGafa, 100);
      return () => clearInterval(intervalo);
    }
  }, [camaraActiva, gafaSeleccionada, tamano, posicionY]);


  // FUNCIONES
  const capturarFoto = () => {
    if (!canvasRef.current || !camaraActiva) { 
      alert("Primero activa la cámara"); 
      return; 
    }
    const fotoURL = canvasRef.current.toDataURL('image/png');
    setFotos([...fotos, fotoURL]);
    alert("Foto capturada correctamente");
  };

  const aceptarTerminos = () => {
    if (terminosAceptados.terminos && terminosAceptados.privacidad) {
      activarCamara();
    } else {
      alert("Debes aceptar los términos y condiciones para continuar");
    }
  };

  const volverAtras = () => {
    if (id) {
      navigate(`/producto/${id}`);
    } else {
      navigate('/catalogo');
    }
  };


  // RENDERIZADO CONDICIONAL

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto py-10 px-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1200px] mx-auto py-10 px-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={cargarProductos}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }


  // TÉRMINOS Y CONDICIONES
  if (mostrarTerminos) {
    return (
      <div className="max-w-[500px] mx-auto py-10 px-5">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#B90F0F] text-white text-center py-6">
            <i className="fa-solid fa-camera text-4xl mb-2"></i>
            <h3 className="text-xl font-bold">Activación de cámara</h3>
          </div>
          <div className="p-6">
            <p>Para usar la función de <strong>Prueba de Montura Virtual</strong>, necesitamos acceder a tu cámara.</p>
            <div className="bg-gray-100 p-4 rounded-xl my-4">
              <h6 className="font-bold text-[#B90F0F]">Términos y condiciones:</h6>
              <ul className="text-sm mt-2 list-disc pl-5">
                <li>Solo usaremos tu cámara mientras estés en esta página.</li>
                <li>No guardamos ni almacenamos ninguna imagen o video en nuestros servidores.</li>
                <li>Las fotos que captures se guardan SOLO en tu dispositivo.</li>
              </ul>
            </div>
            <label className="flex items-center gap-2 mb-2">
              <input 
                type="checkbox" 
                onChange={(e) => setTerminosAceptados({...terminosAceptados, terminos: e.target.checked})} 
              /> 
              Acepto los términos y condiciones
            </label>
            <label className="flex items-center gap-2 mb-4">
              <input 
                type="checkbox" 
                onChange={(e) => setTerminosAceptados({...terminosAceptados, privacidad: e.target.checked})} 
              /> 
              Acepto la política de privacidad
            </label>
            <div className="flex gap-3">
              <button onClick={volverAtras} className="flex-1 bg-gray-500 text-white py-2 rounded-lg">
                Rechazar
              </button>
              <button onClick={aceptarTerminos} className="flex-1 bg-[#B90F0F] text-white py-2 rounded-lg">
                Aceptar y continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // RENDER PRINCIPAL
  return (
    <div className="max-w-[1200px] mx-auto py-10 px-5">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Cámara */}
        <div className="bg-black rounded-2xl overflow-hidden relative min-h-[400px]">
          <video ref={videoRef} autoPlay playsInline muted className="w-full scale-x-[-1]" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full scale-x-[-1]" />
          {!camaraActiva && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80">
              <i className="fa-solid fa-camera text-5xl mb-4"></i>
              <p>Activa tu cámara para comenzar</p>
              <button onClick={activarCamara} className="bg-[#B90F0F] text-white px-6 py-3 rounded-full mt-4">
                Activar cámara
              </button>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-xl font-bold mb-4 text-center">Selecciona tu montura</h3>
          
          {gafas.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay productos disponibles para probar</p>
          ) : (
            <div className="flex flex-col gap-3 mb-6 max-h-[300px] overflow-y-auto">
              {gafas.map(gafa => (
                <div 
                  key={gafa.id} 
                  onClick={() => setGafaSeleccionada(gafa)} 
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                    gafaSeleccionada?.id === gafa.id ? 'border-[#B90F0F] bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={gafa.imagen} 
                    alt={gafa.nombre} 
                    className="w-16 h-16 object-contain"
                    onError={(e) => e.target.src = '/img/default.png'}
                  />
                  <div>
                    <strong>{gafa.nombre}</strong><br />
                    <span className="text-[#B90F0F] text-sm">${(gafa.precio || 0).toLocaleString('es-CO')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mb-4">
            <label className="font-semibold">Tamaño</label>
            <input 
              type="range" 
              min="50" 
              max="150" 
              value={tamano} 
              onChange={(e) => setTamano(parseInt(e.target.value))} 
              className="w-full" 
            />
            <div className="text-center text-[#B90F0F] font-bold">{tamano}%</div>
          </div>
          
          <div className="mb-4">
            <label className="font-semibold">Posición vertical</label>
            <input 
              type="range" 
              min="-50" 
              max="50" 
              value={posicionY} 
              onChange={(e) => setPosicionY(parseInt(e.target.value))} 
              className="w-full" 
            />
            <div className="text-center text-[#B90F0F] font-bold">{posicionY}</div>
          </div>
          
          <button 
            onClick={capturarFoto} 
            className="w-full bg-[#B90F0F] text-white py-3 rounded-xl font-bold mb-2 hover:bg-[#8a0b0b] transition"
          >
            Capturar foto
          </button>
          
          <button 
            onClick={volverAtras} 
            className="w-full border border-[#B90F0F] text-[#B90F0F] py-3 rounded-xl font-bold hover:bg-[#B90F0F] hover:text-white transition"
          >
            Volver a productos
          </button>
        </div>
      </div>

      {/* Fotos capturadas */}
      {fotos.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-md p-5">
          <h3 className="font-bold mb-4">📸 Tus fotos</h3>
          <div className="flex gap-3 flex-wrap">
            {fotos.map((foto, idx) => (
              <img 
                key={idx} 
                src={foto} 
                alt={`Foto ${idx + 1}`} 
                className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition" 
                onClick={() => window.open(foto, '_blank')} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PruebaMontura;