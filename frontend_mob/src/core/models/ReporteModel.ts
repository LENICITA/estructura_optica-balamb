// src/core/models/ReporteModel.ts

export interface ResumenVentas {
  total_pedidos: number;
  ventas_totales: number;
  promedio_venta: number;
  clientes_unicos: number;
}

export interface VentaDiaria {
  fecha: string;
  total_pedidos: number;
  ventas_totales: number;
  promedio_venta: number;
}

export interface ProductoMasVendido {
  id_producto: number;
  producto: string;
  marca: string;
  precio: number;
  categoria: string;
  total_vendidos: number;
  ingreso_total: number;
}

export interface DesempenoRepartidor {
  id_usuario: number;
  repartidor: string;
  telefono: string;
  ciudad: string;
  tipo_vehiculo: string;
  placa: string;
  pedidos_asignados: number;
  pedidos_entregados: number;
  valor_total_entregas: number;
  promedio_venta: number;
  usuario_estado: string;
}

export interface EstadoPedido {
  estado: string;
  cantidad: number;
  monto_total: number;
  promedio: number;
  minimo: number;
  maximo: number;
}

export interface ClienteFrecuente {
  id_usuario: number;
  cliente: string;
  email: string;
  telefono: string;
  ciudad: string;
  total_pedidos: number;
  total_gastado: number;
  promedio_gasto: number;
  mayor_compra: number;
  menor_compra: number;
}

export interface ResumenGeneral {
  clientes: number;
  repartidores: number;
  productos: number;
  pedidos_totales: number;
  ingresos_totales: number;
  pedidos_ultimo_mes: number;
  ingresos_ultimo_mes: number;
  formulas_aprobadas: number;
  formulas_pendientes: number;
  ingresos_por_mes: Array<{
    mes: string;
    pedidos: number;
    ingresos: number;
    envios: number;
  }>;
}

export interface VentasPorCategoria {
  categoria: string;
  pedidos: number;
  unidades_vendidas: number;
  ingresos: number;
  precio_promedio: number;
}

export interface AnalisisFormulas {
  distribucion_condiciones: Array<{
    condicion: string;
    cantidad: number;
    costo_promedio: number;
    costo_total: number;
    clientes_unicos: number;
  }>;
  tendencia_mensual: Array<{
    mes: string;
    nuevas_formulas: number;
    costo_promedio: number;
    aprobadas: number;
  }>;
  estadisticas_estado: Array<{
    estado: string;
    total: number;
    costo_promedio: number;
  }>;
  total_formulas_aprobadas: number;
}

export interface ReporteVentasResponse {
  success: boolean;
  data: {
    periodo: { fecha_inicio: string; fecha_fin: string };
    resumen: ResumenVentas;
    detalle_por_dia: VentaDiaria[];
  };
}

export interface ReporteProductosResponse {
  success: boolean;
  data: ProductoMasVendido[];
}

export interface ReporteRepartidoresResponse {
  success: boolean;
  data: DesempenoRepartidor[];
}

export interface ReporteEstadoPedidosResponse {
  success: boolean;
  data: {
    resumen: { total_pedidos: number; monto_total: number };
    detalle: EstadoPedido[];
  };
}

export interface ReporteClientesResponse {
  success: boolean;
  data: ClienteFrecuente[];
}

export interface ReporteResumenGeneralResponse {
  success: boolean;
  data: ResumenGeneral;
}

export interface ReporteVentasCategoriaResponse {
  success: boolean;
  data: {
    resumen: { total_unidades: number; total_ingresos: number };
    detalle: VentasPorCategoria[];
  };
}

export interface ReporteAnalisisFormulasResponse {
  success: boolean;
  data: AnalisisFormulas;
}

export interface GenerarPDFRequest {
  tipo: string;
  periodo: 'diario' | 'semanal' | 'mensual' | 'anual' | 'personalizado';
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface GenerarPDFResponse {
  success: boolean;
  message: string;
  data?: {
    url?: string;
    filename?: string;
  };
}

export class ReporteModel {
  static fromJSON<T>(data: any): T {
    return data as T;
  }

  static fromJSONArray<T>(data: any[]): T[] {
    return data as T[];
  }
}