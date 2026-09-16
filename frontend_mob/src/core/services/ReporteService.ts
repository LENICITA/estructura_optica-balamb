// src/core/services/ReporteService.ts

import { apiClient } from './ApiClient';
import {
  ReporteVentasResponse,
  ReporteProductosResponse,
  ReporteRepartidoresResponse,
  ReporteEstadoPedidosResponse,
  ReporteClientesResponse,
  ReporteResumenGeneralResponse,
  ReporteVentasCategoriaResponse,
  ReporteAnalisisFormulasResponse,
  GenerarPDFRequest,
  GenerarPDFResponse,
} from '../models/ReporteModel';
import { StorageRepository } from '../repositories/StorageRepository';

export class ReporteService {
  private baseUrl = '/reportes';
  private storage: StorageRepository;

  constructor() {
    this.storage = StorageRepository.getInstance();
  }

  // ===== REPORTE 1: VENTAS POR PERIODO =====
  async getVentasPorPeriodo(
    fecha_inicio: string,
    fecha_fin: string
  ): Promise<ReporteVentasResponse> {
    const response = await apiClient.get<ReporteVentasResponse>(
      `${this.baseUrl}/ventas-periodo`,
      { params: { fecha_inicio, fecha_fin } }
    );
    return response.data;
  }

  // ===== REPORTE 2: PRODUCTOS MAS VENDIDOS =====
  async getProductosMasVendidos(
    limite: number = 10,
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteProductosResponse> {
    const params: any = { limite };
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get<ReporteProductosResponse>(
      `${this.baseUrl}/productos-mas-vendidos`,
      { params }
    );
    return response.data;
  }

  // ===== REPORTE 3: DESEMPEÑO DE REPARTIDORES =====
  async getDesempenoRepartidores(
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteRepartidoresResponse> {
    const params: any = {};
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get<ReporteRepartidoresResponse>(
      `${this.baseUrl}/desempeno-repartidores`,
      { params }
    );
    return response.data;
  }

  // ===== REPORTE 4: ESTADO DE PEDIDOS =====
  async getEstadoPedidos(
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteEstadoPedidosResponse> {
    const params: any = {};
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get<ReporteEstadoPedidosResponse>(
      `${this.baseUrl}/estado-pedidos`,
      { params }
    );
    return response.data;
  }

  // ===== REPORTE 5: CLIENTES FRECUENTES =====
  async getClientesFrecuentes(
    limite: number = 10,
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteClientesResponse> {
    const params: any = { limite };
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get<ReporteClientesResponse>(
      `${this.baseUrl}/clientes-frecuentes`,
      { params }
    );
    return response.data;
  }

  // ===== REPORTE 6: RESUMEN GENERAL =====
  async getResumenGeneral(): Promise<ReporteResumenGeneralResponse> {
    const response = await apiClient.get<ReporteResumenGeneralResponse>(
      `${this.baseUrl}/resumen-general`
    );
    return response.data;
  }

  // ===== REPORTE 7: VENTAS POR CATEGORIA =====
  async getVentasPorCategoria(
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteVentasCategoriaResponse> {
    const params: any = {};
    if (fecha_inicio) params.fecha_inicio = fecha_inicio;
    if (fecha_fin) params.fecha_fin = fecha_fin;

    const response = await apiClient.get<ReporteVentasCategoriaResponse>(
      `${this.baseUrl}/ventas-categoria`,
      { params }
    );
    return response.data;
  }

  // ===== REPORTE 8: ANALISIS DE FORMULAS =====
  async getAnalisisFormulas(): Promise<ReporteAnalisisFormulasResponse> {
    const response = await apiClient.get<ReporteAnalisisFormulasResponse>(
      `${this.baseUrl}/analisis-formulas`
    );
    return response.data;
  }

  // ===== REPORTE 9: GENERAR PDF (MODIFICADO) =====
  async generarPDF(data: GenerarPDFRequest): Promise<{
    success: boolean;
    message?: string;
    blob?: Blob;
  }> {
    try {
      const token = await this.storage.getToken();
      if (!token) {
        throw new Error('No hay token de autenticacion');
      }

      const response = await apiClient.post(
        `${this.baseUrl}/generar-pdf`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      console.log('Service - Respuesta recibida:', response);

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

    } catch (error: any) {
      console.error('Service - Error:', error);

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