// src/core/services/FormulaService.ts

import { apiClient } from './ApiClient';
import { Formula, EstadoFormula } from '../models/FormulaModel';

// ============================================================
// INTERFACES
// ============================================================

export interface CrearFormulaData {
  id_usuario: number;
  condicion: string;
  imagen_formula: string;
  observaciones: string;
  fecha_creacion: string;
}

export interface ActualizarEstadoData {
  estado: EstadoFormula;
  costo?: number;
}

export interface FormulaResponse {
  success: boolean;
  message?: string;
  data?: any;
  count?: number;
}

// ============================================================
// SERVICIO DE FÓRMULA
// ============================================================

export class FormulaService {

  // ==========================================================
  // OBTENER TODAS LAS FÓRMULAS
  // ==========================================================

  async getTodasLasFormulas(): Promise<Formula[]> {
    const response = await apiClient.get<FormulaResponse>('/formulas');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener fórmulas');
    }

    return Array.isArray(data.data) ? data.data : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS DE UN USUARIO
  // ==========================================================

  async getFormulasByUsuario(id_usuario: number): Promise<Formula[]> {
    if (!id_usuario) {
      throw new Error('El id_usuario es obligatorio.');
    }

    const response = await apiClient.get<FormulaResponse>(`/formulas/usuario/${id_usuario}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener fórmulas del usuario');
    }

    return Array.isArray(data.data) ? data.data : [];
  }

  // ==========================================================
  // OBTENER UNA FÓRMULA POR ID
  // ==========================================================

  async getFormulaById(id_formula: number): Promise<Formula | null> {
    if (!id_formula) {
      throw new Error('El id_formula es obligatorio.');
    }

    const response = await apiClient.get<FormulaResponse>(`/formulas/${id_formula}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener la fórmula');
    }

    return data.data || null;
  }

  // ==========================================================
  // CREAR / SUBIR FÓRMULA
  // ==========================================================

