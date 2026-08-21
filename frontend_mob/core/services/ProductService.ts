// src/core/services/ProductService.ts
import { apiClient } from './ApiClient';
import { ProductModel } from '../models/ProductModel';

export interface ProductoResponse {
  success: boolean;
  message?: string;
  data?: any;
  count?: number;
}

export interface CrearProductoRequest {
  id_categoria: number;
  nombre: string;
  descripcion: string;
  marca: string;
  precio: number;
  imagen: string;
  material: string;
  color: string;
}

export interface ActualizarProductoRequest {
  id_categoria?: number;
  nombre?: string;
  descripcion?: string;
  marca?: string;
  precio?: number;
  imagen?: string;
  material?: string;
  color?: string;
}

export class ProductService {

  // ===== OBTENER TODOS LOS PRODUCTOS =====
  async getProductos(): Promise<ProductModel[]> {
    const response = await apiClient.get<{
      success: boolean;
      count: number;
      productos: any[];
      message?: string;
    }>('/inventario/productos');

    const data = response.data;

    console.log(' Productos recibidos:', data.productos);

    if (!data.success) {
      throw new Error(
        data.message || 'Error al obtener productos'
      );
    }

    return ProductModel.fromJSONArray(data.productos || []);
  }

  // ===== OBTENER PRODUCTOS DESTACADOS =====
  async getProductosDestacados(): Promise<ProductModel[]> {
    const response = await apiClient.get<{
      success: boolean;
      count: number;
      productos: any[];
      message?: string;
    }>('/inventario/productos/destacados');

    const data = response.data;

    console.log(' Productos destacados recibidos:', data.productos);

    if (!data.success) {
      throw new Error(
        data.message || 'Error al obtener productos destacados'
      );
    }

    return ProductModel.fromJSONArray(data.productos || []);
  }

  // ===== OBTENER PRODUCTO POR ID =====
  async getProductoById(id: number): Promise<ProductModel | null> {
      console.log('getProductoById llamado con ID:', id);
    const response = await apiClient.get<{ success: boolean; data: any }>(`/inventario/productos/${id}`);
    const data = response.data;

    console.log('Respuesta del backend:', data);

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener producto');
    }

    if (!data.producto) {
        console.log('No se encontró el producto');
        return null;
        }
    console.log('Producto encontrado:', data.producto);
      return ProductModel.fromJSON(data.producto);
  }

  // ===== BUSCAR PRODUCTOS =====
  async buscarProductos(query: string): Promise<ProductModel[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/inventario/productos/buscar?q=${encodeURIComponent(query)}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al buscar productos');
    }

    return ProductModel.fromJSONArray(data.data || []);
  }

  // ===== FILTRAR PRODUCTOS =====
  async filtrarProductos(filtros: {
    precio_min?: number;
    precio_max?: number;
    marca?: string;
    color?: string;
    material?: string;
    id_categoria?: number;
  }): Promise<ProductModel[]> {
    // Limpiar filtros vacíos
    const params: any = {};
    if (filtros.precio_min !== undefined) params.precio_min = filtros.precio_min;
    if (filtros.precio_max !== undefined) params.precio_max = filtros.precio_max;
    if (filtros.marca) params.marca = filtros.marca;
    if (filtros.color) params.color = filtros.color;
    if (filtros.material) params.material = filtros.material;
    if (filtros.id_categoria !== undefined) params.id_categoria = filtros.id_categoria;

    const response = await apiClient.get<{ success: boolean; data: any[] }>('/inventario/productos/filtros', { params });
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al filtrar productos');
    }

    return ProductModel.fromJSONArray(data.data || []);
  }

  // ===== OBTENER PRODUCTOS POR CATEGORÍA =====
  async getProductosByCategoria(id_categoria: number): Promise<ProductModel[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/inventario/productos/categoria/${id_categoria}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener productos por categoría');
    }

    return ProductModel.fromJSONArray(data.data || []);
  }

  // ===== OBTENER PRODUCTOS POR MARCA =====
  async getProductosByMarca(marca: string): Promise<ProductModel[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/inventario/productos/marca/${encodeURIComponent(marca)}`);
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener productos por marca');
    }

    return ProductModel.fromJSONArray(data.data || []);
  }

  // ===== OBTENER MARCAS ÚNICAS =====
  async getMarcas(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>('/inventario/marcas');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener marcas');
    }

    return data.data || [];
  }

  // ===== OBTENER COLORES ÚNICOS =====
  async getColores(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>('/inventario/colores');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener colores');
    }

    return data.data || [];
  }

  // ===== OBTENER CATEGORÍAS =====
  async getCategorias(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; categorias: string[] }>('/inventario/categorias');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener categorías');
    }

    return data.categorias || [];
  }

  // ============================================
  // ADMIN - CRUD
  // ============================================

  // ===== CREAR PRODUCTO (ADMIN) =====
  async crearProducto(data: CrearProductoRequest): Promise<{ success: boolean; message: string; id_producto?: number }> {
    const response = await apiClient.post<ProductoResponse>('/inventario/productos', data);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || 'Error al crear el producto');
    }

    return {
      success: true,
      message: result.message || 'Producto creado exitosamente',
      id_producto: result.data?.id_producto,
    };
  }

  // ===== ACTUALIZAR PRODUCTO (ADMIN) =====
  async actualizarProducto(id: number, data: ActualizarProductoRequest): Promise<{ success: boolean; message: string; data?: any }> {
    const response = await apiClient.put<ProductoResponse>(`/inventario/productos/${id}`, data);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || 'Error al actualizar el producto');
    }

    return {
      success: true,
      message: result.message || 'Producto actualizado exitosamente',
      data: result.data,
    };
  }

  // ===== ELIMINAR PRODUCTO (ADMIN) =====
  async eliminarProducto(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<ProductoResponse>(`/inventario/productos/${id}`);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || 'Error al eliminar el producto');
    }

    return {
      success: true,
      message: result.message || 'Producto eliminado exitosamente',
    };
  }
}