// src/features/client/pages/PerfilCliente.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../../shared/hooks/usePerfil';
import { InfoField } from '../../../shared/components/ui/InfoField';

export const PerfilCliente = () => {
  const navigate = useNavigate();
  const { loading, guardando, editando, formData, handleChange, activarEdicion, cancelarEdicion, guardarCambios } = usePerfil();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-base">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button onClick={() => void navigate(-1)} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition" aria-label="Volver">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-user text-2xl text-[#B90F0F]"></i>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi perfil</h1>
              <p className="text-sm text-gray-500 mt-1">Consulta y actualiza tu información personal.</p>
            </div>
            {!editando && (
              <button onClick={activarEdicion} className="w-full sm:w-auto bg-[#B90F0F] text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#9f0d0d] transition">
                <i className="fa-solid fa-pen"></i> Editar perfil
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-user text-[#B90F0F]"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Información personal</h2>
              <p className="text-xs text-gray-500">Datos principales de tu cuenta.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            <InfoField id="cli-nombre" icon="fa-user" label="Nombre completo" value={formData.nombre_completo} field="nombre_completo" editable={editando} onChange={handleChange} />
            <InfoField id="cli-doc" icon="fa-id-card" label="Documento" value={formData.documento} field="documento" editable={editando} onChange={handleChange} />
            <InfoField id="cli-email" icon="fa-envelope" label="Correo electrónico" value={formData.email} field="email" editable={editando} type="email" onChange={handleChange} />
            <InfoField id="cli-tel" icon="fa-phone" label="Teléfono" value={formData.telefono} field="telefono" editable={editando} onChange={handleChange} />
            <InfoField id="cli-fecha" icon="fa-calendar" label="Fecha de nacimiento" value={formData.fecha_nacimiento} field="fecha_nacimiento" editable={editando} type="date" onChange={handleChange} />
            <InfoField id="cli-ciudad" icon="fa-building" label="Ciudad" value={formData.ciudad} field="ciudad" editable={editando} onChange={handleChange} />
            <div className="md:col-span-2">
              <InfoField id="cli-dir" icon="fa-location-dot" label="Dirección" value={formData.direccion} field="direccion" editable={editando} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-shield-halved text-[#B90F0F]"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Información de cuenta</h2>
              <p className="text-xs text-gray-500">Información relacionada con el estado y permisos de tu cuenta.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InfoField id="cli-estado" icon="fa-shield" label="Estado" value={formData.estado} field="estado" editable={false} onChange={handleChange} />
            <InfoField id="cli-roles" icon="fa-users" label="Roles" value={formData.roles} field="roles" editable={false} onChange={handleChange} />
            <div className="md:col-span-2">
              <div className="mb-3">
                <p className="block text-xs font-semibold text-gray-700 mb-1.5">Contraseña</p>
                <div className="flex items-center bg-gray-100 rounded-xl px-3 min-h-[44px]">
                  <i className="fa-solid fa-lock text-[#B90F0F] mr-3"></i>
                  <span className="flex-1 text-sm text-gray-700 py-2">••••••••</span>
                  <i className="fa-solid fa-eye-slash text-gray-400"></i>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 ml-1">La contraseña no se muestra por seguridad.</p>
              </div>
            </div>
          </div>
        </div>

        {!editando ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => void navigate('/cliente/mis-formulas')} className="flex-1 border border-[#B90F0F] text-[#B90F0F] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition">
                <i className="fa-solid fa-file-medical"></i> Mis fórmulas
              </button>
              <button onClick={activarEdicion} className="flex-1 bg-[#B90F0F] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#9f0d0d] transition">
                <i className="fa-solid fa-pen"></i> Editar información
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={cancelarEdicion} disabled={guardando} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={guardarCambios} disabled={guardando} className="flex-1 bg-[#B90F0F] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#9f0d0d] transition disabled:opacity-50">
                {guardando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><i className="fa-solid fa-check"></i> Guardar cambios</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PerfilCliente;