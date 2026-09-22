// src/features/admin/pages/PerfilAdmin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { UserController } from '../../../core/controllers/UserController';
import {
  checkNombre,
  checkEmail,
  checkTelefono,
  checkDocumento,
  checkCiudad,
} from '../../../shared/validators/userValidators';

export const PerfilAdmin = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const userController = new UserController();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

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
      } else {
        alert('No fue posible cargar el perfil.');
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      alert('No fue posible cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const activarEdicion = () => setEditando(true);

  const cancelarEdicion = () => {
    setEditando(false);
    cargarPerfil();
  };

  const guardarCambios = async () => {
    const nombreCheck = checkNombre(formData.nombre_completo);
    if (!nombreCheck.valido) return alert(nombreCheck.mensaje);

    const emailCheck = checkEmail(formData.email);
    if (!emailCheck.valido) return alert(emailCheck.mensaje);

    const telCheck = checkTelefono(formData.telefono);
    if (!telCheck.valido) return alert(telCheck.mensaje);

    const docCheck = checkDocumento(formData.documento);
    if (!docCheck.valido) return alert(docCheck.mensaje);

    const ciudadCheck = checkCiudad(formData.ciudad);
    if (!ciudadCheck.valido) return alert(ciudadCheck.mensaje);

    if (formData.fecha_nacimiento) {
      const fecha = new Date(formData.fecha_nacimiento);
      if (isNaN(fecha.getTime())) return alert('La fecha de nacimiento no es válida.');
    }

    try {
      setGuardando(true);

      const result = await userController.updateProfile({
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        fecha_nacimiento: formData.fecha_nacimiento.trim(),
        documento: formData.documento ? Number(formData.documento) : undefined,
      });

      if (result.success) {
        await updateUser();
        setEditando(false);
        alert(result.message);
        await cargarPerfil();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('No fue posible actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  const InfoField = ({ icon, label, value, field, editable = false, type = 'text' }) => (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-black mb-1.5">{label}</label>
      <div className="flex items-center bg-gray-100 rounded-lg px-3 min-h-[42px]">
        <i className={`fa-solid ${icon} text-[#B90F0F] mr-2`}></i>
        {editable ? (
          <input
            type={type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 py-2"
          />
        ) : (
          <span className="flex-1 text-sm text-gray-700 py-2">{value || 'No registrado'}</span>
        )}
      </div>
    </div>
  );

  return (
  <div className="p-5 md:p-8 lg:p-10 bg-gray-100 min-h-screen">

    {/* HEADER */}
    <div className="max-w-6xl mx-auto flex items-center mb-6">
      <button
        onClick={() => navigate(-1)}
        className="mr-3 p-2 hover:bg-gray-200 rounded-full transition flex-shrink-0"
      >
        <i className="fa-solid fa-arrow-left text-2xl text-black"></i>
      </button>

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-black">
          GESTIÓN DE PERFIL
        </h1>

        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Consulta y actualiza tu información personal
        </p>
      </div>
    </div>

    {/* CARD */}
    <div className="max-w-6xl mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-md">

      {/* INFORMACIÓN PERSONAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">

        <InfoField
          icon="fa-user"
          label="Nombre"
          value={formData.nombre_completo}
          field="nombre_completo"
          editable={editando}
        />

        <InfoField
          icon="fa-envelope"
          label="Correo electrónico"
          value={formData.email}
          field="email"
          editable={editando}
          type="email"
        />

        <InfoField
          icon="fa-phone"
          label="Teléfono"
          value={formData.telefono}
          field="telefono"
          editable={editando}
        />

        <InfoField
          icon="fa-id-card"
          label="Documento"
          value={formData.documento}
          field="documento"
          editable={editando}
        />

        <InfoField
          icon="fa-location-dot"
          label="Dirección"
          value={formData.direccion}
          field="direccion"
          editable={editando}
        />

        <InfoField
          icon="fa-building"
          label="Ciudad"
          value={formData.ciudad}
          field="ciudad"
          editable={editando}
        />

        <InfoField
          icon="fa-calendar"
          label="Fecha de nacimiento"
          value={formData.fecha_nacimiento}
          field="fecha_nacimiento"
          editable={editando}
          type="date"
        />

        <InfoField
          icon="fa-shield"
          label="Estado"
          value={formData.estado}
          field="estado"
          editable={false}
        />

        <InfoField
          icon="fa-users"
          label="Rol"
          value={formData.roles}
          field="roles"
          editable={false}
        />

        {/* CONTRASEÑA */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-black mb-1.5">
            Contraseña
          </label>

          <div className="flex items-center bg-gray-100 rounded-lg px-3 min-h-[42px]">
            <i className="fa-solid fa-lock text-[#B90F0F] mr-2"></i>

            <span className="flex-1 text-sm text-gray-700 py-2">
              ••••••••
            </span>

            <i className="fa-solid fa-eye-slash text-gray-400"></i>
          </div>

          <p className="text-[10px] text-gray-400 mt-1 ml-1">
            La contraseña no se muestra por seguridad
          </p>
        </div>

      </div>

      {/* BOTONES */}
      {!editando ? (
        <div className="flex flex-col sm:flex-row gap-3 mt-5">

          <button
            onClick={activarEdicion}
            className="flex-1 bg-[#B90F0F] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-800 transition"
          >
            <i className="fa-solid fa-pen"></i>
            Editar perfil
          </button>

          <button
            onClick={() => navigate('/admin/formulas')}
            className="flex-1 border border-[#B90F0F] text-[#B90F0F] py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition"
          >
            <i className="fa-solid fa-file-lines"></i>
            Ver fórmulas
          </button>

        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 mt-5">

          <button
            onClick={cancelarEdicion}
            disabled={guardando}
            className="flex-1 border border-gray-400 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="flex-1 bg-[#B90F0F] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-800 transition disabled:opacity-50"
          >
            {guardando ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <i className="fa-solid fa-check"></i>
                Guardar
              </>
            )}
          </button>

        </div>
      )}

    </div>
  </div>
);
};