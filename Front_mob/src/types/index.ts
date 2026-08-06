// src/types/index.ts
// USUARIO
export interface Usuario {
  id_usuario: number;
  nombre_completo: string;
  telefono: string;
  fecha_nacimiento: string;
  documento: number;
  ciudad: string;
  direccion: string;
  fecha_registro: string;
  email: string;
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
  roles?: string[];
}

// REGISTRO

export interface RegisterRequest {
  nombre_completo: string;
  telefono: string;
  fecha_nacimiento: string;
  documento: number;
  ciudad: string;
  direccion: string;
  email: string;
  contrasena: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    usuario: {
      id: number;
      nombre_completo: string;
      email: string;
      telefono: string;
      ciudad: string;
    };
    token: string;
  };
}

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
  };
}

export interface UpdateProfileRequest {
  nombre_completo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: any;
}