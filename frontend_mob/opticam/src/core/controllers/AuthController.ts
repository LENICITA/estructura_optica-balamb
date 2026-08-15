// src/core/controllers/AuthController.ts
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { UserModel } from '../models/UserModel';

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: UserModel;
  token?: string;
}

export interface RegisterResult {
  success: boolean;
  message?: string;
  user?: UserModel;
  token?: string;
}

export class AuthController {
  private authService: AuthService;
  private userRepository: UserRepository;

  constructor() {
    this.authService = new AuthService();
    this.userRepository = new UserRepository();
  }

  // LOGIN

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email y contraseña son requeridos' };
      }

      const response = await this.authService.login(email.trim().toLowerCase(), password);

      if (!response.success) {
        return { success: false, message: response.message || 'Credenciales inválidas' };
      }

      const { token, usuario } = response.data;

      const tokenString = typeof token === 'string' ? token : token?.token;
      if (!tokenString) {
        return { success: false, message: 'No se recibió un token válido' };
      }

      let rolesArray: string[] = [];
      if (Array.isArray(usuario.roles)) {
        rolesArray = usuario.roles.map((r: any) =>
          typeof r === 'string' ? r : r.nombre || r.rol || r
        );
      } else if (usuario.roles) {
        rolesArray = [usuario.roles];
      } else {
        rolesArray = ['CLIENTE'];
      }
      rolesArray = rolesArray.map((role) => role.toUpperCase());

      const userData = {
        id_usuario: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        telefono: usuario.telefono || '',
        ciudad: usuario.ciudad || '',
        direccion: '',
        documento: 0,
        fecha_nacimiento: '',
        fecha_registro: '',
        estado: 'ACTIVO' as const,
        roles: rolesArray,
      };

      const userModel = UserModel.fromJSON(userData);

      await this.userRepository.saveToken(tokenString);
      await this.userRepository.saveUser(userModel);

      return {
        success: true,
        user: userModel,
        token: token,
      };

    } catch (error: any) {
      console.error('❌ Error en login:', error);
      let message = 'Error al iniciar sesión';
      if (error.response?.status === 401) {
        message = error.response?.data?.message || 'Credenciales inválidas';
      } else if (error.response?.status === 403) {
        message = error.response?.data?.message || 'Usuario inactivo';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      return { success: false, message };
    }
  }

  // REGISTER

  async register(userData: any): Promise<RegisterResult> {
    try {
      if (!userData.nombre_completo || !userData.email || !userData.contrasena) {
        return { success: false, message: 'Nombre, email y contraseña son requeridos' };
      }
      if (userData.contrasena.length < 8) {
        return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
      }

      const dataToSend = {
        ...userData,
        rol: 'CLIENTE',
        email: userData.email.trim().toLowerCase(),
      };

      const response = await this.authService.register(dataToSend);

      if (!response.success) {
        return { success: false, message: response.message || 'Error al registrar usuario' };
      }

      const { token, usuario } = response.data;

      const tokenString = typeof token === 'string' ? token : token?.token;
      if (!tokenString) {
        return { success: false, message: 'No se recibió un token válido' };
      }

      let rolesArray: string[] = [];
      if (Array.isArray(usuario.roles)) {
        rolesArray = usuario.roles.map((r: any) =>
          typeof r === 'string' ? r : r.nombre || r.rol || r
        );
      } else if (usuario.roles) {
        rolesArray = [usuario.roles];
      } else {
        rolesArray = ['CLIENTE'];
      }
      rolesArray = rolesArray.map((role) => role.toUpperCase());

      const userModel = UserModel.fromJSON({
        id_usuario: usuario.id,
        nombre_completo: usuario.nombre_completo,
        email: usuario.email,
        telefono: usuario.telefono || '',
        ciudad: usuario.ciudad || '',
        direccion: '',
        documento: 0,
        fecha_nacimiento: '',
        fecha_registro: '',
        estado: 'ACTIVO' as const,
        roles: rolesArray,
      });

      await this.userRepository.saveToken(tokenString);
      await this.userRepository.saveUser(userModel);

      return {
        success: true,
        user: userModel,
        token: token,
      };

    } catch (error: any) {
      console.error(' Error en register:', error);
      let message = 'Error al registrar usuario';
      if (error.response?.status === 400) {
        message = error.response?.data?.message || 'Datos inválidos. Verifica los campos.';
      } else if (error.response?.status === 409) {
        message = error.response?.data?.message || 'El email o documento ya está registrado.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      return { success: false, message };
    }
  }

  // LOGOUT

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await this.userRepository.clearSession();
      try {
        await this.authService.logout();
      } catch (e) {
        // Ignorar errores del backend
      }
      return { success: true, message: 'Sesión cerrada correctamente' };
    } catch (error) {
      console.error(' Error en logout:', error);
      return { success: false, message: 'Error al cerrar sesión' };
    }
  }

  // CARGAR USUARIO

  async loadUser(): Promise<UserModel | null> {
    try {
      const token = await this.userRepository.getToken();
      if (!token) return null;

      const storedUser = await this.userRepository.getUser();
      if (storedUser) return storedUser;

      const response = await this.authService.verifyToken();

      if (response.success && response.data?.usuario) {
        const userData = response.data.usuario;
        const userModel = UserModel.fromJSON({
          id_usuario: userData.id,
          nombre_completo: userData.nombre_completo,
          email: userData.email,
          telefono: userData.telefono || '',
          direccion: userData.direccion || '',
          ciudad: userData.ciudad || '',
          documento: userData.documento || 0,
          fecha_nacimiento: userData.fecha_nacimiento || '',
          fecha_registro: '',
          estado: userData.estado || 'ACTIVO',
          roles: userData.roles || [],
        });
        await this.userRepository.saveUser(userModel);
        return userModel;
      }
      return null;
    } catch (error) {
      console.error(' Error en loadUser:', error);
      await this.userRepository.clearSession();
      return null;
    }
  }

  // RECUPERAR CONTRASEÑA

  async solicitarRecuperacion(email: string): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const response = await this.authService.solicitarRecuperacion(email.trim().toLowerCase());
      if (!response.success) {
        return { success: false, message: response.message || 'Error al enviar el correo' };
      }
      return {
        success: true,
        message: response.message || 'Correo enviado correctamente',
        token: response.token,
      };
    } catch (error: any) {
      console.error(' Error en solicitarRecuperacion:', error);
      let message = 'Error al procesar la solicitud';
      if (error.response?.status === 404) {
        message = 'No existe una cuenta con este email';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      return { success: false, message };
    }
  }

  async verificarTokenRecuperacion(token: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!token) {
        return { success: false, message: 'Token requerido' };
      }
      const response = await this.authService.verificarTokenRecuperacion(token);
      if (!response.success) {
        return { success: false, message: response.message || 'Token inválido o expirado' };
      }
      return {
        success: true,
        message: response.message || 'Token válido',
        data: response.data,
      };
    } catch (error: any) {
      console.error(' Error en verificarTokenRecuperacion:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al verificar el token',
      };
    }
  }

  async resetearPassword(token: string, nuevaContrasena: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!token || !nuevaContrasena) {
        return { success: false, message: 'Token y nueva contraseña son requeridos' };
      }
      if (nuevaContrasena.length < 8) {
        return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
      }

      const response = await this.authService.resetearPassword(token, nuevaContrasena);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al resetear la contraseña' };
      }
      return {
        success: true,
        message: response.message || 'Contraseña actualizada correctamente',
      };
    } catch (error: any) {
      console.error(' Error en resetearPassword:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al resetear la contraseña',
      };
    }
  }

  // VERIFICAR TOKEN

  async verifyToken(): Promise<{ success: boolean; data?: any }> {
    try {
      const response = await this.authService.verifyToken();
      if (!response.success) {
        return { success: false };
      }
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Error en verifyToken:', error);
      return { success: false };
    }
  }
}