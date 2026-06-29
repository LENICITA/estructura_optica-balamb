import Inventario from '../models/inventario.js';
import { obtenerUrlImagen, obtenerThumbnail } from '../utils/imageUtils.js';
import cloudinary from '../config/cloudinary.js';

// ========== PRODUCTOS ==========

// Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    const results = await Inventario.getAll();

    const productosConImagen = results.map(p => ({
      ...p,
      imagen_url: obtenerUrlImagen(p.imagen, 400, 400),
      imagen_thumbnail: obtenerThumbnail(p.imagen)
    }));

    res.json({
      success: true,
      count: productosConImagen.length,
      productos: productosConImagen
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos"
    });
  }
};

// Obtener productos destacados (últimos 6)
export const getProductosDestacados = async (req, res) => {
  try {
    const results = await Inventario.getDestacados();

    const productosConImagen = results.map(p => ({
      ...p,
      imagen_url: obtenerUrlImagen(p.imagen, 400, 400),
      imagen_thumbnail: obtenerThumbnail(p.imagen)
    }));

    res.json({
      success: true,
      count: productosConImagen.length,
      productos: productosConImagen
    });
  } catch (error) {
    console.error("Error al obtener productos destacados:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos destacados"
    });
  }
};

// Obtener producto por ID
export const getProductoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Inventario.findById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    const productoConImagen = {
      ...result,
      imagen_url: obtenerUrlImagen(result.imagen, 400, 400),
      imagen_thumbnail: obtenerThumbnail(result.imagen)
    };

    res.json({
      success: true,
      producto: productoConImagen
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto"
    });
  }
};

// Filtrar productos
export const filtrarProductos = async (req, res) => {
  try {
    const filtros = {
      precio_min: req.query.precio_min,
      precio_max: req.query.precio_max,
      marca: req.query.marca,
      color: req.query.color,
      material: req.query.material,
      id_categoria: req.query.id_categoria,
      busqueda: req.query.q
    };

    const results = await Inventario.filtrar(filtros);

    const productosConImagen = results.map(p => ({
      ...p,
      imagen_url: obtenerUrlImagen(p.imagen, 400, 400),
      imagen_thumbnail: obtenerThumbnail(p.imagen)
    }));

    res.json({
      success: true,
      count: productosConImagen.length,
      filtros: filtros,
      productos: productosConImagen
    });
  } catch (error) {
    console.error("Error al filtrar productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al filtrar productos"
    });
  }
};

// Buscar productos por texto
export const buscarProductos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Debes proporcionar un término de búsqueda"
      });
    }

    const results = await Inventario.buscar(q);

    const productosConImagen = results.map(p => ({
      ...p,
      imagen_url: obtenerUrlImagen(p.imagen, 400, 400),
      imagen_thumbnail: obtenerThumbnail(p.imagen)
    }));

    res.json({
      success: true,
      query: q,
      count: productosConImagen.length,
      productos: productosConImagen
    });
  } catch (error) {
    console.error("Error al buscar productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al buscar productos"
    });
  }
};

// Obtener productos por categoría
export const getProductosByCategoria = async (req, res) => {
  try {
    const { id_categoria } = req.params;
    const results = await Inventario.getByCategoria(id_categoria);

    const productosConImagen = results.map(p => ({
      ...p,
      imagen_url: obtenerUrlImagen(p.imagen, 400, 400),
      imagen_thumbnail: obtenerThumbnail(p.imagen)
    }));

    res.json({
      success: true,
      id_categoria: id_categoria,
      count: productosConImagen.length,
      productos: productosConImagen
    });
  } catch (error) {
    console.error("Error al obtener productos por categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos por categoría"
    });
  }
};

// Obtener productos por marca
export const getProductosByMarca = async (req, res) => {
  try {
    const { marca } = req.params;
    const results = await Inventario.getByMarca(marca);

    const productosConImagen = results.map(p => ({
      ...p,
      imagen_url: obtenerUrlImagen(p.imagen, 400, 400),
      imagen_thumbnail: obtenerThumbnail(p.imagen)
    }));

    res.json({
      success: true,
      marca: marca,
      count: productosConImagen.length,
      productos: productosConImagen
    });
  } catch (error) {
    console.error("Error al obtener productos por marca:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos por marca"
    });
  }
};

// Obtener todas las marcas
export const getMarcas = async (req, res) => {
  try {
    const results = await Inventario.getMarcas();
    const marcas = results.map(item => item.marca);
    res.json({
      success: true,
      count: marcas.length,
      marcas: marcas
    });
  } catch (error) {
    console.error("Error al obtener marcas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener marcas"
    });
  }
};

// Obtener todos los colores
export const getColores = async (req, res) => {
  try {
    const results = await Inventario.getColores();
    const colores = results.map(item => item.color);
    res.json({
      success: true,
      count: colores.length,
      colores: colores
    });
  } catch (error) {
    console.error("Error al obtener colores:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener colores"
    });
  }
};

