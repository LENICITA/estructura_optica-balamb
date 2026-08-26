// src/core/controllers/FormulaController.ts

import { FormulaService } from '../services/FormulaServices';
import {
  FormulaModel,
  EstadoFormula,
} from '../models/FormulaModel';

export class FormulaController {
  private formulaService: FormulaService;

  constructor() {
    this.formulaService = new FormulaService();
  }


  async getTodasLasFormulas(): Promise<FormulaModel[]> {
    try {
      console.log(
        'FormulaController - obteniendo todas las fórmulas'
      );

      const formulas =
        await this.formulaService.getTodasLasFormulas();

      if (!Array.isArray(formulas)) {
        return [];
      }

      return formulas;
    } catch (error) {
      console.error(
        'Error en FormulaController.getTodasLasFormulas:',
        error
      );

      return [];
    }
  }

  // ============================================
  // OBTENER FÓRMULAS DE UN USUARIO
  // ============================================

  async getFormulasByUsuario(
    id_usuario: number
  ): Promise<FormulaModel[]> {
    try {
      if (!id_usuario) {
        console.error(
          'FormulaController - id_usuario es obligatorio'
        );

        return [];
      }

      console.log(
        'FormulaController - obteniendo fórmulas del usuario:',
        id_usuario
      );

      const formulas =
        await this.formulaService.getFormulasByUsuario(
          id_usuario
        );

      if (!Array.isArray(formulas)) {
        return [];
      }

      return formulas;
    } catch (error) {
      console.error(
        'Error en FormulaController.getFormulasByUsuario:',
        error
      );

      return [];
    }
  }

  // ============================================
  // OBTENER UNA FÓRMULA POR ID
  // ============================================

  async getFormulaById(
    id_formula: number
  ): Promise<FormulaModel | null> {
    try {
      if (!id_formula) {
        console.error(
          'FormulaController - id_formula es obligatorio'
        );

        return null;
      }

      console.log(
        'FormulaController - obteniendo fórmula:',
        id_formula
      );

      const formula =
        await this.formulaService.getFormulaById(
          id_formula
        );

      return formula;
    } catch (error) {
      console.error(
        'Error en FormulaController.getFormulaById:',
        error
      );

      return null;
    }
  }

  // ============================================
  // CREAR FÓRMULA
  // ============================================

  async crearFormula(data: {
    id_usuario: number;
    condicion: string;
    imagen_formula: string;
    observaciones: string;
    fecha_creacion?: string;
  }): Promise<{
    success: boolean;
    message: string;
    id_formula?: number;
    data?: FormulaModel;
  }> {
    try {
      console.log(
        'FormulaController - creando fórmula'
      );

      if (!data.id_usuario) {
        return {
          success: false,
          message: 'El usuario es obligatorio.',
        };
      }

      if (!data.condicion?.trim()) {
        return {
          success: false,
          message: 'La condición es obligatoria.',
        };
      }

      if (!data.imagen_formula) {
        return {
          success: false,
          message:
            'La imagen de la fórmula es obligatoria.',
        };
      }

      const response =
        await this.formulaService.crearFormula(data);

      return response;
    } catch (error: any) {
      console.error(
        'Error en FormulaController.crearFormula:',
        error
      );

      return {
        success: false,
        message:
          error?.message ||
          'No fue posible crear la fórmula.',
      };
    }
  }

  // ============================================
  // ELIMINAR FÓRMULA
  // ============================================

