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

  async getFormulasByUsuario(id_usuario: number): Promise<FormulaModel[]> {
    try {
      console.log('Controller - getFormulasByUsuario:', id_usuario);
      const result = await this.formulaService.getFormulasByUsuario(id_usuario);
      console.log('Controller - Formulas obtenidas:', result.length);
      return result;
    } catch (error) {
      console.error('Error en getFormulasByUsuario:', error);
      return [];
    }
  }

  async getFormulaById(id: number): Promise<FormulaModel | null> {
    try {
      console.log('Controller - getFormulaById:', id);
      const result = await this.formulaService.getFormulaById(id);
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
      console.log('Controller - crearFormula:', data);

      if (!data.id_usuario || !data.condicion || !data.imagen_formula) {
        return {
          success: false,
          message: 'Usuario, condicion e imagen de la formula son requeridos',
        };
      }

      const response = await this.formulaService.crearFormula(data);
      console.log('Controller - Respuesta creacion:', response);

      return response;
    } catch (error: any) {
      console.error('Error en crearFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear la formula',
      };
    }
  }

  async eliminarFormula(id_formula: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('Controller - eliminarFormula ID:', id_formula);

      if (!id_formula) {
        return {
          success: false,
          message: 'El ID de la formula es requerido',
        };
      }

      const idNumber = Number(id_formula);
      if (isNaN(idNumber) || idNumber <= 0) {
        return {
          success: false,
          message: 'ID de formula invalido',
        };
      }

      const response = await this.formulaService.eliminarFormula(idNumber);
      console.log('Controller - Respuesta eliminacion:', response);

      return response;
    } catch (error: any) {
      console.error('Error en eliminarFormula:', error);
      return {
        success: false,
        message: error?.message || 'Error al eliminar la formula',
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

  async getFormulasPendientes(): Promise<FormulaModel[]> {
    try {
      return await this.formulaService.getFormulasPendientes();
    } catch (error) {
      console.error('Error en getFormulasPendientes:', error);
      return [];
    }
  }

  async actualizarEstadoFormula(
    id_formula: number,
    estado: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: FormulaModel;
  }> {
    try {
      console.log('Controller - actualizarEstadoFormula:', { id_formula, estado });

      if (!id_formula) {
        return {
          success: false,
          message: 'El ID de la formula es requerido',
        };
      }

      const response = await this.formulaService.actualizarEstadoFormula(id_formula, estado);

      return {
        success: response.success,
        message: response.message || (response.success
          ? 'Estado actualizado exitosamente'
          : 'Error al actualizar el estado'),
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
    data?: FormulaModel;
  }> {
    try {
      console.log('Controller - actualizarCostoFormula:', { id_formula, costo });

      if (!id_formula) {
        return {
          success: false,
          message: 'El ID de la formula es requerido',
        };
      }

      if (costo < 0) {
        return {
          success: false,
          message: 'El costo no puede ser negativo',
        };
      }

      if (costo === 0) {
        return {
          success: false,
          message: 'El costo debe ser mayor a 0',
        };
      }

      const response = await this.formulaService.actualizarCostoFormula(id_formula, costo);

      return {
        success: response.success,
        message: response.message || (response.success
          ? 'Costo actualizado exitosamente'
          : 'Error al actualizar el costo'),
        data: response.data,
      };
    } catch (error: any) {
      console.error('Error en actualizarCostoFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar el costo',
      };
    }
  }

  // ============================================
  // ESTADISTICAS
  // ============================================

  async getEstadisticasFormulas(): Promise<{
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
  }> {
    try {
      return await this.formulaService.getEstadisticasFormulas();
    } catch (error) {
      console.error('Error en getEstadisticasFormulas:', error);
      return {
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0,
      };
    }
  }
}