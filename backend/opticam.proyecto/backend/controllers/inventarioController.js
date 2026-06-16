// controllers/inventarioController.js
const Inventario = require('../models/inventario');

// ========== PRODUCTOS ==========

// Obtener todos los productos
const getProductos = (req, res) => {
  Inventario.getAll((err, results) => {
    if (err) {
      console.error("Error al obtener productos:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos"
      });
    }
    res.json({
      success: true,
      count: results.length,
      productos: results
    });
  });
};

// Obtener productos destacados (últimos 6)
const getProductosDestacados = (req, res) => {
  Inventario.getDestacados((err, results) => {
    if (err) {
      console.error("Error al obtener productos destacados:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos destacados"
      });
    }
    res.json({
      success: true,
      count: results.length,
      productos: results
    });
  });
};

// Obtener producto por ID
const getProductoById = (req, res) => {
  const { id } = req.params;

  Inventario.findById(id, (err, results) => {
    if (err) {
      console.error("Error al obtener producto:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener producto"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    res.json({
      success: true,
      producto: results[0]
    });
  });
};

// Filtrar productos
const filtrarProductos = (req, res) => {
  const filtros = {
    precio_min: req.query.precio_min,
    precio_max: req.query.precio_max,
    marca: req.query.marca,
    color: req.query.color,
    material: req.query.material,
    id_categoria: req.query.id_categoria,
    busqueda: req.query.q
  };

  Inventario.filtrar(filtros, (err, results) => {
    if (err) {
      console.error("Error al filtrar productos:", err);
      return res.status(500).json({
        success: false,
        message: "Error al filtrar productos"
      });
    }
    res.json({
      success: true,
      count: results.length,
      filtros: filtros,
      productos: results
    });
  });
};

// Buscar productos por texto
const buscarProductos = (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Debes proporcionar un término de búsqueda"
    });
  }

  Inventario.buscar(q, (err, results) => {
    if (err) {
      console.error("Error al buscar productos:", err);
      return res.status(500).json({
        success: false,
        message: "Error al buscar productos"
      });
    }
    res.json({
      success: true,
      query: q,
      count: results.length,
      productos: results
    });
  });
};

// Obtener productos por categoría
const getProductosByCategoria = (req, res) => {
  const { id_categoria } = req.params;

  Inventario.getByCategoria(id_categoria, (err, results) => {
    if (err) {
      console.error("Error al obtener productos por categoría:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos por categoría"
      });
    }
    res.json({
      success: true,
      id_categoria: id_categoria,
      count: results.length,
      productos: results
    });
  });
};

// Obtener productos por marca
const getProductosByMarca = (req, res) => {
  const { marca } = req.params;

  Inventario.getByMarca(marca, (err, results) => {
    if (err) {
      console.error("Error al obtener productos por marca:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener productos por marca"
      });
    }
    res.json({
      success: true,
      marca: marca,
      count: results.length,
      productos: results
    });
  });
};

// Obtener todas las marcas
const getMarcas = (req, res) => {
  Inventario.getMarcas((err, results) => {
    if (err) {
      console.error("Error al obtener marcas:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener marcas"
      });
    }
    const marcas = results.map(item => item.marca);
    res.json({
      success: true,
      count: marcas.length,
      marcas: marcas
    });
  });
};

// Obtener todos los colores
const getColores = (req, res) => {
  Inventario.getColores((err, results) => {
    if (err) {
      console.error("Error al obtener colores:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener colores"
      });
    }
    const colores = results.map(item => item.color);
    res.json({
      success: true,
      count: colores.length,
      colores: colores
    });
  });
};

// Crear producto (solo admin)
const createProducto = (req, res) => {
  const { id_categoria, nombre, descripcion, marca, precio, imagen, material, color } = req.body;

  // Validar campos obligatorios
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

  Inventario.create({
    id_categoria,
    nombre,
    descripcion: descripcion || "",
    marca: marca || "",
    precio,
    imagen: imagen || "",
    material: material || "",
    color: color || ""
  }, (err, result) => {
    if (err) {
      console.error("Error al crear producto:", err);
      return res.status(500).json({
        success: false,
        message: "Error al crear producto"
      });
    }

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      id_producto: result.insertId
    });
  });
};

