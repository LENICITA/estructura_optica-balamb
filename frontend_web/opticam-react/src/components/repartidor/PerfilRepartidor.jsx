import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PerfilRepartidor = () => {
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    correo: '',
    telefono: ''
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get('/usuarios/perfil');

      // Procesar la respuesta
      let userData = response.data;
      if (response.data && response.data.data) {
        userData = response.data.data;
      }
      if (response.data && response.data.usuario) {
        userData = response.data.usuario;
      }

      setFormData({
        nombre: userData.nombre_completo || userData.nombre || '',
        direccion: userData.direccion || '',
        correo: userData.email || '',
        telefono: userData.telefono || ''
      });

      // Guardar nombre en localStorage para el dashboard
      if (userData.nombre_completo) {
        localStorage.setItem('nombre', userData.nombre_completo);
      }

    } catch (err) {
      console.error('Error al cargar perfil:', err);
      
      let mensajeError = 'Error al cargar el perfil. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Redirigiendo al login...';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 404) {
        mensajeError += 'La ruta /usuarios/perfil no existe.';
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      setError(mensajeError);
      
      // Datos de ejemplo en caso de error
      const nombreLocal = localStorage.getItem('nombre') || 'Repartidor';
      setFormData({
        nombre: nombreLocal,
        direccion: 'Calle Principal #456',
        correo: 'repartidor@email.com',
        telefono: '3112223344'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const activarEdicion = () => {
    setEditando(true);
  };

  const guardar = async () => {
    try {
      setLoading(true);
      
      const response = await api.put('/usuarios/perfil', {
        direccion: formData.direccion,
        email: formData.correo,
        telefono: formData.telefono
      });


      if (response.data.success || response.status === 200) {
        alert('Datos guardados correctamente');
        setEditando(false);
        cargarPerfil(); // Recargar datos
      }

    } catch (err) {
      console.error('Error al guardar perfil:', err);
      
      let mensajeError = 'Error al guardar los cambios. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Redirigiendo al login...';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 400) {
        mensajeError += err.response.data?.message || 'Datos inválidos';
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      alert(`${mensajeError}`);
    } finally {
      setLoading(false);
    }
  };

  const subirFoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = document.getElementById('preview');
          if (preview) preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Mostrar loading
  if (loading && !editando) {
    return (
      <div className="container mx-auto py-10 px-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="container mx-auto py-10 px-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={cargarPerfil}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-5">
      <h2 className="text-2xl font-bold text-center mb-5">GESTIÓN DE PERFIL REPARTIDOR</h2>

      <div className="bg-white w-full max-w-2xl mx-auto p-8 rounded-xl shadow-lg relative">
        {/* Foto de perfil */}
        <div className="absolute -right-[60px] -top-10 max-md:static max-md:mb-5 max-md:text-center">
          <div className="relative inline-block">
            <img 
              id="preview" 
              src="/img/user.jpg" 
              alt="Foto" 
              className="w-[110px] h-[110px] rounded-full border-4 border-[#B90F0F] object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/110'}
            />
            <button 
              onClick={subirFoto}
              className="absolute bottom-0 right-0 bg-[#B90F0F] text-white border-none rounded-full w-8 h-8 cursor-pointer flex items-center justify-center hover:bg-[#8a0b0b] transition"
              disabled={loading}
            >
              📷
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form className="mt-4">
          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Nombre</label>
            <input 
              type="text" 
              value={formData.nombre} 
              disabled 
              className="w-full p-2.5 rounded-xl border-none bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Dirección</label>
            <input 
              type="text" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange}
              disabled={!editando || loading}
              className="w-full p-2.5 rounded-xl border-none bg-gray-100 disabled:bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Contraseña</label>
            <input 
              type="password" 
              value="********" 
              disabled 
              className="w-full p-2.5 rounded-xl border-none bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">La contraseña no se muestra por seguridad</p>
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Correo</label>
            <input 
              type="email" 
              name="correo" 
              value={formData.correo} 
              onChange={handleChange}
              disabled={!editando || loading}
              className="w-full p-2.5 rounded-xl border-none bg-gray-100 disabled:bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Teléfono</label>
            <input 
              type="text" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange}
              disabled={!editando || loading}
              className="w-full p-2.5 rounded-xl border-none bg-gray-100 disabled:bg-gray-100"
            />
          </div>

          <div className="flex gap-3 mt-4">
            {!editando ? (
              <button 
                type="button" 
                onClick={activarEdicion}
                className="flex-1 bg-black text-white py-3 rounded-full cursor-pointer hover:opacity-85 transition disabled:opacity-50"
                disabled={loading}
              >
                EDITAR PERFIL
              </button>
            ) : (
              <button 
                type="button" 
                onClick={guardar}
                className="flex-1 bg-[#B90F0F] text-white py-3 rounded-full cursor-pointer hover:opacity-85 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'GUARDAR'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilRepartidor;