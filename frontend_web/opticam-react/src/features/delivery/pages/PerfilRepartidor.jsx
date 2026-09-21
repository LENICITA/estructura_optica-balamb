// src/features/delivery/pages/PerfilRepartidor.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserController } from '../../../core/controllers/UserController';

export const PerfilRepartidor = () => {
  const navigate = useNavigate();
  const userController = new UserController();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    documento: '',
    fecha_nacimiento: '',
    estado: '',
    roles: '',
  });
  const [vehiculo, setVehiculo] = useState({
    tipo: '',
    modelo: '',
    placa: '',
    color: '',
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);

      const user = await userController.getProfile();

      if (user) {
        setFormData({
          nombre_completo: user.nombre_completo || '',
          email: user.email || '',
          telefono: user.telefono || '',
          direccion: user.direccion || '',
          ciudad: user.ciudad || '',
          documento: user.documento ? String(user.documento) : '',
          fecha_nacimiento: user.fecha_nacimiento || '',
          estado: user.estado || '',
          roles: user.getRoles().join(', ') || '',
        });

        const vehiculoData = user.vehiculo || {};
        setVehiculo({
          tipo: vehiculoData.tipo || '',
          modelo: vehiculoData.modelo || '',
          placa: vehiculoData.placa || '',
          color: vehiculoData.color || '',
        });
      } else {
        alert('No fue posible cargar el perfil.');
      }
    } catch (error) {
      console.error('Error al cargar perfil del repartidor:', error);

      if (error.response?.status === 401) {
        alert('Tu sesión ha expirado. Inicia sesión nuevamente.');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'No fue posible cargar tu perfil.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-base">Cargando perfil...</p>
      </div>
    );
  }

  const InfoField = ({ icon, label, value }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-black mb-1.5">{label}</label>
      <div className="flex items-center bg-gray-100 rounded-lg px-3 min-h-[42px]">
        <i className={`fa-solid ${icon} text-[#B90F0F] mr-2`}></i>
        <span className="flex-1 text-sm text-gray-700 py-2">{value || 'No registrado'}</span>
      </div>
    </div>
  );

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-user-circle text-[#B90F0F] text-3xl"></i>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Mi perfil
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Consulta tu información personal y los datos de tu vehículo.
              </p>
            </div>
          </div>
        </div>

        {/* INFORMACIÓN PERSONAL */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-user text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Información personal
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Datos registrados en tu cuenta.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoField
              icon="fa-user"
              label="Nombre completo"
              value={formData.nombre_completo}
            />

            <InfoField
              icon="fa-envelope"
              label="Correo electrónico"
              value={formData.email}
            />

            <InfoField
              icon="fa-phone"
              label="Teléfono"
              value={formData.telefono}
            />

            <InfoField
              icon="fa-id-card"
              label="Documento"
              value={formData.documento}
            />

            <InfoField
              icon="fa-location-dot"
              label="Dirección"
              value={formData.direccion}
            />

            <InfoField
              icon="fa-building"
              label="Ciudad"
              value={formData.ciudad}
            />

            <InfoField
              icon="fa-calendar"
              label="Fecha de nacimiento"
              value={formData.fecha_nacimiento}
            />
          </div>
        </div>

        {/* INFORMACIÓN DE CUENTA */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Información de cuenta
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Estado y permisos de tu cuenta.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                  <i className="fa-solid fa-circle-check text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formData.estado || 'No registrado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                  <i className="fa-solid fa-users text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Rol</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {formData.roles || 'No registrado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VEHÍCULO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <i
                className={`fa-solid ${
                  vehiculo.tipo === 'MOTO' ? 'fa-motorcycle' : 'fa-car'
                } text-[#B90F0F]`}
              ></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Mi vehículo
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Información del vehículo asignado.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <InfoField
              icon={vehiculo.tipo === 'MOTO' ? 'fa-motorcycle' : 'fa-car'}
              label="Tipo de vehículo"
              value={
                vehiculo.tipo === 'MOTO'
                  ? 'Moto'
                  : vehiculo.tipo === 'CARRO'
                  ? 'Carro'
                  : vehiculo.tipo
              }
            />

            <InfoField
              icon="fa-wrench"
              label="Modelo"
              value={vehiculo.modelo}
            />

            <InfoField
              icon="fa-file-lines"
              label="Placa"
              value={vehiculo.placa}
            />

            <InfoField
              icon="fa-palette"
              label="Color"
              value={vehiculo.color}
            />
          </div>
        </div>

        {/* MENSAJE INFORMATIVO */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-circle-info text-[#B90F0F]"></i>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800">
                Información administrada por el administrador
              </p>

              <p className="text-xs text-gray-600 leading-5 mt-1">
                Esta información es administrada por el administrador del
                sistema. Si necesitas actualizar algún dato, comunícate con
                el administrador.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerfilRepartidor;