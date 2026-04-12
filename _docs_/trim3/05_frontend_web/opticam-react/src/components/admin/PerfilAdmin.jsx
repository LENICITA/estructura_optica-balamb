import React, { useState } from 'react';

const PerfilAdmin = () => {
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: 'LENNY TABAREZ',
    direccion: 'Calle Principal #123',
    correo: 'admin@gmail.com',
    telefono: '3001234567'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const activarEdicion = () => {
    setEditando(true);
  };

  const guardar = () => {
    alert('✅ Datos guardados correctamente');
    setEditando(false);
  };

  const subirFoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onclick = (e) => {
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

  return (
    <div className="container mx-auto py-10 px-5">
      <h2 className="text-2xl font-bold text-center mb-5">GESTIÓN DE PERFIL ADMINISTRADOR</h2>

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
              className="absolute bottom-0 right-0 bg-[#B90F0F] text-white border-none rounded-full w-8 h-8 cursor-pointer flex items-center justify-center"
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
              disabled={!editando}
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
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Correo</label>
            <input 
              type="email" 
              name="correo" 
              value={formData.correo} 
              onChange={handleChange}
              disabled={!editando}
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
              disabled={!editando}
              className="w-full p-2.5 rounded-xl border-none bg-gray-100 disabled:bg-gray-100"
            />
          </div>

          <div className="flex gap-3 mt-4">
            {!editando ? (
              <button 
                type="button" 
                onClick={activarEdicion}
                className="flex-1 bg-black text-white py-3 rounded-full cursor-pointer hover:opacity-85 transition"
              >
                EDITAR PERFIL
              </button>
            ) : (
              <button 
                type="button" 
                onClick={guardar}
                className="flex-1 bg-[#B90F0F] text-white py-3 rounded-full cursor-pointer hover:opacity-85 transition"
              >
                GUARDAR
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilAdmin;