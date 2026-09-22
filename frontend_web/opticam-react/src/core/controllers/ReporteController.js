// src/core/controllers/ReporteController.js
import { ReporteService } from '../services/ReporteService';

export class ReporteController {
  constructor() {
    this.reporteService = new ReporteService();
  }

  // ===== REPORTE 1: VENTAS POR PERÍODO =====
  async getVentasPorPeriodo(fecha_inicio, fecha_fin) {
    try {
      return await this.reporteService.getVentasPorPeriodo(fecha_inicio, fecha_fin);
    } catch (error) {
      console.error(' Error en getVentasPorPeriodo:', error);
      return null;
    }
  }

  // ===== REPORTE 2: PRODUCTOS MÁS VENDIDOS =====
  async getProductosMasVendidos(limite = 10, fecha_inicio, fecha_fin) {
    try {
      return await this.reporteService.getProductosMasVendidos(limite, fecha_inicio, fecha_fin);
    } catch (error) {
      console.error(' Error en getProductosMasVendidos:', error);
      return null;
    }
  }

  // ===== REPORTE 3: DESEMPEÑO DE REPARTIDORES =====
  async getDesempenoRepartidores(fecha_inicio, fecha_fin) {
    try {
      return await this.reporteService.getDesempenoRepartidores(fecha_inicio, fecha_fin);
    } catch (error) {
      console.error(' Error en getDesempenoRepartidores:', error);
      return null;
    }
  }

  // ===== REPORTE 4: ESTADO DE PEDIDOS =====
  async getEstadoPedidos(fecha_inicio, fecha_fin) {
    try {
      return await this.reporteService.getEstadoPedidos(fecha_inicio, fecha_fin);
    } catch (error) {
      console.error(' Error en getEstadoPedidos:', error);
      return null;
    }
  }

  // ===== REPORTE 5: CLIENTES FRECUENTES =====
  async getClientesFrecuentes(limite = 10, fecha_inicio, fecha_fin) {
    try {
      return await this.reporteService.getClientesFrecuentes(limite, fecha_inicio, fecha_fin);
    } catch (error) {
      console.error(' Error en getClientesFrecuentes:', error);
      return null;
    }
  }

  // ===== REPORTE 6: RESUMEN GENERAL =====
  async getResumenGeneral() {
    try {
      return await this.reporteService.getResumenGeneral();
    } catch (error) {
      console.error(' Error en getResumenGeneral:', error);
      return null;
    }
  }

  // ===== REPORTE 7: VENTAS POR CATEGORÍA =====
  async getVentasPorCategoria(fecha_inicio, fecha_fin) {
    try {
      return await this.reporteService.getVentasPorCategoria(fecha_inicio, fecha_fin);
    } catch (error) {
      console.error(' Error en getVentasPorCategoria:', error);
      return null;
    }
  }

  // ===== REPORTE 8: ANÁLISIS DE FÓRMULAS =====
  async getAnalisisFormulas() {
    try {
      return await this.reporteService.getAnalisisFormulas();
    } catch (error) {
      console.error(' Error en getAnalisisFormulas:', error);
      return null;
    }
  }

  // ===== REPORTE 9: GENERAR PDF =====
  async generarPDF(data) {
    try {
      console.log(' Controller - generarPDF:', data);
      const result = await this.reporteService.generarPDF(data);
      console.log(' Controller - Resultado:', result);
      return result;
    } catch (error) {
      console.error(' Controller - Error:', error);
      return {
        success: false,
        message: error.message || 'Error al generar el reporte',
      };
    }
  }
}