// src/core/controllers/UserController.ts
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { UserModel } from '../models/UserModel';

export interface RepartidorData {
  id: number;
  nombre: string;
  estado: string;
  correo?: string;
  telefono?: string;
  ciudad?: string;
  pedidos?: number;
  fecha_registro: string;
  vehiculo?: {
    tipo: string;
    modelo: string;
    placa: string;
    color: string;
  };
}

export interface RegisterRepartidorData {
  nombre_completo: string;
  telefono: string;
  fecha_nacimiento: string;
  documento: string;
  ciudad: string;
  direccion: string;
  email: string;
  contrasena: string;
  vehiculo: {
    tipo: string;
    modelo: string;
    placa: string;
    color: string;
  };
}

export class UserController {
  private userService: UserService;
  private userRepository: UserRepository;

  constructor() {
    this.userService = new UserService();
    this.userRepository = new UserRepository();
  }

  // ============================================
  // PERFIL
  // ============================================

  async getProfile(): Promise<UserModel | null> {
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

  async updateProfile(
    data: {
      nombre_completo?: string;
      telefono?: string;
      direccion?: string;
      ciudad?: string;
      email?: string;
      fecha_nacimiento?: string;
      documento?: string | number;
    },
    userRoles?: string[]
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (userRoles && userRoles.some(r => r.toUpperCase() === 'REPARTIDOR')) {
        return {
          success: false,
          message: 'Los repartidores no pueden editar su perfil. Contacta al administrador.'
        };
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
    } catch (error: any) {
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

  async registrarCliente(data: {
    nombre_completo: string;
    telefono: string;
    fecha_nacimiento: string;
    documento: string;
    ciudad: string;
    direccion: string;
    email: string;
    contrasena: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!data.nombre_completo || !data.email || !data.contrasena) {
        return { success: false, message: 'Nombre, email y contraseña son requeridos' };
      }
      if (data.contrasena.length < 8) {
        return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
      }
      if (!data.telefono) {
        return { success: false, message: 'El teléfono es requerido' };
      }
      if (!data.documento) {
        return { success: false, message: 'El documento es requerido' };
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
    } catch (error: any) {
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

  async countClientes(): Promise<{ success: boolean; data: { total: number } }> {
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

  async getRepartidores(): Promise<RepartidorData[]> {
    try {
      const response = await this.userService.getRepartidores();
      if (!response.success) return [];

      return response.data.map((r: any) => ({
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
      console.error(' Error en getRepartidores:', error);
      return [];
    }
  }

  async getRepartidorById(id: number): Promise<RepartidorData | null> {
    try {
      const response = await this.userService.getRepartidorById(id);
      if (!response.success) return null;

      const r = response.data;
      return {
        id: r.id_usuario,
        nombre: r.nombre_completo,
        estado: r.estado,
        correo: r.email,
        telefono: r.telefono,
        ciudad: r.ciudad,
        pedidos: r.pedidos_count || 0,
        fecha_registro: r.fecha_registro,
        vehiculo: r.vehiculo ? {
          tipo: r.vehiculo.tipo,
          modelo: r.vehiculo.modelo,
          placa: r.vehiculo.placa,
          color: r.vehiculo.color,
        } : undefined,
      };
    } catch (error) {
      console.error(' Error en getRepartidorById:', error);
      return null;
    }
  }

  async registrarRepartidor(data: RegisterRepartidorData): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      if (!data.nombre_completo || !data.email || !data.contrasena) {
        return { success: false, message: 'Nombre, email y contraseña son requeridos' };
      }
      if (data.contrasena.length < 8) {
        return { success: false, message: 'La contraseña debe tener al menos 8 caracteres' };
      }
      if (!data.vehiculo || !data.vehiculo.placa) {
        return { success: false, message: 'Los datos del vehículo son requeridos' };
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
    } catch (error: any) {
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

  async actualizarRepartidor(id: number, data: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await this.userService.actualizarRepartidor(id, data);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al actualizar repartidor' };
      }
      return {
        success: true,
        message: response.message || 'Repartidor actualizado correctamente',
        data: response.data,
      };
    } catch (error: any) {
      console.error(' Error en actualizarRepartidor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar repartidor',
      };
    }
  }

  async cambiarEstadoRepartidor(id: number, estado: string): Promise<{ success: boolean; message: string }> {
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
    } catch (error: any) {
      console.error(' Error en cambiarEstadoRepartidor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cambiar estado',
      };
    }
  }

  async eliminarRepartidor(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.userService.eliminarRepartidor(id);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al eliminar repartidor' };
      }
      return {
        success: true,
        message: response.message || 'Repartidor eliminado correctamente',
      };
    } catch (error: any) {
      console.error(' Error en eliminarRepartidor:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar repartidor',
      };
    }
  }

  async buscarRepartidores(filtros: { nombre?: string; ciudad?: string; estado?: string; placa?: string }): Promise<RepartidorData[]> {
    try {
      const response = await this.userService.buscarRepartidores(filtros);
      if (!response.success) return [];

      return response.data.map((r: any) => ({
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

  async loadUser(): Promise<UserModel | null> {
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