// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// ✅ Agregar 'rol' a la interfaz User
interface User {
  id: string;
  nombre_completo: string;
  email: string;
  roles: string[];
  rol?: string;  // ← Agregamos rol como opcional
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (userData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulación de login
      const mockUser: User = {
        id: '1',
        nombre_completo: 'Usuario Prueba',
        email: email,
        roles: ['CLIENTE'],
        rol: 'CLIENTE',  // ← Agregamos rol también
      };

      setUser(mockUser);
      setLoading(false);
      return { success: true };

    } catch (error: any) {
      setLoading(false);
      return { 
        success: false, 
        message: error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (userData: any) => {
    try {
      console.log('Registrando usuario:', userData);
      return { success: true };
    } catch (error) {
      console.error('Error al registrar:', error);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};