// Actualizar producto (solo admin)
const updateProducto = (req, res) => {
  const { id } = req.params;
  const { id_categoria, nombre, descripcion, marca, precio, imagen, material, color } = req.body;

  // Verificar si el producto existe
  Inventario.findById(id, (err, results) => {
    if (err) {
      console.error("Error al verificar producto:", err);
      return res.status(500).json({
        success: false,
        message: "Error al verificar producto"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    const productoActual = results[0];

    // Actualizar solo los campos enviados
    Inventario.update(id, {
      id_categoria: id_categoria || productoActual.id_categoria,
      nombre: nombre || productoActual.nombre,
      descripcion: descripcion !== undefined ? descripcion : productoActual.descripcion,
      marca: marca !== undefined ? marca : productoActual.marca,
      precio: precio !== undefined ? precio : productoActual.precio,
      imagen: imagen !== undefined ? imagen : productoActual.imagen,
      material: material !== undefined ? material : productoActual.material,
      color: color !== undefined ? color : productoActual.color
    }, (err, result) => {
      if (err) {
        console.error("Error al actualizar producto:", err);
        return res.status(500).json({
          success: false,
          message: "Error al actualizar producto"
        });
      }

      // Obtener el producto actualizado
      Inventario.findById(id, (err, updatedResults) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error al obtener producto actualizado"
          });
        }
        res.json({
          success: true,
          message: "Producto actualizado exitosamente",
          producto: updatedResults[0]
        });
      });
    });
  });
};

// Eliminar producto (solo admin)
const deleteProducto = (req, res) => {
  const { id } = req.params;

  // Verificar si el producto existe
  Inventario.findById(id, (err, results) => {
    if (err) {
      console.error("Error al verificar producto:", err);
      return res.status(500).json({
        success: false,
        message: "Error al verificar producto"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado"
      });
    }

    Inventario.delete(id, (err, result) => {
      if (err) {
        console.error("Error al eliminar producto:", err);
        return res.status(500).json({
          success: false,
          message: "Error al eliminar producto"
        });
      }

      res.json({
        success: true,
        message: "Producto eliminado exitosamente"
      });
    });
  });
};

// ========== CATEGORIAS ==========

// Obtener todas las categorías
const getCategorias = (req, res) => {
  Inventario.getCategorias((err, results) => {
    if (err) {
      console.error("Error al obtener categorías:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener categorías"
      });
    }
    res.json({
      success: true,
      count: results.length,
      categorias: results
    });
  });
};

// Obtener categoría por ID
const getCategoriaById = (req, res) => {
  const { id } = req.params;

  Inventario.getCategoriaById(id, (err, results) => {
    if (err) {
      console.error("Error al obtener categoría:", err);
      return res.status(500).json({
        success: false,
        message: "Error al obtener categoría"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada"
      });
    }

    res.json({
      success: true,
      categoria: results[0]
    });
  });
};

// Crear categoría (solo admin)
const createCategoria = (req, res) => {
  const { tipo_categoria, descripcion } = req.body;

  if (!tipo_categoria) {
    return res.status(400).json({
      success: false,
      message: "El campo tipo_categoria es obligatorio"
    });
  }

  Inventario.createCategoria({
    tipo_categoria,
    descripcion: descripcion || ""
  }, (err, result) => {
    if (err) {
      console.error("Error al crear categoría:", err);
      return res.status(500).json({
        success: false,
        message: "Error al crear categoría"
      });
    }

    res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      id_categoria: result.insertId
    });
  });
};

// Actualizar categoría (solo admin)
const updateCategoria = (req, res) => {
  const { id } = req.params;
  const { tipo_categoria, descripcion } = req.body;

  // Verificar si la categoría existe
  Inventario.getCategoriaById(id, (err, results) => {
    if (err) {
      console.error("Error al verificar categoría:", err);
      return res.status(500).json({
        success: false,
        message: "Error al verificar categoría"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada"
      });
    }

    const categoriaActual = results[0];

    Inventario.updateCategoria(id, {
      tipo_categoria: tipo_categoria || categoriaActual.tipo_categoria,
      descripcion: descripcion !== undefined ? descripcion : categoriaActual.descripcion
    }, (err, result) => {
      if (err) {
        console.error("Error al actualizar categoría:", err);
        return res.status(500).json({
          success: false,
          message: "Error al actualizar categoría"
        });
      }

      Inventario.getCategoriaById(id, (err, updatedResults) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error al obtener categoría actualizada"
          });
        }
        res.json({
          success: true,
          message: "Categoría actualizada exitosamente",
          categoria: updatedResults[0]
        });
      });
    });
  });
};

// Eliminar categoría (solo admin)
const deleteCategoria = (req, res) => {
  const { id } = req.params;

  // Verificar si la categoría existe
  Inventario.getCategoriaById(id, (err, results) => {
    if (err) {
      console.error("Error al verificar categoría:", err);
      return res.status(500).json({
        success: false,
        message: "Error al verificar categoría"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada"
      });
    }

    Inventario.deleteCategoria(id, (err, result) => {
      if (err) {
        console.error("Error al eliminar categoría:", err);
        return res.status(500).json({
          success: false,
          message: "Error al eliminar categoría"
        });
      }

      res.json({
        success: true,
        message: "Categoría eliminada exitosamente"
      });
    });
  });
};

module.exports = {
  // Productos
  getProductos,
  getProductosDestacados,
  getProductoById,
  filtrarProductos,
  buscarProductos,
  getProductosByCategoria,
  getProductosByMarca,
  getMarcas,
  getColores,
  createProducto,
  updateProducto,
  deleteProducto,
  // Categorías
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
};