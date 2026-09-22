// src/core/controllers/UserController.js
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { UserModel } from '../../shared/types/UserModel';
import {
  validarFormularioCliente,
  validarFormularioRepartidor,
  checkTelefono,
  checkCiudad,
  checkEmail,
  checkNombre
} from '../../shared/validators/userValidators';

export class UserController {
  constructor() {
    this.userService = new UserService();
    this.userRepository = new UserRepository();
  }

  // ============================================
  // PERFIL
  // ============================================

  async getProfile() {
    try {
      const response = await this.userService.getProfile();
      if (!response.success) return null;

      const userData = response.data;

      const userModel = UserModel.fromJSON({
        id_usuario: userData.id_usuario,
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
        vehiculo: userData.vehiculo,
      });

      return userModel;
    } catch (error) {
      console.error(' Error en getProfile:', error);
      return null;
    }
  }

  async updateProfile(data, userRoles) {
    try {
      if (userRoles && userRoles.some(r => r.toUpperCase() === 'REPARTIDOR')) {
        return {
          success: false,
          message: 'Los repartidores no pueden editar su perfil. Contacta al administrador.'
        };
      }

      // Validaciones por campo (solo si vienen)
      if (data.nombre_completo) {
        const check = checkNombre(data.nombre_completo);
        if (!check.valido) return { success: false, message: check.mensaje };
      }
      if (data.email) {
        const check = checkEmail(data.email);
        if (!check.valido) return { success: false, message: check.mensaje };
      }
      if (data.telefono) {
        const check = checkTelefono(data.telefono);
        if (!check.valido) return { success: false, message: check.mensaje };
      }
      if (data.ciudad) {
        const check = checkCiudad(data.ciudad);
        if (!check.valido) return { success: false, message: check.mensaje };
      }

      const response = await this.userService.updateProfile(data);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al actualizar perfil' };
      }
      await this.getProfile();
      return {
        success: true,
        message: response.message || 'Perfil actualizado correctamente',
        data: response.data,
      };
    } catch (error) {
      console.error(' Error en updateProfile:', error);
      let message = 'Error al actualizar perfil';
      if (error.response?.status === 400) {
        message = error.response?.data?.message || 'Datos inválidos';
      } else if (error.response?.status === 409) {
        message = error.response?.data?.message || 'El email o documento ya está registrado';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      return { success: false, message };
    }
  }

  // ============================================
  // CLIENTES
  // ============================================

  async registrarCliente(data) {
    try {
      const check = validarFormularioCliente({
        nombre_completo: data.nombre_completo,
        telefono: data.telefono,
        fecha_nacimiento: data.fecha_nacimiento,
        documento: data.documento,
        ciudad: data.ciudad,
        direccion: data.direccion,
        email: data.email,
        contrasena: data.contrasena,
      });

      if (!check.valido) {
        return { success: false, message: check.mensaje || 'Datos inválidos' };
      }

      const response = await this.userService.registrarCliente(data);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al registrar cliente' };
      }
      return {
        success: true,
        message: response.message || 'Cliente registrado correctamente',
        data: response.data,
      };
    } catch (error) {
      console.error(' Error en registrarCliente:', error);
      let message = 'Error al registrar cliente';
      if (error.response?.status === 400) {
        message = error.response?.data?.message || 'Datos inválidos';
      } else if (error.response?.status === 409) {
        message = error.response?.data?.message || 'El email o documento ya está registrado';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      return { success: false, message };
    }
  }

  async countClientes() {
    try {
      const response = await this.userService.countClientes();
      return response;
    } catch (error) {
      console.error(' Error en countClientes:', error);
      return { success: false, data: { total: 0 } };
    }
  }

  // ============================================
  // REPARTIDORES
  // ============================================

  async getRepartidores() {
    try {
      const response = await this.userService.getRepartidores();
      if (!response.success) return [];

      return response.data.map((r) =>
        UserModel.fromJSON({
          id_usuario: r.id_usuario || r.id || 0,
          nombre_completo: r.nombre_completo || r.nombre || '',
          telefono: r.telefono || '',
          fecha_nacimiento: r.fecha_nacimiento || '',
          documento: r.documento || 0,
          ciudad: r.ciudad || '',
          direccion: r.direccion || '',
          fecha_registro: r.fecha_registro || new Date().toISOString(),
          email: r.email || '',
          estado: r.estado || 'INACTIVO',
          roles: r.roles || [],
          vehiculo: r.vehiculo ? {
            tipo: r.vehiculo.tipo,
            modelo: r.vehiculo.modelo,
            placa: r.vehiculo.placa,
            color: r.vehiculo.color,
          } : undefined,
        })
      );
    } catch (error) {
      console.error(' Error en getRepartidores:', error);
      return [];
    }
  }

