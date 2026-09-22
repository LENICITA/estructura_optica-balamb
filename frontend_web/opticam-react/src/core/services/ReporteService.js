// src/core/services/ReporteService.js
import { apiClient } from './ApiClient';
import { StorageRepository } from '../repositories/StorageRepository';

export class ReporteService {
  constructor() {
    this.baseUrl = '/reportes';
    this.storage = StorageRepository.getInstance();
  }

  // ===== REPORTE 1: VENTAS POR PERIODO =====
  async getVentasPorPeriodo(fecha_inicio, fecha_fin) {
    const response = await apiClient.get(`${this.baseUrl}/ventas-periodo`, {
      params: { fecha_inicio, fecha_fin },
    });
    return response.data;
  }

  // ===== REPORTE 2: PRODUCTOS MAS VENDIDOS =====
  async getProductosMasVendidos(limite = 10, fecha_inicio, fecha_fin) {
    const params = { limite };
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get(`${this.baseUrl}/productos-mas-vendidos`, {
      params,
    });
    return response.data;
  }

  // ===== REPORTE 3: DESEMPEÑO DE REPARTIDORES =====
  async getDesempenoRepartidores(fecha_inicio, fecha_fin) {
    const params = {};
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get(`${this.baseUrl}/desempeno-repartidores`, {
      params,
    });
    return response.data;
  }

  // ===== REPORTE 4: ESTADO DE PEDIDOS =====
  async getEstadoPedidos(fecha_inicio, fecha_fin) {
    const params = {};
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get(`${this.baseUrl}/estado-pedidos`, {
      params,
    });
    return response.data;
  }

  // ===== REPORTE 5: CLIENTES FRECUENTES =====
  async getClientesFrecuentes(limite = 10, fecha_inicio, fecha_fin) {
    const params = { limite };
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get(`${this.baseUrl}/clientes-frecuentes`, {
      params,
    });
    return response.data;
  }

  // ===== REPORTE 6: RESUMEN GENERAL =====
  async getResumenGeneral() {
    const response = await apiClient.get(`${this.baseUrl}/resumen-general`);
    return response.data;
  }

  // ===== REPORTE 7: VENTAS POR CATEGORIA =====
  async getVentasPorCategoria(fecha_inicio, fecha_fin) {
    const params = {};
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get(`${this.baseUrl}/ventas-categoria`, {
      params,
    });
    return response.data;
  }

  // ===== REPORTE 8: ANALISIS DE FORMULAS =====
  async getAnalisisFormulas() {
    const response = await apiClient.get(`${this.baseUrl}/analisis-formulas`);
    return response.data;
  }

  // ===== REPORTE 9: GENERAR PDF =====
  async generarPDF(data) {
    try {
      const token = await this.storage.getToken();
      if (!token) {
        throw new Error('No hay token de autenticacion');
      }

      const response = await apiClient.post(`${this.baseUrl}/generar-pdf`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      console.log(' Service - Respuesta recibida:', response);

      const contentType = String(response.headers['content-type'] || '');

      if (contentType.includes('application/pdf')) {
        return {
          success: true,
          message: 'PDF generado correctamente',
          blob: response.data,
        };
      }

      // Si no es PDF, intentar leer como texto (error)
      const text = await response.data.text();
      try {
        const json = JSON.parse(text);
        return {
          success: false,
          message: json.message || 'Error al generar el reporte',
        };
      } catch {
        return {
          success: false,
          message: 'Error al generar el reporte',
        };
      }

    } catch (error) {
      console.error(' Service - Error:', error);

      let message = 'Error al generar el reporte';
      if (error.response?.status === 401) {
        message = 'Sesion expirada. Por favor, inicia sesion nuevamente.';
        await this.storage.clearSession();
      } else if (error.response?.data) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          message = json.message || message;
        } catch {
          message = error.message || message;
        }
      }

      throw new Error(message);
    }
  }
}