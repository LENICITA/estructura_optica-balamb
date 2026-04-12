import React, { useState } from 'react';

const InicioRepartidor = () => {
  const [filtro, setFiltro] = useState('all');

  const pedidos = [
    { id: 1, cliente: "Olga López", direccion: "Cl. 132 Bis # 156A-29", estado: "pendiente", articulos: 3, distancia: "40 min" },
    { id: 2, cliente: "Carlos Mendoza", direccion: "Carrera 89 #12-34", estado: "pendiente", articulos: 2, distancia: "25 min" },
    { id: 3, cliente: "María Rodríguez", direccion: "Av. Siempre Viva #123", estado: "en-entrega", articulos: 4, distancia: "15 min" },
    { id: 4, cliente: "Ana Martínez", direccion: "Calle 5 #20-30", estado: "pendiente", articulos: 1, distancia: "50 min" }
  ];

  const pedidosFiltrados = filtro === 'all' ? pedidos : pedidos.filter(p => p.estado === filtro);

  const iniciarEntrega = (id) => {
    if (window.confirm('¿Estás seguro de iniciar la entrega? Debes cumplir con la entrega en el tiempo establecido para evitar sanciones.')) {
      window.location.href = `/detalles-pedido/${id}`;
    }
  };

  return (
    <main className="relative p-10 flex flex-col gap-4 min-h-[650px] max-md:p-5">
      <h1 className="text-3xl font-bold max-md:text-2xl">¡Bienvenido, Fernando García!</h1>
      <h2 className="text-lg text-gray-700">Estos son tus pedidos del día de hoy</h2>

      {/* Filtros */}
      <div className="flex gap-4 mb-5">
        <button 
          onClick={() => setFiltro('all')}
          className={`no-underline text-[#000000] px-2.5 py-1 rounded-md text-sm transition-all ${filtro === 'all' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'}`}
        >
          Todo
        </button>
        <button 
          onClick={() => setFiltro('en-entrega')}
          className={`no-underline text-[#000000] px-2.5 py-1 rounded-md text-sm transition-all ${filtro === 'en-entrega' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'}`}
        >
          En entrega
        </button>
        <button 
          onClick={() => setFiltro('pendiente')}
          className={`no-underline text-[#000000] px-2.5 py-1 rounded-md text-sm transition-all ${filtro === 'pendiente' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'}`}
        >
          Pendiente
        </button>
      </div>

      {/* Lista de pedidos */}
      <div className="flex flex-wrap gap-12 justify-center">
        {pedidosFiltrados.map((pedido) => (
          <div key={pedido.id} className="w-[280px] bg-white rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-1">
            <img src="../../../public/img/maps.png" alt="Mapa" className="w-full h-[150px] object-cover" />
            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-lg font-bold">{pedido.cliente}</h3>
              <p className="text-sm flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {pedido.direccion}</p>
              <p className="text-sm flex items-center gap-1.5"><i className="fa-solid fa-boxes-packing"></i> {pedido.articulos} artículos</p>
              <p className="text-sm flex items-center gap-1.5"><i className="fa-solid fa-clock"></i> +{pedido.distancia}</p>
              <p className={`font-bold text-sm flex items-center gap-1.5 ${pedido.estado === 'pendiente' ? 'text-red-600' : 'text-green-600'}`}>
                <i className={`fa-solid ${pedido.estado === 'pendiente' ? 'fa-circle-exclamation' : 'fa-truck-moving'}`}></i>
                {pedido.estado === 'pendiente' ? 'Pendiente' : 'En entrega'}
              </p>
              {pedido.estado === 'pendiente' ? (
                <button 
                  onClick={() => iniciarEntrega(pedido.id)}
                  className="block w-full mt-2.5 py-2.5 text-center bg-[#B90F0F] text-white rounded-md no-underline font-bold cursor-pointer hover:bg-[#8a0b0b]"
                >
                  Iniciar Entrega
                </button>
              ) : (
                <a 
                  href={`/detalles-pedido/${pedido.id}`}
                  className="block w-full mt-2.5 py-2.5 text-center bg-green-700 text-white rounded-md no-underline font-bold cursor-pointer hover:bg-green-800"
                >
                  Ver
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default InicioRepartidor;