  async getRepartidorById(id) {
    try {
      console.log('🔍 Fetching repartidor details for ID:', id);
      const response = await this.userService.getRepartidorById(id);
      if (!response.success) return null;

      const r = response.data;
      return UserModel.fromJSON({
        id_usuario: r.id_usuario || r.id || 0,
        nombre_completo: r.nombre_completo || r.nombre || '',
        telefono: r.telefono || '',
        fecha_nacimiento: r.fecha_nacimiento || '',
        documento: r.documento || 0,
        ciudad: r.ciudad || '',
        direccion: r.direccion || '',
        fecha_registro: r.fecha_registro || '',
        email: r.email || '',
        estado: r.estado || 'INACTIVO',
        roles: r.roles || [],
        vehiculo: r.vehiculo ? {
          tipo: r.vehiculo.tipo,
          modelo: r.vehiculo.modelo,
          placa: r.vehiculo.placa,
          color: r.vehiculo.color,
        } : undefined,
      });
    } catch (error) {
      console.error(' Error en getRepartidorById:', error);
      return null;
    }
  }

  async registrarRepartidor(data) {
    try {
      const check = validarFormularioRepartidor({
        nombre_completo: data.nombre_completo,
        telefono: data.telefono,
        fecha_nacimiento: data.fecha_nacimiento,
        documento: String(data.documento || ''),
        ciudad: data.ciudad,
        direccion: data.direccion,
        email: data.email,
        contrasena: data.contrasena || '',
        vehiculo: data.vehiculo ? {
          tipo: data.vehiculo.tipo,
          modelo: data.vehiculo.modelo,
          placa: data.vehiculo.placa,
          color: data.vehiculo.color,
        } : undefined,
      });

      if (!check.valido) {
        return { success: false, message: check.mensaje || 'Datos inválidos' };
      }

      const response = await this.userService.registrarRepartidor(data);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al registrar repartidor' };
      }
      return {
        success: true,
        message: response.message || 'Repartidor registrado correctamente',
        data: response.data,
      };
    } catch (error) {
      console.error(' Error en registrarRepartidor:', error);
      let message = 'Error al registrar repartidor';
      if (error.response?.status === 400) {
        message = error.response?.data?.message || 'Datos inválidos';
      } else if (error.response?.status === 409) {
        message = error.response?.data?.message || 'El email, documento o placa ya está registrado';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      return { success: false, message };
    }
  }

  async actualizarRepartidor(id, data) {
    try {
      if (data.telefono) {
        const check = checkTelefono(data.telefono);
        if (!check.valido) return { success: false, message: check.mensaje };
      }
      if (data.ciudad) {
        const check = checkCiudad(data.ciudad);
        if (!check.valido) return { success: false, message: check.mensaje };
      }
      if (data.email) {
        const check = checkEmail(data.email);
        if (!check.valido) return { success: false, message: check.mensaje };
      }

      const response = await this.userService.actualizarRepartidor(id, data);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al actualizar repartidor' };
      }
      return {
        success: true,
        message: response.message || 'Repartidor actualizado correctamente',
        data: response.data,
      };
    } catch (error) {
      console.error(' Error en actualizarRepartidor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar repartidor',
      };
    }
  }

  async cambiarEstadoRepartidor(id, estado) {
    try {
      if (!['ACTIVO', 'INACTIVO', 'SUSPENDIDO'].includes(estado)) {
        return { success: false, message: 'Estado inválido' };
      }
      const response = await this.userService.cambiarEstadoRepartidor(id, estado);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al cambiar estado' };
      }
      return {
        success: true,
        message: response.message || 'Estado actualizado correctamente',
      };
    } catch (error) {
      console.error(' Error en cambiarEstadoRepartidor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cambiar estado',
      };
    }
  }

  async eliminarRepartidor(id) {
    try {
      const response = await this.userService.eliminarRepartidor(id);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al eliminar repartidor' };
      }
      return {
        success: true,
        message: response.message || 'Repartidor eliminado correctamente',
      };
    } catch (error) {
      console.error(' Error en eliminarRepartidor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar repartidor',
      };
    }
  }

  async buscarRepartidores(filtros) {
    try {
      const response = await this.userService.buscarRepartidores(filtros);
      if (!response.success) return [];

      return response.data.map((r) => ({
        id: r.id_usuario || r.id,
        nombre: r.nombre_completo || r.nombre,
        estado: r.estado || 'INACTIVO',
        correo: r.email,
        telefono: r.telefono,
        ciudad: r.ciudad,
        pedidos: r.pedidos_count || 0,
        fecha_registro: r.fecha_registro || new Date().toISOString(),
        vehiculo: r.vehiculo ? {
          tipo: r.vehiculo.tipo,
          modelo: r.vehiculo.modelo,
          placa: r.vehiculo.placa,
          color: r.vehiculo.color,
        } : undefined,
      }));
    } catch (error) {
      console.error(' Error en buscarRepartidores:', error);
      return [];
    }
  }

  // ============================================
  // SESIÓN
  // ============================================

  async loadUser() {
    try {
      const token = await this.userRepository.getToken();
      if (!token) return null;

      const storedUser = await this.userRepository.getUser();
      if (storedUser) return storedUser;

      const response = await this.userService.getProfile();
      if (response.success) {
        const userData = response.data;
        const userModel = UserModel.fromJSON({
          id_usuario: userData.id_usuario,
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
}