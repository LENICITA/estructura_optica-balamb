// src/shared/hooks/usePerfil.js
import { useState, useEffect } from 'react';
import { UserController } from '../../core/controllers/UserController';
import { useAuth } from '../../features/auth/context/AuthContext';
import { checkNombre, checkEmail, checkTelefono, checkDocumento, checkCiudad } from '../validators/userValidators';
import { alertError, alertSuccess, alertWarning } from '../utils/alert';

export const usePerfil = () => {
  const { updateUser } = useAuth();
  const userController = new UserController();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  const [formData, setFormData] = useState({
    nombre_completo: '', email: '', telefono: '', direccion: '',
    ciudad: '', documento: '', fecha_nacimiento: '', estado: '', roles: '',
  });

  useEffect(() => { void cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const user = await userController.getProfile();
      if (user) {
        setFormData({
          nombre_completo: user.nombre_completo || '', email: user.email || '',
          telefono: user.telefono || '', direccion: user.direccion || '',
          ciudad: user.ciudad || '', documento: user.documento ? String(user.documento) : '',
          fecha_nacimiento: user.fecha_nacimiento || '', estado: user.estado || '',
          roles: user.getRoles().join(', ') || '',
        });
      } else {
        void alertError('No fue posible cargar el perfil.');
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      void alertError('No fue posible cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (campo, valor) => setFormData((prev) => ({ ...prev, [campo]: valor }));
  const activarEdicion = () => setEditando(true);
  const cancelarEdicion = () => { setEditando(false); void cargarPerfil(); };

  const guardarCambios = async () => {
    const checks = [
      checkNombre(formData.nombre_completo), checkEmail(formData.email),
      checkTelefono(formData.telefono), checkDocumento(formData.documento),
      checkCiudad(formData.ciudad),
    ];

    for (const check of checks) {
      if (!check.valido) return void alertWarning(check.mensaje);
    }

    if (formData.fecha_nacimiento) {
      const fecha = new Date(formData.fecha_nacimiento);
      if (Number.isNaN(fecha.getTime())) return void alertWarning('La fecha de nacimiento no es válida.');
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
        void alertSuccess(result.message);
        await cargarPerfil();
      } else {
        void alertError(result.message);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      void alertError('No fue posible actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return {
    loading, guardando, editando, formData,
    handleChange, activarEdicion, cancelarEdicion, guardarCambios
  };
};