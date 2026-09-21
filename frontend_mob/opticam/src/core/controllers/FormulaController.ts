// src/core/controllers/FormulaController.ts

import { FormulaService } from '../services/FormulaService';
import { FormulaModel, EstadoFormula } from '../models/FormulaModel';
import {
  checkCondicion,
  checkImagen,
  checkObservaciones,
  checkCosto,
  checkId,
  validarFormularioFormula
} from '../../shared/validators/formulaValidators';

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
      console.log(' Controller - getFormulasByUsuario:', id_usuario);
      const result = await this.formulaService.getFormulasByUsuario(id_usuario);
      console.log(' Controller - Fórmulas obtenidas:', result.length);
      return result;
    } catch (error) {
      console.error('Error en getFormulasByUsuario:', error);
      return [];
    }
  }

  async getFormulaById(
    id: number
  ): Promise<FormulaModel | null> {
    try {
      console.log(' Controller - getFormulaById:', id);
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
      console.log(' Controller - crearFormula:', data);

      const check = validarFormularioFormula({
              id_usuario: data.id_usuario,
              condicion: data.condicion,
              imagen_formula: data.imagen_formula,
              observaciones: data.observaciones
            });

            if (!check.valido) {
              return {
                success: false,
                message: check.mensaje || 'Datos inválidos'
              };
            }

      const response = await this.formulaService.crearFormula(data);

      console.log(' Controller - Respuesta creación:', response);

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
      console.log('Controller - eliminarFormula ID:', id_formula);

      const checkIdResult = checkId(id_formula);
            if (!checkIdResult.valido) {
              return {
                success: false,
                message: checkIdResult.mensaje || 'ID de fórmula inválido',
              };
            }

            const idNumber = Number(id_formula);

      const response = await this.formulaService.eliminarFormula(idNumber);

      console.log('Controller - Respuesta eliminación:', response);

      return response;

    } catch (error: any) {
      console.error('Error en eliminarFormula:', error);
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
        'Pendiente',
        'Aprobado',
        'Rechazado',
      ];

      const checkIdResult = checkId(id_formula);
            if (!checkIdResult.valido) {
              return {
                success: false,
                message: checkIdResult.mensaje || 'ID de fórmula inválido',
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
    data?: FormulaModel;
  }> {
    try {
      const checkIdResult = checkId(id_formula);
            if (!checkIdResult.valido) {
              return {
                success: false,
                message: checkIdResult.mensaje || 'ID de fórmula inválido',
              };
            }

            // Validar costo con el validador compartido
            const checkCostoResult = checkCosto(costo);
            if (!checkCostoResult.valido) {
              return {
                success: false,
                message: checkCostoResult.mensaje || 'Costo inválido',
              };
            }

      const response = await this.formulaService.actualizarCostoFormula(
              id_formula,
              Number(costo)
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