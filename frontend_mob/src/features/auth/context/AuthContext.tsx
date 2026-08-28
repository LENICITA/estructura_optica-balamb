// src/features/auth/context/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { AuthController } from '../../../core/controllers/AuthController';
import { UserController } from '../../../core/controllers/UserController';
import { UserModel } from '../../../core/models/UserModel';

// ============================================
// TIPOS
// ============================================
interface AuthContextProps {
  user: UserModel | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    message?: string;
    user?: UserModel;
  }>;
  register: (userData: any) => Promise<{
    success: boolean;
    message?: string;
    user?: UserModel;
  }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: () => Promise<void>;
}

// ============================================
// CREAR CONTEXT
// ============================================
const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

// ============================================
// PROVIDER
// ============================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ===== ESTADO =====
  const [user, setUser] = useState<UserModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ===== INSTANCIAS DE CONTROLADORES =====
  const authController = new AuthController();
  const userController = new UserController();

  // ===== CARGAR USUARIO =====
  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log(' AuthContext: Cargando usuario...');

      const userModel = await authController.loadUser();

      if (userModel) {
        setUser(userModel);
        setIsAuthenticated(true);
        console.log(' AuthContext: Usuario cargado:', userModel.nombre_completo);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('ℹ AuthContext: No hay sesión activa');
      }
    } catch (error) {
      console.error(' AuthContext: Error al cargar usuario:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===== LOGIN =====
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log(' AuthContext: Iniciando login...');

      const result = await authController.login(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        console.log(' AuthContext: Login exitoso');
        return {
          success: true,
          user: result.user,
        };
      } else {
        console.log(' AuthContext: Login fallido:', result.message);
        return {
          success: false,
          message: result.message || 'Error al iniciar sesión',
        };
      }
    } catch (error: any) {
      console.error(' AuthContext: Error en login:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ===== REGISTER =====
  const register = async (userData: any) => {
    try {
      setIsLoading(true);
      console.log(' AuthContext: Iniciando registro de cliente...');

      const result = await userController.registrarCliente({
            nombre_completo: userData.nombre_completo,
            email: userData.email,
            documento: userData.documento || '',
            fecha_nacimiento: userData.fecha_nacimiento || '',
            ciudad: userData.ciudad || '',
            direccion: userData.direccion || '',
            telefono: userData.telefono || '',
            contrasena: userData.contrasena,
          });

            console.log('Resultado de registrarCliente:', result);

          if (result.success) {
        console.log(' AuthContext: Registro exitoso');
        return {
          success: true,
          message: result.message || 'Usuario registrado correctamente',
        };
      } else {
        console.log(' AuthContext: Registro fallido:', result.message);
        return {
          success: false,
          message: result.message || 'Error al registrar usuario',
        };
      }
    } catch (error: any) {
      console.error(' AuthContext: Error en registro:', error);
      return {
        success: false,
        message: error.message || 'Error al registrar usuario',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ===== LOGOUT =====
  const logout = async () => {
    try {
      setIsLoading(true);
      console.log(' AuthContext: Cerrando sesión...');

      await authController.logout();

      setUser(null);
      setIsAuthenticated(false);
      console.log(' AuthContext: Sesión cerrada');
    } catch (error) {
      console.error(' AuthContext: Error en logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== ACTUALIZAR USUARIO =====
  const updateUser = async () => {
    try {
      console.log(' AuthContext: Actualizando usuario...');
      const userModel = await userController.getProfile();

      if (userModel) {
        setUser(userModel);
        setIsAuthenticated(true);
        console.log(' AuthContext: Usuario actualizado');
      } else {
        // Si no se pudo obtener, recargar desde auth
        await loadUser();
      }
    } catch (error) {
      console.error(' AuthContext: Error al actualizar usuario:', error);
    }
  };

  // ===== EFECTO INICIAL =====
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // ============================================
  // PROVIDER VALUE
  // ============================================
  const value: AuthContextProps = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK PERSONALIZADO
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};