  async crearFormula(data: CrearFormulaData): Promise<{
    success: boolean;
    message: string;
    id_formula?: number;
    data?: Formula;
  }> {
    try {
      // ------------------------------------------------------
      // VALIDACIONES
      // ------------------------------------------------------

      if (!data.id_usuario) {
        return {
          success: false,
          message: 'El usuario es obligatorio.',
        };
      }

      if (!data.condicion) {
        return {
          success: false,
          message: 'La condición es obligatoria.',
        };
      }

      if (!data.imagen_formula) {
        return {
          success: false,
          message: 'La imagen de la fórmula es obligatoria.',
        };
      }

      if (!data.observaciones) {
        return {
          success: false,
          message: 'Las observaciones son obligatorias.',
        };
      }

      // ------------------------------------------------------
      // ENVIAR DATOS
      // ------------------------------------------------------

      const response = await apiClient.post<FormulaResponse>('/formulas', {
        id_usuario: data.id_usuario,
        condicion: data.condicion,
        imagen_formula: data.imagen_formula,
        observaciones: data.observaciones,
        fecha_creacion: data.fecha_creacion,
        estado: 'PENDIENTE',
        costo: 0,
      });

      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Fórmula creada exitosamente.',
        id_formula: result.data?.id_formula,
        data: result.data,
      };

    } catch (error: any) {
      console.error('Error en FormulaService.crearFormula:', error);

      return {
        success: false,
        message: error.response?.data?.message || 'No fue posible crear la fórmula.',
      };
    }
  }

  // ==========================================================
  // ELIMINAR FÓRMULA
  // ==========================================================

  async eliminarFormula(id_formula: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (!id_formula) {
        return {
          success: false,
          message: 'El id_formula es obligatorio.',
        };
      }

      const response = await apiClient.delete<FormulaResponse>(`/formulas/${id_formula}`);
      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Fórmula eliminada exitosamente.',
      };

    } catch (error: any) {
      console.error('Error en FormulaService.eliminarFormula:', error);

      return {
        success: false,
        message: error.response?.data?.message || 'No fue posible eliminar la fórmula.',
      };
    }
  }

  // ==========================================================
  // ACTUALIZAR ESTADO
  // ==========================================================

  /**
   * ESTE MÉTODO ES IMPORTANTE PARA EL ADMINISTRADOR.
   *
   * Ejemplo:
   *   PENDIENTE → APROBADO
   *   PENDIENTE → RECHAZADO
   */

  async actualizarEstado(
    id_formula: number,
    data: ActualizarEstadoData
  ): Promise<{
    success: boolean;
    message: string;
    data?: Formula;
  }> {
    try {
      if (!id_formula) {
        return {
          success: false,
          message: 'El id_formula es obligatorio.',
        };
      }

      if (!data.estado) {
        return {
          success: false,
          message: 'El estado es obligatorio.',
        };
      }

      // ------------------------------------------------------
      // VALIDAR ESTADO
      // ------------------------------------------------------

      const estadosValidos: EstadoFormula[] = ['PENDIENTE', 'APROBADO', 'RECHAZADO'];

      if (!estadosValidos.includes(data.estado)) {
        return {
          success: false,
          message: 'El estado de la fórmula no es válido.',
        };
      }

      // ------------------------------------------------------
      // DATOS A ACTUALIZAR
      // ------------------------------------------------------

      const body: { estado: EstadoFormula; costo?: number } = {
        estado: data.estado,
      };

      if (data.costo !== undefined) {
        body.costo = data.costo;
      }

      // ------------------------------------------------------
      // PETICIÓN
      // ------------------------------------------------------

      const response = await apiClient.put<FormulaResponse>(
        `/formulas/${id_formula}/estado`,
        body
      );

      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Estado actualizado exitosamente.',
        data: result.data,
      };

    } catch (error: any) {
      console.error('Error en FormulaService.actualizarEstado:', error);

      return {
        success: false,
        message: error.response?.data?.message || 'No fue posible actualizar el estado.',
      };
    }
  }

  // ==========================================================
  // ACTUALIZAR FÓRMULA
  // ==========================================================

  async actualizarCostoFormula(
    id_formula: number,
    data: Partial<CrearFormulaData>
  ): Promise<{
    success: boolean;
    message: string;
    data?: Formula;
  }> {
    try {
      if (!id_formula) {
        return {
          success: false,
          message: 'El id_formula es obligatorio.',
        };
      }

      const response = await apiClient.put<FormulaResponse>(
        `/formulas/${id_formula}`,
        data
      );

      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Fórmula actualizada exitosamente.',
        data: result.data,
      };

    } catch (error: any) {
      console.error('Error en FormulaService.actualizarFormula:', error);

      return {
        success: false,
        message: error.response?.data?.message || 'No fue posible actualizar la fórmula.',
      };
    }
  }

  // ==========================================================
  // OBTENER FÓRMULAS POR ESTADO
  // ==========================================================

  /**
   * Este método será útil para el administrador.
   *
   * Por ejemplo:
   *   getFormulasByEstado('PENDIENTE')
   * devuelve las fórmulas que el administrador
   * todavía tiene que revisar.
   */

  async getFormulasByEstado(estado: EstadoFormula): Promise<Formula[]> {
    const response = await apiClient.get<FormulaResponse>(`/formulas/estado/${estado}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener fórmulas por estado');
    }

    return Array.isArray(data.data) ? data.data : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS PENDIENTES
  // ==========================================================

  async getFormulasPendientes(): Promise<Formula[]> {
    return this.getFormulasByEstado('PENDIENTE');
  }

  // ==========================================================
  // OBTENER ESTADÍSTICAS DE FÓRMULAS (OPCIONAL)
  // ==========================================================

  async getEstadisticasFormulas(): Promise<{
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        total: number;
        pendientes: number;
        aprobadas: number;
        rechazadas: number;
      };
    }>('/formulas/admin/estadisticas');

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener estadísticas de fórmulas');
    }

    return data.data;
  }
}