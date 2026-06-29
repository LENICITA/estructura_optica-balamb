import React, { useEffect, useState } from 'react';
import api from '../../utils/api.js';

const RepartidoresAdmin = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRepartidor, setSelectedRepartidor] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');

  useEffect(() => {
    const cargarRepartidores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No hay token de autenticación');
        }
        
        const response = await api.get('/usuarios/repartidores');
        
        // Procesar la respuesta
        let repartidoresData = response.data;
        
        // Si la API devuelve un objeto con propiedad 'data'
        if (response.data && response.data.data) {
          repartidoresData = response.data.data;
        }
        
        // Si la API devuelve con propiedad 'repartidores'
        if (response.data && response.data.repartidores) {
          repartidoresData = response.data.repartidores;
        }
        
        // Si es un objeto, buscar el array
        if (repartidoresData && typeof repartidoresData === 'object' && !Array.isArray(repartidoresData)) {
          const posiblesKeys = ['data', 'repartidores', 'repartidor', 'items', 'results', 'rows'];
          for (const key of posiblesKeys) {
            if (repartidoresData[key] && Array.isArray(repartidoresData[key])) {
              repartidoresData = repartidoresData[key];
              break;
            }
          }
        }
        
        // Asegurar que sea un array
        if (!Array.isArray(repartidoresData)) {
          console.warn('Datos no son un array:', repartidoresData);
          repartidoresData = [];
        }
        
        // MAPEAR DATOS PARA QUE COINCIDAN CON LO QUE ESPERA EL FRONTEND
        const repartidoresMapeados = repartidoresData.map((r) => ({
          id: r.id_usuario || r.id || r._id,
          nombre: r.nombre_completo || r.nombre || r.Nombre || 'Sin nombre',
          estado: r.estado || r.Estado || 'Inactivo',
          pedidos: r.pedidos || r.Pedidos || r.total_pedidos || 0,
          // Guardar datos originales por si se necesitan
          ...r
        }));
        
        setRepartidores(repartidoresMapeados);
        
      } catch (err) {
        console.error('Error:', err);
        
        let mensajeError = 'Error al cargar los repartidores. ';
        
        if (err.response?.data?.message) {
          mensajeError += err.response.data.message;
        } else if (err.response?.status === 500) {
          mensajeError += 'Error interno del servidor.';
        } else if (err.response?.status === 401) {
          mensajeError += 'Sesión expirada. Redirigiendo al login...';
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          mensajeError += err.message;
        }
        
        setError(mensajeError);
      } finally {
        setLoading(false);
      }
    };

    cargarRepartidores();
  }, []);

  const getEstadoClass = (estado) => {
    switch(estado?.toLowerCase()) {
      case 'activo': return 'bg-green-500';
      case 'inactivo': return 'bg-gray-500';
      case 'suspendido': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const seleccionarRepartidor = (repartidor) => {
    setSelectedRepartidor(repartidor);
    setNuevoEstado(repartidor.estado || 'Activo');
  };

  const guardarCambios = async () => {
    if (!selectedRepartidor) {
      alert('Primero selecciona un repartidor de la lista');
      return;
    }
    
    const estadoActual = selectedRepartidor.estado;
    const nombreRepartidor = selectedRepartidor.nombre;
    const idRepartidor = selectedRepartidor.id;
    
    if (nuevoEstado === estadoActual) {
      alert(`El repartidor ya está en estado "${nuevoEstado}"`);
      return;
    }
    
    const confirmar = window.confirm(`¿Estás seguro de cambiar el estado de "${nombreRepartidor}" de ${estadoActual} a ${nuevoEstado}?`);
    
    if (confirmar) {
      try {
        
        const response = await api.patch(`/usuarios/repartidores/${idRepartidor}/estado`, {
          estado: nuevoEstado
        });
        
        let updatedRepartidor = response.data;
        
        if (response.data && response.data.data) {
          updatedRepartidor = response.data.data;
        }
        
        // Actualizar estado local
        const nuevosRepartidores = repartidores.map(r => {
          if (r.id === idRepartidor) {
            return {
              ...r,
              estado: nuevoEstado,
              // Si la respuesta trae más datos, actualizarlos
              ...updatedRepartidor
            };
          }
          return r;
        });
        
        setRepartidores(nuevosRepartidores);
        setSelectedRepartidor({ ...selectedRepartidor, estado: nuevoEstado });
        alert(`Estado actualizado correctamente a "${nuevoEstado}"`);
        
      } catch (err) {
        console.error('Error al actualizar:', err);
        
        let mensajeError = 'Error al actualizar el estado. ';
        
        if (err.response?.data?.message) {
          mensajeError += err.response.data.message;
        } else if (err.response?.status === 401) {
          mensajeError += 'Sesión expirada.';
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = '/login', 2000);
        } else {
          mensajeError += err.message;
        }
        
        alert(`${mensajeError}`);
      }
    }
  };

  if (loading) {
    return (
      <main className="flex-1 pb-10 max-w-[1500px] mx-auto px-5 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando repartidores...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 pb-10 max-w-[1500px] mx-auto px-5 py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center max-w-2xl">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
              <p className="font-bold mb-2">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#B90F0F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pb-10 max-w-[1500px] mx-auto px-5 py-10">
      <div className="flex justify-between items-center mb-5 mt-5 ml-10 max-md:flex-col max-md:items-start max-md:ml-0 max-md:gap-2.5">
        <h1 className="text-3xl max-md:text-2xl font-bold">Gestión de Repartidores</h1>
        <button className="bg-[#B90F0F] text-white border-none px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/admin/registrar-repartidor" className="text-white no-underline">
            <i className="fa-solid fa-user-plus mr-2"></i> Registrar repartidor
          </a>
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4 ml-10">
        Total: {repartidores.length} repartidores registrados
      </p>

      <div className="flex gap-6 mt-2 max-md:flex-col">
        {/* Lista de repartidores */}
        <div className="flex-1 bg-white p-5 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Lista de Repartidores</h2>
          
          {repartidores.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay repartidores registrados</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="[&_th]:p-3 [&_th]:text-left [&_th]:border-b [&_th]:border-gray-200">
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th>Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {repartidores.map((repartidor) => {
                  const id = repartidor.id;
                  const nombre = repartidor.nombre || 'Sin nombre';
                  const estado = repartidor.estado || 'Inactivo';
                  const pedidos = repartidor.pedidos || 0;
                  const isSelected = selectedRepartidor?.id === id;
                  
                  return (
                    <tr 
                      key={id} 
                      onClick={() => seleccionarRepartidor(repartidor)}
                      className={`cursor-pointer hover:bg-gray-50 transition ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="p-3 border-b border-gray-200">{nombre}</td>
                      <td className="p-3 border-b border-gray-200">
                        <span className={`${getEstadoClass(estado)} text-white px-3 py-1 rounded-full text-xs`}>
                          {estado}
                        </span>
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center">{pedidos}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Detalle del repartidor */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Detalle del repartidor</h2>
          
          {selectedRepartidor ? (
            <>
              <p className="my-2.5">
                <strong>Nombre:</strong> {selectedRepartidor.nombre}
              </p>
              <p className="my-2.5">
                <strong>ID:</strong> {selectedRepartidor.id}
              </p>
              <p className="my-2.5">
                <strong>Email:</strong> {selectedRepartidor.email || 'No disponible'}
              </p>
              <p className="my-2.5">
                <strong>Teléfono:</strong> {selectedRepartidor.telefono || 'No disponible'}
              </p>
              <p className="my-2.5">
                <strong>Ciudad:</strong> {selectedRepartidor.ciudad || 'No disponible'}
              </p>
              <p className="my-2.5">
                <strong>Pedidos entregados:</strong> {selectedRepartidor.pedidos || 0}
              </p>
              <p className="my-2.5">
                <strong>Estado actual:</strong>{' '}
                <span className={`${getEstadoClass(selectedRepartidor.estado)} text-white px-3 py-1 rounded-full text-xs inline-block`}>
                  {selectedRepartidor.estado}
                </span>
              </p>
              
              <div className="mt-4">
                <label className="font-bold block mb-2">Cambiar estado:</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-4 focus:outline-none focus:border-[#B90F0F] focus:shadow-md"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="SUSPENDIDO">Suspendido</option>
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
            <p className="text-gray-500 text-center py-10">
              Selecciona un repartidor para ver sus detalles
            </p>
          )}
        </div>
      </div>
    </main>
  );
};

export default RepartidoresAdmin;