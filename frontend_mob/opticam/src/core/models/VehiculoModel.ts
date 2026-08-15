// src/core/models/VehiculoModel.ts

export interface Vehiculo {
  id_vehiculo?: number;
  id_usuario: number;
  tipo: 'CARRO' | 'MOTO';
  modelo: string;
  placa: string;
  color: string;
}

export class VehiculoModel implements Vehiculo {
  id_vehiculo?: number;
  id_usuario: number;
  tipo: 'CARRO' | 'MOTO';
  modelo: string;
  placa: string;
  color: string;

  constructor(data: Vehiculo) {
    this.id_vehiculo = data.id_vehiculo;
    this.id_usuario = data.id_usuario;
    this.tipo = data.tipo;
    this.modelo = data.modelo;
    this.placa = data.placa;
    this.color = data.color;
  }

  get tipoDisplay(): string {
    return this.tipo === 'MOTO' ? 'Moto' : 'Carro';
  }

  get iconName(): string {
    return this.tipo === 'MOTO' ? 'bicycle-outline' : 'car-outline';
  }

  static fromJSON(data: any): VehiculoModel | null {
    if (!data) return null;
    return new VehiculoModel({
      id_vehiculo: data.id_vehiculo || data.id,
      id_usuario: data.id_usuario || data.id_usuario,
      tipo: data.tipo || 'MOTO',
      modelo: data.modelo || '',
      placa: data.placa || '',
      color: data.color || ''
    });
  }
}