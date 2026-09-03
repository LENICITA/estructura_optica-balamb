// src/core/controllers/ReporteController.ts

import { ReporteService } from '../services/ReporteService';
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

export class ReporteController {
  private reporteService: ReporteService;

  constructor() {
    this.reporteService = new ReporteService();
  }

  // ===== REPORTE 1: VENTAS POR PERÍODO =====
  async getVentasPorPeriodo(
    fecha_inicio: string,
    fecha_fin: string
  ): Promise<ReporteVentasResponse | null> {
    try {
      return await this.reporteService.getVentasPorPeriodo(fecha_inicio, fecha_fin);
    } catch (error) {
      console.error('Error en getVentasPorPeriodo:', error);
      return null;
    }
  }

  // ===== REPORTE 2: PRODUCTOS MÁS VENDIDOS =====
  async getProductosMasVendidos(
    limite: number = 10,
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteProductosResponse | null> {
    try {
      return await this.reporteService.getProductosMasVendidos(limite, fecha_inicio, fecha_fin);
    } catch (error) {
      console.error('Error en getProductosMasVendidos:', error);
      return null;
    }
  }

  // ===== REPORTE 3: DESEMPEÑO DE REPARTIDORES =====
  async getDesempenoRepartidores(
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteRepartidoresResponse | null> {
    try {
      return await this.reporteService.getDesempenoRepartidores(fecha_inicio, fecha_fin);
    } catch (error) {
      console.error('Error en getDesempenoRepartidores:', error);
      return null;
    }
  }

  // ===== REPORTE 4: ESTADO DE PEDIDOS =====
  async getEstadoPedidos(
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteEstadoPedidosResponse | null> {
    try {
      return await this.reporteService.getEstadoPedidos(fecha_inicio, fecha_fin);
    } catch (error) {
      console.error('Error en getEstadoPedidos:', error);
      return null;
    }
  }

  // ===== REPORTE 5: CLIENTES FRECUENTES =====
  async getClientesFrecuentes(
    limite: number = 10,
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteClientesResponse | null> {
    try {
      return await this.reporteService.getClientesFrecuentes(limite, fecha_inicio, fecha_fin);
    } catch (error) {
      console.error('Error en getClientesFrecuentes:', error);
      return null;
    }
  }

  // ===== REPORTE 6: RESUMEN GENERAL =====
  async getResumenGeneral(): Promise<ReporteResumenGeneralResponse | null> {
    try {
      return await this.reporteService.getResumenGeneral();
    } catch (error) {
      console.error('Error en getResumenGeneral:', error);
      return null;
    }
  }

  // ===== REPORTE 7: VENTAS POR CATEGORÍA =====
  async getVentasPorCategoria(
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<ReporteVentasCategoriaResponse | null> {
    try {
      return await this.reporteService.getVentasPorCategoria(fecha_inicio, fecha_fin);
    } catch (error) {
      console.error('Error en getVentasPorCategoria:', error);
      return null;
    }
  }

  // ===== REPORTE 8: ANÁLISIS DE FÓRMULAS =====
  async getAnalisisFormulas(): Promise<ReporteAnalisisFormulasResponse | null> {
    try {
      return await this.reporteService.getAnalisisFormulas();
    } catch (error) {
      console.error('Error en getAnalisisFormulas:', error);
      return null;
    }
  }

  // ===== REPORTE 9: GENERAR PDF =====
  async generarPDF(data: GenerarPDFRequest): Promise<GenerarPDFResponse | null> {
    try {
      return await this.reporteService.generarPDF(data);
    } catch (error) {
      console.error('Error en generarPDF:', error);
      return null;
    }
  }
}