// Crear producto (solo admin)
export const createProducto = async (req, res) => {
  try {
    const { id_categoria, nombre, descripcion, marca, precio, material, color } = req.body;

    if (!id_categoria) {
      return res.status(400).json({
        success: false,
        message: "El campo id_categoria es obligatorio"
      });
    }
    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El campo nombre es obligatorio"
      });
    }
    if (!precio) {
      return res.status(400).json({
        success: false,
        message: "El campo precio es obligatorio"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "La imagen es requerida"
      });
    }

    const result = await Inventario.create({
      id_categoria,
      nombre,
      descripcion: descripcion || "",
      marca: marca || "",
      precio,
      imagen: req.file.path,
      material: material || "",
      color: color || ""
    });

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      id_producto: result.insertId,
      imagen_cloudinary: req.file.path
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear producto"
    });
  }
};

// Actualizar producto (solo admin)
export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_categoria, nombre, descripcion, marca, precio, material, color } = req.body;

    const productoActual = await Inventario.findById(id);

    if (!productoActual) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    // SI HAY NUEVA IMAGEN, SUBIR AUTOMÁTICAMENTE

    let imagenFinal = productoActual.imagen;

    if (req.file) {
      imagenFinal = req.file.path;

      // 2. Eliminar imagen anterior de Cloudinary
      if (productoActual.imagen) {
        try {
          const urlParts = productoActual.imagen.split('/');
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExt.split('.')[0];
          await cloudinary.uploader.destroy(`opticam/productos/${publicId}`);
        } catch (error) {
          console.log('Error al eliminar imagen anterior:', error);
        }
      }
    }

    await Inventario.update(id, {
      id_categoria: id_categoria || productoActual.id_categoria,
      nombre: nombre || productoActual.nombre,
      descripcion: descripcion !== undefined ? descripcion : productoActual.descripcion,
      marca: marca !== undefined ? marca : productoActual.marca,
      precio: precio !== undefined ? precio : productoActual.precio,
      imagen: imagenFinal,
      material: material !== undefined ? material : productoActual.material,
      color: color !== undefined ? color : productoActual.color
    });

    const updatedProduct = await Inventario.findById(id);
    const productoConImagen = {
      ...updatedProduct,
      imagen_url: obtenerUrlImagen(updatedProduct.imagen, 400, 400),
      imagen_thumbnail: obtenerThumbnail(updatedProduct.imagen)
    };

    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
      producto: productoConImagen
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar producto"
    });
  }
};

// Eliminar producto (solo admin)
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Inventario.findById(id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    // ELIMINAR IMAGEN DE CLOUDINARY
  
    if (producto.imagen) {
      try {
        const urlParts = producto.imagen.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        await cloudinary.uploader.destroy(`opticam/productos/${publicId}`);
      } catch (error) {
        console.log('Error al eliminar imagen de Cloudinary:', error);
      }
    }

    await Inventario.delete(id);

    res.json({
      success: true,
      message: "Producto eliminado exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto"
    });
  }
};

// ========== CATEGORIAS ==========

// Obtener todas las categorías
export const getCategorias = async (req, res) => {
  try {
    const results = await Inventario.getCategorias();
    res.json({
      success: true,
      count: results.length,
      categorias: results
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener categorías"
    });
  }
};

// Obtener categoría por ID
export const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Inventario.getCategoriaById(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada"
      });
    }

    res.json({
      success: true,
      categoria: result
    });
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener categoría"
    });
  }
};

// Crear categoría (solo admin)
export const createCategoria = async (req, res) => {
  try {
    const { tipo_categoria, descripcion } = req.body;

    if (!tipo_categoria) {
      return res.status(400).json({
        success: false,
        message: "El campo tipo_categoria es obligatorio"
      });
    }

    const result = await Inventario.createCategoria({
      tipo_categoria,
      descripcion: descripcion || ""
    });

    res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      id_categoria: result.insertId
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear categoría"
    });
  }
};

// Actualizar categoría (solo admin)
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_categoria, descripcion } = req.body;

    const categoriaActual = await Inventario.getCategoriaById(id);

    if (!categoriaActual) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada"
      });
    }

    await Inventario.updateCategoria(id, {
      tipo_categoria: tipo_categoria || categoriaActual.tipo_categoria,
      descripcion: descripcion !== undefined ? descripcion : categoriaActual.descripcion
    });

    const updatedCategoria = await Inventario.getCategoriaById(id);

    res.json({
      success: true,
      message: "Categoría actualizada exitosamente",
      categoria: updatedCategoria
    });
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar categoría"
    });
  }
};

// Eliminar categoría (solo admin)
export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Inventario.getCategoriaById(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada"
      });
    }

    await Inventario.deleteCategoria(id);

    res.json({
      success: true,
      message: "Categoría eliminada exitosamente"
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar categoría"
    });
  }
};