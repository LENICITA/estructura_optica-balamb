// src/features/admin/pages/DetalleRepartidor.jsx
import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserController } from '../../../core/controllers/UserController';

export const DetalleRepartidor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userController = new UserController();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarDatosRepartidor = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await userController.getRepartidorById(Number(id));
      if (response) setUser(response);
    } catch (error) {
      console.error('Error al cargar los datos del repartidor:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDatosRepartidor();
  }, [cargarDatosRepartidor]);

  const formatDate = (value) => {
    if (!value) return 'No disponible';
    if (typeof value === 'string') {
      const fechaSolo = value.split('T')[0];
      const partes = fechaSolo.split('-');
      if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    return isNaN(date.getTime()) ? 'No disponible' : date.toLocaleDateString('es-ES');
  };

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando información...</p>
      </div>
    );
  }

  const nombre = user?.nombre_completo ?? 'No disponible';
  const estado = user?.estado ?? 'INACTIVO';
  const telefono = user?.telefono ?? '';
  const correo = user?.email ?? '';
  const ciudad = user?.ciudad ?? 'No especificada';
  const fechaRegistro = user?.fecha_registro ?? null;
  const vehiculo = user?.vehiculo ?? null;

  const InfoItem = ({ label, value }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
      <span className="text-[13px] text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-semibold max-w-[60%] text-right">{value || 'No registrado'}</span>
    </div>
  );

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-5xl mx-auto">

      {/* ENCABEZADO / VOLVER */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#B90F0F] transition"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Volver a repartidores
        </button>
      </div>

      {/* PERFIL PRINCIPAL */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          <div className="w-16 h-16 shrink-0 bg-red-50 rounded-2xl flex items-center justify-center">
            <i className="fa-solid fa-user text-[#B90F0F] text-2xl"></i>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {nombre}
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  estado === 'ACTIVO'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    estado === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></span>
                {estado}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2 min-w-0">
                <i className="fa-solid fa-phone w-4 text-gray-400"></i>
                <span className="truncate">
                  {telefono || 'No disponible'}
                </span>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <i className="fa-solid fa-envelope w-4 text-gray-400"></i>
                <span className="truncate">
                  {correo || 'No disponible'}
                </span>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <i className="fa-solid fa-location-dot w-4 text-gray-400"></i>
                <span className="truncate">
                  {ciudad || 'No especificada'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CONTENIDO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* INFORMACIÓN PERSONAL */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

          <div className="flex items-center gap-3 pb-4 mb-2 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-user text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Información Personal
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Datos registrados del repartidor
              </p>
            </div>
          </div>

          <div>
            <InfoItem label="Nombre completo" value={nombre} />
            <InfoItem
              label="Correo electrónico"
              value={correo || 'No disponible'}
            />
            <InfoItem
              label="Teléfono"
              value={telefono || 'No disponible'}
            />
            <InfoItem
              label="Ciudad"
              value={ciudad || 'No especificada'}
            />
            <InfoItem label="Estado" value={estado} />
            <InfoItem
              label="Fecha de registro"
              value={formatDate(fechaRegistro)}
            />
          </div>
        </div>

        {/* VEHÍCULO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

          <div className="flex items-center gap-3 pb-4 mb-2 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-motorcycle text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Información del Vehículo
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Vehículo asignado al repartidor
              </p>
            </div>
          </div>

          {vehiculo ? (
            <div>
              <InfoItem
                label="Tipo"
                value={vehiculo.tipo || 'No especificado'}
              />
              <InfoItem
                label="Placa"
                value={vehiculo.placa || 'No disponible'}
              />
              <InfoItem
                label="Modelo"
                value={vehiculo.modelo || 'No especificado'}
              />
              <InfoItem
                label="Color"
                value={vehiculo.color || 'No especificado'}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <i className="fa-solid fa-motorcycle text-2xl text-gray-300"></i>
              </div>

              <p className="text-sm font-semibold text-gray-600 mt-4">
                Sin vehículo asignado
              </p>

              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Este repartidor no tiene un vehículo registrado.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* BOTÓN EDITAR */}
      <div className="mt-5 flex justify-end">
        <Link
          to={`/admin/repartidores/${id}/editar`}
          className="inline-flex items-center justify-center gap-2 bg-[#B90F0F] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#9f0d0d] transition shadow-sm"
        >
          <i className="fa-solid fa-pen"></i>
          Editar repartidor
        </Link>
      </div>

    </div>
  </div>
);
};

export default DetalleRepartidor;