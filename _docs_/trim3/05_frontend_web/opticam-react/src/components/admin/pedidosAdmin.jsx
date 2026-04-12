import React, { useState } from 'react';

const PedidosAdmin = () => {
  const [modalAsignar, setModalAsignar] = useState({ show: false, pedidoId: null });
  const [modalDetalles, setModalDetalles] = useState({ show: false, pedido: null });
  const [repartidorSeleccionado, setRepartidorSeleccionado] = useState('');

  const pedidos = [
    { id: 1, cliente: "Valentina", direccion: "Calle 123", estado: "pendiente", repartidor: "No asignado", total: 50000 },
    { id: 2, cliente: "Luisa", direccion: "Carrera 10", estado: "pendiente", repartidor: "No asignado", total: 30000 },
    { id: 3, cliente: "Shariht", direccion: "Calle 123", estado: "pendiente", repartidor: "No asignado", total: 45000 },
    { id: 4, cliente: "Saida", direccion: "Calle 123", estado: "pendiente", repartidor: "No asignado", total: 60000 },
    { id: 5, cliente: "Laura", direccion: "Calle 123", estado: "pendiente", repartidor: "No asignado", total: 35000 },
    { id: 6, cliente: "Juan", direccion: "Calle 123", estado: "pendiente", repartidor: "No asignado", total: 40000 }
  ];

  const repartidores = [
    { id: 1, nombre: "Juan Pérez" },
    { id: 2, nombre: "María Gómez" }
  ];

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'pendiente': return 'bg-yellow-500';
      case 'listo': return 'bg-blue-500';
      case 'en-camino': return 'bg-orange-500';
      case 'entregado': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const verDetalles = (pedido) => {
    setModalDetalles({ show: true, pedido });
  };

  const cerrarDetalles = () => {
    setModalDetalles({ show: false, pedido: null });
  };

  const abrirModalAsignar = (pedidoId) => {
    setModalAsignar({ show: true, pedidoId });
    setRepartidorSeleccionado('');
  };

  const cerrarModalAsignar = () => {
    setModalAsignar({ show: false, pedidoId: null });
  };

  const asignarRepartidor = () => {
    if (!repartidorSeleccionado) {
      alert('Selecciona un repartidor');
      return;
    }
    const repartidor = repartidores.find(r => r.id === parseInt(repartidorSeleccionado));
    alert(`✅ Repartidor ${repartidor?.nombre} asignado al pedido #${modalAsignar.pedidoId}`);
    cerrarModalAsignar();
  };

  const marcarListo = () => {
    alert('✅ Pedido marcado como listo');
    cerrarDetalles();
  };

  return (
    <main className="p-[30px] max-md:p-5">
      <h1 className="mb-5 text-2xl font-bold">Gestión de Pedidos</h1>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2.5">
          <thead>
            <tr className="[&_th]:p-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:text-gray-500">
              <th>ID pedido</th>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Estado</th>
              <th>Repartidor</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="bg-white shadow-md rounded-xl hover:-translate-y-0.5 transition-all [&_td]:p-4 [&_td]:align-middle first:[&_td]:rounded-l-xl last:[&_td]:rounded-r-xl">
                <td className="font-bold">#{pedido.id}</td>
                <td>
                  <div className="flex items-center gap-2.5">
                    <img src="/img/user.jpg" alt="User" className="w-10 h-10 rounded-full" />
                    <span>{pedido.cliente}</span>
                  </div>
                </td>
                <td>{pedido.direccion}</td>
                <td>
                  <span className={`${getEstadoClass(pedido.estado)} text-white px-3 py-1.5 rounded-full text-xs font-bold`}>
                    {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                  </span>
                </td>
                <td className="text-gray-500">{pedido.repartidor}</td>
                <td className="flex gap-2">
                  <button onClick={() => verDetalles(pedido)} className="bg-[#B90F0F] text-white px-3 py-2 rounded-lg text-xs cursor-pointer hover:opacity-90">Ver</button>
                  <button onClick={() => abrirModalAsignar(pedido.id)} className="bg-[#B90F0F] text-white px-3 py-2 rounded-lg text-xs cursor-pointer hover:opacity-90">Asignar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ASIGNAR */}
      {modalAsignar.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl text-center w-80">
            <h2 className="text-xl font-bold mb-4">Asignar Repartidor</h2>
            <select 
              className="w-full p-2.5 my-4 border border-gray-300 rounded-md"
              value={repartidorSeleccionado}
              onChange={(e) => setRepartidorSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar</option>
              {repartidores.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={asignarRepartidor} className="flex-1 bg-[#B90F0F] text-white py-2 rounded-lg cursor-pointer hover:opacity-90">Confirmar</button>
              <button onClick={cerrarModalAsignar} className="flex-1 bg-gray-500 text-white py-2 rounded-lg cursor-pointer hover:bg-gray-600">Cancelar</button>
            </div>
          </div>
        </div>
      )}

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
            <h3 className="font-bold">Total: $<span>{modalDetalles.pedido.total}</span></h3>
            <div className="flex flex-col gap-2.5 mt-4">
              <button onClick={marcarListo} className="bg-[#B90F0F] text-white py-2.5 rounded-lg w-full font-bold cursor-pointer hover:opacity-90">Pedido listo</button>
              <button onClick={cerrarDetalles} className="bg-gray-500 text-white py-2.5 rounded-lg w-full cursor-pointer hover:bg-gray-600">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PedidosAdmin;