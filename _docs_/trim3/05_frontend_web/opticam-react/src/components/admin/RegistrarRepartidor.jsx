import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hashSHA256 } from '../../utils/encryption';

const API_URL = 'http://localhost:3001';

const RegistrarRepartidor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    documento: '',
    fechaNacimiento: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    password: '',
    vehiculo: '',
    modelo: '',
    placa: '',
    color: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.nombre || !formData.email || !formData.password) {
      setError('❌ Completa los campos obligatorios');
      setLoading(false);
      return;
    }

    try {
      // 1. Verificar si el email ya existe en usuarios
      const checkResponse = await fetch(`${API_URL}/usuarios?email=${formData.email}`);
      const existingUsers = await checkResponse.json();
      
      if (existingUsers.length > 0) {
        setError('❌ Este email ya está registrado');
        setLoading(false);
        return;
      }

      // 2. Encriptar contraseña
      const hashedPassword = await hashSHA256(formData.password);

      // 3. Crear el usuario en la colección "usuarios"
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

      const createUserResponse = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });

      if (!createUserResponse.ok) {
        throw new Error('Error al crear usuario');
      }

      const createdUser = await createUserResponse.json();

      // 4. Asignar rol de repartidor (id_rol = 3) en roles_usuarios
      await fetch(`${API_URL}/roles_usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_rol: 3, id_usuario: createdUser.id })
      });

      // 5. Guardar datos adicionales en la colección "repartidores"
      const nuevoRepartidor = {
        nombre: formData.nombre,
        email: formData.email,
        documento: formData.documento,
        fecha_nacimiento: formData.fechaNacimiento,
        ciudad: formData.ciudad,
        direccion: formData.direccion,
        telefono: formData.telefono,
        password: hashedPassword,
        vehiculo: formData.vehiculo,
        modelo: formData.modelo,
        placa: formData.placa,
        color: formData.color,
        estado: 'activo',
        pedidos_entregados: 0,
        rol: 'repartidor',
        fecha_registro: new Date().toISOString()
      };

      await fetch(`${API_URL}/repartidores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRepartidor)
      });

      alert('✅ ¡Repartidor registrado exitosamente!');
      navigate('/admin/repartidores');

    } catch (error) {
      console.error('Error:', error);
      setError('❌ Error al registrar repartidor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-bold text-center text-[#000000]">
        Registro <br /><span className="text-3xl font-medium">Registra a tus Repartidores</span>
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

          <label className="block text-[#000000] mt-4 mb-1">Tipo de vehículo</label>
          <select name="vehiculo" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required>
            <option value="">Seleccione un tipo</option>
            <option value="moto">Moto</option>
            <option value="carro">Carro</option>
          </select>

          <label className="block text-[#000000] mt-4 mb-1">Modelo del vehículo</label>
          <input type="text" name="modelo" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Placa</label>
          <input type="text" name="placa" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <label className="block text-[#000000] mt-4 mb-1">Color del vehículo</label>
          <input type="text" name="color" className="w-full p-3 rounded-xl border border-gray-300" onChange={handleChange} required />

          <button 
            type="submit" 
            className="w-full mt-6 py-3 bg-[#B90F0F] text-white border-none rounded-xl text-base cursor-pointer transition-all hover:opacity-85"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrarRepartidor;