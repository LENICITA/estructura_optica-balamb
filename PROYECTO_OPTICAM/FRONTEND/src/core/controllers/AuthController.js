import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { UserModel } from '../../shared/types/UserModel';
import { validarFormularioCliente } from '../../shared/validators/userValidators';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.userRepository = new UserRepository();
  }

  _normalizarRoles(roles) {
    let rolesArray = [];
    if (Array.isArray(roles)) {
      rolesArray = roles.map((r) =>
        typeof r === 'string' ? r : r.nombre || r.rol || r
      );
    } else if (roles) {
      rolesArray = [roles];
    } else {
      rolesArray = ['CLIENTE'];
    }
    return rolesArray.map((role) => role.toUpperCase());
  }

  async _procesarSesionAutenticada({ token, usuario }) {
    const tokenString = typeof token === 'string' ? token : token?.token;
    if (!tokenString) {
      return { success: false, message: 'No se recibió un token válido' };
    }

    const rolesArray = this._normalizarRoles(usuario.roles);

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
      estado: 'ACTIVO',
      roles: rolesArray,
    });

    await this.userRepository.saveToken(tokenString);
    await this.userRepository.saveUser(userModel);

    return { success: true, user: userModel, token };
  }

  _mapearUsuarioDesdeBackend(userData) {
    return UserModel.fromJSON({
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
  }

  _manejarErrorAuth(error, mensajePorDefecto, mensajesPorStatus = {}) {
    console.error(`${mensajePorDefecto}:`, error);
    let message = mensajePorDefecto;

    const status = error.response?.status;
    if (status && mensajesPorStatus[status]) {
      message = error.response?.data?.message || mensajesPorStatus[status];
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    return { success: false, message };
  }

  async login(email, password) {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email y contraseña son requeridos' };
      }

      const response = await this.authService.login(
        email.trim().toLowerCase(),
        password
      );

      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Credenciales inválidas',
        };
      }

      return await this._procesarSesionAutenticada(response.data);
    } catch (error) {
      return this._manejarErrorAuth(error, 'Error al iniciar sesión', {
        401: 'Credenciales inválidas',
        403: 'Usuario inactivo',
      });
    }
  }

  async register(userData) {
    try {
      const check = validarFormularioCliente({
        nombre_completo: userData.nombre_completo,
        telefono: userData.telefono,
        fecha_nacimiento: userData.fecha_nacimiento,
        documento: userData.documento,
        ciudad: userData.ciudad,
        direccion: userData.direccion,
        email: userData.email,
        contrasena: userData.contrasena,
      });

      if (!check.valido) {
        return { success: false, message: check.mensaje || 'Datos inválidos' };
      }

      const dataToSend = {
        ...userData,
        rol: 'CLIENTE',
        email: userData.email.trim().toLowerCase(),
      };

      const response = await this.authService.register(dataToSend);

      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Error al registrar usuario',
        };
      }

      return await this._procesarSesionAutenticada(response.data);
    } catch (error) {
      return this._manejarErrorAuth(error, 'Error al registrar usuario', {
        400: 'Datos inválidos. Verifica los campos.',
        409: 'El email o documento ya está registrado.',
      });
    }
  }

  async logout() {
    try {
      await this.userRepository.clearSession();
      try {
        await this.authService.logout();
      } catch (e) {
      }
      return { success: true, message: 'Sesión cerrada correctamente' };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, message: 'Error al cerrar sesión' };
    }
  }

  async loadUser() {
    try {
      const token = await this.userRepository.getToken();
      if (!token) return null;

      const storedUser = await this.userRepository.getUser();
      if (storedUser) return storedUser;

      const response = await this.authService.verifyToken();
      if (response.success && response.data?.usuario) {
        const userModel = this._mapearUsuarioDesdeBackend(response.data.usuario);
        await this.userRepository.saveUser(userModel);
        return userModel;
      }

      return null;
    } catch (error) {
      console.error('Error en loadUser:', error);
      await this.userRepository.clearSession();
      return null;
    }
  }

  async solicitarRecuperacion(email) {
    try {
      const response = await this.authService.solicitarRecuperacion(
        email.trim().toLowerCase()
      );

      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Error al enviar el correo',
        };
      }

      return {
        success: true,
        message: response.message || 'Correo enviado correctamente',
        token: response.token,
      };
    } catch (error) {
      return this._manejarErrorAuth(error, 'Error al procesar la solicitud', {
        404: 'No existe una cuenta con este email',
      });
    }
  }

  async verificarTokenRecuperacion(token) {
    try {
      if (!token) {
        return { success: false, message: 'Token requerido' };
      }

      const response = await this.authService.verificarTokenRecuperacion(token);

      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Token inválido o expirado',
        };
      }

      return {
        success: true,
        message: response.message || 'Token válido',
        data: response.data,
      };
    } catch (error) {
      console.error('Error en verificarTokenRecuperacion:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al verificar el token',
      };
    }
  }

  async resetearPassword(token, nuevaContrasena) {
    try {
      if (!token || !nuevaContrasena) {
        return {
          success: false,
          message: 'Token y nueva contraseña son requeridos',
        };
      }

      if (nuevaContrasena.length < 8) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres',
        };
      }

      const response = await this.authService.resetearPassword(
        token,
        nuevaContrasena
      );

      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Error al resetear la contraseña',
        };
      }

      return {
        success: true,
        message: response.message || 'Contraseña actualizada correctamente',
      };
    } catch (error) {
      return this._manejarErrorAuth(
        error,
        'Error al resetear la contraseña'
      );
    }
  }

  async verifyToken() {
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
      console.error('Error en verifyToken:', error);
      return { success: false };
    }
  }
}