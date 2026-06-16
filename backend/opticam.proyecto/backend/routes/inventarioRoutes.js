// routes/inventarioRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const inventarioController = require("../controllers/inventarioController");

// ========== RUTAS PÚBLICAS (NO requieren autenticación) ==========

// Productos

/**
 * @swagger
 * /api/inventario/productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 */
router.get("/productos", inventarioController.getProductos);

/**
 * @swagger
 * /api/inventario/productos/destacados:
 *   get:
 *     summary: Obtener productos destacados
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Últimos 6 productos agregados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 */
router.get("/productos/destacados", inventarioController.getProductosDestacados);

/**
 * @swagger
 * /api/inventario/productos/buscar:
 *   get:
 *     summary: Buscar productos por texto
 *     tags: [Inventario]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Término de búsqueda (nombre, marca o descripción)
 *     responses:
 *       200:
 *         description: Productos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 query:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Falta el término de búsqueda
 */
router.get("/productos/buscar", inventarioController.buscarProductos);

/**
 * @swagger
 * /api/inventario/productos/filtros:
 *   get:
 *     summary: Filtrar productos por precio, marca, color, material o categoría
 *     tags: [Inventario]
 *     parameters:
 *       - in: query
 *         name: precio_min
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: precio_max
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         description: Marca del producto
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Color del producto
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *         description: Material del producto
 *       - in: query
 *         name: id_categoria
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Productos filtrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 filtros:
 *                   type: object
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 */
router.get("/productos/filtros", inventarioController.filtrarProductos);

/**
 * @swagger
 * /api/inventario/productos/categoria/{id_categoria}:
 *   get:
 *     summary: Obtener productos por categoría
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id_categoria
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Productos de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id_categoria:
 *                   type: integer
 *                 count:
 *                   type: integer
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 */
router.get("/productos/categoria/:id_categoria", inventarioController.getProductosByCategoria);

/**
 * @swagger
 * /api/inventario/productos/marca/{marca}:
 *   get:
 *     summary: Obtener productos por marca
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: marca
 *         schema:
 *           type: string
 *         required: true
 *         description: Marca del producto
 *     responses:
 *       200:
 *         description: Productos de la marca
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 marca:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 productos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 */
router.get("/productos/marca/:marca", inventarioController.getProductosByMarca);

/**
 * @swagger
 * /api/inventario/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 producto:
 *                   $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 */
router.get("/productos/:id", inventarioController.getProductoById);

// Marcas y colores

/**
 * @swagger
 * /api/inventario/marcas:
 *   get:
 *     summary: Obtener todas las marcas disponibles
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de marcas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 marcas:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/marcas", inventarioController.getMarcas);

/**
 * @swagger
 * /api/inventario/colores:
 *   get:
 *     summary: Obtener todos los colores disponibles
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de colores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 colores:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/colores", inventarioController.getColores);

// Categorías

/**
 * @swagger
 * /api/inventario/categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 categorias:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Categoria'
 */
router.get("/categorias", inventarioController.getCategorias);

/**
 * @swagger
 * /api/inventario/categorias/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categoria:
 *                   $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Categoría no encontrada
 */
router.get("/categorias/:id", inventarioController.getCategoriaById);

// ========== RUTAS PROTEGIDAS (SOLO ADMIN) ==========

// Productos - CRUD admin

/**
 * @swagger
 * /api/inventario/productos:
 *   post:
 *     summary: Crear un nuevo producto (Admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_categoria
 *               - nombre
 *               - precio
 *             properties:
 *               id_categoria:
 *                 type: integer
 *                 example: 1
 *               nombre:
 *                 type: string
 *                 example: "Montura Elegance"
 *               descripcion:
 *                 type: string
 *                 example: "Montura moderna de alta calidad"
 *               marca:
 *                 type: string
 *                 example: "Rayban"
 *               precio:
 *                 type: number
 *                 example: 250000
 *               imagen:
 *                 type: string
 *                 example: "https://opticam.com/img/montura1.jpg"
 *               material:
 *                 type: string
 *                 example: "Policarbonato"
 *               color:
 *                 type: string
 *                 example: "Negro"
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id_producto:
 *                   type: integer
 *       400:
 *         description: Campos obligatorios faltantes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (requiere admin)
 */
router.post("/productos", verifyToken, authorizeRoles(["admin"]), inventarioController.createProducto);

/**
 * @swagger
 * /api/inventario/productos/{id}:
 *   put:
 *     summary: Actualizar un producto (Admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_categoria:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               marca:
 *                 type: string
 *               precio:
 *                 type: number
 *               imagen:
 *                 type: string
 *               material:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 producto:
 *                   $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (requiere admin)
 */
router.put("/productos/:id", verifyToken, authorizeRoles(["admin"]), inventarioController.updateProducto);

/**
 * @swagger
 * /api/inventario/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto (Admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (requiere admin)
 */
router.delete("/productos/:id", verifyToken, authorizeRoles(["admin"]), inventarioController.deleteProducto);

// Categorías - CRUD admin

/**
 * @swagger
 * /api/inventario/categorias:
 *   post:
 *     summary: Crear una nueva categoría (Admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo_categoria
 *             properties:
 *               tipo_categoria:
 *                 type: string
 *                 enum: [MONTURAS, ACCESORIOS, GAFAS DE SOL]
 *                 example: "ACCESORIOS"
 *               descripcion:
 *                 type: string
 *                 example: "Lentes de contacto y accesorios"
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 id_categoria:
 *                   type: integer
 *       400:
 *         description: Campos obligatorios faltantes
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (requiere admin)
 */
router.post("/categorias", verifyToken, authorizeRoles(["admin"]), inventarioController.createCategoria);

/**
 * @swagger
 * /api/inventario/categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría (Admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo_categoria:
 *                 type: string
 *                 enum: [MONTURAS, ACCESORIOS, GAFAS DE SOL]
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (requiere admin)
 */
router.put("/categorias/:id", verifyToken, authorizeRoles(["admin"]), inventarioController.updateCategoria);

/**
 * @swagger
 * /api/inventario/categorias/{id}:
 *   delete:
 *     summary: Eliminar una categoría (Admin)
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado (requiere admin)
 */
router.delete("/categorias/:id", verifyToken, authorizeRoles(["admin"]), inventarioController.deleteCategoria);

module.exports = router;