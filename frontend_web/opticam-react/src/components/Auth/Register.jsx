import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    documento: '',
    fecha_nacimiento: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    contrasena: '',
    confirmar_contrasena: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar errores cuando el usuario escribe
    if (error) setError('');
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validaciones mejoradas
    if (!formData.nombre_completo.trim()) {
      setError('El nombre completo es obligatorio');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError('Ingresa un email válido (ejemplo: usuario@dominio.com)');
      return;
    }
    
    if (!formData.contrasena) {
      setError('La contraseña es obligatoria');
      return;
    }
    
    if (formData.contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (formData.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    // Validar que la contraseña tenga al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.contrasena)) {
      setError('La contraseña debe tener al menos una mayúscula, una minúscula y un número');
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar datos para la API
      const userData = {
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email.trim().toLowerCase(),
        documento: formData.documento.trim() || '',
        fecha_nacimiento: formData.fecha_nacimiento || '',
        ciudad: formData.ciudad.trim() || '',
        direccion: formData.direccion.trim() || '',
        telefono: formData.telefono.trim() || '',
        contrasena: formData.contrasena,
        // Asegurar que se asigne el rol CLIENTE
        rol: 'CLIENTE' // O 'cliente' según cómo lo maneje tu backend
      };

      const result = await register(userData);

      if (result.success) {
        setSuccess('Registro exitoso. Redirigiendo al login...');
        // Limpiar formulario
        setFormData({
          nombre_completo: '',
          email: '',
          documento: '',
          fecha_nacimiento: '',
          ciudad: '',
          direccion: '',
          telefono: '',
          contrasena: '',
          confirmar_contrasena: ''
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Manejar mensajes de error específicos
        if (result.message?.includes('email')) {
          setError('Este email ya está registrado. Por favor, usa otro o inicia sesión.');
        } else if (result.message?.includes('documento')) {
          setError('Este documento ya está registrado.');
        } else {
          setError(result.message || 'Error al registrar usuario. Intenta nuevamente.');
        }
      }
      
    } catch (error) {
      console.error('Error en registro:', error);
      setError('Error de conexión. Verifica tu internet e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-bold text-center text-[#000000]">
        Registro <br /><span className="text-3xl font-medium">Regístrate gratis y seguro!</span>
      </h1>

      <div className="bg-white p-8 w-[400px] max-w-[90%] rounded-xl shadow-lg mt-5 max-h-[85vh] overflow-y-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <strong>¡Éxito!</strong> {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <label className="block text-[#000000] mt-4 mb-1">
            Nombres y Apellidos <span className="text-red-600">*</span>
          </label>
          <input 
            type="text" 
            name="nombre_completo" 
            value={formData.nombre_completo}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
            placeholder="Juan Perez"
            required 
          />

          <label className="block text-[#000000] mt-4 mb-1">
            Email <span className="text-red-600">*</span>
          </label>
          <input 
            type="email" 
            name="email" 
            value={formData.email}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
            placeholder="juan@email.com"
            required 
          />

          <label className="block text-[#000000] mt-4 mb-1">Documento</label>
          <input 
            type="number" 
            name="documento" 
            value={formData.documento}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
            placeholder="123456789"
          />

          <label className="block text-[#000000] mt-4 mb-1">Fecha de nacimiento</label>
          <input 
            type="date" 
            name="fecha_nacimiento" 
            value={formData.fecha_nacimiento}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
          />

          <label className="block text-[#000000] mt-4 mb-1">Ciudad</label>
          <input 
            type="text" 
            name="ciudad" 
            value={formData.ciudad}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
            placeholder="Bogota"
          />

          <label className="block text-[#000000] mt-4 mb-1">Dirección</label>
          <input 
            type="text" 
            name="direccion" 
            value={formData.direccion}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
            placeholder="Calle 123 #45-67"
          />

          <label className="block text-[#000000] mt-4 mb-1">Teléfono</label>
          <input 
            type="tel" 
            name="telefono" 
            value={formData.telefono}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
            placeholder="3001234567"
          />

          <label className="block text-[#000000] mt-4 mb-1">
            Contraseña <span className="text-red-600">*</span>
          </label>
          <input 
            type="password" 
            name="contrasena" 
            value={formData.contrasena}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
            placeholder="Minimo 8 caracteres"
            required 
          />
          <p className="text-xs text-gray-500 mt-1">
            Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
          </p>

          <label className="block text-[#000000] mt-4 mb-1">
            Confirmar Contraseña <span className="text-red-600">*</span>
          </label>
          <input 
            type="password" 
            name="confirmar_contrasena" 
            value={formData.confirmar_contrasena}
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
            onChange={handleChange} 
            placeholder="Repite la contraseña"
            required 
          />

          <div className="flex items-center my-5 gap-2.5">
            <hr className="flex-1 border-none h-px bg-gray-300" />
            <span className="text-sm text-gray-500">o</span>
            <hr className="flex-1 border-none h-px bg-gray-300" />
          </div>

          <button 
            type="button" 
            className="flex justify-center items-center gap-2.5 w-full mt-3 py-3 border-none rounded-full bg-gray-200 cursor-pointer text-sm transition-all hover:bg-gray-300"
          >
            Continuar con Google <i className="fa-brands fa-google text-red-600"></i>
          </button>

          <button 
            type="button" 
            className="flex justify-center items-center gap-2.5 w-full mt-3 py-3 border-none rounded-full bg-gray-200 cursor-pointer text-sm transition-all hover:bg-gray-300"
          >
            Continuar con Facebook <i className="fa-brands fa-facebook text-blue-700"></i>
          </button>

          <button 
            type="submit" 
            className="w-full mt-4 py-3 bg-[#B90F0F] text-white border-none rounded-xl text-base cursor-pointer transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <p className="text-center mt-4 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#B90F0F] no-underline hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;