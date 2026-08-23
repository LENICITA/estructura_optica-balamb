// src/core/models/UserModel.ts

export interface Role {
  id_rol?: number;
  nombre: string;
}

// ✅ MOVER ESTAS INTERFACES AQUÍ (desde UserService)
export interface ProfileResponse {
  success: boolean;
  data: {
    id_usuario: number;
    nombre_completo: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    documento: number;
    fecha_nacimiento: string;
    estado: string;
    roles: string[];
    vehiculo?: {
      id_vehiculo?: number;
      tipo: string;
      modelo: string;
      placa: string;
      color: string;
    };
  };
}

export interface UpdateProfileRequest {
  nombre_completo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  email?: string;
  fecha_nacimiento?: string;
  documento?: string | number;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface User {
  id_usuario: number;
  nombre_completo: string;
  telefono: string;
  fecha_nacimiento: string;
  documento: number;
  ciudad: string;
  direccion: string;
  fecha_registro: string;
  email: string;
  contrasena?: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  roles?: Role[] | string[];
  vehiculo?: {
    tipo: string;
    modelo: string;
    placa: string;
    color: string;
  };
}

export class UserModel implements User {
  id_usuario: number;
  nombre_completo: string;
  telefono: string;
  fecha_nacimiento: string;
  documento: number;
  ciudad: string;
  direccion: string;
  fecha_registro: string;
  email: string;
  contrasena?: string | undefined;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  roles?: Role[] | string[];
  vehiculo?: {
    tipo: string;
    modelo: string;
    placa: string;
    color: string;
  };

  constructor(data: User) {
    this.id_usuario = data.id_usuario;
    this.nombre_completo = data.nombre_completo;
    this.telefono = data.telefono;
    this.fecha_nacimiento = data.fecha_nacimiento;
    this.documento = data.documento;
    this.ciudad = data.ciudad;
    this.direccion = data.direccion;
    this.fecha_registro = data.fecha_registro;
    this.email = data.email;
    this.contrasena = data.contrasena;
    this.estado = data.estado;
    this.roles = data.roles || [];
    this.vehiculo = data.vehiculo;
  }

  // Obtener roles como array de strings
  getRoles(): string[] {
    if (!this.roles) return [];

    if (Array.isArray(this.roles) && this.roles.length > 0) {
      if (typeof this.roles[0] === 'string') {
        return this.roles as string[];
      }
      return (this.roles as Role[]).map(r => r.nombre);
    }
    return [];
  }

  // Verificar si tiene un rol específico
  hasRole(roleName: string): boolean {
    const roles = this.getRoles();
    return roles.some(r => r.toUpperCase() === roleName.toUpperCase());
  }

  // Verificar si es administrador
  get isAdmin(): boolean {
    return this.hasRole('ADMIN') || this.hasRole('ADMINISTRADOR');
  }

  // Verificar si es cliente
  get isClient(): boolean {
    return this.hasRole('CLIENTE');
  }

  // Verificar si es repartidor
  get isDelivery(): boolean {
    return this.hasRole('REPARTIDOR');
  }

  // Obtener nombre para mostrar (primer nombre)
  get displayName(): string {
    return this.nombre_completo.split(' ')[0] || this.nombre_completo;
  }

  // Crear desde JSON del backend
  static fromJSON(data: any): UserModel {
    return new UserModel({
      id_usuario: data.id_usuario || data.id || 0,
      nombre_completo: data.nombre_completo || data.nombre || '',
      telefono: data.telefono || '',
      fecha_nacimiento: data.fecha_nacimiento || '',
      documento: data.documento || 0,
      ciudad: data.ciudad || '',
      direccion: data.direccion || '',
      fecha_registro: data.fecha_registro || new Date().toISOString(),
      email: data.email || '',
      contrasena: data.contrasena || '',
      estado: data.estado || 'ACTIVO',
      roles: data.roles || [],
      vehiculo: data.vehiculo,
    });
  }
}