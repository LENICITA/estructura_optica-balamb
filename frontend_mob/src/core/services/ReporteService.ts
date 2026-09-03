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

export class ReporteService {
  private baseUrl = '/reportes';

  // ===== REPORTE 1: VENTAS POR PERÍODO =====
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

  // ===== REPORTE 2: PRODUCTOS MÁS VENDIDOS =====
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

  // ===== REPORTE 7: VENTAS POR CATEGORÍA =====
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

  // ===== REPORTE 8: ANÁLISIS DE FÓRMULAS =====
  async getAnalisisFormulas(): Promise<ReporteAnalisisFormulasResponse> {
    const response = await apiClient.get<ReporteAnalisisFormulasResponse>(
      `${this.baseUrl}/analisis-formulas`
    );
    return response.data;
  }

  // ===== REPORTE 9: GENERAR PDF =====
  async generarPDF(data: GenerarPDFRequest): Promise<GenerarPDFResponse> {
    const response = await apiClient.post<GenerarPDFResponse>(
      `${this.baseUrl}/generar-pdf`,
      data,
      { responseType: 'blob' }
    );
    return response.data;
  }
}