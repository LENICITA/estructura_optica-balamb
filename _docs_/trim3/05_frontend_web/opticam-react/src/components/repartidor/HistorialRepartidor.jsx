import React, { useState } from 'react';

const HistorialRepartidor = () => {
  const [pedidos] = useState([
    { id: 1, cliente: "Valentina", direccion: "Calle 123", estado: "entregado", fecha: "15/04/2024" },
    { id: 2, cliente: "Luisa", direccion: "Carrera 10", estado: "entregado", fecha: "14/04/2024" },
    { id: 3, cliente: "Shariht", direccion: "Calle 123", estado: "entregado", fecha: "13/04/2024" },
    { id: 4, cliente: "Saida", direccion: "Calle 123", estado: "entregado", fecha: "12/04/2024" },
    { id: 5, cliente: "Laura", direccion: "Calle 123", estado: "entregado", fecha: "11/04/2024" }
  ]);

  const [modalDetalles, setModalDetalles] = useState({ show: false, pedido: null });

  const verDetalles = (pedido) => {
    setModalDetalles({ show: true, pedido });
  };

  const cerrarDetalles = () => {
    setModalDetalles({ show: false, pedido: null });
  };

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'pendiente': return 'bg-yellow-500';
      case 'listo': return 'bg-blue-500';
      case 'en-camino': return 'bg-orange-500';
      case 'entregado': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <main className="p-[30px] max-md:p-5">
      <h1 className="mb-5 text-2xl font-bold">Historial de Pedidos</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2.5">
          <thead>
            <tr className="[&_th]:p-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-gray-500">
              <th>ID pedido</th>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="bg-white shadow-md rounded-xl hover:-translate-y-0.5 transition-all [&_td]:p-4 [&_td]:align-middle first:[&_td]:rounded-l-xl last:[&_td]:rounded-r-xl">
                <td className="font-bold">#{pedido.id}</td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <img src="../../../public/img/user.jpg" alt="User" className="w-10 h-10 rounded-full" />
                    <span>{pedido.cliente}</span>
                  </div>
                </td>
                <td>{pedido.direccion}</td>
                <td>
                  <span className={`${getEstadoClass(pedido.estado)} text-white px-3 py-1.5 rounded-full text-xs font-bold`}>
                    {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                  </span>
                </td>
                <td>
                  <button onClick={() => verDetalles(pedido)} className="bg-[#B90F0F] text-white px-3 py-2 rounded-lg text-xs cursor-pointer hover:opacity-90">Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLES */}
      {modalDetalles.show && modalDetalles.pedido && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-[450px] max-w-[90%]">
            <h2 className="text-xl font-bold mb-4">Pedido <span>#{modalDetalles.pedido.id}</span></h2>
            <p><strong>Cliente:</strong> <span>{modalDetalles.pedido.cliente}</span></p>
            <p><strong>Dirección:</strong> <span>{modalDetalles.pedido.direccion}</span></p>
            <h3 className="font-bold mt-4 mb-2">Productos</h3>
            <div className="bg-gray-50 p-2 rounded-lg mb-3">
              <div className="flex justify-between p-2.5 bg-white rounded-lg mb-2">
                <span className="font-bold">Gafas negras</span>
                <span className="text-gray-500">x1</span>
              </div>
              <div className="flex justify-between p-2.5 bg-white rounded-lg">
                <span className="font-bold">Lentes formulados</span>
                <span className="text-gray-500">x2</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 mt-4">
              <button onClick={cerrarDetalles} className="bg-gray-500 text-white py-2.5 rounded-lg w-full cursor-pointer hover:bg-gray-600">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HistorialRepartidor;