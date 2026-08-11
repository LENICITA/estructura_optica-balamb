import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';

import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  removeToken,
  removeUser,
} from '../utils/storage';

import { login as loginService } from '../services/authService';
import { getProfile } from '../services/userService';
import { apiClient } from '../services/apiClient';
import { Usuario } from '../types/index';

interface AuthContextProps {
  user: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // CARGAR USUARIO AL INICIAR

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);

      const token = await getToken();
      const storedUser = await getUser();

      console.log(' Token almacenado:', token);
      console.log(' Usuario almacenado:', storedUser);

      // Si existen token y usuario guardados
      if (token && storedUser) {

        setUser(storedUser);
        setIsAuthenticated(true);

        console.log(' Usuario cargado desde almacenamiento');

        return;
      }

      // Si hay token pero no usuario,
      // consultar el perfil al backend
      if (token) {

        console.log(' Obteniendo perfil desde backend...');

        const response = await getProfile();

        if (response.success) {

          const userData = response.data;

          const usuarioNormalizado: Usuario = {
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
          };

          setUser(usuarioNormalizado);
          setIsAuthenticated(true);

          await saveUser(usuarioNormalizado);

          console.log(' Perfil obtenido correctamente');
        }
      }

    } catch (error) {

      console.error(' Error al cargar usuario:', error);

      await removeToken();
      await removeUser();

      setUser(null);
      setIsAuthenticated(false);

    } finally {

      setIsLoading(false);
    }
  };

  // INICIOSESION

  const login = async (
    email: string,
    password: string
  ) => {

    try {

      setIsLoading(true);

      const response = await loginService(email, password);

      if (!response.success) {

        return {
          success: false,
          message:
            response.message ||
            'Error al iniciar sesión',
        };
      }

      const { token, usuario } = response.data;

      // NORMALIZAR TOKEN

      const tokenString =
        typeof token === 'string'
          ? token
          : token?.token;

      if (!tokenString) {

        console.error(' No se recibió un token válido');

        return {
          success: false,
          message: 'No se recibió un token válido',
        };
      }

      // NORMALIZAR ROLES

      let rolesArray: string[] = [];

      if (Array.isArray(usuario.roles)) {

        rolesArray = usuario.roles.map(
          (r: any) =>
            typeof r === 'string'
              ? r
              : r.nombre || r.rol || r
        );

      } else if (usuario.roles) {

        rolesArray = [usuario.roles];

      } else if (usuario.rol) {

        rolesArray = [usuario.rol];

      } else {

        rolesArray = ['CLIENTE'];
      }

      rolesArray = rolesArray.map(
        (role) => role.toUpperCase()
      );

      // USUARIO NORMALIZADO

      const usuarioNormalizado = {
        ...usuario,
        roles: rolesArray,
      };

      console.log(
        ' Usuario normalizado:',
        JSON.stringify(
          usuarioNormalizado,
          null,
          2
        )
      );

      console.log(
        ' Guardando token:',
        tokenString
      );

      // GUARDAR SESIÓN

      await saveToken(tokenString);
      await saveUser(usuarioNormalizado);

      // ACTUALIZAR ESTADO

      setUser(usuarioNormalizado as Usuario);
      setIsAuthenticated(true);

      console.log(
        ' Sesión iniciada correctamente'
      );

      return {
        success: true,
        user: usuarioNormalizado,
      };

    } catch (error: any) {

      console.error(
        ' Error en login:',
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Error al iniciar sesión',
      };

    } finally {

      setIsLoading(false);
    }
  };

  // REGISTER

  const register = async (
    userData: any
  ) => {

    try {

      setIsLoading(true);

      const dataToSend = {
        ...userData,
        rol: 'CLIENTE',
      };

      const response =
        await apiClient.post(
          '/usuarios/registro',
          dataToSend
        );

      if (
        response.data?.success &&
        response.data?.data
      ) {

        const {
          token,
          usuario,
        } = response.data.data;

        const tokenString =
          typeof token === 'string'
            ? token
            : token?.token;

        let rolesArray: string[] = [];

        if (Array.isArray(usuario.roles)) {

          rolesArray =
            usuario.roles.map(
              (r: any) =>
                typeof r === 'string'
                  ? r
                  : r.nombre || r.rol || r
            );

        } else if (usuario.roles) {

          rolesArray = [usuario.roles];

        } else {

          rolesArray = ['CLIENTE'];
        }

        rolesArray = rolesArray.map(
          (role) => role.toUpperCase()
        );

        const usuarioNormalizado = {
          ...usuario,
          roles: rolesArray,
        };

        console.log(
          ' Usuario normalizado (register):',
          JSON.stringify(
            usuarioNormalizado,
            null,
            2
          )
        );

        await saveToken(tokenString);
        await saveUser(usuarioNormalizado);

        setUser(
          usuarioNormalizado as Usuario
        );

        setIsAuthenticated(true);

        return {
          success: true,
          message:
            'Usuario registrado exitosamente',
          user: usuarioNormalizado,
        };
      }

      return {
        success: false,
        message:
          response.data?.message ||
          'Error al registrar usuario',
      };

    } catch (error: any) {

      console.error(
        ' Error en register:',
        error
      );

      let message =
        'Error al registrar usuario. Intenta nuevamente.';

      if (error.response?.status === 400) {

        message =
          error.response?.data?.message ||
          'Datos inválidos. Verifica los campos.';

      } else if (
        error.response?.status === 409
      ) {

        message =
          error.response?.data?.message ||
          'El email o documento ya está registrado.';
      }

      return {
        success: false,
        message,
      };

    } finally {

      setIsLoading(false);
    }
  };

  // LOGOUT

  const logout = async () => {

    try {

      await removeToken();
      await removeUser();

      setUser(null);
      setIsAuthenticated(false);

    } catch (error) {

      console.error(
        ' Error en logout:',
        error
      );
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

export const useAuth = () =>
  useContext(AuthContext);