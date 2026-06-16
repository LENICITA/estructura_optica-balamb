//models/inventario.js

const db = require("../config/config");

const Inventario = {
  // ========== PRODUCTOS ==========

  // Obtener todos los productos con JOIN a categorías
  getAll: (callback) => {
    db.query(
      `SELECT p.*, c.tipo_categoria, c.descripcion as categoria_descripcion
       FROM PRODUCTOS p
       INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
       ORDER BY p.id_producto DESC`,
      callback
    );
  },

  // Obtener productos destacados (últimos 6)
  getDestacados: (callback) => {
    db.query(
      `SELECT p.*, c.tipo_categoria
       FROM PRODUCTOS p
       INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
       ORDER BY p.id_producto DESC
       LIMIT 6`,
      callback
    );
  },

  // Obtener producto por ID
  findById: (id, callback) => {
    db.query(
      `SELECT p.*, c.tipo_categoria, c.descripcion as categoria_descripcion
       FROM PRODUCTOS p
       INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
       WHERE p.id_producto = ?`,
      [id],
      callback
    );
  },

  // Filtrar productos por precio, marca, color, material
  filtrar: (filtros, callback) => {
    let sql = `SELECT p.*, c.tipo_categoria 
               FROM PRODUCTOS p
               INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
               WHERE 1=1`;
    const values = [];

    if (filtros.precio_min) {
      sql += ` AND p.precio >= ?`;
      values.push(filtros.precio_min);
    }
    if (filtros.precio_max) {
      sql += ` AND p.precio <= ?`;
      values.push(filtros.precio_max);
    }
    if (filtros.marca) {
      sql += ` AND p.marca = ?`;
      values.push(filtros.marca);
    }
    if (filtros.color) {
      sql += ` AND p.color = ?`;
      values.push(filtros.color);
    }
    if (filtros.material) {
      sql += ` AND p.material = ?`;
      values.push(filtros.material);
    }
    if (filtros.id_categoria) {
      sql += ` AND p.id_categoria = ?`;
      values.push(filtros.id_categoria);
    }
    if (filtros.busqueda) {
      sql += ` AND (p.nombre LIKE ? OR p.marca LIKE ? OR p.descripcion LIKE ?)`;
      const search = `%${filtros.busqueda}%`;
      values.push(search, search, search);
    }

    sql += ` ORDER BY p.id_producto DESC`;

    db.query(sql, values, callback);
  },

  // Buscar productos por nombre o marca (búsqueda rápida)
  buscar: (termino, callback) => {
    const search = `%${termino}%`;
    db.query(
      `SELECT p.*, c.tipo_categoria
       FROM PRODUCTOS p
       INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
       WHERE p.nombre LIKE ? OR p.marca LIKE ? OR p.descripcion LIKE ?
       ORDER BY p.id_producto DESC`,
      [search, search, search],
      callback
    );
  },

  // Obtener productos por categoría
  getByCategoria: (id_categoria, callback) => {
    db.query(
      `SELECT p.*, c.tipo_categoria
       FROM PRODUCTOS p
       INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
       WHERE p.id_categoria = ?
       ORDER BY p.id_producto DESC`,
      [id_categoria],
      callback
    );
  },

  // Obtener productos por marca
  getByMarca: (marca, callback) => {
    db.query(
      `SELECT p.*, c.tipo_categoria
       FROM PRODUCTOS p
       INNER JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
       WHERE p.marca = ?
       ORDER BY p.id_producto DESC`,
      [marca],
      callback
    );
  },

  // Obtener todas las marcas únicas
  getMarcas: (callback) => {
    db.query(
      `SELECT DISTINCT marca FROM PRODUCTOS ORDER BY marca ASC`,
      callback
    );
  },

  // Obtener todos los colores únicos
  getColores: (callback) => {
    db.query(
      `SELECT DISTINCT color FROM PRODUCTOS ORDER BY color ASC`,
      callback
    );
  },

  // Crear producto
  create: (data, callback) => {
    const { id_categoria, nombre, descripcion, marca, precio, imagen, material, color } = data;
    db.query(
      `INSERT INTO PRODUCTOS 
       (id_categoria, nombre, descripcion, marca, precio, imagen, material, color) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_categoria, nombre, descripcion || '', marca || '', precio, imagen || '', material || '', color || ''],
      callback
    );
  },

  // Actualizar producto
  update: (id, data, callback) => {
    const { id_categoria, nombre, descripcion, marca, precio, imagen, material, color } = data;
    db.query(
      `UPDATE PRODUCTOS 
       SET id_categoria = ?, nombre = ?, descripcion = ?, 
           marca = ?, precio = ?, imagen = ?, material = ?, color = ?
       WHERE id_producto = ?`,
      [id_categoria, nombre, descripcion, marca, precio, imagen, material, color, id],
      callback
    );
  },

  // Eliminar producto
  delete: (id, callback) => {
    db.query('DELETE FROM PRODUCTOS WHERE id_producto = ?', [id], callback);
  },

  // ========== CATEGORIAS ==========

  // Obtener todas las categorías
  getCategorias: (callback) => {
    db.query('SELECT * FROM CATEGORIAS ORDER BY id_categoria ASC', callback);
  },

  // Obtener categoría por ID
  getCategoriaById: (id, callback) => {
    db.query('SELECT * FROM CATEGORIAS WHERE id_categoria = ?', [id], callback);
  },

  // Crear categoría
  createCategoria: (data, callback) => {
    const { tipo_categoria, descripcion } = data;
    db.query(
      'INSERT INTO CATEGORIAS (tipo_categoria, descripcion) VALUES (?, ?)',
      [tipo_categoria, descripcion],
      callback
    );
  },

  // Actualizar categoría
  updateCategoria: (id, data, callback) => {
    const { tipo_categoria, descripcion } = data;
    db.query(
      'UPDATE CATEGORIAS SET tipo_categoria = ?, descripcion = ? WHERE id_categoria = ?',
      [tipo_categoria, descripcion, id],
      callback
    );
  },

  // Eliminar categoría
  deleteCategoria: (id, callback) => {
    db.query('DELETE FROM CATEGORIAS WHERE id_categoria = ?', [id], callback);
  }
};

module.exports = Inventario;