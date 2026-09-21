// src/core/controllers/ProductController.js
import { ProductService } from '../services/ProductService';
import {
  validarFormularioProducto,
  validarFormularioEditarProducto,
  checkIdProducto
} from '../../shared/validators/productoValidators';

export class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  // ============================================
  // PÚBLICOS - CLIENTE
  // ============================================

  async getProductos() {
    try {
      return await this.productService.getProductos();
    } catch (error) {
      console.error(' Error en getProductos:', error);
      return [];
    }
  }

  async getProductosDestacados() {
    try {
      const productos = await this.productService.getProductosDestacados();
      return productos || [];
    } catch (error) {
      console.error(' Error en getProductosDestacados:', error);
      return [];
    }
  }

  async getProductoById(id) {
    try {
      console.log(' Controller - getProductoById con ID:', id);
      const checkId = checkIdProducto(id);
      if (!checkId.valido) {
        console.error('ID de producto inválido:', id);
        return null;
      }
      const producto = await this.productService.getProductoById(id);
      console.log(' Controller - producto obtenido:', producto);
      return producto;
    } catch (error) {
      console.error(' Error en getProductoById:', error);
      return null;
    }
  }

  async buscarProductos(query) {
    try {
      if (!query || query.trim() === '') return [];
      return await this.productService.buscarProductos(query.trim());
    } catch (error) {
      console.error(' Error en buscarProductos:', error);
      return [];
    }
  }

  async filtrarProductos(filtros) {
    try {
      return await this.productService.filtrarProductos(filtros);
    } catch (error) {
      console.error(' Error en filtrarProductos:', error);
      return [];
    }
  }

  async getProductosByCategoria(id_categoria) {
    try {
      return await this.productService.getProductosByCategoria(id_categoria);
    } catch (error) {
      console.error(' Error en getProductosByCategoria:', error);
      return [];
    }
  }

  async getProductosByMarca(marca) {
    try {
      return await this.productService.getProductosByMarca(marca);
    } catch (error) {
      console.error(' Error en getProductosByMarca:', error);
      return [];
    }
  }

  async getMarcas() {
    try {
      return await this.productService.getMarcas();
    } catch (error) {
      console.error(' Error en getMarcas:', error);
      return [];
    }
  }

  async getColores() {
    try {
      return await this.productService.getColores();
    } catch (error) {
      console.error(' Error en getColores:', error);
      return [];
    }
  }

  async getCategorias() {
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

  async crearProducto(data) {
    try {
      console.log(' Controller - crearProducto:', {
        id_categoria: data.id_categoria,
        nombre: data.nombre,
        tieneImagen: !!data.imagen,
      });

      const check = validarFormularioProducto({
        id_categoria: data.id_categoria,
        nombre: data.nombre,
        descripcion: data.descripcion,
        marca: data.marca,
        precio: data.precio,
        imagen: data.imagen,
        material: data.material,
        color: data.color
      });

      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'Datos inválidos'
        };
      }

      const response = await this.productService.crearProducto(data);

      console.log(' Controller - Respuesta creación:', response);

      return response;

    } catch (error) {
      console.error(' Error en crearProducto:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear el producto',
      };
    }
  }

  async actualizarProducto(id, data) {
    try {
      const checkId = checkIdProducto(id);
      if (!checkId.valido) {
        return {
          success: false,
          message: checkId.mensaje || 'ID de producto inválido'
        };
      }

      const check = validarFormularioEditarProducto({
        id_categoria: data.id_categoria,
        nombre: data.nombre,
        descripcion: data.descripcion,
        marca: data.marca,
        precio: data.precio,
        imagen: data.imagen,
        material: data.material,
        color: data.color
      });

      if (!check.valido) {
        return {
          success: false,
          message: check.mensaje || 'Datos inválidos'
        };
      }
      const response = await this.productService.actualizarProducto(id, data);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al actualizar producto' };
      }
      return {
        success: true,
        message: response.message || 'Producto actualizado exitosamente',
        data: response.data,
      };
    } catch (error) {
      console.error(' Error en actualizarProducto:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar producto',
      };
    }
  }

  async eliminarProducto(id) {
    try {
      const checkId = checkIdProducto(id);
      if (!checkId.valido) {
        return {
          success: false,
          message: checkId.mensaje || 'ID de producto inválido'
        };
      }
      const response = await this.productService.eliminarProducto(id);
      if (!response.success) {
        return { success: false, message: response.message || 'Error al eliminar producto' };
      }
      return {
        success: true,
        message: response.message || 'Producto eliminado exitosamente',
      };
    } catch (error) {
      console.error(' Error en eliminarProducto:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar producto',
      };
    }
  }
}