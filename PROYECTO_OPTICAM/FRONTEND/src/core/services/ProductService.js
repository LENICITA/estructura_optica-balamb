// src/core/services/ProductService.js
import { apiClient } from './ApiClient';
import { ProductModel } from '../../shared/types/ProductModel';
import { adjuntarImagenFormData, extraerMensajeError } from '../../shared/utils/serviceHelpers';

export class ProductService {

  // ===== OBTENER TODOS LOS PRODUCTOS =====
  async getProductos() {
    const response = await apiClient.get('/inventario/productos');
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener productos');
    return ProductModel.fromJSONArray(data.productos || []);
  }

  // ===== OBTENER PRODUCTOS DESTACADOS =====
  async getProductosDestacados() {
    const response = await apiClient.get('/inventario/productos/destacados');
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener productos destacados');
    return ProductModel.fromJSONArray(data.productos || []);
  }

  // ===== OBTENER PRODUCTO POR ID =====
  async getProductoById(id) {
    const response = await apiClient.get(`/inventario/productos/${id}`);
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener producto');
    if (!data.producto) return null;
    return ProductModel.fromJSON(data.producto);
  }

  // ===== BUSCAR PRODUCTOS =====
  async buscarProductos(query) {
    const response = await apiClient.get(`/inventario/productos/buscar?q=${encodeURIComponent(query)}`);
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al buscar productos');
    return ProductModel.fromJSONArray(data.productos || []);
  }

  // ===== FILTRAR PRODUCTOS =====
  async filtrarProductos(filtros) {
    const params = {};
    if (filtros.precio_min !== undefined) params.precio_min = filtros.precio_min;
    if (filtros.precio_max !== undefined) params.precio_max = filtros.precio_max;
    if (filtros.marca) params.marca = filtros.marca;
    if (filtros.color) params.color = filtros.color;
    if (filtros.material) params.material = filtros.material;
    if (filtros.id_categoria !== undefined) params.id_categoria = filtros.id_categoria;

    const response = await apiClient.get('/inventario/productos/filtros', { params });
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al filtrar productos');
    return ProductModel.fromJSONArray(data.productos || []);
  }

  // ===== OBTENER PRODUCTOS POR CATEGORÍA =====
  async getProductosByCategoria(id_categoria) {
    const response = await apiClient.get(`/inventario/productos/categoria/${id_categoria}`);
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener productos por categoría');
    return ProductModel.fromJSONArray(data.productos || []);
  }

  // ===== OBTENER PRODUCTOS POR MARCA =====
  async getProductosByMarca(marca) {
    const response = await apiClient.get(`/inventario/productos/marca/${encodeURIComponent(marca)}`);
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener productos por marca');
    return ProductModel.fromJSONArray(data.productos || []);
  }

  // ===== OBTENER MARCAS ÚNICAS =====
  async getMarcas() {
    const response = await apiClient.get('/inventario/marcas');
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener marcas');
    return data.marcas || [];
  }

  // ===== OBTENER COLORES ÚNICOS =====
  async getColores() {
    const response = await apiClient.get('/inventario/colores');
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener colores');
    return data.colores || [];
  }

  // ===== OBTENER CATEGORÍAS =====
  async getCategorias() {
    const response = await apiClient.get('/inventario/categorias');
    const data = response.data;
    if (!data.success) throw new Error(data.message || 'Error al obtener categorías');
    return data.categorias || [];
  }

  // ============================================
  // ADMIN - CRUD
  // ============================================

  // ===== CREAR PRODUCTO (ADMIN) =====
  async crearProducto(data) {
    try {
      const formData = new FormData();
      formData.append('id_categoria', String(data.id_categoria));
      formData.append('nombre', data.nombre);
      formData.append('descripcion', data.descripcion || '');
      formData.append('marca', data.marca || '');
      formData.append('precio', String(data.precio));
      formData.append('material', data.material || '');
      formData.append('color', data.color || '');

      adjuntarImagenFormData(formData, data.imagen, 'imagen', 'producto');

      const response = await apiClient.post('/inventario/productos', formData);
      const result = response.data;

      if (!result.success) {
        return { success: false, message: result.message || 'Error al crear el producto' };
      }

      return {
        success: true,
        message: result.message || 'Producto creado exitosamente',
        id_producto: result.id_producto || result.data?.id_producto,
      };
    } catch (error) {
      console.error('Error en ProductService.crearProducto:', error);
      return { success: false, message: extraerMensajeError(error, 'No fue posible crear el producto.') };
    }
  }

  // ===== ACTUALIZAR PRODUCTO (ADMIN) =====
  async actualizarProducto(id, data) {
    try {
      const formData = new FormData();

      if (data.id_categoria !== undefined) formData.append('id_categoria', String(data.id_categoria));
      if (data.nombre !== undefined) formData.append('nombre', data.nombre);
      if (data.descripcion !== undefined) formData.append('descripcion', data.descripcion || '');
      if (data.marca !== undefined) formData.append('marca', data.marca || '');
      if (data.precio !== undefined) formData.append('precio', String(data.precio));
      if (data.material !== undefined) formData.append('material', data.material || '');
      if (data.color !== undefined) formData.append('color', data.color || '');

      const esUrlExistente = typeof data.imagen === 'string' && data.imagen.startsWith('http');
      if (data.imagen && !esUrlExistente) {
        adjuntarImagenFormData(formData, data.imagen, 'imagen', 'producto');
      }

      const response = await apiClient.put(`/inventario/productos/${id}`, formData);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || 'Error al actualizar el producto');
      }

      return {
        success: true,
        message: result.message || 'Producto actualizado exitosamente',
        data: result.producto || result.data,
      };
    } catch (error) {
      console.error('Error en ProductService.actualizarProducto:', error);
      throw new Error(extraerMensajeError(error, 'No fue posible actualizar el producto.'));
    }
  }

  // ===== ELIMINAR PRODUCTO (ADMIN) =====
  async eliminarProducto(id) {
    const response = await apiClient.delete(`/inventario/productos/${id}`);
    const result = response.data;
    if (!result.success) throw new Error(result.message || 'Error al eliminar el producto');
    return { success: true, message: result.message || 'Producto eliminado exitosamente' };
  }
}