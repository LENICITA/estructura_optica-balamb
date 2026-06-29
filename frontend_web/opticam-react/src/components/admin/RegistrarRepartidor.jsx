import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

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
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.password) {
      setError('Completa los campos obligatorios');
      setLoading(false);
      return;
    }

    try {
      // Verificar que el token existe
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No hay sesión activa. Inicia sesión nuevamente.');
        setLoading(false);
        return;
      }

      // Preparar datos para el backend
      const repartidorData = {
        nombre_completo: formData.nombre,
        telefono: formData.telefono || '',
        fecha_nacimiento: formData.fechaNacimiento || '',
        documento: formData.documento || '',
        ciudad: formData.ciudad || '',
        direccion: formData.direccion || '',
        email: formData.email,
        contrasena: formData.password,
        vehiculo: {
          tipo: formData.vehiculo ? formData.vehiculo.toUpperCase() : '',
          modelo: formData.modelo || '',
          placa: formData.placa ? formData.placa.toUpperCase() : '',
          color: formData.color || ''
        }
      };

      const response = await api.post('/usuarios/repartidores', repartidorData);
      
      setSuccess('Repartidor registrado exitosamente');
      
      // Limpiar formulario
      setFormData({
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

      setTimeout(() => {
        navigate('/admin/repartidores');
      }, 2000);

    } catch (error) {
      console.error('Error completo:', error);
      console.error('Response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      if (error.response?.status === 401) {
        setError('Tu sesión ha expirado. Inicia sesión nuevamente.');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || 'Datos inválidos. Verifica los campos.');
      } else if (error.response?.status === 403) {
        setError('No tienes permisos para registrar repartidores.');
      } else {
        setError(error.response?.data?.message || 'Error al registrar repartidor. Intenta nuevamente.');
      }
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
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm border border-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm border border-green-400">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block text-[#000000] mt-4 mb-1">Nombres y Apellidos *</label>
          <input 
            type="text" 
            name="nombre" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.nombre}
            onChange={handleChange} 
            required 
          />

          <label className="block text-[#000000] mt-4 mb-1">Email *</label>
          <input 
            type="email" 
            name="email" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.email}
            onChange={handleChange} 
            required 
          />

          <label className="block text-[#000000] mt-4 mb-1">Documento</label>
          <input 
            type="number" 
            name="documento" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.documento}
            onChange={handleChange} 
          />

          <label className="block text-[#000000] mt-4 mb-1">Fecha de nacimiento</label>
          <input 
            type="date" 
            name="fechaNacimiento" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.fechaNacimiento}
            onChange={handleChange} 
          />

          <label className="block text-[#000000] mt-4 mb-1">Ciudad</label>
          <input 
            type="text" 
            name="ciudad" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.ciudad}
            onChange={handleChange} 
          />

          <label className="block text-[#000000] mt-4 mb-1">Dirección</label>
          <input 
            type="text" 
            name="direccion" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.direccion}
            onChange={handleChange} 
          />

          <label className="block text-[#000000] mt-4 mb-1">Teléfono</label>
          <input 
            type="number" 
            name="telefono" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.telefono}
            onChange={handleChange} 
          />

          <label className="block text-[#000000] mt-4 mb-1">Contraseña *</label>
          <input 
            type="password" 
            name="password" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.password}
            onChange={handleChange} 
            required 
          />

          <label className="block text-[#000000] mt-4 mb-1">Tipo de vehículo</label>
          <select 
            name="vehiculo" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.vehiculo}
            onChange={handleChange}
          >
            <option value="">Seleccione un tipo</option>
            <option value="CARRO">Carro</option>
            <option value="MOTO">Moto</option>
            <option value="BICICLETA">Bicicleta</option>
          </select>

          <label className="block text-[#000000] mt-4 mb-1">Modelo del vehículo</label>
          <input 
            type="text" 
            name="modelo" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.modelo}
            onChange={handleChange} 
          />

          <label className="block text-[#000000] mt-4 mb-1">Placa</label>
          <input 
            type="text" 
            name="placa" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F] uppercase" 
            value={formData.placa}
            onChange={handleChange} 
          />

          <label className="block text-[#000000] mt-4 mb-1">Color del vehículo</label>
          <input 
            type="text" 
            name="color" 
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            value={formData.color}
            onChange={handleChange} 
          />

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