// src/core/services/FormulaService.js
import { apiClient } from './ApiClient';
import { FormulaModel } from '../../shared/types/FormulaModel';

export class FormulaService {

  // ==========================================================
  // OBTENER TODAS LAS FÓRMULAS
  // ==========================================================

  async getTodasLasFormulas() {
    const response = await apiClient.get('/formulas/admin/todas');

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener fórmulas');
    }

    return Array.isArray(data.data)
      ? data.data.map((item) => FormulaModel.fromJSON(item))
      : [];
  }

  // ==========================================================
  // OBTENER FÓRMULAS DE UN USUARIO
  // ==========================================================

  async getFormulasByUsuario(id_usuario) {
    console.log(' Service - Obteniendo fórmulas para usuario:', id_usuario);

    if (!id_usuario) {
      throw new Error('El id_usuario es obligatorio.');
    }

    try {
      const response = await apiClient.get('/formulas/mis-formulas');

      const data = response.data;
      console.log(' Service - Respuesta completa:', data);

      if (!data.success) {
        throw new Error(data.message || 'Error al obtener fórmulas del usuario');
      }

      const formulas = Array.isArray(data.data) ? data.data : [];

      const mappedFormulas = formulas.map((item) => {
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

    } catch (error) {
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

  async getFormulaById(id_formula) {

    if (!id_formula) {
      throw new Error('El id_formula es obligatorio.');
    }

    const response = await apiClient.get(`/formulas/${id_formula}`);

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

  async crearFormula(data) {
    try {
      console.log(' Service - Creando fórmula con datos:', {
        id_usuario: data.id_usuario,
        condicion: data.condicion,
        observaciones: data.observaciones,
        tieneImagen: !!data.imagen_formula,
      });

      // Validaciones
      if (!data.id_usuario) {
        return { success: false, message: 'El usuario es obligatorio.' };
      }
      if (!data.condicion) {
        return { success: false, message: 'La condición es obligatoria.' };
      }
      if (!data.imagen_formula) {
        return { success: false, message: 'La imagen de la fórmula es obligatoria.' };
      }

      // CREAR FormData
      const formData = new FormData();

      formData.append('condicion', data.condicion);
      formData.append('observaciones', data.observaciones || '');

      // AGREGAR IMAGEN como archivo
      const uri = data.imagen_formula;
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1] || 'jpg';
      const fileName = `formula_${Date.now()}.${fileType}`;

      let mimeType = 'image/jpeg';
      if (fileType.toLowerCase() === 'png') mimeType = 'image/png';
      else if (fileType.toLowerCase() === 'gif') mimeType = 'image/gif';
      else if (fileType.toLowerCase() === 'webp') mimeType = 'image/webp';

      formData.append('imagen', {
        uri: uri,
        name: fileName,
        type: mimeType,
      });

      console.log(' Service - Enviando FormData con imagen:', fileName);

      // ENVIAR
      const response = await apiClient.post('/formulas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(' Service - Respuesta del backend:', response.data);

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

    } catch (error) {
      console.error(' Error en FormulaService.crearFormula:', error);

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

  async eliminarFormula(id_formula) {
    console.log(' Service - Eliminando fórmula ID:', id_formula);
    console.log(' Service - Tipo de ID:', typeof id_formula);

    try {
      // Validación estricta
      if (!id_formula) {
        return {
          success: false,
          message: 'El ID de la fórmula es requerido',
        };
      }

      // Asegurar que sea un número
      const idNumber = Number(id_formula);
      if (isNaN(idNumber) || idNumber <= 0) {
        return {
          success: false,
          message: 'ID de fórmula inválido',
        };
      }

      // Enviar DELETE a la URL correcta
      const response = await apiClient.delete(`/formulas/${idNumber}`);

      console.log(' Service - Respuesta del backend:', response.data);

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

    } catch (error) {
      console.error(' Error en FormulaService.eliminarFormula:', error);

      let errorMessage = 'No fue posible eliminar la fórmula.';

      if (error.response) {
        console.log('Error response:', error.response.status);
        console.log('Error data:', error.response.data);

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

  async actualizarEstadoFormula(id_formula, estado) {
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

      const estadosValidos = ['Pendiente', 'Aprobado', 'Rechazado'];

      if (!estadosValidos.includes(estado)) {
        return {
          success: false,
          message: 'El estado de la fórmula no es válido.',
        };
      }

      const response = await apiClient.put(`/formulas/${id_formula}/estado`, {
        estado: estado,
      });

      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Estado actualizado exitosamente.',
        data: result.data ? FormulaModel.fromJSON(result.data) : undefined,
      };

    } catch (error) {
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

  async actualizarCostoFormula(id_formula, costo) {
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

      const response = await apiClient.put(`/formulas/${id_formula}/precio`, {
        costo: costo,
      });

      const result = response.data;

      return {
        success: result.success ?? true,
        message: result.message ?? 'Costo actualizado exitosamente.',
        data: result.data ? FormulaModel.fromJSON(result.data) : undefined,
      };

    } catch (error) {
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

  async getFormulasByEstado(estado) {
    const response = await apiClient.get(`/formulas/estado/${estado}`);

    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener fórmulas por estado');
    }

    return Array.isArray(data.data)
      ? data.data.map((item) => FormulaModel.fromJSON(item))
      : [];
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

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener estadísticas');
    }

    return data.data;
  }
}