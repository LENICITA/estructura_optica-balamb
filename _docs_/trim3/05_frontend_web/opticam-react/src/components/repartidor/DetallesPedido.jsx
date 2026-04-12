import React from 'react';
import { useParams } from 'react-router-dom';

const DetallesPedido = () => {
  const { id } = useParams();

  const pedido = {
    id: id,
    cliente: "Angel Cortés",
    direccion: "Cl. 132 Bis # 156A-29, Lisboa, Suba, Bogotá D.C",
    telefono: "322 8951978",
    nota: "Es una casa verde",
    fechaEntrega: "16 de abril - 4:50pm"
  };

  const articulos = [
    { nombre: "Marco femenino estilo #016", cantidad: 1 },
    { nombre: "Marco masculino estilo #017 + lente formulado", cantidad: 1 },
    { nombre: "Lentes de sol estilo #05", cantidad: 1 }
  ];

  const handleLlegada = () => {
    window.location.href = `/qr/${id}`;
  };

  return (
    <main className="max-w-[900px] mx-auto my-[30px] p-5">
      <h2 className="text-center mb-6 text-3xl font-bold">
        <i className="fa-regular fa-calendar-days text-[#B90F0F] mr-2"></i>
        Entrega estimada para el {pedido.fechaEntrega}
      </h2>

      {/* Mapa */}
      <div className="w-full mb-5">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.166910024568!2d-74.12630949999999!3d4.741041300000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f837db042b0bb%3A0xaf13101125e3787!2zQ2wuIDEzMiBCaXMgIyAxNTZBLTI5LCBTdWJhLCBCb2dvdMOhLCBELkMuLCBCb2dvdMOhLCBCb2dvdMOhLCBELkMu!5e0!3m2!1ses-419!2sco!4v1775342423680!5m2!1ses-419!2sco" 
          className="w-full h-[300px] rounded-xl border-0"
          allowFullScreen 
          loading="lazy"
          title="Mapa"
        ></iframe>
      </div>

      {/* Información de entrega */}
      <div className="bg-gray-100 p-4 rounded-xl mb-5">
        <h3 className="mb-2.5 text-[#B90F0F] font-bold">Entrega para {pedido.cliente}</h3>
        <p className="text-base mb-1">{pedido.direccion}</p>
        <p className="text-base mb-1">{pedido.telefono}</p>
        <p className="text-base">Nota cliente: {pedido.nota}</p>
      </div>

      {/* Artículos */}
      <div className="mb-[30px]">
        <h3 className="text-xl font-bold mb-2.5">3 artículos</h3>
        <div className="flex gap-3 mb-4">
          <img src="/img/marco1.png" alt="Marco 1" className="w-[100px] h-[100px] object-cover rounded-lg" />
          <img src="/img/marco2.png" alt="Marco 2" className="w-[100px] h-[100px] object-cover rounded-lg" />
          <img src="/img/gafassol.png" alt="Gafas sol" className="w-[100px] h-[100px] object-cover rounded-lg" />
        </div>
        <div className="pl-5">
          <ul className="list-disc">
            {articulos.map((item, idx) => (
              <li key={idx} className="text-base mb-1">{item.nombre}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botón */}
      <button 
        onClick={handleLlegada}
        className="block w-full text-center bg-[#B90F0F] text-white py-4 rounded-xl no-underline font-bold transition-all hover:bg-[#8a0b0b]"
      >
        He llegado a la dirección de entrega
      </button>
    </main>
  );
};

export default DetallesPedido;