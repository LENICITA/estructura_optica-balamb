import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';

// 📌 1. INTERFAZ ACTUALIZADA (Coincide exactamente con lo que devuelven las funciones)
interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; data?: any }>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<{ success: boolean; message?: string; data?: any }>;
  updateUser: (userData: any) => Promise<void>;
}

// Creamos el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para el Provider
interface AuthProviderProps {
  children: ReactNode;
}

// El Provider que va a envolver toda la app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar, verificar si hay usuario guardado
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIN - LLAMADA REAL AL BACKEND
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, usuario } = response.data.data;
        setUser(usuario);
        await AsyncStorage.setItem('user', JSON.stringify(usuario));
        await AsyncStorage.setItem('token', token);
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.data.message || 'Credenciales incorrectas' };
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error de conexión' 
      };
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // ✅ REGISTER - LLAMADA REAL AL BACKEND
  const register = async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token, usuario } = response.data.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(usuario));
        setUser(usuario);
        return { success: true, data: response.data };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Error al registrar' 
        };
      }
    } catch (error: any) {
      console.error('Error al registrar:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error de conexión' 
      };
    }
  };

  // Actualizar datos del usuario
  const updateUser = async (userData: any) => {
    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
    updateUser,
  };

  // 📌 2. AGREGAMOS 'as AuthContextType' PARA ELIMINAR LA LÍNEA ROJA DEL PROVIDER
  return (
    <AuthContext.Provider value={value as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};