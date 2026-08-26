// src/core/models/FormulaModel.ts

export type EstadoFormula =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO';

export interface Formula {
  id_formula: number;
  id_usuario: number;
  condicion: string;
  imagen_formula: string;
  observaciones: string;
  fecha_creacion: string;
  estado: EstadoFormula;
  costo: number;

  // Información del cliente
  nombre_completo?: string;
  email?: string;
  telefono?: string;
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

  // Información del cliente
  nombre_completo?: string;
  email?: string;
  telefono?: string;

  constructor(data: Formula) {
    this.id_formula = data.id_formula;
    this.id_usuario = data.id_usuario;
    this.condicion = data.condicion;
    this.imagen_formula = data.imagen_formula;
    this.observaciones = data.observaciones;
    this.fecha_creacion = data.fecha_creacion;
    this.estado = data.estado;
    this.costo = data.costo;

    // Información del cliente
    this.nombre_completo = data.nombre_completo;
    this.email = data.email;
    this.telefono = data.telefono;

    console.log('🏗️ FormulaModel creado:', {
      id_formula: this.id_formula,
      id_usuario: this.id_usuario,
      condicion: this.condicion,
      estado: this.estado,
      nombre_completo: this.nombre_completo,
      email: this.email,
      telefono: this.telefono,
    });
  }

  // ============================================
  // COSTO FORMATEADO
  // ============================================

  get costoFormateado(): string {
    if (!this.costo || this.costo === 0) {
      return '$0';
    }

    return `$${this.costo.toLocaleString('es-CO')}`;
  }

  // ============================================
  // ESTADO EN TEXTO
  // ============================================

  get estadoTexto(): string {
    switch (this.estado) {
      case 'APROBADO':
        return 'Aprobado';

      case 'RECHAZADO':
        return 'Rechazado';

      case 'PENDIENTE':
      default:
        return 'Pendiente';
    }
  }

  // ============================================
  // CREAR MODELO DESDE JSON
  // ============================================

  static fromJSON(data: any): FormulaModel {
    console.log(
      '🔄 FormulaModel.fromJSON - Datos recibidos:',
      data
    );

    // Sequelize puede enviar dataValues
    const source = data?.dataValues ?? data ?? {};

    console.log(
      '🔄 FormulaModel.fromJSON - Datos normalizados:',
      source
    );

    // ============================================
    // ID DE LA FÓRMULA
    // ============================================

    const idFormula = Number(
      source.id_formula ??
        source.id_Formula ??
        source.id ??
        0
    );

    console.log(
      '🔄 FormulaModel.fromJSON - ID final:',
      idFormula
    );

    // ============================================
    // CREAR MODELO
    // ============================================

    return new FormulaModel({
      id_formula: idFormula,

      id_usuario: Number(
        source.id_usuario ??
          source.usuario_id ??
          0
      ),

      condicion:
        source.condicion ?? '',

      imagen_formula:
        source.imagen_formula ??
        source.imagen_url ??
        source.imagen ??
        '',

      observaciones:
        source.observaciones ??
        source.descripcion ??
        '',

      fecha_creacion:
        source.fecha_creacion ??
        source.fecha ??
        new Date()
          .toISOString()
          .split('T')[0],

      costo: Number(
        source.costo ?? 0
      ),

      estado:
        (
          source.estado ??
          'PENDIENTE'
        ).toUpperCase() as EstadoFormula,

      // ========================================
      // INFORMACIÓN DEL CLIENTE
      // Viene del JOIN del backend
      // ========================================

      nombre_completo:
        source.nombre_completo ??
        source.nombre ??
        '',

      email:
        source.email ??
        '',

      telefono:
        source.telefono ??
        '',
    });
  }
}