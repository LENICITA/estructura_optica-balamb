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
  checkNombre,
} from '../../shared/validators/userValidators';

// ✅ 1. Funciones auxiliares para evitar duplicaciones
const mapearVehiculo = (vehiculo) => {
  if (!vehiculo) return undefined;
  return {
    tipo: vehiculo.tipo,
    modelo: vehiculo.modelo,
    placa: vehiculo.placa,
    color: vehiculo.color,
  };
};

const mapearUserData = (data) => {
  return UserModel.fromJSON({
    id_usuario: data.id_usuario || data.id || 0,
    nombre_completo: data.nombre_completo || data.nombre || '',
    email: data.email || '',
    telefono: data.telefono || '',
    direccion: data.direccion || '',
    ciudad: data.ciudad || '',
    documento: data.documento || 0,
    fecha_nacimiento: data.fecha_nacimiento || '',
    fecha_registro: data.fecha_registro || '',
    estado: data.estado || 'ACTIVO',
    roles: data.roles || [],
    vehiculo: mapearVehiculo(data.vehiculo),
  });
};

const obtenerMensajeError = (error, mensajePorDefecto) => {
  if (error.response?.status === 400) return error.response?.data?.message || 'Datos inválidos';
  if (error.response?.status === 409) return error.response?.data?.message || 'El email o documento ya está registrado';
  return error.response?.data?.message || mensajePorDefecto;
};

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
      return mapearUserData(response.data);
    } catch (error) {
      console.error('Error en getProfile:', error);
      return null;
    }
  }

  async updateProfile(data, userRoles) {
    try {
      if (userRoles && userRoles.some((r) => r.toUpperCase() === 'REPARTIDOR')) {
        return {
          success: false,
          message: 'Los repartidores no pueden editar su perfil. Contacta al administrador.',
        };
      }

      // Validaciones por campo (solo si vienen)
      const validaciones = [
        { campo: data.nombre_completo, check: checkNombre },
        { campo: data.email, check: checkEmail },
        { campo: data.telefono, check: checkTelefono },
        { campo: data.ciudad, check: checkCiudad },
      ];

      for (const { campo, check } of validaciones) {
        if (campo) {
          const result = check(campo);
          if (!result.valido) return { success: false, message: result.mensaje };
        }
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
      console.error('Error en updateProfile:', error);
      return { success: false, message: obtenerMensajeError(error, 'Error al actualizar perfil') };
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
      console.error('Error en registrarCliente:', error);
      return { success: false, message: obtenerMensajeError(error, 'Error al registrar cliente') };
    }
  }

  async countClientes() {
    try {
      const response = await this.userService.countClientes();
      return response;
    } catch (error) {
      console.error('Error en countClientes:', error);
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
      return response.data.map(mapearUserData);
    } catch (error) {
      console.error('Error en getRepartidores:', error);
      return [];
    }
  }

  async getRepartidorById(id) {
    try {
      console.log('🔍 Fetching repartidor details for ID:', id);
      const response = await this.userService.getRepartidorById(id);
      if (!response.success) return null;
      return mapearUserData(response.data);
    } catch (error) {
      console.error('Error en getRepartidorById:', error);
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
        vehiculo: mapearVehiculo(data.vehiculo),
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
      console.error('Error en registrarRepartidor:', error);
      return { success: false, message: obtenerMensajeError(error, 'Error al registrar repartidor') };
    }
  }

  async actualizarRepartidor(id, data) {
    try {
      const validaciones = [
        { campo: data.telefono, check: checkTelefono },
        { campo: data.ciudad, check: checkCiudad },
        { campo: data.email, check: checkEmail },
      ];

      for (const { campo, check } of validaciones) {
        if (campo) {
          const result = check(campo);
          if (!result.valido) return { success: false, message: result.mensaje };
        }
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
      console.error('Error en actualizarRepartidor:', error);
      return { success: false, message: obtenerMensajeError(error, 'Error al actualizar repartidor') };
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
      console.error('Error en cambiarEstadoRepartidor:', error);
      return { success: false, message: obtenerMensajeError(error, 'Error al cambiar estado') };
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
      console.error('Error en eliminarRepartidor:', error);
      return { success: false, message: obtenerMensajeError(error, 'Error al eliminar repartidor') };
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
        vehiculo: mapearVehiculo(r.vehiculo),
      }));
    } catch (error) {
      console.error('Error en buscarRepartidores:', error);
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
        const userModel = mapearUserData(response.data);
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
}