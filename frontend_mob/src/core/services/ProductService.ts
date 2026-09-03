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
     const response = await apiClient.get<{
      success: boolean;
      query?: string;
      count?: number;
      productos?: any[];
      message?: string;
    }>(
    `/inventario/productos/buscar?q=${encodeURIComponent(query)}`
  );

  const data = response.data;

  console.log('Busqueda:', query);
  console.log('Resultados:', data.productos);

  if (!data.success) {
    throw new Error(
      data.message || 'Error al buscar productos'
    );
  }

  return ProductModel.fromJSONArray(data.productos || []);
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

    const response = await apiClient.get<{
        success: boolean;
        productos?: any[];
        count?: number;
      }>('/inventario/productos/filtros', { params });

      const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al filtrar productos');
    }

    return ProductModel.fromJSONArray(data.productos || []);
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
    const response = await apiClient.get<{ success: boolean; marcas: string[] }>('/inventario/marcas');
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || 'Error al obtener marcas');
    }

    return data.marcas || [];
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
    async crearProducto(data: CrearProductoRequest): Promise<{ 
    success: boolean; 
    message: string; 
    id_producto?: number 
  }> {
    try {
      console.log('Service - Creando producto con datos:', {
        id_categoria: data.id_categoria,
        nombre: data.nombre,
        tieneImagen: !!data.imagen,
      });

      const formData = new FormData();

      formData.append('id_categoria', String(data.id_categoria));
      formData.append('nombre', data.nombre);
      formData.append('descripcion', data.descripcion || '');
      formData.append('marca', data.marca || '');
      formData.append('precio', String(data.precio));
      formData.append('material', data.material || '');
      formData.append('color', data.color || '');

      if (data.imagen) {
        const uri = data.imagen;
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1] || 'jpg';
        const fileName = `producto_${Date.now()}.${fileType}`;

        let mimeType = 'image/jpeg';
        if (fileType.toLowerCase() === 'png') mimeType = 'image/png';
        else if (fileType.toLowerCase() === 'gif') mimeType = 'image/gif';
        else if (fileType.toLowerCase() === 'webp') mimeType = 'image/webp';

        // @ts-ignore
        formData.append('imagen', {
          uri: uri,
          name: fileName,
          type: mimeType,
        });

        console.log('Service - Imagen adjuntada:', fileName);
      }

      console.log('Service - Enviando FormData...');

      const response = await apiClient.post('/inventario/productos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Service - Respuesta del backend:', response.data);

      const result = response.data;

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Error al crear el producto',
        };
      }

      return {
        success: true,
        message: result.message || 'Producto creado exitosamente',
        id_producto: result.id_producto || result.data?.id_producto,
      };

    } catch (error: any) {
      console.error('Error en ProductService.crearProducto:', error);

      let errorMessage = 'No fue posible crear el producto.';
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