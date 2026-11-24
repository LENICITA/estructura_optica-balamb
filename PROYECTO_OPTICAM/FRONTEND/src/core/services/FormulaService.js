// src/core/services/FormulaService.js
import { apiClient } from './ApiClient';
import { FormulaModel } from '../../shared/types/FormulaModel';
import { adjuntarImagenFormData, extraerMensajeError } from '../../shared/utils/serviceHelpers';

export class FormulaService {

  // ==========================================================
  // OBTENER TODAS LAS FÓRMULAS
  // ==========================================================
  async getTodasLasFormulas() {
    const response = await apiClient.get('/formulas/admin/todas');
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener fórmulas');
    return Array.isArray(data.data) ? data.data.map((item) => FormulaModel.fromJSON(item)) : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS DE UN USUARIO
  // ==========================================================
  async getFormulasByUsuario(id_usuario) {
    if (!id_usuario) throw new Error('El id_usuario es obligatorio.');
    
    try {
      const response = await apiClient.get('/formulas/mis-formulas');
      const data = response.data;
      if (!data.success) throw new Error(data.message || 'Error al obtener fórmulas del usuario');
      
      const formulas = Array.isArray(data.data) ? data.data : [];
      return formulas.map((item) => {
        const source = item?.dataValues ?? item;
        const formulaData = {
          ...source,
          id_formula: Number(source?.id_formula ?? source?.id_Formula ?? source?.id ?? 0),
        };
        return FormulaModel.fromJSON(formulaData);
      });
    } catch (error) {
      console.error('Error en FormulaService.getFormulasByUsuario:', error);
      if (error.response?.status === 404) return [];
      throw error;
    }
  }

  // ==========================================================
  // OBTENER UNA FÓRMULA POR ID
  // ==========================================================
  async getFormulaById(id_formula) {
    if (!id_formula) throw new Error('El id_formula es obligatorio.');
    
    const response = await apiClient.get(`/formulas/${id_formula}`);
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener la fórmula');
    if (!data.data) return null;
    return FormulaModel.fromJSON(data.data);
  }

  // ==========================================================
  // CREAR FÓRMULA
  // ==========================================================
  async crearFormula(data) {
    try {
      if (!data.id_usuario) return { success: false, message: 'El usuario es obligatorio.' };
      if (!data.condicion) return { success: false, message: 'La condición es obligatoria.' };
      if (!data.imagen_formula) return { success: false, message: 'La imagen de la fórmula es obligatoria.' };

      const formData = new FormData();
      formData.append('id_usuario', String(data.id_usuario));
      formData.append('condicion', data.condicion);
      formData.append('observaciones', data.observaciones || '');
      if (data.fecha_creacion) formData.append('fecha_creacion', data.fecha_creacion);

      adjuntarImagenFormData(formData, data.imagen_formula, 'imagen', 'formula');

      const response = await apiClient.post('/formulas', formData);
      const result = response.data;

      if (!result.success) {
        return { success: false, message: result.message || 'Error al crear la fórmula' };
      }

      return {
        success: true,
        message: result.message || 'Fórmula creada exitosamente.',
        id_formula: result.data?.id_formula || result.data?.id,
        data: result.data,
      };
    } catch (error) {
      console.error('Error en FormulaService.crearFormula:', error);
      return { success: false, message: extraerMensajeError(error, 'No fue posible crear la fórmula.') };
    }
  }

  // ==========================================================
  // ELIMINAR FÓRMULA
  // ==========================================================
  async eliminarFormula(id_formula) {
    try {
      if (!id_formula) return { success: false, message: 'El ID de la fórmula es requerido' };
      
      const idNumber = Number(id_formula);
      if (Number.isNaN(idNumber) || idNumber <= 0) {
        return { success: false, message: 'ID de fórmula inválido' };
      }

      const response = await apiClient.delete(`/formulas/${idNumber}`);
      const result = response.data;

      if (result.success === false) {
        return { success: false, message: result.message || 'Error al eliminar la fórmula' };
      }

      return { success: true, message: result.message || 'Fórmula eliminada exitosamente' };
    } catch (error) {
      console.error('Error en FormulaService.eliminarFormula:', error);
      const mensaje = extraerMensajeError(error, 'No fue posible eliminar la fórmula.', {
        400: 'Solo puedes eliminar fórmulas en estado Pendiente.',
        403: 'No tienes permiso para eliminar esta fórmula.',
        404: 'La fórmula no existe o ya fue eliminada.',
      });
      return { success: false, message: mensaje };
    }
  }

  // ==========================================================
  // ACTUALIZAR ESTADO DE FÓRMULA
  // ==========================================================
  async actualizarEstadoFormula(id_formula, estado) {
    try {
      if (!id_formula) return { success: false, message: 'El id_formula es obligatorio.' };
      if (!estado) return { success: false, message: 'El estado es obligatorio.' };
      
      const estadosValidos = ['Pendiente', 'Aprobado', 'Rechazado'];
      if (!estadosValidos.includes(estado)) {
        return { success: false, message: 'El estado de la fórmula no es válido.' };
      }

      const response = await apiClient.put(`/formulas/${id_formula}/estado`, { estado });
      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Estado actualizado exitosamente.',
        data: result.data ? FormulaModel.fromJSON(result.data) : undefined,
      };
    } catch (error) {
      console.error('Error en FormulaService.actualizarEstadoFormula:', error);
      return { success: false, message: extraerMensajeError(error, 'No fue posible actualizar el estado.') };
    }
  }

  // ==========================================================
  // ACTUALIZAR COSTO DE FÓRMULA
  // ==========================================================
  async actualizarCostoFormula(id_formula, costo) {
    try {
      if (!id_formula) return { success: false, message: 'El id_formula es obligatorio.' };
      if (costo < 0) return { success: false, message: 'El costo no puede ser negativo.' };

      const response = await apiClient.put(`/formulas/${id_formula}/precio`, { costo });
      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Costo actualizado exitosamente.',
        data: result.data ? FormulaModel.fromJSON(result.data) : undefined,
      };
    } catch (error) {
      console.error('Error en FormulaService.actualizarCostoFormula:', error);
      return { success: false, message: extraerMensajeError(error, 'No fue posible actualizar el costo.') };
    }
  }

  // ==========================================================
  // OBTENER FÓRMULAS POR ESTADO
  // ==========================================================
  async getFormulasByEstado(estado) {
    const response = await apiClient.get(`/formulas/estado/${estado}`);
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener fórmulas por estado');
    return Array.isArray(data.data) ? data.data.map((item) => FormulaModel.fromJSON(item)) : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS PENDIENTES
  // ==========================================================
  async getFormulasPendientes() {
    return this.getFormulasByEstado('Pendiente');
  }

  // ==========================================================
  // ESTADÍSTICAS DE FÓRMULAS
  // ==========================================================
  async getEstadisticasFormulas() {
    const response = await apiClient.get('/formulas/admin/estadisticas');
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener estadísticas');
    return data.data;
  }
}