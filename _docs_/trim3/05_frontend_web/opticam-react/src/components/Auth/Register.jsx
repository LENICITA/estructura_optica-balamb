import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hashSHA256 } from '../../utils/encryption';

const API_URL = 'http://localhost:3001';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '', email: '', documento: '', fechaNacimiento: '', ciudad: '', direccion: '', telefono: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.nombre || !formData.email || !formData.password) {
      setError('❌ Completa los campos obligatorios');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('❌ Las contraseñas no coinciden');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      // Verificar si el email ya existe
      const checkResponse = await fetch(`${API_URL}/usuarios?email=${formData.email}`);
      const existing = await checkResponse.json();
      
      if (existing.length > 0) {
        setError('❌ Este email ya está registrado');
        setLoading(false);
        return;
      }
      
      const hashedPassword = await hashSHA256(formData.password);
      
      const nuevoUsuario = {
        name: formData.nombre,
        email: formData.email,
        documento: formData.documento,
        fecha_nacimiento: formData.fechaNacimiento,
        ciudad: formData.ciudad,
        direccion: formData.direccion,
        telefono: formData.telefono,
        password: hashedPassword,
        estado: 'activo',
        fecha_registro: new Date().toISOString()
      };
      
      console.log('Enviando datos:', nuevoUsuario);
        const response = await fetch(`${API_URL}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevoUsuario)
        });
        console.log('Respuesta:', response);
      
      const createdUser = await response.json();
      
      // Asignar rol de cliente (id_rol = 2)
      await fetch(`${API_URL}/roles_usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_rol: 2, id_usuario: createdUser.id })
      });
      
      alert('✅ ¡Registro exitoso! Ahora puedes iniciar sesión.');
      navigate('/login');
      
    } catch (error) {
      console.error(error);
      setError('❌ Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-bold text-center text-[#000000]">
        Registro <br /><span className="text-3xl font-medium">Regístrate gratis y seguro!</span>
      </h1>

      <div className="bg-white p-8 w-[370px] max-w-[90%] rounded-xl shadow-lg mt-5">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block text-[#000000] mt-4 mb-1">Nombres y Apellidos</label>
          <input type="text" name="nombre" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Email</label>
          <input type="email" name="email" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Documento</label>
          <input type="number" name="documento" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Fecha de nacimiento</label>
          <input type="date" name="fechaNacimiento" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Ciudad</label>
          <input type="text" name="ciudad" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Dirección</label>
          <input type="text" name="direccion" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Teléfono</label>
          <input type="number" name="telefono" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Contraseña</label>
          <input type="password" name="password" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Confirmar Contraseña</label>
          <input type="password" name="confirmPassword" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <div className="flex items-center my-5 gap-2.5">
            <hr className="flex-1 border-none h-px bg-gray-300" />
            <span className="text-sm text-gray-500">o</span>
            <hr className="flex-1 border-none h-px bg-gray-300" />
          </div>

          <button type="button" className="flex justify-center items-center gap-2.5 w-full mt-3 py-3 border-none rounded-full bg-gray-200 cursor-pointer text-sm transition-all hover:bg-gray-300">
            Continuar con Google <i className="fa-brands fa-google text-red-600"></i>
          </button>

          <button type="button" className="flex justify-center items-center gap-2.5 w-full mt-3 py-3 border-none rounded-full bg-gray-200 cursor-pointer text-sm transition-all hover:bg-gray-300">
            Continuar con Facebook <i className="fa-brands fa-facebook text-blue-700"></i>
          </button>

          <button 
            type="submit" 
            className="w-full mt-4 py-3 bg-[#B90F0F] text-white border-none rounded-xl text-base cursor-pointer transition-all hover:opacity-85"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;