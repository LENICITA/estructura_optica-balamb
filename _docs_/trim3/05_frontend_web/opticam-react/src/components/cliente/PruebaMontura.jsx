import React, { useState, useRef, useEffect } from 'react';

const PruebaMontura = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [stream, setStream] = useState(null);
  const [gafaSeleccionada, setGafaSeleccionada] = useState(null);
  const [tamano, setTamano] = useState(100);
  const [posicionY, setPosicionY] = useState(0);
  const [fotos, setFotos] = useState([]);
  const [mostrarTerminos, setMostrarTerminos] = useState(true);
  const [terminosAceptados, setTerminosAceptados] = useState({ terminos: false, privacidad: false });

  const gafas = [
    { id: 1, nombre: "Gafas Ámbar", imagen: "/img/gafasambar.png", precio: "$250.000" },
    { id: 2, nombre: "Gafas Doradas", imagen: "/img/gafasdoradas.png", precio: "$220.000" },
    { id: 3, nombre: "Lentes Lectura", imagen: "/img/lenteslectura.png", precio: "$180.000" }
  ];

  useEffect(() => {
    if (gafas.length > 0 && !gafaSeleccionada) setGafaSeleccionada(gafas[0]);
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, []);

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

  const capturarFoto = () => {
    if (!canvasRef.current || !camaraActiva) { alert("Primero activa la cámara"); return; }
    const fotoURL = canvasRef.current.toDataURL('image/png');
    setFotos([...fotos, fotoURL]);
    alert("📸 Foto capturada correctamente");
  };

  const aceptarTerminos = () => {
    if (terminosAceptados.terminos && terminosAceptados.privacidad) activarCamara();
    else alert("Debes aceptar los términos y condiciones para continuar");
  };

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
              <h6 className="font-bold text-[#B90F0F]">📋 Términos y condiciones:</h6>
              <ul className="text-sm mt-2 list-disc pl-5">
                <li>✅ Solo usaremos tu cámara mientras estés en esta página.</li>
                <li>✅ No guardamos ni almacenamos ninguna imagen o video en nuestros servidores.</li>
                <li>✅ Las fotos que captures se guardan SOLO en tu dispositivo.</li>
              </ul>
            </div>
            <label className="flex items-center gap-2 mb-2"><input type="checkbox" onChange={(e) => setTerminosAceptados({...terminosAceptados, terminos: e.target.checked})} /> Acepto los términos y condiciones</label>
            <label className="flex items-center gap-2 mb-4"><input type="checkbox" onChange={(e) => setTerminosAceptados({...terminosAceptados, privacidad: e.target.checked})} /> Acepto la política de privacidad</label>
            <div className="flex gap-3">
              <button onClick={() => window.history.back()} className="flex-1 bg-gray-500 text-white py-2 rounded-lg">Rechazar</button>
              <button onClick={aceptarTerminos} className="flex-1 bg-[#B90F0F] text-white py-2 rounded-lg">Aceptar y continuar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <button onClick={activarCamara} className="bg-[#B90F0F] text-white px-6 py-3 rounded-full mt-4">Activar cámara</button>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-xl font-bold mb-4 text-center">Selecciona tu montura</h3>
          <div className="flex flex-col gap-3 mb-6">
            {gafas.map(gafa => (
              <div key={gafa.id} onClick={() => setGafaSeleccionada(gafa)} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${gafaSeleccionada?.id === gafa.id ? 'border-[#B90F0F] bg-red-50' : 'border-gray-200'}`}>
                <img src={gafa.imagen} alt={gafa.nombre} className="w-16 h-16 object-contain" />
                <div><strong>{gafa.nombre}</strong><br /><span className="text-[#B90F0F] text-sm">{gafa.precio}</span></div>
              </div>
            ))}
          </div>
          <div className="mb-4"><label className="font-semibold">📏 Tamaño</label><input type="range" min="50" max="150" value={tamano} onChange={(e) => setTamano(parseInt(e.target.value))} className="w-full" /><div className="text-center text-[#B90F0F] font-bold">{tamano}%</div></div>
          <div className="mb-4"><label className="font-semibold">⬆️ Posición vertical</label><input type="range" min="-50" max="50" value={posicionY} onChange={(e) => setPosicionY(parseInt(e.target.value))} className="w-full" /><div className="text-center text-[#B90F0F] font-bold">{posicionY}</div></div>
          <button onClick={capturarFoto} className="w-full bg-[#B90F0F] text-white py-3 rounded-xl font-bold mb-2">Capturar foto</button>
          <button onClick={() => window.history.back()} className="w-full border border-[#B90F0F] text-[#B90F0F] py-3 rounded-xl font-bold">Volver a productos</button>
        </div>
      </div>

      {fotos.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-md p-5">
          <h3 className="font-bold mb-4">📸 Tus fotos</h3>
          <div className="flex gap-3 flex-wrap">
            {fotos.map((foto, idx) => <img key={idx} src={foto} alt={`Foto ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg border cursor-pointer" onClick={() => window.open(foto, '_blank')} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PruebaMontura;