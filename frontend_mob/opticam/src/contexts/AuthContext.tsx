// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, getUser, saveToken, saveUser, removeToken, removeUser } from '../utils/storage';
import { login as loginService } from '../services/authService';
import { getProfile } from '../services/userService';
import { apiClient } from '../services/apiClient';
import { Usuario } from '../types';

interface AuthContextProps {
  user: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar usuario al iniciar
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const storedUser = await getUser();

      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else if (token) {
        const response = await getProfile();
        if (response.success) {
          const userData = response.data;
          setUser({
            id_usuario: userData.id_usuario,
            nombre_completo: userData.nombre_completo,
            email: userData.email,
            telefono: userData.telefono,
            direccion: userData.direccion,
            ciudad: userData.ciudad,
            documento: userData.documento,
            fecha_nacimiento: userData.fecha_nacimiento,
            estado: userData.estado as any,
            roles: userData.roles,
            fecha_registro: '',
          });
          await saveUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      await removeToken();
      await removeUser();
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LOGIN =====
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginService(email, password);

      if (response.success) {
        const { token, usuario } = response.data;
        await saveToken(token);
        await saveUser(usuario);
        setUser(usuario as any);
        setIsAuthenticated(true);
        return { success: true, user: usuario };
      } else {
        return { success: false, message: response.message || 'Error al iniciar sesión' };
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ===== REGISTER =====
  const register = async (userData: any) => {
    try {
      setIsLoading(true);

      const dataToSend = {
        ...userData,
        rol: 'CLIENTE'
      };

      const response = await apiClient.post('/usuarios/registro', dataToSend);

      if (response.data?.success && response.data?.data) {
        const { token, usuario } = response.data.data;

        await saveToken(token);
        await saveUser(usuario);
        setUser(usuario);
        setIsAuthenticated(true);

        return {
          success: true,
          message: 'Usuario registrado exitosamente',
          user: usuario
        };
      }

      return {
        success: false,
        message: response.data?.message || 'Error al registrar usuario'
      };
    } catch (error: any) {
      console.error('Error en register:', error);

      let message = 'Error al registrar usuario. Intenta nuevamente.';

      if (error.response?.status === 400) {
        message = error.response?.data?.message || 'Datos inválidos. Verifica los campos.';
      } else if (error.response?.status === 409) {
        message = error.response?.data?.message || 'El email o documento ya está registrado.';
      }

      return {
        success: false,
        message
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LOGOUT =====
  const logout = async () => {
    try {
      await removeToken();
      await removeUser();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);