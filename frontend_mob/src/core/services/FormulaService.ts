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
      ? data.data.map((item: any) => FormulaModel.fromJSON(item))
      : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS DE UN USUARIO
  // ==========================================================

  async getFormulasByUsuario(
    id_usuario: number
  ): Promise<FormulaModel[]> {
    console.log('📋 Service - Obteniendo fórmulas para usuario:', id_usuario);

    if (!id_usuario) {
      throw new Error('El id_usuario es obligatorio.');
    }

    try {
      const response = await apiClient.get<FormulaResponse>(
        '/formulas/mis-formulas'
      );

      const data = response.data;
      console.log('📋 Service - Respuesta completa:', data);

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener fórmulas del usuario');
      }

      const formulas = Array.isArray(data.data) ? data.data : [];
      
      const mappedFormulas = formulas.map((item: any) => {
        const source = item?.dataValues ?? item;
        const formulaData = {
          ...source,
          id_formula: Number(
            source?.id_formula ??
            source?.id_Formula ??
            source?.id ??
            0
          ),
        };
        return FormulaModel.fromJSON(formulaData);
      });

      return mappedFormulas;

    } catch (error: any) {
      console.error('Error en FormulaService.getFormulasByUsuario:', error);
      if (error.response?.status === 404) {
        console.warn('Ruta /mis-formulas no encontrada');
        return [];
      }
      throw error;
    }
  }

  // ==========================================================
  // OBTENER UNA FÓRMULA POR ID
  // ==========================================================

  async getFormulaById(
    id_formula: number
  ): Promise<FormulaModel | null> {

    if (!id_formula) {
      throw new Error('El id_formula es obligatorio.');
    }

    const response = await apiClient.get<FormulaResponse>(
      `/formulas/${id_formula}`
    );

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener la fórmula');
    }

    if (!data.data) {
      return null;
    }

    return FormulaModel.fromJSON(data.data);
  }

  // ==========================================================
  // CREAR FÓRMULA
  // ==========================================================

  async crearFormula(
    data: CrearFormulaData
  ): Promise<{
    success: boolean;
    message: string;
    id_formula?: number;
    data?: FormulaModel;
  }> {
    try {
      console.log('📤 Service - Creando fórmula con datos:', {
        id_usuario: data.id_usuario,
        condicion: data.condicion,
        observaciones: data.observaciones,
        tieneImagen: !!data.imagen_formula,
      });

      // ✅ Validaciones
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
      const uri = data.imagen_formula;
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      const fileName = `formula_${Date.now()}.${fileType}`;

      let mimeType = 'image/jpeg';
      if (fileType.toLowerCase() === 'png') mimeType = 'image/png';
      else if (fileType.toLowerCase() === 'gif') mimeType = 'image/gif';
      else if (fileType.toLowerCase() === 'webp') mimeType = 'image/webp';

      // @ts-ignore
      formData.append('imagen', {
        uri: uri,
        name: fileName,
        type: mimeType,
      });

      console.log('📤 Service - Enviando FormData con imagen:', fileName);

      // ✅ ENVIAR
      const response = await apiClient.post('/formulas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Service - Respuesta del backend:', response.data);

      const result = response.data;

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al crear la fórmula',
        };
      }

      return {
        success: true,
        message: result.message || 'Fórmula creada exitosamente.',
        id_formula: result.data?.id_formula || result.data?.id,
        data: result.data,
      };

    } catch (error: any) {
      console.error('❌ Error en FormulaService.crearFormula:', error);
      
      let errorMessage = 'No fue posible crear la fórmula.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos. Verifica la imagen y los campos.';
      } else if (error.response?.status === 413) {
        errorMessage = 'La imagen es demasiado grande.';
      }
      
      return {
        success: false,
        message: errorMessage,
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
    console.log('🗑️ Service - Eliminando fórmula ID:', id_formula);
    console.log('🗑️ Service - Tipo de ID:', typeof id_formula);

    try {
      // ✅ Validación estricta
      if (!id_formula) {
        return {
          success: false,
          message: 'El ID de la fórmula es requerido',
        };
      }

      // ✅ Asegurar que sea un número
      const idNumber = Number(id_formula);
      if (isNaN(idNumber) || idNumber <= 0) {
        return {
          success: false,
          message: 'ID de fórmula inválido',
        };
      }

      // ✅ Enviar DELETE a la URL correcta
      const response = await apiClient.delete(`/formulas/${idNumber}`);

      console.log('✅ Service - Respuesta del backend:', response.data);

      const result = response.data;

      if (result.success === false) {
        return {
          success: false,
          message: result.message || 'Error al eliminar la fórmula',
        };
      }

      return {
        success: true,
        message: result.message || 'Fórmula eliminada exitosamente',
      };

    } catch (error: any) {
      console.error('❌ Error en FormulaService.eliminarFormula:', error);
      
      let errorMessage = 'No fue posible eliminar la fórmula.';
      
      if (error.response) {
        console.log('📊 Error response:', error.response.status);
        console.log('📊 Error data:', error.response.data);
        
        if (error.response.status === 404) {
          errorMessage = 'La fórmula no existe o ya fue eliminada.';
        } else if (error.response.status === 403) {
          errorMessage = 'No tienes permiso para eliminar esta fórmula.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Solo puedes eliminar fórmulas en estado Pendiente.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor.';
      }
      
      return {
        success: false,
        message: errorMessage,
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
          message: 'El id_formula es obligatorio.',
        };
      }

      if (!estado) {
        return {
          success: false,
          message: 'El estado es obligatorio.',
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
          message: 'El estado de la fórmula no es válido.',
        };
      }

      const response = await apiClient.put<FormulaResponse>(
        `/formulas/${id_formula}/estado`,
        { estado: estado }
      );

      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Estado actualizado exitosamente.',
        data: result.data ? FormulaModel.fromJSON(result.data) : undefined,
      };

    } catch (error: any) {
      console.error('Error en FormulaService.actualizarEstadoFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'No fue posible actualizar el estado.',
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
          message: 'El id_formula es obligatorio.',
        };
      }

      if (costo < 0) {
        return {
          success: false,
          message: 'El costo no puede ser negativo.',
        };
      }

      const response = await apiClient.put<FormulaResponse>(
        `/formulas/${id_formula}`,
        { costo: costo }
      );

      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Costo actualizado exitosamente.',
        data: result.data ? FormulaModel.fromJSON(result.data) : undefined,
      };

    } catch (error: any) {
      console.error('Error en FormulaService.actualizarCostoFormula:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'No fue posible actualizar el costo.',
      };
    }
  }

  // ==========================================================
  // OBTENER FÓRMULAS POR ESTADO
  // ==========================================================

  async getFormulasByEstado(
    estado: EstadoFormula
  ): Promise<FormulaModel[]> {

    const response = await apiClient.get<FormulaResponse>(
      `/formulas/estado/${estado}`
    );

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener fórmulas por estado');
    }

    return Array.isArray(data.data)
      ? data.data.map((item: any) => FormulaModel.fromJSON(item))
      : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS PENDIENTES
  // ==========================================================

  async getFormulasPendientes(): Promise<FormulaModel[]> {
    return this.getFormulasByEstado('PENDIENTE');
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

    const response = await apiClient.get<{
      success: boolean;
      message?: string;
      data: {
        total: number;
        pendientes: number;
        aprobadas: number;
        rechazadas: number;
      };
    }>('/formulas/admin/estadisticas');

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener estadísticas');
    }

    return data.data;
  }
}