  async eliminarFormula(
    id_formula: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (!id_formula) {
        return {
          success: false,
          message:
            'El ID de la fórmula es obligatorio.',
        };
      }

      console.log(
        'FormulaController - eliminando fórmula:',
        id_formula
      );

      const response =
        await this.formulaService.eliminarFormula(
          id_formula
        );

      return response;
    } catch (error: any) {
      console.error(
        'Error en FormulaController.eliminarFormula:',
        error
      );

      return {
        success: false,
        message:
          error?.message ||
          'No fue posible eliminar la fórmula.',
      };
    }
  }

  // ============================================
  // ACTUALIZAR ESTADO DE FÓRMULA
  // ============================================

  async actualizarEstadoFormula(
    id_formula: number,
    estado: EstadoFormula
  ): Promise<{
    success: boolean;
    message: string;
    data?: FormulaModel;
  }> {
    try {
      if (!id_formula) {
        return {
          success: false,
          message:
            'El ID de la fórmula es obligatorio.',
        };
      }

      if (!estado) {
        return {
          success: false,
          message:
            'El estado de la fórmula es obligatorio.',
        };
      }

      const estadosValidos: EstadoFormula[] = [
        'PENDIENTE',
        'APROBADO',
        'RECHAZADO',
      ];

      if (!estadosValidos.includes(estado)) {
        return {
          success: false,
          message:
            'El estado de la fórmula no es válido.',
        };
      }

      console.log(
        'FormulaController - actualizando estado:',
        {
          id_formula,
          estado,
        }
      );

      const response =
        await this.formulaService.actualizarEstadoFormula(
          id_formula,
          estado
        );

      return response;
    } catch (error: any) {
      console.error(
        'Error en FormulaController.actualizarEstadoFormula:',
        error
      );

      return {
        success: false,
        message:
          error?.message ||
          'No fue posible actualizar el estado.',
      };
    }
  }

  // ============================================
  // ACTUALIZAR COSTO DE FÓRMULA
  // ============================================

  async actualizarCostoFormula(
    id_formula: number,
    costo: number
  ): Promise<{
    success: boolean;
    message: string;
    data?: FormulaModel;
  }> {
    try {
      if (!id_formula) {
        return {
          success: false,
          message:
            'El ID de la fórmula es obligatorio.',
        };
      }

      if (costo === undefined || costo === null) {
        return {
          success: false,
          message:
            'El costo de la fórmula es obligatorio.',
        };
      }

      if (costo < 0) {
        return {
          success: false,
          message:
            'El costo no puede ser negativo.',
        };
      }

      console.log(
        'FormulaController - actualizando costo:',
        {
          id_formula,
          costo,
        }
      );

      const response =
        await this.formulaService.actualizarCostoFormula(
          id_formula,
          costo
        );

      return response;
    } catch (error: any) {
      console.error(
        'Error en FormulaController.actualizarCostoFormula:',
        error
      );

      return {
        success: false,
        message:
          error?.message ||
          'No fue posible actualizar el costo.',
      };
    }
  }

  // ============================================
  // OBTENER FÓRMULAS POR ESTADO
  // ============================================

  async getFormulasByEstado(
    estado: EstadoFormula
  ): Promise<FormulaModel[]> {
    try {
      const estadosValidos: EstadoFormula[] = [
        'PENDIENTE',
        'APROBADO',
        'RECHAZADO',
      ];

      if (!estadosValidos.includes(estado)) {
        console.error(
          'FormulaController - estado inválido:',
          estado
        );

        return [];
      }

      console.log(
        'FormulaController - obteniendo fórmulas por estado:',
        estado
      );

      const formulas =
        await this.formulaService.getFormulasByEstado(
          estado
        );

      if (!Array.isArray(formulas)) {
        return [];
      }

      return formulas;
    } catch (error) {
      console.error(
        'Error en FormulaController.getFormulasByEstado:',
        error
      );

      return [];
    }
  }

  // ============================================
  // OBTENER FÓRMULAS PENDIENTES
  // ============================================

  async getFormulasPendientes(): Promise<FormulaModel[]> {
    try {
      console.log(
        'FormulaController - obteniendo fórmulas pendientes'
      );

      const formulas =
        await this.formulaService.getFormulasPendientes();

      if (!Array.isArray(formulas)) {
        return [];
      }

      return formulas;
    } catch (error) {
      console.error(
        'Error en FormulaController.getFormulasPendientes:',
        error
      );

      return [];
    }
  }

  // ============================================
  // ESTADÍSTICAS DE FÓRMULAS
  // ============================================

  async getEstadisticasFormulas(): Promise<{
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
  }> {
    try {
      console.log(
        'FormulaController - obteniendo estadísticas'
      );

      const estadisticas =
        await this.formulaService.getEstadisticasFormulas();

      return {
        total: estadisticas.total ?? 0,
        pendientes:
          estadisticas.pendientes ?? 0,
        aprobadas:
          estadisticas.aprobadas ?? 0,
        rechazadas:
          estadisticas.rechazadas ?? 0,
      };
    } catch (error) {
      console.error(
        'Error en FormulaController.getEstadisticasFormulas:',
        error
      );

      return {
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0,
      };
    }
  }
}