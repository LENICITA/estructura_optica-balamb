import React, { useState } from 'react';

const RepartidoresAdmin = () => {
  const [repartidores, setRepartidores] = useState([
    { id: 1, nombre: "Juan Pérez", estado: "Activo", pedidos: 15 },
    { id: 2, nombre: "Ana López", estado: "Inactivo", pedidos: 8 },
    { id: 3, nombre: "Carlos Mendoza", estado: "Activo", pedidos: 22 },
    { id: 4, nombre: "María García", estado: "Suspendido", pedidos: 5 },
    { id: 5, nombre: "Luis Rodríguez", estado: "Activo", pedidos: 18 }
  ]);

  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');

  const getEstadoClass = (estado) => {
    switch(estado.toLowerCase()) {
      case 'activo': return 'bg-green-500';
      case 'inactivo': return 'bg-gray-500';
      case 'suspendido': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const seleccionarRepartidor = (repartidor) => {
    setSelectedRepartidor(repartidor);
    setNuevoEstado(repartidor.estado);
  };

  const guardarCambios = () => {
    if (!selectedRepartidor) {
      alert('❌ Primero selecciona un repartidor de la lista');
      return;
    }
    
    if (nuevoEstado === selectedRepartidor.estado) {
      alert(`⚠️ El repartidor ya está en estado "${nuevoEstado}"`);
      return;
    }
    
    const confirmar = window.confirm(`¿Estás seguro de cambiar el estado de "${selectedRepartidor.nombre}" de ${selectedRepartidor.estado} a ${nuevoEstado}?`);
    
    if (confirmar) {
      const nuevosRepartidores = repartidores.map(r => 
        r.id === selectedRepartidor.id ? { ...r, estado: nuevoEstado } : r
      );
      setRepartidores(nuevosRepartidores);
      setSelectedRepartidor({ ...selectedRepartidor, estado: nuevoEstado });
      alert(`✅ Estado actualizado correctamente a "${nuevoEstado}" para ${selectedRepartidor.nombre}`);
    }
  };

  return (
    <main className="flex-1 pb-10 max-w-[1500px] mx-auto px-5 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 mt-5 ml-10 max-md:flex-col max-md:items-start max-md:ml-0 max-md:gap-2.5">
        <h1 className="text-3xl max-md:text-2xl font-bold">Gestión de Repartidores</h1>
        <button className="bg-[#B90F0F] text-white border-none px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/admin/registrar-repartidor" className="text-white no-underline">
            <i className="fa-solid fa-user-plus mr-2"></i> Registrar repartidor
          </a>
        </button>
      </div>

      {/* Contenedor principal */}
      <div className="flex gap-6 mt-12 max-md:flex-col">
        {/* Lista de repartidores */}
        <div className="flex-1 bg-white p-5 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Repartidores</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="[&_th]:p-3 [&_th]:text-left [&_th]:border-b [&_th]:border-gray-200">
                <th>Nombre</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {repartidores.map((repartidor) => (
                <tr 
                  key={repartidor.id} 
                  onClick={() => seleccionarRepartidor(repartidor)}
                  className={`cursor-pointer hover:bg-gray-50 transition ${selectedRepartidor?.id === repartidor.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="p-3 border-b border-gray-200">{repartidor.nombre}</td>
                  <td className="p-3 border-b border-gray-200">
                    <span className={`${getEstadoClass(repartidor.estado)} text-white px-3 py-1 rounded-full text-xs`}>
                      {repartidor.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detalle del repartidor */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Detalle del repartidor</h2>
          {selectedRepartidor ? (
            <>
              <p className="my-2.5"><strong>Nombre:</strong> {selectedRepartidor.nombre}</p>
              <p className="my-2.5"><strong>Pedidos entregados:</strong> {selectedRepartidor.pedidos}</p>
              <p className="my-2.5">
                <strong>Estado actual:</strong>{' '}
                <span className={`${getEstadoClass(selectedRepartidor.estado)} text-white px-3 py-1 rounded-full text-xs inline-block`}>
                  {selectedRepartidor.estado}
                </span>
              </p>
              <div className="mt-4">
                <label className="font-bold block mb-2">Cambiar estado:</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-4"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
                <button 
                  onClick={guardarCambios}
                  className="w-full bg-[#B90F0F] text-white py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition"
                >
                  Guardar cambios
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-10">Selecciona un repartidor para ver sus detalles</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default RepartidoresAdmin;