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
// SERVICIO DE FORMULA
// ============================================================

export class FormulaService {

  // ==========================================================
  // OBTENER TODAS LAS FORMULAS
  // ==========================================================

  async getTodasLasFormulas(): Promise<FormulaModel[]> {
    const response = await apiClient.get<FormulaResponse>('/formulas/admin/todas');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener formulas');
    }

    return Array.isArray(data.data)
      ? data.data.map((item: any) => FormulaModel.fromJSON(item))
      : [];
  }

  // ==========================================================
  // OBTENER FORMULAS DE UN USUARIO
  // ==========================================================

  async getFormulasByUsuario(id_usuario: number): Promise<FormulaModel[]> {
    console.log('Service - Obteniendo formulas para usuario:', id_usuario);

    if (!id_usuario) {
      throw new Error('El id_usuario es obligatorio.');
    }

    try {
      const response = await apiClient.get<FormulaResponse>('/formulas/mis-formulas');
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener formulas del usuario');
      }

      const formulas = Array.isArray(data.data) ? data.data : [];
      
      const mappedFormulas = formulas.map((item: any) => {
        const source = item?.dataValues ?? item;
        const formulaData = {
          ...source,
          id_formula: Number(source?.id_formula ?? source?.id_Formula ?? source?.id ?? 0),
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
  // OBTENER UNA FORMULA POR ID
  // ==========================================================

  async getFormulaById(id_formula: number): Promise<FormulaModel | null> {
    if (!id_formula) {
      throw new Error('El id_formula es obligatorio.');
    }

    const response = await apiClient.get<FormulaResponse>(`/formulas/${id_formula}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener la formula');
    }

    if (!data.data) {
      return null;
    }

    return FormulaModel.fromJSON(data.data);
  }

  // ==========================================================
  // CREAR FORMULA
  // ==========================================================

  async crearFormula(data: CrearFormulaData): Promise<{
    success: boolean;
    message: string;
    id_formula?: number;
    data?: FormulaModel;
  }> {
    try {
      console.log('Service - Creando formula con datos:', {
        id_usuario: data.id_usuario,
        condicion: data.condicion,
        observaciones: data.observaciones,
        tieneImagen: !!data.imagen_formula,
      });

      if (!data.id_usuario) {
        return { success: false, message: 'El usuario es obligatorio.' };
      }
      if (!data.condicion) {
        return { success: false, message: 'La condicion es obligatoria.' };
      }
      if (!data.imagen_formula) {
        return { success: false, message: 'La imagen de la formula es obligatoria.' };
      }

      const formData = new FormData();

      formData.append('condicion', data.condicion);
      formData.append('observaciones', data.observaciones || '');

      const uri = data.imagen_formula;
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      const fileName = `formula_${Date.now()}.${fileType}`;

      let mimeType = 'image/jpeg';
      if (fileType.toLowerCase() === 'png') mimeType = 'image/png';
      else if (fileType.toLowerCase() === 'gif') mimeType = 'image/gif';
      else if (fileType.toLowerCase() === 'webp') mimeType = 'image/webp';

      (formData as any).append('imagen', {
        uri: uri,
        name: fileName,
        type: mimeType,
      });

      console.log('Service - Enviando FormData con imagen:', fileName);

      const response = await apiClient.post('/formulas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Service - Respuesta del backend:', response.data);

      const result = response.data;

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al crear la formula',
        };
      }

      return {
        success: true,
        message: result.message || 'Formula creada exitosamente.',
        id_formula: result.data?.id_formula || result.data?.id,
        data: result.data,
      };

    } catch (error: any) {
      console.error('Error en FormulaService.crearFormula:', error);
      
      let errorMessage = 'No fue posible crear la formula.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos invalidos. Verifica la imagen y los campos.';
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
  // ELIMINAR FORMULA
  // ==========================================================

  async eliminarFormula(id_formula: number): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log('Service - Eliminando formula ID:', id_formula);

    try {
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

      const response = await apiClient.delete(`/formulas/${idNumber}`);
      console.log('Service - Respuesta del backend:', response.data);

      const result = response.data;

      if (result.success === false) {
        return {
          success: false,
          message: result.message || 'Error al eliminar la formula',
        };
      }

      return {
        success: true,
        message: result.message || 'Formula eliminada exitosamente',
      };

    } catch (error: any) {
      console.error('Error en FormulaService.eliminarFormula:', error);
      
      let errorMessage = 'No fue posible eliminar la formula.';
      
      if (error.response) {
        console.log('Error response:', error.response.status);
        console.log('Error data:', error.response.data);
        
        if (error.response.status === 404) {
          errorMessage = 'La formula no existe o ya fue eliminada.';
        } else if (error.response.status === 403) {
          errorMessage = 'No tienes permiso para eliminar esta formula.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Solo puedes eliminar formulas en estado Pendiente.';
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
  // ACTUALIZAR ESTADO DE FORMULA
  // ==========================================================

  async actualizarEstadoFormula(
  id_formula: number,
  estado: string  // ✅ Cambiar de EstadoFormula a string
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


  // ============================================================
// ACTUALIZAR COSTO DE FORMULA
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
        message: 'El id_formula es obligatorio.',
      };
    }

    if (costo < 0) {
      return {
        success: false,
        message: 'El costo no puede ser negativo.',
      };
    }

    if (costo === 0) {
      return {
        success: false,
        message: 'El costo debe ser mayor a 0.',
      };
    }

    const response = await apiClient.put<FormulaResponse>(
      `/formulas/${id_formula}/precio`,
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
  // OBTENER FORMULAS POR ESTADO
  // ==========================================================

  async getFormulasByEstado(estado: EstadoFormula): Promise<FormulaModel[]> {
    const response = await apiClient.get<FormulaResponse>(`/formulas/estado/${estado}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener formulas por estado');
    }

    return Array.isArray(data.data)
      ? data.data.map((item: any) => FormulaModel.fromJSON(item))
      : [];
  }

  // ==========================================================
  // OBTENER FORMULAS PENDIENTES
  // ==========================================================

  async getFormulasPendientes(): Promise<FormulaModel[]> {
    return this.getFormulasByEstado('PENDIENTE');
  }

  // ==========================================================
  // ESTADISTICAS DE FORMULAS
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
      throw new Error(data.message || 'Error al obtener estadisticas');
    }

    return data.data;
  }
}