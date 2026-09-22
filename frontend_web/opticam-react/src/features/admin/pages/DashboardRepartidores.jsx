// src/features/admin/pages/DashboardRepartidores.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserController } from '../../../core/controllers/UserController';

const DashboardRepartidores = () => {
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [filtro, setFiltro] = useState('todos');

  const navigate = useNavigate();
  const userController = new UserController();

  const cargarRepartidores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userController.getRepartidores();

      const repartidoresMapeados = data.map((r) => ({
        id: r.id_usuario || r.id || 0,
        nombre: r.nombre_completo || r.nombre || 'Sin nombre',
        estado: r.estado || 'INACTIVO',
        correo: r.email || r.correo || '',
        telefono: r.telefono || '',
        ciudad: r.ciudad || '',
        fecha_registro: r.fecha_registro || new Date().toISOString(),
      }));

      setRepartidores(repartidoresMapeados);
    } catch (error) {
      console.error('Error al cargar repartidores:', error);
      alert('No se pudieron cargar los repartidores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarRepartidores();
  }, [cargarRepartidores]);

  const eliminarRepartidor = async (item) => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${item.nombre}"?\n\nEsta acción no se puede deshacer.`)) return;

    try {
      const response = await userController.eliminarRepartidor(item.id);
      if (!response.success) return alert(response.message || 'No se pudo eliminar.');

      setRepartidores((prev) => prev.filter((r) => r.id !== item.id));
      alert(`El repartidor "${item.nombre}" fue eliminado correctamente.`);
    } catch (error) {
      console.error('Error al eliminar repartidor:', error);
      alert('No se pudo eliminar el repartidor.');
    }
  };

  const filtrarRepartidores = repartidores.filter((repartidor) => {
    const cumpleFiltro = filtro === 'todos' || repartidor.estado === filtro;
    const cumpleBusqueda = repartidor.nombre.toLowerCase().includes(buscar.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  const cantidadActivos = repartidores.filter((r) => r.estado === 'ACTIVO').length;
  const cantidadInactivos = repartidores.filter((r) => r.estado === 'INACTIVO').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500">Cargando repartidores...</p>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">

      {/* ENCABEZADO */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-motorcycle text-[#B90F0F] text-xl"></i>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Repartidores
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Administra el equipo encargado de las entregas
              </p>
            </div>
          </div>

          <Link
            to="/admin/repartidores/registrar"
            className="inline-flex items-center justify-center gap-2 bg-[#B90F0F] hover:bg-[#9f0d0d] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <i className="fa-solid fa-plus"></i>
            Agregar repartidor
          </Link>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {repartidores.length}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
              <i className="fa-solid fa-users text-gray-600 text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Activos</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {cantidadActivos}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
              <i className="fa-solid fa-circle-check text-green-600 text-lg"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Inactivos</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {cantidadInactivos}
              </p>
            </div>

            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-circle-xmark text-red-600 text-lg"></i>
            </div>
          </div>
        </div>

      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-5">

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">

          {/* BUSCADOR */}
          <div className="flex items-center bg-gray-50 rounded-xl px-4 h-11 border border-gray-200 gap-3 flex-1">
            <i className="fa-solid fa-magnifying-glass text-gray-400"></i>

            <input
              type="text"
              placeholder="Buscar repartidor..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />

            {buscar && (
              <button
                onClick={() => setBuscar('')}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            )}
          </div>

          {/* FILTROS */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'todos', label: 'Todos', count: repartidores.length },
              { key: 'ACTIVO', label: 'Activos', count: cantidadActivos },
              { key: 'INACTIVO', label: 'Inactivos', count: cantidadInactivos },
            ].map((f) => {
              const activo = filtro === f.key;

              return (
                <button
                  key={f.key}
                  onClick={() => setFiltro(f.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                    activo
                      ? 'bg-[#B90F0F] border-[#B90F0F] text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {f.label}

                  <span
                    className={`min-w-[21px] h-5 rounded-full px-1.5 flex items-center justify-center text-[11px] font-bold ${
                      activo
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* LISTA */}
      {filtrarRepartidores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-solid fa-users text-2xl text-gray-300"></i>
          </div>

          <p className="text-base font-bold text-gray-700 mt-4">
            Sin resultados
          </p>

          <p className="text-sm text-gray-400 mt-1 text-center px-4">
            No se encontraron repartidores con esos criterios
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {filtrarRepartidores.map((item) => {
            const activo = item.estado === 'ACTIVO';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition"
              >

                {/* INFORMACIÓN PRINCIPAL */}
                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 shrink-0 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="text-[#B90F0F] text-lg font-bold">
                      {item.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900 truncate">
                          {item.nombre}
                        </p>

                        <span
                          className={`inline-flex items-center gap-1.5 mt-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            activo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              activo ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></span>

                          {item.estado}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `¿Deseas eliminar a ${item.nombre}?`
                            )
                          ) {
                            eliminarRepartidor(item);
                          }
                        }}
                        className="w-8 h-8 shrink-0 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Eliminar repartidor"
                      >
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </div>

                    {/* DATOS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 mt-4">

                      <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
                        <i className="fa-solid fa-phone w-4 text-gray-400"></i>
                        <span className="truncate">
                          {item.telefono || 'No disponible'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
                        <i className="fa-solid fa-envelope w-4 text-gray-400"></i>
                        <span className="truncate">
                          {item.correo || 'No disponible'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0 sm:col-span-2">
                        <i className="fa-solid fa-location-dot w-4 text-gray-400"></i>
                        <span className="truncate">
                          {item.ciudad || 'No especificada'}
                        </span>
                      </div>

                    </div>

                    {/* DETALLES */}
                    <Link
                      to={`/admin/repartidores/${item.id}`}
                      className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl bg-red-50 text-[#B90F0F] text-sm font-bold hover:bg-red-100 transition"
                    >
                      Ver detalles
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </Link>

                  </div>
                </div>
              </div>
            );
          })}

        </div>
      )}

    </div>
  </div>
);
};

export default DashboardRepartidores;