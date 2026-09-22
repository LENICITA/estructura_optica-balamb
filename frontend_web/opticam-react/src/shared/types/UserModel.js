// src/shared/types/UserModel.js

export class UserModel {
  constructor(data) {
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
  getRoles() {
    if (!this.roles) return [];

    if (Array.isArray(this.roles) && this.roles.length > 0) {
      if (typeof this.roles[0] === 'string') {
        return this.roles;
      }
      return this.roles.map(r => r.nombre);
    }
    return [];
  }

  // Verificar si tiene un rol específico
  hasRole(roleName) {
    const roles = this.getRoles();
    return roles.some(r => r.toUpperCase() === roleName.toUpperCase());
  }

  // Verificar si es administrador
  get isAdmin() {
    return this.hasRole('ADMIN') || this.hasRole('ADMINISTRADOR');
  }

  // Verificar si es cliente
  get isClient() {
    return this.hasRole('CLIENTE');
  }

  // Verificar si es repartidor
  get isDelivery() {
    return this.hasRole('REPARTIDOR');
  }

  // Obtener nombre para mostrar (primer nombre)
  get displayName() {
    return this.nombre_completo.split(' ')[0] || this.nombre_completo;
  }

  // Crear desde JSON del backend
  static fromJSON(data) {
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