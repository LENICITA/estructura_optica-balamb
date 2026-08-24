// src/core/services/FormulaService.ts

import { apiClient } from './ApiClient';
import { EstadoFormula, FormulaModel } from '../models/FormulaModel';

// ============================================================
// INTERFACES
// ============================================================

export interface CrearFormulaData {
  id_usuario: number;
  condicion: string;
  imagen_formula: string;
  observaciones: string;
  fecha_creacion?: string;
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

  async getTodasLasFormulas(): Promise<FormulaModel[]> {
    const response =
      await apiClient.get<FormulaResponse>('/formulas');

    const data = response.data;

    if (!data.success) {
      throw new Error(
        data.message ||
        'Error al obtener fórmulas'
      );
    }

    return Array.isArray(data.data)
      ? data.data
      : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS DE UN USUARIO
  // ==========================================================

  async getFormulasByUsuario(
    id_usuario: number
  ): Promise<FormulaModel[]> {

    if (!id_usuario) {
      throw new Error(
        'El id_usuario es obligatorio.'
      );
    }

    const response =
      await apiClient.get<FormulaResponse>(
        `/formulas/usuario/${id_usuario}`
      );

    const data = response.data;

    if (!data.success) {
      throw new Error(
        data.message ||
        'Error al obtener fórmulas del usuario'
      );
    }

    return Array.isArray(data.data)
      ? data.data
      : [];
  }

  // ==========================================================
  // OBTENER UNA FÓRMULA POR ID
  // ==========================================================

  async getFormulaById(
    id_formula: number
  ): Promise<FormulaModel | null> {

    if (!id_formula) {
      throw new Error(
        'El id_formula es obligatorio.'
      );
    }

    const response =
      await apiClient.get<FormulaResponse>(
        `/formulas/${id_formula}`
      );

    const data = response.data;

    if (!data.success) {
      throw new Error(
        data.message ||
        'Error al obtener la fórmula'
      );
    }

    return data.data || null;
  }

  // ==========================================================
  // CREAR / SUBIR FÓRMULA
  // ==========================================================
// src/core/services/FormulaService.ts

async crearFormula(
  data: CrearFormulaData
): Promise<{
  success: boolean;
  message: string;
  id_formula?: number;
  data?: FormulaModel;
}> {
  try {
    // ✅ Validaciones corregidas
    if (!data.id_usuario) {
      return { success: false, message: 'El usuario es obligatorio.' };
    }
    if (!data.condicion) {
      return { success: false, message: 'La condición es obligatoria.' };
    }
    if (!data.imagen_formula) {
      return { success: false, message: 'La imagen de la fórmula es obligatoria.' };
    }

    // ✅ CREAR FormData
    const formData = new FormData();
    formData.append('condicion', data.condicion);
    formData.append('observaciones', data.observaciones || '');

    // ✅ AGREGAR IMAGEN como archivo
    const uriParts = data.imagen_formula.split('.');
    const fileType = uriParts[uriParts.length - 1] || 'jpg';
    const fileName = `formula_${Date.now()}.${fileType}`;
    
    formData.append('imagen_formula', {
      uri: data.imagen_formula,
      name: fileName,
      type: `image/${fileType}`,
    } as any);

    // ✅ ENVIAR con multipart
    const response = await apiClient.post<FormulaResponse>(
      '/formulas',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

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
            'El id_formula es obligatorio.',
        };
      }

      const response =
        await apiClient.delete<FormulaResponse>(
          `/formulas/${id_formula}`
        );

      const result = response.data;

      return {
        success:
          result.success ?? true,

        message:
          result.message ??
          'Fórmula eliminada exitosamente.',
      };

    } catch (error: any) {

      console.error(
        'Error en FormulaService.eliminarFormula:',
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          'No fue posible eliminar la fórmula.',
      };
    }
  }

  // ==========================================================
  // ACTUALIZAR ESTADO DE FÓRMULA
  // ==========================================================

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
            'El id_formula es obligatorio.',
        };
      }

      if (!estado) {
        return {
          success: false,
          message:
            'El estado es obligatorio.',
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

      const response =
        await apiClient.put<FormulaResponse>(
          `/formulas/${id_formula}/estado`,
          {
            estado: estado,
          }
        );

      const result = response.data;

      return {
        success:
          result.success ?? true,

        message:
          result.message ??
          'Estado actualizado exitosamente.',

        data: result.data,
      };

    } catch (error: any) {

      console.error(
        'Error en FormulaService.actualizarEstadoFormula:',
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          'No fue posible actualizar el estado.',
      };
    }
  }

  // ==========================================================
  // ACTUALIZAR COSTO DE FÓRMULA
  // ==========================================================

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
            'El id_formula es obligatorio.',
        };
      }

      if (costo < 0) {
        return {
          success: false,
          message:
            'El costo no puede ser negativo.',
        };
      }

      const response =
        await apiClient.put<FormulaResponse>(
          `/formulas/${id_formula}`,
          {
            costo: costo,
          }
        );

      const result = response.data;

      return {
        success:
          result.success ?? true,

        message:
          result.message ??
          'Costo actualizado exitosamente.',

        data: result.data,
      };

    } catch (error: any) {

      console.error(
        'Error en FormulaService.actualizarCostoFormula:',
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.message ||
          'No fue posible actualizar el costo.',
      };
    }
  }

  // ==========================================================
  // OBTENER FÓRMULAS POR ESTADO
  // ==========================================================

  async getFormulasByEstado(
    estado: EstadoFormula
  ): Promise<FormulaModel[]> {

    const response =
      await apiClient.get<FormulaResponse>(
        `/formulas/estado/${estado}`
      );

    const data = response.data;

    if (!data.success) {
      throw new Error(
        data.message ||
        'Error al obtener fórmulas por estado'
      );
    }

    return Array.isArray(data.data)
      ? data.data
      : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS PENDIENTES
  // ==========================================================

  async getFormulasPendientes(): Promise<FormulaModel[]> {
    return this.getFormulasByEstado(
      'PENDIENTE'
    );
  }

  // ==========================================================
  // ESTADÍSTICAS DE FÓRMULAS
  // ==========================================================

  async getEstadisticasFormulas(): Promise<{
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
  }> {

    const response =
      await apiClient.get<{
        success: boolean;
        data: {
          total: number;
          pendientes: number;
          aprobadas: number;
          rechazadas: number;
        };
      }>(
        '/formulas/admin/estadisticas'
      );

    const data = response.data;

    if (!data.success) {
      throw new Error(
        data.message ||
        'Error al obtener estadísticas de fórmulas'
      );
    }

    return data.data;
  }
}