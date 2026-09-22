// src/core/controllers/FormulaController.js
import { FormulaService } from '../services/FormulaService';
import {
  checkId,
  checkCosto,
  validarFormularioFormula
} from '../../shared/validators/formulaValidators';

export class FormulaController {
  constructor() {
    this.formulaService = new FormulaService();
  }

  // ============================================
  // CLIENTE
  // ============================================

  async getFormulasByUsuario(id_usuario) {
    try {
      console.log(' Controller - getFormulasByUsuario:', id_usuario);
      const result = await this.formulaService.getFormulasByUsuario(id_usuario);
      console.log(' Controller - Fórmulas obtenidas:', result.length);
      return result;
    } catch (error) {
      console.error(' Error en getFormulasByUsuario:', error);
      return [];
    }
  }

  async getFormulaById(id) {
    try {
      console.log(' Controller - getFormulaById:', id);
      const result = await this.formulaService.getFormulaById(id);
      return result;
    } catch (error) {
      console.error(' Error en getFormulaById:', error);
      return null;
    }
  }

  async crearFormula(data) {
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

    } catch (error) {
      console.error(' Error en crearFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear la fórmula',
      };
    }
  }

  async eliminarFormula(id_formula) {
    try {
      console.log(' Controller - eliminarFormula ID:', id_formula);

      const checkIdResult = checkId(id_formula);
      if (!checkIdResult.valido) {
        return {
          success: false,
          message: checkIdResult.mensaje || 'ID de fórmula inválido',
        };
      }

      const idNumber = Number(id_formula);

      const response = await this.formulaService.eliminarFormula(idNumber);

      console.log(' Controller - Respuesta eliminación:', response);

      return response;

    } catch (error) {
      console.error(' Error en eliminarFormula:', error);
      return {
        success: false,
        message: error?.message || 'Error al eliminar la fórmula',
      };
    }
  }

  // ============================================
  // ADMINISTRADOR
  // ============================================

  async getTodasLasFormulas() {
    try {
      return await this.formulaService.getTodasLasFormulas();
    } catch (error) {
      console.error(' Error en getTodasLasFormulas:', error);
      return [];
    }
  }

  async actualizarEstadoFormula(id_formula, estado) {
    try {
      const estadosPermitidos = ['Pendiente', 'Aprobado', 'Rechazado'];

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

    } catch (error) {
      console.error(' Error en actualizarEstadoFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar el estado',
      };
    }
  }

  async actualizarCostoFormula(id_formula, costo) {
    try {
      const checkIdResult = checkId(id_formula);
      if (!checkIdResult.valido) {
        return {
          success: false,
          message: checkIdResult.mensaje || 'ID de fórmula inválido',
        };
      }

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

    } catch (error) {
      console.error(' Error en actualizarCostoFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar el costo',
      };
    }
  }
}