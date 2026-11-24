// src/features/admin/pages/PerfilAdmin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../../shared/hooks/usePerfil';
import { InfoField } from '../../../shared/components/ui/InfoField';

export const PerfilAdmin = () => {
  const navigate = useNavigate();
  const { loading, guardando, editando, formData, handleChange, activarEdicion, cancelarEdicion, guardarCambios } = usePerfil();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 lg:p-10 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto flex items-center mb-6">
        <button 
          onClick={() => void navigate(-1)} 
          className="mr-3 p-2 hover:bg-gray-200 rounded-full transition flex-shrink-0" 
          aria-label="Volver"
        >
          <i className="fa-solid fa-arrow-left text-2xl text-black"></i>
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-black">GESTIÓN DE PERFIL</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Consulta y actualiza tu información personal</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <InfoField id="adm-nombre" icon="fa-user" label="Nombre" value={formData.nombre_completo} field="nombre_completo" editable={editando} onChange={handleChange} />
          <InfoField id="adm-email" icon="fa-envelope" label="Correo electrónico" value={formData.email} field="email" editable={editando} type="email" onChange={handleChange} />
          <InfoField id="adm-tel" icon="fa-phone" label="Teléfono" value={formData.telefono} field="telefono" editable={editando} onChange={handleChange} />
          <InfoField id="adm-doc" icon="fa-id-card" label="Documento" value={formData.documento} field="documento" editable={editando} onChange={handleChange} />
          <InfoField id="adm-dir" icon="fa-location-dot" label="Dirección" value={formData.direccion} field="direccion" editable={editando} onChange={handleChange} />
          <InfoField id="adm-ciudad" icon="fa-building" label="Ciudad" value={formData.ciudad} field="ciudad" editable={editando} onChange={handleChange} />
          <InfoField id="adm-fecha" icon="fa-calendar" label="Fecha de nacimiento" value={formData.fecha_nacimiento} field="fecha_nacimiento" editable={editando} type="date" onChange={handleChange} />
          <InfoField id="adm-estado" icon="fa-shield" label="Estado" value={formData.estado} field="estado" editable={false} onChange={handleChange} />
          <InfoField id="adm-rol" icon="fa-users" label="Rol" value={formData.roles} field="roles" editable={false} onChange={handleChange} />

          <div className="mb-3">
            <p className="block text-xs font-semibold text-black mb-1.5">Contraseña</p>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 min-h-[42px]">
              <i className="fa-solid fa-lock text-[#B90F0F] mr-2"></i>
              <span className="flex-1 text-sm text-gray-700 py-2">••••••••</span>
              <i className="fa-solid fa-eye-slash text-gray-400"></i>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-1">La contraseña no se muestra por seguridad</p>
          </div>
        </div>

        {!editando ? (
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button onClick={activarEdicion} className="flex-1 bg-[#B90F0F] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-800 transition">
              <i className="fa-solid fa-pen"></i> Editar perfil
            </button>
            <button onClick={() => void navigate('/admin/formulas')} className="flex-1 border border-[#B90F0F] text-[#B90F0F] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition">
              <i className="fa-solid fa-file-lines"></i> Ver fórmulas
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button onClick={cancelarEdicion} disabled={guardando} className="flex-1 border border-gray-400 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={guardarCambios} disabled={guardando} className="flex-1 bg-[#B90F0F] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-800 transition disabled:opacity-50">
              {guardando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><i className="fa-solid fa-check"></i> Guardar</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default PerfilAdmin;