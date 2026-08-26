// src/core/models/FormulaModel.ts

export type EstadoFormula = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface Formula {
  id_formula: number;
  id_usuario: number;
  condicion: string;
  imagen_formula: string;
  observaciones: string;
  fecha_creacion: string;
  estado: EstadoFormula;
  costo: number;
  nombre_completo: string;
  telefono: string;
  email: string;
}

export class FormulaModel implements Formula {
  id_formula: number;
  id_usuario: number;
  condicion: string;
  imagen_formula: string;
  observaciones: string;
  fecha_creacion: string;
  estado: EstadoFormula;
  costo: number;
  nombre_completo: string;
  telefono: string;
  email: string;

  constructor(data: Formula) {
    this.id_formula = data.id_formula;
    this.id_usuario = data.id_usuario;
    this.condicion = data.condicion;
    this.imagen_formula = data.imagen_formula;
    this.observaciones = data.observaciones;
    this.fecha_creacion = data.fecha_creacion;
    this.estado = data.estado;
    this.costo = data.costo;
    this.nombre_completo = data.nombre_completo;
    this.telefono = data.telefono;
    this.email = data.email;
    
    console.log('🏗️ FormulaModel creado:', {
      id_formula: this.id_formula,
      condicion: this.condicion,
      estado: this.estado
    });
  }

  get costoFormateado(): string {
    if (!this.costo || this.costo === 0) {
      return '$0';
    }
    return `$${this.costo.toLocaleString('es-CO')}`;
  }

  get estadoTexto(): string {
    switch (this.estado) {
      case 'APROBADO':
        return 'Aprobado';
      case 'RECHAZADO':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  }

  static fromJSON(data: any): FormulaModel {
    console.log('🔄 fromJSON - Datos recibidos:', data);

    // Si Sequelize manda dataValues, usarlo
    const source = data?.dataValues ?? data ?? {};

    console.log('🔄 fromJSON - Datos normalizados:', source);

    const idFormula = Number(
      source.id_formula ??
      source.id_Formula ??
      source.id ??
      0
    );

    console.log('🔄 fromJSON - ID final:', idFormula);

    return new FormulaModel({
      id_formula: idFormula,
      id_usuario: Number(source.id_usuario ?? source.usuario_id ?? 0),
      condicion: source.condicion ?? '',
      imagen_formula: source.imagen_formula ?? source.imagen_url ?? source.imagen ?? '',
      observaciones: source.observaciones ?? source.descripcion ?? '',
      fecha_creacion: source.fecha_creacion ?? source.fecha ?? new Date().toISOString().split('T')[0],
      costo: Number(source.costo ?? 0),
      estado: (source.estado ?? 'PENDIENTE').toUpperCase() as EstadoFormula,
      nombre_completo: source.nombre_completo,
      telefono: source.telefono,
      email: source.email,
    });
  }
}