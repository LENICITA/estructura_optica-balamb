// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Asegurar que el usuario tenga roles como array
        if (!parsedUser.roles || !Array.isArray(parsedUser.roles)) {
          parsedUser.roles = [];
        }
        
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al restaurar sesion: ', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
    }
    setLoading(false);
  }, []);

  const login = async (email, contrasena) => {
    try {
      
      const response = await api.post('/auth/login', { email, contrasena });
      
      if (response.data?.success && response.data?.data) {
        const { token, usuario } = response.data.data;
        
        const tokenString = typeof token === 'string' ? token : token.token || JSON.stringify(token);
        
        // Asegurar que roles sea un array
        if (!usuario.roles || !Array.isArray(usuario.roles)) {
          usuario.roles = [];
        }
        
        localStorage.setItem('token', tokenString);
        localStorage.setItem('user', JSON.stringify(usuario));
        
        setUser(usuario);
                
        return {
          success: true,
          user: usuario,
          roles: usuario.roles || []
        };
      } else {
        console.error('Estructura de respuesta inesperada:', response.data);
        return {
          success: false,
          message: response.data?.message || 'Error en la respuesta del servidor'
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.response) {
        console.error('Error del servidor:', error.response.data);
        return {
          success: false,
          message: error.response.data?.message || 'Credenciales incorrectas'
        };
      } else if (error.request) {
        console.error('No hay respuesta del servidor');
        return {
          success: false,
          message: 'Error de conexión con el servidor'
        };
      } else {
        console.error('Error en la petición:', error.message);
        return {
          success: false,
          message: 'Error al intentar iniciar sesión'
        };
      }
    }
  };

  const register = async (userData) => {
    try {

      const response = await api.post('/auth/register', {
        nombre_completo: userData.nombre_completo || userData.name,
        telefono: userData.telefono || '',
        fecha_nacimiento: userData.fecha_nacimiento || '',
        documento: userData.documento || '',
        ciudad: userData.ciudad || '',
        direccion: userData.direccion || '',
        email: userData.email,
        contrasena: userData.password || userData.contrasena,
        rol: userData.rol || 'CLIENTE'
      });

      if (response.data?.success && response.data?.data) {
        const { token, usuario } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        setUser(usuario);
        
        return {
          success: true,
          message: 'Usuario registrado exitosamente',
          user: usuario
        };
      }

      return {
        success: true,
        message: 'Usuario registrado exitosamente. Por favor, inicia sesión.'
      };

    } catch (error) {
      console.error('Error en register:', error);

      if (error.response?.status === 409) {
        return {
          success: false,
          message: error.response?.data?.message || 'El email o documento ya está registrado'
        };
      }

      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response?.data?.message || 'Datos inválidos'
        };
      }

      return {
        success: false,
        message: 'Error al registrar usuario. Intenta nuevamente.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getUserRole = () => {
    if (!user) return null;
    if (user.roles?.includes('ADMIN')) return 'ADMIN';
    if (user.roles?.includes('REPARTIDOR')) return 'REPARTIDOR';
    if (user.roles?.includes('CLIENTE')) return 'CLIENTE';
    return null;
  };

  const isAdmin = () => user?.roles?.includes('ADMIN') || false;
  const isRepartidor = () => user?.roles?.includes('REPARTIDOR') || false;
  const isCliente = () => user?.roles?.includes('CLIENTE') || false;
  const hasRole = (role) => user?.roles?.includes(role) || false;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      getUserRole,
      isAdmin,
      isRepartidor,
      isCliente,
      hasRole,
      isAuthenticated: !!user,
      token: localStorage.getItem('token')
    }}>
      {children}
    </AuthContext.Provider>
  );
};
