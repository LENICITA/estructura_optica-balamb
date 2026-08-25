// src/core/controllers/FormulaController.ts

import { FormulaService } from '../services/FormulaService';
import { FormulaModel, EstadoFormula } from '../models/FormulaModel';

export class FormulaController {
  private formulaService: FormulaService;

  constructor() {
    this.formulaService = new FormulaService();
  }

  // ============================================
  // CLIENTE
  // ============================================

  async getFormulasByUsuario(
    id_usuario: number
  ): Promise<FormulaModel[]> {
    try {
      console.log('📋 Controller - getFormulasByUsuario:', id_usuario);
      const result = await this.formulaService.getFormulasByUsuario(id_usuario);
      console.log('📋 Controller - Fórmulas obtenidas:', result.length);
      return result;
    } catch (error) {
      console.error('Error en getFormulasByUsuario:', error);
      return [];
    }
  }

  async getFormulaById(
    id_formula: number
  ): Promise<FormulaModel | null> {
    try {
      console.log('📋 Controller - getFormulaById:', id_formula);
      const result = await this.formulaService.getFormulaById(id_formula);
      return result;
    } catch (error) {
      console.error('Error en getFormulaById:', error);
      return null;
    }
  }

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
  }> {
    try {
      console.log('📤 Controller - crearFormula:', data);

      if (!data.id_usuario || !data.condicion || !data.imagen_formula) {
        return {
          success: false,
          message: 'Usuario, condición e imagen de la fórmula son requeridos',
        };
      }

      const response = await this.formulaService.crearFormula(data);

      console.log('📊 Controller - Respuesta creación:', response);

      return response;

    } catch (error: any) {
      console.error('Error en crearFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear la fórmula',
      };
    }
  }

  async eliminarFormula(
    id_formula: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('🗑️ Controller - eliminarFormula ID:', id_formula);

      if (!id_formula) {
        return {
          success: false,
          message: 'El ID de la fórmula es requerido',
        };
      }

      const idNumber = Number(id_formula);
      if (isNaN(idNumber) || idNumber <= 0) {
        return {
          success: false,
          message: 'ID de fórmula inválido',
        };
      }

      const response = await this.formulaService.eliminarFormula(idNumber);

      console.log('📊 Controller - Respuesta eliminación:', response);

      return response;

    } catch (error: any) {
      console.error('❌ Error en eliminarFormula:', error);
      return {
        success: false,
        message: error?.message || 'Error al eliminar la fórmula',
      };
    }
  }

  // ============================================
  // ADMINISTRADOR
  // ============================================

  async getTodasLasFormulas(): Promise<FormulaModel[]> {
    try {
      return await this.formulaService.getTodasLasFormulas();
    } catch (error) {
      console.error('Error en getTodasLasFormulas:', error);
      return [];
    }
  }

  async actualizarEstadoFormula(
    id_formula: number,
    estado: EstadoFormula
  ): Promise<{
    success: boolean;
    message: string;
    data?: FormulaModel;
  }> {
    try {
      const estadosPermitidos: EstadoFormula[] = [
        'PENDIENTE',
        'APROBADO',
        'RECHAZADO',
      ];

      if (!id_formula) {
        return {
          success: false,
          message: 'El ID de la fórmula es requerido',
        };
      }

      if (!estadosPermitidos.includes(estado)) {
        return {
          success: false,
          message: 'Estado de fórmula no válido',
        };
      }

      const response = await this.formulaService.actualizarEstadoFormula(
        id_formula,
        estado
      );

      if (!response.success) {
        return {
          success: false,
          message: response.message || 'Error al actualizar el estado',
        };
      }

      return {
        success: true,
        message: response.message || 'Estado actualizado exitosamente',
        data: response.data,
      };

    } catch (error: any) {
      console.error('Error en actualizarEstadoFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar el estado',
      };
    }
  }

  async actualizarCostoFormula(
    id_formula: number,
    costo: number
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (!id_formula) {
        return {
          success: false,
          message: 'El ID de la fórmula es requerido',
        };
      }

      if (costo < 0) {
        return {
          success: false,
          message: 'El costo no puede ser negativo',
        };
      }

      const response = await this.formulaService.actualizarCostoFormula(
        id_formula,
        costo
      );

      return {
        success: response.success,
        message: response.message || (response.success
          ? 'Costo actualizado exitosamente'
          : 'Error al actualizar el costo'),
      };

    } catch (error: any) {
      console.error('Error en actualizarCostoFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar el costo',
      };
    }
  }
}