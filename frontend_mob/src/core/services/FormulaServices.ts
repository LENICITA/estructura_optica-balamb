// src/core/services/FormulaService.ts

import { apiClient } from './ApiClient';
import { EstadoFormula, FormulaModel } from '../models/FormulaModel';

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

export class FormulaService {

  // ============================================================
  // OBTENER TODAS LAS FÓRMULAS
  // ============================================================

  async getTodasLasFormulas(): Promise<FormulaModel[]> {
    try {
      const response = await apiClient.get<FormulaResponse>(
        '/formulas/admin/todas'
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(
          result.message || 'Error al obtener las fórmulas'
        );
      }

      if (!Array.isArray(result.data)) {
        return [];
      }

      return result.data.map((item: any) =>
        FormulaModel.fromJSON(item)
      );
    } catch (error: any) {
      console.error(
        'Error en FormulaService.getTodasLasFormulas:',
        error
      );

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'No fue posible obtener las fórmulas'
      );
    }
  }

  // ============================================================
  // OBTENER FÓRMULAS DEL USUARIO
  // ============================================================

  async getFormulasByUsuario(
    id_usuario: number
  ): Promise<FormulaModel[]> {
    if (!id_usuario) {
      throw new Error('El id_usuario es obligatorio.');
    }

    try {
      const response = await apiClient.get<FormulaResponse>(
        '/formulas/mis-formulas'
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(
          result.message ||
          'Error al obtener las fórmulas del usuario'
        );
      }

      if (!Array.isArray(result.data)) {
        return [];
      }

      return result.data.map((item: any) =>
        FormulaModel.fromJSON(item)
      );
    } catch (error: any) {
      console.error(
        'Error en FormulaService.getFormulasByUsuario:',
        error
      );

      if (error.response?.status === 404) {
        return [];
      }

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'No fue posible obtener las fórmulas'
      );
    }
  }

  // ============================================================
  // OBTENER UNA FÓRMULA POR ID
  // ============================================================

  async getFormulaById(
    id_formula: number
  ): Promise<FormulaModel | null> {
    if (!id_formula) {
      throw new Error('El id_formula es obligatorio.');
    }

    try {
      const response = await apiClient.get<FormulaResponse>(
        `/formulas/${id_formula}`
      );

      const result = response.data;

      if (!result.success) {
        throw new Error(
          result.message ||
          'Error al obtener la fórmula'
        );
      }

      if (!result.data) {
        return null;
      }

      return FormulaModel.fromJSON(result.data);
    } catch (error: any) {
      console.error(
        'Error en FormulaService.getFormulaById:',
        error
      );

      if (error.response?.status === 404) {
        return null;
      }

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'No fue posible obtener la fórmula'
      );
    }
  }

  // ============================================================
  // CREAR FÓRMULA
  // ============================================================

  async crearFormula(
    data: CrearFormulaData
  ): Promise<{
    success: boolean;
    message: string;
    id_formula?: number;
    data?: FormulaModel;
  }> {
    try {
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

      const formData = new FormData();

      formData.append(
        'condicion',
        data.condicion
      );

      formData.append(
        'observaciones',
        data.observaciones || ''
      );

      const uri = data.imagen_formula;

      const uriParts = uri.split('.');
      const fileType =
        uriParts[uriParts.length - 1]?.toLowerCase() || 'jpg';

      const fileName =
        `formula_${Date.now()}.${fileType}`;

      let mimeType = 'image/jpeg';

      if (fileType === 'png') {
        mimeType = 'image/png';
      } else if (fileType === 'gif') {
        mimeType = 'image/gif';
      } else if (fileType === 'webp') {
        mimeType = 'image/webp';
      }

      formData.append(
        'imagen',
        {
          uri,
          name: fileName,
          type: mimeType,
        } as any
      );

      const response = await apiClient.post(
        '/formulas',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = response.data;

      if (!result.success) {
        return {
          success: false,
          message:
            result.message ||
            'Error al crear la fórmula',
        };
      }

      return {
        success: true,
        message:
          result.message ||
          'Fórmula creada exitosamente.',
        id_formula:
          result.data?.id_formula ||
          result.data?.id,
        data: result.data
          ? FormulaModel.fromJSON(result.data)
          : undefined,
      };

    } catch (error: any) {
      console.error(
        'Error en FormulaService.crearFormula:',
        error
      );

      let message =
        'No fue posible crear la fórmula.';

      if (error.response?.data?.message) {
        message =
          error.response.data.message;
      } else if (
        error.response?.status === 400
      ) {
        message =
          'Datos inválidos. Verifica la imagen y los campos.';
      } else if (
        error.response?.status === 413
      ) {
        message =
          'La imagen es demasiado grande.';
      }

      return {
        success: false,
        message,
      };
    }
  }

  // ============================================================
  // ELIMINAR FÓRMULA
  // ============================================================

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
            'El ID de la fórmula es requerido.',
        };
      }

      const idNumber = Number(id_formula);

      if (
        Number.isNaN(idNumber) ||
        idNumber <= 0
      ) {
        return {
          success: false,
          message:
            'ID de fórmula inválido.',
        };
      }

      const response =
        await apiClient.delete(
          `/formulas/${idNumber}`
        );

      const result = response.data;

      if (result.success === false) {
        return {
          success: false,
          message:
            result.message ||
            'Error al eliminar la fórmula.',
        };
      }

      return {
        success: true,
        message:
          result.message ||
          'Fórmula eliminada exitosamente.',
      };

    } catch (error: any) {
      console.error(
        'Error en FormulaService.eliminarFormula:',
        error
      );

      let message =
        'No fue posible eliminar la fórmula.';

      if (error.response?.status === 404) {
        message =
          'La fórmula no existe o ya fue eliminada.';
      } else if (
        error.response?.status === 403
      ) {
        message =
          'No tienes permiso para eliminar esta fórmula.';
      } else if (
        error.response?.status === 400
      ) {
        message =
          error.response.data?.message ||
          'Solo puedes eliminar fórmulas en estado Pendiente.';
      } else if (
        error.response?.data?.message
      ) {
        message =
          error.response.data.message;
      }

      return {
        success: false,
        message,
      };
    }
  }

  // ============================================================
  // ACTUALIZAR ESTADO DE FÓRMULA
  // ============================================================

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
            estado,
          }
        );

      const result = response.data;

      if (!result.success) {
        return {
          success: false,
          message:
            result.message ||
            'No fue posible actualizar el estado.',
        };
      }

      return {
        success: true,
        message:
          result.message ||
          'Estado actualizado exitosamente.',
        data: result.data
          ? FormulaModel.fromJSON(result.data)
          : undefined,
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

  // ============================================================
  // ACTUALIZAR COSTO DE FÓRMULA
  // ============================================================

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

      if (
        typeof costo !== 'number' ||
        Number.isNaN(costo) ||
        costo < 0
      ) {
        return {
          success: false,
          message:
            'El costo no puede ser negativo.',
        };
      }

      const response =
        await apiClient.put<FormulaResponse>(
          `/formulas/${id_formula}/precio`,
          {
            costo,
          }
        );

      const result = response.data;

      if (!result.success) {
        return {
          success: false,
          message:
            result.message ||
            'No fue posible actualizar el costo.',
        };
      }

      return {
        success: true,
        message:
          result.message ||
          'Costo actualizado exitosamente.',
        data: result.data
          ? FormulaModel.fromJSON(result.data)
          : undefined,
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

  // ============================================================
  // OBTENER FÓRMULAS PENDIENTES
  // ============================================================

  async getFormulasPendientes(): Promise<FormulaModel[]> {
    try {
      const response =
        await apiClient.get<FormulaResponse>(
          '/formulas/admin/pendientes'
        );

      const result = response.data;

      if (!result.success) {
        throw new Error(
          result.message ||
          'Error al obtener fórmulas pendientes'
        );
      }

      if (!Array.isArray(result.data)) {
        return [];
      }

      return result.data.map((item: any) =>
        FormulaModel.fromJSON(item)
      );

    } catch (error: any) {
      console.error(
        'Error en FormulaService.getFormulasPendientes:',
        error
      );

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'No fue posible obtener las fórmulas pendientes'
      );
    }
  }

  // ============================================================
  // OBTENER FÓRMULAS POR ESTADO
  // ============================================================

  async getFormulasByEstado(
    estado: EstadoFormula
  ): Promise<FormulaModel[]> {
    const formulas =
      await this.getTodasLasFormulas();

    return formulas.filter(
      formula =>
        formula.estado === estado
    );
  }

  // ============================================================
  // ESTADÍSTICAS DE FÓRMULAS
  // ============================================================

  async getEstadisticasFormulas(): Promise<{
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
  }> {
    const formulas =
      await this.getTodasLasFormulas();

    return {
      total: formulas.length,

      pendientes: formulas.filter(
        formula =>
          formula.estado === 'PENDIENTE'
      ).length,

      aprobadas: formulas.filter(
        formula =>
          formula.estado === 'APROBADO'
      ).length,

      rechazadas: formulas.filter(
        formula =>
          formula.estado === 'RECHAZADO'
      ).length,
    };
  }
}