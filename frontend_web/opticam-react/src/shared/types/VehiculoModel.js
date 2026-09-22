// src/shared/types/VehiculoModel.js

export class VehiculoModel {
  constructor(data) {
    this.id_vehiculo = data.id_vehiculo;
    this.id_usuario = data.id_usuario;
    this.tipo = data.tipo;
    this.modelo = data.modelo;
    this.placa = data.placa;
    this.color = data.color;
  }

  get tipoDisplay() {
    return this.tipo === 'MOTO' ? 'Moto' : 'Carro';
  }

  get iconName() {
    return this.tipo === 'MOTO' ? 'bicycle-outline' : 'car-outline';
  }

  static fromJSON(data) {
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