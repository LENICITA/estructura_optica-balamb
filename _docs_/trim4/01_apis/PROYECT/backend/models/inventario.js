// models/inventario.js
import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';

// ========== MODELO PRODUCTOS ==========
const Producto = sequelize.define('Producto', {
  id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  imagen: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  material: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(45),
    allowNull: false
  }
}, {
  tableName: 'PRODUCTOS',
  timestamps: false
});

// ========== MODELO CATEGORIAS ==========
const Categoria = sequelize.define('Categoria', {
  id_categoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_categoria: {
    type: DataTypes.ENUM('MONTURAS', 'ACCESORIOS', 'GAFAS DE SOL'),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: false
  }
}, {
  tableName: 'CATEGORIAS',
  timestamps: false
});

// ========== RELACIONES ==========
Producto.belongsTo(Categoria, {
  foreignKey: 'id_categoria',
  as: 'categoria'
});

Categoria.hasMany(Producto, {
  foreignKey: 'id_categoria',
  as: 'productos'
});

// ========== MÉTODOS DEL INVENTARIO ==========
const Inventario = {
  // ========== PRODUCTOS ==========

  // Obtener todos los productos con JOIN a categorías
  getAll: async () => {
    try {
      const productos = await Producto.findAll({
        include: [{
          model: Categoria,
          as: 'categoria'
        }],
        order: [['id_producto', 'DESC']]
      });

      // Formatear para mantener la misma estructura que antes
      return productos.map(p => ({
        id_producto: p.id_producto,
        id_categoria: p.id_categoria,
        nombre: p.nombre,
        descripcion: p.descripcion,
        marca: p.marca,
        precio: p.precio,
        imagen: p.imagen,
        material: p.material,
        color: p.color,
        tipo_categoria: p.categoria?.tipo_categoria,
        categoria_descripcion: p.categoria?.descripcion
      }));
    } catch (error) {
      throw error;
    }
  },

  // Obtener productos destacados (últimos 6)
  getDestacados: async () => {
    try {
      const productos = await Producto.findAll({
        include: [{
          model: Categoria,
          as: 'categoria'
        }],
        order: [['id_producto', 'DESC']],
        limit: 6
      });

      return productos.map(p => ({
        id_producto: p.id_producto,
        id_categoria: p.id_categoria,
        nombre: p.nombre,
        descripcion: p.descripcion,
        marca: p.marca,
        precio: p.precio,
        imagen: p.imagen,
        material: p.material,
        color: p.color,
        tipo_categoria: p.categoria?.tipo_categoria
      }));
    } catch (error) {
      throw error;
    }
  },

  // Obtener producto por ID
  findById: async (id) => {
    try {
      const producto = await Producto.findByPk(id, {
        include: [{
          model: Categoria,
          as: 'categoria'
        }]
      });

      if (!producto) return null;

      return {
        id_producto: producto.id_producto,
        id_categoria: producto.id_categoria,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        marca: producto.marca,
        precio: producto.precio,
        imagen: producto.imagen,
        material: producto.material,
        color: producto.color,
        tipo_categoria: producto.categoria?.tipo_categoria,
        categoria_descripcion: producto.categoria?.descripcion
      };
    } catch (error) {
      throw error;
    }
  },

  // Filtrar productos por precio, marca, color, material
  filtrar: async (filtros) => {
    try {
      const where = {};

      if (filtros.precio_min) {
        where.precio = { [Op.gte]: parseFloat(filtros.precio_min) };
      }
      if (filtros.precio_max) {
        where.precio = { ...where.precio, [Op.lte]: parseFloat(filtros.precio_max) };
      }
      if (filtros.marca) {
        where.marca = filtros.marca;
      }
      if (filtros.color) {
        where.color = filtros.color;
      }
      if (filtros.material) {
        where.material = filtros.material;
      }
      if (filtros.id_categoria) {
        where.id_categoria = parseInt(filtros.id_categoria);
      }
      if (filtros.busqueda) {
        where[Op.or] = [
          { nombre: { [Op.like]: `%${filtros.busqueda}%` } },
          { marca: { [Op.like]: `%${filtros.busqueda}%` } },
          { descripcion: { [Op.like]: `%${filtros.busqueda}%` } }
        ];
      }

      const productos = await Producto.findAll({
        where,
        include: [{
          model: Categoria,
          as: 'categoria'
        }],
        order: [['id_producto', 'DESC']]
      });

      return productos.map(p => ({
        id_producto: p.id_producto,
        id_categoria: p.id_categoria,
        nombre: p.nombre,
        descripcion: p.descripcion,
        marca: p.marca,
        precio: p.precio,
        imagen: p.imagen,
        material: p.material,
        color: p.color,
        tipo_categoria: p.categoria?.tipo_categoria
      }));
    } catch (error) {
      throw error;
    }
  },

  // Buscar productos por nombre o marca (búsqueda rápida)
  buscar: async (termino) => {
    try {
      const search = `%${termino}%`;
      const productos = await Producto.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: search } },
            { marca: { [Op.like]: search } },
            { descripcion: { [Op.like]: search } }
          ]
        },
        include: [{
          model: Categoria,
          as: 'categoria'
        }],
        order: [['id_producto', 'DESC']]
      });

      return productos.map(p => ({
        id_producto: p.id_producto,
        id_categoria: p.id_categoria,
        nombre: p.nombre,
        descripcion: p.descripcion,
        marca: p.marca,
        precio: p.precio,
        imagen: p.imagen,
        material: p.material,
        color: p.color,
        tipo_categoria: p.categoria?.tipo_categoria
      }));
    } catch (error) {
      throw error;
    }
  },

  // Obtener productos por categoría
  getByCategoria: async (id_categoria) => {
    try {
      const productos = await Producto.findAll({
        where: { id_categoria: parseInt(id_categoria) },
        include: [{
          model: Categoria,
          as: 'categoria'
        }],
        order: [['id_producto', 'DESC']]
      });

      return productos.map(p => ({
        id_producto: p.id_producto,
        id_categoria: p.id_categoria,
        nombre: p.nombre,
        descripcion: p.descripcion,
        marca: p.marca,
        precio: p.precio,
        imagen: p.imagen,
        material: p.material,
        color: p.color,
        tipo_categoria: p.categoria?.tipo_categoria
      }));
    } catch (error) {
      throw error;
    }
  },

  // Obtener productos por marca
  getByMarca: async (marca) => {
    try {
      const productos = await Producto.findAll({
        where: { marca },
        include: [{
          model: Categoria,
          as: 'categoria'
        }],
        order: [['id_producto', 'DESC']]
      });

      return productos.map(p => ({
        id_producto: p.id_producto,
        id_categoria: p.id_categoria,
        nombre: p.nombre,
        descripcion: p.descripcion,
        marca: p.marca,
        precio: p.precio,
        imagen: p.imagen,
        material: p.material,
        color: p.color,
        tipo_categoria: p.categoria?.tipo_categoria
      }));
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las marcas únicas
  getMarcas: async () => {
    try {
      const marcas = await Producto.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('marca')), 'marca']
        ],
        order: [['marca', 'ASC']]
      });

      return marcas.map(item => item.marca);
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los colores únicos
  getColores: async () => {
    try {
      const colores = await Producto.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('color')), 'color']
        ],
        order: [['color', 'ASC']]
      });

      return colores.map(item => item.color);
    } catch (error) {
      throw error;
    }
  },

  // Crear producto
  create: async (data) => {
    try {
      const { id_categoria, nombre, descripcion, marca, precio, imagen, material, color } = data;
      
      const producto = await Producto.create({
        id_categoria,
        nombre,
        descripcion: descripcion || '',
        marca: marca || '',
        precio,
        imagen: imagen || '',
        material: material || '',
        color: color || ''
      });

      return { insertId: producto.id_producto };
    } catch (error) {
      throw error;
    }
  },

  // Actualizar producto
  update: async (id, data) => {
    try {
      const { id_categoria, nombre, descripcion, marca, precio, imagen, material, color } = data;
      
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      await producto.update({
        id_categoria: id_categoria || producto.id_categoria,
        nombre: nombre || producto.nombre,
        descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
        marca: marca !== undefined ? marca : producto.marca,
        precio: precio !== undefined ? precio : producto.precio,
        imagen: imagen !== undefined ? imagen : producto.imagen,
        material: material !== undefined ? material : producto.material,
        color: color !== undefined ? color : producto.color
      });

      return { affectedRows: 1 };
    } catch (error) {
      throw error;
    }
  },

  // Eliminar producto
  delete: async (id) => {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      await producto.destroy();
      return { affectedRows: 1 };
    } catch (error) {
      throw error;
    }
  },

  // ========== CATEGORIAS ==========

  // Obtener todas las categorías
  getCategorias: async () => {
    try {
      const categorias = await Categoria.findAll({
        order: [['id_categoria', 'ASC']]
      });

      return categorias.map(c => ({
        id_categoria: c.id_categoria,
        tipo_categoria: c.tipo_categoria,
        descripcion: c.descripcion
      }));
    } catch (error) {
      throw error;
    }
  },

  // Obtener categoría por ID
  getCategoriaById: async (id) => {
    try {
      const categoria = await Categoria.findByPk(id);
      
      if (!categoria) return null;

      return {
        id_categoria: categoria.id_categoria,
        tipo_categoria: categoria.tipo_categoria,
        descripcion: categoria.descripcion
      };
    } catch (error) {
      throw error;
    }
  },

  // Crear categoría
  createCategoria: async (data) => {
    try {
      const { tipo_categoria, descripcion } = data;
      
      const categoria = await Categoria.create({
        tipo_categoria,
        descripcion: descripcion || ''
      });

      return { insertId: categoria.id_categoria };
    } catch (error) {
      throw error;
    }
  },

  // Actualizar categoría
  updateCategoria: async (id, data) => {
    try {
      const { tipo_categoria, descripcion } = data;
      
      const categoria = await Categoria.findByPk(id);
      
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      await categoria.update({
        tipo_categoria: tipo_categoria || categoria.tipo_categoria,
        descripcion: descripcion !== undefined ? descripcion : categoria.descripcion
      });

      return { affectedRows: 1 };
    } catch (error) {
      throw error;
    }
  },

  // Eliminar categoría
  deleteCategoria: async (id) => {
    try {
      const categoria = await Categoria.findByPk(id);
      
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }

      await categoria.destroy();
      return { affectedRows: 1 };
    } catch (error) {
      throw error;
    }
  }
};

export default Inventario;