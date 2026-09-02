// src/core/controllers/ProductController.ts

import { ProductService } from '../services/ProductService';
import { ProductModel } from '../models/ProductModel';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  // ============================================
  // PÚBLICOS - CLIENTE
  // ============================================

  async getProductos(): Promise<ProductModel[]> {
    try {
      return await this.productService.getProductos();
    } catch (error) {
      console.error(' Error en getProductos:', error);
      return [];
    }
  }

  async getProductosDestacados(): Promise<ProductModel[]> {
    try {
      const productos = await this.productService.getProductosDestacados();
      return productos || [];
    } catch (error) {
      console.error(' Error en getProductosDestacados:', error);
      return [];
    }
  }

  async getProductoById(id: number): Promise<ProductModel | null> {
    try {
      console.log('Controller - getProductoById con ID:', id);
          const producto = await this.productService.getProductoById(id);
          console.log('Controller - producto obtenido:', producto);
          return producto;
        } catch (error) {
          console.error(' Error en getProductoById:', error);
          return null;
        }
      }

  async buscarProductos(query: string): Promise<ProductModel[]> {
    try {
      if (!query || query.trim() === '') return [];
      return await this.productService.buscarProductos(query.trim());
    } catch (error) {
      console.error(' Error en buscarProductos:', error);
      return [];
    }
  }

  async filtrarProductos(filtros: {
    precio_min?: number;
    precio_max?: number;
    marca?: string;
    color?: string;
    material?: string;
    id_categoria?: number;
  }): Promise<ProductModel[]> {
    try {
      return await this.productService.filtrarProductos(filtros);
    } catch (error) {
      console.error(' Error en filtrarProductos:', error);
      return [];
    }
  }

  async getProductosByCategoria(id_categoria: number): Promise<ProductModel[]> {
    try {
      return await this.productService.getProductosByCategoria(id_categoria);
    } catch (error) {
      console.error(' Error en getProductosByCategoria:', error);
      return [];
    }
  }

  async getProductosByMarca(marca: string): Promise<ProductModel[]> {
    try {
      return await this.productService.getProductosByMarca(marca);
    } catch (error) {
      console.error(' Error en getProductosByMarca:', error);
      return [];
    }
  }

  async getMarcas(): Promise<string[]> {
    try {
      return await this.productService.getMarcas();
    } catch (error) {
      console.error(' Error en getMarcas:', error);
      return [];
    }
  }

  async getColores(): Promise<string[]> {
    try {
      return await this.productService.getColores();
    } catch (error) {
      console.error(' Error en getColores:', error);
      return [];
    }
  }

  async getCategorias(): Promise<string[]> {
    try {
      return await this.productService.getCategorias();
    } catch (error) {
      console.error(' Error en getCategorias:', error);
      return [];
    }
  }

  // ============================================
  // ADMIN - CRUD
  // ============================================

  async crearProducto(data: {
    id_categoria: number;
    nombre: string;
    descripcion: string;
    marca: string;
    precio: number;
    imagen: string;
    material: string;
    color: string;
  }): Promise<{ success: boolean; message: string; id_producto?: number }> {
    try {
      if (!data.id_categoria || !data.nombre || !data.precio) {
        return { success: false, message: 'Categoría, nombre y precio son requeridos' };
      }
      const response = await this.productService.crearProducto(data);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al crear producto' };
      }
      return {
        success: true,
        message: response.message || 'Producto creado exitosamente',
        id_producto: response.id_producto,
      };
    } catch (error: any) {
      console.error(' Error en crearProducto:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear producto',
      };
    }
  }

  async actualizarProducto(id: number, data: {
    id_categoria?: number;
    nombre?: string;
    descripcion?: string;
    marca?: string;
    precio?: number;
    imagen?: string;
    material?: string;
    color?: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await this.productService.actualizarProducto(id, data);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al actualizar producto' };
      }
      return {
        success: true,
        message: response.message || 'Producto actualizado exitosamente',
        data: response.data,
      };
    } catch (error: any) {
      console.error(' Error en actualizarProducto:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar producto',
      };
    }
  }

  async eliminarProducto(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.productService.eliminarProducto(id);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al eliminar producto' };
      }
      return {
        success: true,
        message: response.message || 'Producto eliminado exitosamente',
      };
    } catch (error: any) {
      console.error(' Error en eliminarProducto:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar producto',
      };
    }
  }
}