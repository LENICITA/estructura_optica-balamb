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

  constructor(data: Formula) {
    this.id_formula = data.id_formula;
    this.id_usuario = data.id_usuario;
    this.condicion = data.condicion;
    this.imagen_formula = data.imagen_formula;
    this.observaciones = data.observaciones;
    this.fecha_creacion = data.fecha_creacion;
    this.estado = data.estado;
    this.costo = data.costo;
  }

  get costoFormateado(): string {
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
    return new FormulaModel({
      id_formula: Number(data.id_formula || data.id || 0),

      id_usuario: Number(
        data.id_usuario ||
        data.usuario_id ||
        0
      ),

      condicion: data.condicion || '',

      imagen_formula:
        data.imagen_formula ||
        data.imagen ||
        '',

      observaciones:
        data.observaciones ||
        data.descripcion ||
        '',

      fecha_creacion:
        data.fecha_creacion ||
        data.fecha ||
        '',

      estado:
        String(data.estado || 'PENDIENTE').toUpperCase() as EstadoFormula,

      costo: Number(data.costo || 0),
    });
  }

  static fromJSONArray(data: any[]): FormulaModel[] {
    return data.map(item => FormulaModel.fromJSON(item));
  }
}