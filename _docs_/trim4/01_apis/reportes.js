// routes/reportesRoutes.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

// ============================================
// GET /api/reportes/ventas
// Reporte de ventas (basado en PEDIDOS y PAGOS)
// ============================================
router.get('/ventas', async (req, res) => {
    try {
        const { periodo, fechaInicio, fechaFin } = req.query;
        
        let query = `
            SELECT 
                COUNT(p.id_pedido) as totalVentas,
                SUM(p.total) as montoTotal,
                AVG(p.total) as promedioVenta,
                MIN(p.total) as ventaMinima,
                MAX(p.total) as ventaMaxima,
                DATE_FORMAT(p.fecha_pedido, '%Y-%m-%d') as fecha
            FROM PEDIDOS p
            WHERE p.estado = 'completado'
        `;
        
        const params = [];
        
        if (fechaInicio) {
            query += ' AND p.fecha_pedido >= ?';
            params.push(fechaInicio);
        }
        
        if (fechaFin) {
            query += ' AND p.fecha_pedido <= ?';
            params.push(fechaFin);
        }

        // Agrupar por período
        if (periodo === 'daily') {
            query += ' GROUP BY DATE(p.fecha_pedido)';
        } else if (periodo === 'weekly') {
            query += ' GROUP BY YEARWEEK(p.fecha_pedido)';
        } else if (periodo === 'monthly') {
            query += ' GROUP BY YEAR(p.fecha_pedido), MONTH(p.fecha_pedido)';
        } else if (periodo === 'yearly') {
            query += ' GROUP BY YEAR(p.fecha_pedido)';
        }

        query += ' ORDER BY fecha DESC';

        const [ventas] = await pool.query(query, params);
        
        // Obtener ventas por método de pago
        const [metodosPago] = await pool.query(`
            SELECT 
                pg.eleccion_pago as metodo_pago,
                pg.canal_pago as canal,
                COUNT(p.id_pedido) as cantidad,
                SUM(p.total) as total
            FROM PEDIDOS p
            JOIN PAGOS pg ON p.id_pedido = pg.id_pedido
            WHERE p.estado = 'completado'
            ${fechaInicio ? 'AND p.fecha_pedido >= ?' : ''}
            ${fechaFin ? 'AND p.fecha_pedido <= ?' : ''}
            GROUP BY pg.eleccion_pago, pg.canal_pago
        `, params);

        // Obtener productos más vendidos
        const [productosMasVendidos] = await pool.query(`
            SELECT 
                pr.nombre,
                SUM(pp.cant_productos) as cantidad_vendida,
                SUM(pp.cant_productos * pr.precio) as total_vendido
            FROM PEDIDOS_PRODUCTOS pp
            JOIN PRODUCTOS pr ON pp.id_producto = pr.id_producto
            JOIN PEDIDOS p ON pp.id_pedido = p.id_pedido
            WHERE p.estado = 'completado'
            ${fechaInicio ? 'AND p.fecha_pedido >= ?' : ''}
            ${fechaFin ? 'AND p.fecha_pedido <= ?' : ''}
            GROUP BY pr.id_producto, pr.nombre
            ORDER BY cantidad_vendida DESC
            LIMIT 10
        `, params);

        // Ventas por categoría
        const [ventasPorCategoria] = await pool.query(`
            SELECT 
                c.tipo_categoria as categoria,
                COUNT(DISTINCT p.id_pedido) as cantidad_pedidos,
                SUM(pp.cant_productos) as productos_vendidos,
                SUM(pp.cant_productos * pr.precio) as total_vendido
            FROM PEDIDOS_PRODUCTOS pp
            JOIN PRODUCTOS pr ON pp.id_producto = pr.id_producto
            JOIN CATEGORIAS c ON pr.id_categoria = c.id_categoria
            JOIN PEDIDOS p ON pp.id_pedido = p.id_pedido
            WHERE p.estado = 'completado'
            ${fechaInicio ? 'AND p.fecha_pedido >= ?' : ''}
            ${fechaFin ? 'AND p.fecha_pedido <= ?' : ''}
            GROUP BY c.id_categoria, c.tipo_categoria
        `, params);

        res.json({
            resumen: ventas,
            metodosPago: metodosPago,
            productosMasVendidos: productosMasVendidos,
            ventasPorCategoria: ventasPorCategoria,
            fechaGeneracion: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al generar reporte de ventas:', error);
        res.status(500).json({ error: 'Error al generar reporte de ventas' });
    }
});

// ============================================
// GET /api/reportes/inventario
// Reporte de inventario (basado en PRODUCTOS y CATEGORIAS)
// ============================================
router.get('/inventario', async (req, res) => {
    try {
        const { categoria, material, color } = req.query;
        
        let query = `
            SELECT 
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.marca,
                p.precio,
                p.material,
                p.color,
                p.imagen,
                c.tipo_categoria as categoria,
                c.descripcion as categoria_descripcion,
                CASE 
                    WHEN p.precio < 50000 THEN 'Económico'
                    WHEN p.precio < 150000 THEN 'Medio'
                    ELSE 'Premium'
                END as rango_precio,
                (SELECT COUNT(pp.id_pedido) 
                 FROM PEDIDOS_PRODUCTOS pp 
                 JOIN PEDIDOS ped ON pp.id_pedido = ped.id_pedido 
                 WHERE pp.id_producto = p.id_producto 
                 AND ped.estado = 'completado') as veces_vendido
            FROM PRODUCTOS p
            JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
            WHERE 1=1
        `;
        
        const params = [];
        
        if (categoria && categoria !== 'Todos') {
            query += ' AND c.tipo_categoria = ?';
            params.push(categoria);
        }
        
        if (material && material !== 'Todos') {
            query += ' AND p.material = ?';
            params.push(material);
        }
        
        if (color && color !== 'Todos') {
            query += ' AND p.color = ?';
            params.push(color);
        }

        query += ' ORDER BY p.nombre ASC';

        const [productos] = await pool.query(query, params);
        
        // Resumen del inventario
        const [resumen] = await pool.query(`
            SELECT 
                COUNT(*) as totalProductos,
                COUNT(DISTINCT marca) as totalMarcas,
                MIN(precio) as precioMinimo,
                MAX(precio) as precioMaximo,
                AVG(precio) as precioPromedio,
                SUM(precio) as valorTotalInventario
            FROM PRODUCTOS
        `);

        // Productos por categoría
        const [porCategoria] = await pool.query(`
            SELECT 
                c.tipo_categoria as categoria,
                COUNT(p.id_producto) as cantidad,
                MIN(p.precio) as precioMinimo,
                MAX(p.precio) as precioMaximo,
                AVG(p.precio) as precioPromedio
            FROM PRODUCTOS p
            JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
            GROUP BY c.id_categoria, c.tipo_categoria
            ORDER BY cantidad DESC
        `);

        // Productos por marca
        const [porMarca] = await pool.query(`
            SELECT 
                marca,
                COUNT(*) as cantidad,
                AVG(precio) as precioPromedio
            FROM PRODUCTOS
            GROUP BY marca
            ORDER BY cantidad DESC
        `);

        // Productos por material
        const [porMaterial] = await pool.query(`
            SELECT 
                material,
                COUNT(*) as cantidad,
                AVG(precio) as precioPromedio
            FROM PRODUCTOS
            GROUP BY material
            ORDER BY cantidad DESC
        `);

        res.json({
            resumen: resumen[0],
            productos: productos,
            porCategoria: porCategoria,
            porMarca: porMarca,
            porMaterial: porMaterial,
            fechaGeneracion: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al generar reporte de inventario:', error);
        res.status(500).json({ error: 'Error al generar reporte de inventario' });
    }
});

// ============================================
// GET /api/reportes/repartidores
// Reporte de repartidores (basado en USUARIOS con rol repartidor y VEHICULOS)
// ============================================
router.get('/repartidores', async (req, res) => {
    try {
        const { estado, ciudad } = req.query;
        
        // Primero obtenemos los usuarios que tienen rol de repartidor
        let query = `
            SELECT 
                u.id_usuario,
                u.nombre_completo,
                u.telefono,
                u.email,
                u.ciudad,
                u.direccion,
                u.estado,
                u.fecha_registro,
                v.id_vehiculo,
                v.tipo as tipo_vehiculo,
                v.modelo as modelo_vehiculo,
                v.placa,
                v.color as color_vehiculo,
                COUNT(DISTINCT p.id_pedido) as total_pedidos_asignados,
                COUNT(DISTINCT CASE WHEN p.estado = 'entregado' THEN p.id_pedido END) as pedidos_entregados,
                COUNT(DISTINCT CASE WHEN p.estado = 'pendiente' THEN p.id_pedido END) as pedidos_pendientes,
                SUM(CASE WHEN p.estado = 'entregado' THEN p.total ELSE 0 END) as monto_total_entregado
            FROM USUARIOS u
            LEFT JOIN VEHICULOS v ON u.id_usuario = v.id_usuario
            LEFT JOIN PEDIDOS p ON u.id_usuario = p.id_usuario AND p.estado IN ('entregado', 'pendiente')
            WHERE u.id_usuario IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre = 'repartidor'
            )
        `;
        
        const params = [];
        
        if (estado && estado !== 'Todos') {
            query += ' AND u.estado = ?';
            params.push(estado);
        }
        
        if (ciudad && ciudad !== 'Todas') {
            query += ' AND u.ciudad = ?';
            params.push(ciudad);
        }

        query += ' GROUP BY u.id_usuario ORDER BY pedidos_entregados DESC';

        const [repartidores] = await pool.query(query, params);
        
        // Resumen de repartidores
        const [resumen] = await pool.query(`
            SELECT 
                COUNT(DISTINCT u.id_usuario) as totalRepartidores,
                SUM(CASE WHEN u.estado = 'activo' THEN 1 ELSE 0 END) as repartidoresActivos,
                SUM(CASE WHEN u.estado = 'inactivo' THEN 1 ELSE 0 END) as repartidoresInactivos,
                COUNT(DISTINCT v.id_vehiculo) as totalVehiculos,
                COUNT(DISTINCT u.ciudad) as ciudadesCubiertas
            FROM USUARIOS u
            LEFT JOIN VEHICULOS v ON u.id_usuario = v.id_usuario
            WHERE u.id_usuario IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre = 'repartidor'
            )
        `);

        // Rendimiento general de repartidores
        const [rendimiento] = await pool.query(`
            SELECT 
                COUNT(DISTINCT p.id_pedido) as totalPedidosAsignados,
                COUNT(DISTINCT CASE WHEN p.estado = 'entregado' THEN p.id_pedido END) as totalPedidosEntregados,
                SUM(CASE WHEN p.estado = 'entregado' THEN p.total ELSE 0 END) as montoTotalEntregado,
                AVG(CASE WHEN p.estado = 'entregado' THEN DATEDIFF(p.fecha_entrega, p.fecha_pedido) END) as diasPromedioEntrega
            FROM PEDIDOS p
            WHERE p.id_usuario IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre = 'repartidor'
            )
        `);

        // Repartidores por ciudad
        const [porCiudad] = await pool.query(`
            SELECT 
                u.ciudad,
                COUNT(DISTINCT u.id_usuario) as cantidad_repartidores,
                COUNT(DISTINCT v.id_vehiculo) as cantidad_vehiculos
            FROM USUARIOS u
            LEFT JOIN VEHICULOS v ON u.id_usuario = v.id_usuario
            WHERE u.id_usuario IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre = 'repartidor'
            )
            GROUP BY u.ciudad
            ORDER BY cantidad_repartidores DESC
        `);

        res.json({
            resumen: resumen[0],
            rendimiento: rendimiento[0],
            repartidores: repartidores,
            porCiudad: porCiudad,
            fechaGeneracion: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al generar reporte de repartidores:', error);
        res.status(500).json({ error: 'Error al generar reporte de repartidores' });
    }
});

// ============================================
// GET /api/reportes/clientes
// Reporte de clientes (basado en USUARIOS)
// ============================================
router.get('/clientes', async (req, res) => {
    try {
        const { periodo, ciudad, clienteId } = req.query;
        
        let query = `
            SELECT 
                u.id_usuario,
                u.nombre_completo,
                u.email,
                u.telefono,
                u.ciudad,
                u.direccion,
                u.estado,
                u.fecha_registro,
                COUNT(DISTINCT p.id_pedido) as total_pedidos,
                SUM(p.total) as monto_total_gastado,
                AVG(p.total) as promedio_pedido,
                MAX(p.fecha_pedido) as ultimo_pedido,
                COUNT(DISTINCT f.id_formula) as total_formulas,
                COUNT(DISTINCT CASE 
                    WHEN p.estado = 'completado' THEN p.id_pedido 
                END) as pedidos_completados
            FROM USUARIOS u
            LEFT JOIN PEDIDOS p ON u.id_usuario = p.id_usuario
            LEFT JOIN FORMULAS f ON u.id_usuario = f.id_usuario
            WHERE u.id_usuario NOT IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre IN ('admin', 'repartidor')
            )
        `;
        
        const params = [];
        
        if (clienteId) {
            query += ' AND u.id_usuario = ?';
            params.push(clienteId);
        }

        if (ciudad && ciudad !== 'Todas') {
            query += ' AND u.ciudad = ?';
            params.push(ciudad);
        }

        // Filtrar por período de registro
        if (periodo === 'daily') {
            query += ' AND u.fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
        } else if (periodo === 'weekly') {
            query += ' AND u.fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        } else if (periodo === 'monthly') {
            query += ' AND u.fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        } else if (periodo === 'yearly') {
            query += ' AND u.fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        }

        query += ' GROUP BY u.id_usuario ORDER BY monto_total_gastado DESC';

        const [clientes] = await pool.query(query, params);
        
        // Resumen de clientes
        const [resumen] = await pool.query(`
            SELECT 
                COUNT(*) as totalClientes,
                SUM(CASE WHEN fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as clientesNuevos,
                SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as clientesActivos,
                SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as clientesInactivos,
                COUNT(DISTINCT ciudad) as ciudadesCubiertas,
                AVG(DATEDIFF(NOW(), fecha_registro)) as antiguedadPromedio
            FROM USUARIOS
            WHERE id_usuario NOT IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre IN ('admin', 'repartidor')
            )
        `);

        // Top clientes por compras
        const [topClientes] = await pool.query(`
            SELECT 
                u.nombre_completo,
                COUNT(p.id_pedido) as total_pedidos,
                SUM(p.total) as monto_total
            FROM USUARIOS u
            JOIN PEDIDOS p ON u.id_usuario = p.id_usuario
            WHERE u.id_usuario NOT IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre IN ('admin', 'repartidor')
            )
            AND p.estado = 'completado'
            GROUP BY u.id_usuario, u.nombre_completo
            ORDER BY monto_total DESC
            LIMIT 10
        `);

        // Distribución de clientes por ciudad
        const [porCiudad] = await pool.query(`
            SELECT 
                ciudad,
                COUNT(*) as cantidad,
                SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos
            FROM USUARIOS
            WHERE id_usuario NOT IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre IN ('admin', 'repartidor')
            )
            GROUP BY ciudad
            ORDER BY cantidad DESC
        `);

        // Clientes con fórmulas
        const [clientesConFormula] = await pool.query(`
            SELECT 
                COUNT(DISTINCT u.id_usuario) as clientes_con_formula,
                COUNT(f.id_formula) as total_formulas,
                AVG(f.costo) as costo_promedio_formula
            FROM USUARIOS u
            JOIN FORMULAS f ON u.id_usuario = f.id_usuario
            WHERE u.id_usuario NOT IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre IN ('admin', 'repartidor')
            )
        `);

        res.json({
            resumen: resumen[0],
            clientes: clientes,
            topClientes: topClientes,
            porCiudad: porCiudad,
            clientesConFormula: clientesConFormula[0],
            fechaGeneracion: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al generar reporte de clientes:', error);
        res.status(500).json({ error: 'Error al generar reporte de clientes' });
    }
});

// ============================================
// GET /api/reportes/dashboard
// Reporte general del dashboard
// ============================================
router.get('/dashboard', async (req, res) => {
    try {
        // Pedidos del día
        const [pedidosHoy] = await pool.query(`
            SELECT 
                COUNT(*) as totalPedidos,
                SUM(total) as montoTotal,
                SUM(CASE WHEN estado = 'completado' THEN total ELSE 0 END) as montoCompletado
            FROM PEDIDOS
            WHERE DATE(fecha_pedido) = CURDATE()
        `);

        // Pedidos del mes
        const [pedidosMes] = await pool.query(`
            SELECT 
                COUNT(*) as totalPedidos,
                SUM(total) as montoTotal
            FROM PEDIDOS
            WHERE MONTH(fecha_pedido) = MONTH(CURDATE()) 
            AND YEAR(fecha_pedido) = YEAR(CURDATE())
            AND estado = 'completado'
        `);

        // Total productos
        const [totalProductos] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(DISTINCT marca) as totalMarcas,
                COUNT(DISTINCT id_categoria) as totalCategorias
            FROM PRODUCTOS
        `);

        // Pedidos por estado
        const [pedidosPorEstado] = await pool.query(`
            SELECT 
                estado,
                COUNT(*) as cantidad,
                SUM(total) as montoTotal
            FROM PEDIDOS
            GROUP BY estado
        `);

        // Clientes totales (excluyendo admins y repartidores)
        const [totalClientes] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as nuevos
            FROM USUARIOS
            WHERE id_usuario NOT IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre IN ('admin', 'repartidor')
            )
        `);

        // Repartidores activos
        const [repartidoresActivos] = await pool.query(`
            SELECT 
                COUNT(*) as total
            FROM USUARIOS
            WHERE estado = 'activo'
            AND id_usuario IN (
                SELECT ru.id_usuario 
                FROM ROL_USUARIO ru 
                JOIN ROLES r ON ru.id_rol = r.id_rol 
                WHERE r.nombre = 'repartidor'
            )
        `);

        // Ventas por día (últimos 7 días)
        const [ventasUltimos7Dias] = await pool.query(`
            SELECT 
                DATE(fecha_pedido) as fecha,
                COUNT(*) as cantidad,
                SUM(total) as total
            FROM PEDIDOS
            WHERE fecha_pedido >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND estado = 'completado'
            GROUP BY DATE(fecha_pedido)
            ORDER BY fecha ASC
        `);

        // Productos más vendidos
        const [productosMasVendidos] = await pool.query(`
            SELECT 
                pr.nombre,
                pr.marca,
                SUM(pp.cant_productos) as cantidad_vendida,
                SUM(pp.cant_productos * pr.precio) as total_vendido
            FROM PEDIDOS_PRODUCTOS pp
            JOIN PRODUCTOS pr ON pp.id_producto = pr.id_producto
            JOIN PEDIDOS p ON pp.id_pedido = p.id_pedido
            WHERE p.estado = 'completado'
            AND p.fecha_pedido >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY pr.id_producto, pr.nombre, pr.marca
            ORDER BY cantidad_vendida DESC
            LIMIT 5
        `);

        // Categorías más vendidas
        const [categoriasMasVendidas] = await pool.query(`
            SELECT 
                c.tipo_categoria as categoria,
                SUM(pp.cant_productos) as cantidad_vendida,
                SUM(pp.cant_productos * pr.precio) as total_vendido
            FROM PEDIDOS_PRODUCTOS pp
            JOIN PRODUCTOS pr ON pp.id_producto = pr.id_producto
            JOIN CATEGORIAS c ON pr.id_categoria = c.id_categoria
            JOIN PEDIDOS p ON pp.id_pedido = p.id_pedido
            WHERE p.estado = 'completado'
            AND p.fecha_pedido >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY c.id_categoria, c.tipo_categoria
            ORDER BY cantidad_vendida DESC
        `);

        // Pagos por método
        const [pagosPorMetodo] = await pool.query(`
            SELECT 
                eleccion_pago as metodo,
                canal_pago as canal,
                COUNT(*) as cantidad,
                SUM(monto) as montoTotal
            FROM PAGOS
            WHERE fecha_pago >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY eleccion_pago, canal_pago
            ORDER BY cantidad DESC
        `);

        res.json({
            indicadores: {
                pedidosHoy: pedidosHoy[0] || { totalPedidos: 0, montoTotal: 0, montoCompletado: 0 },
                pedidosMes: pedidosMes[0] || { totalPedidos: 0, montoTotal: 0 },
                totalProductos: totalProductos[0] || { total: 0, totalMarcas: 0, totalCategorias: 0 },
                pedidosPorEstado: pedidosPorEstado,
                totalClientes: totalClientes[0] || { total: 0, activos: 0, nuevos: 0 },
                repartidoresActivos: repartidoresActivos[0]?.total || 0
            },
            graficos: {
                ventasUltimos7Dias: ventasUltimos7Dias,
                productosMasVendidos: productosMasVendidos,
                categoriasMasVendidas: categoriasMasVendidas,
                pagosPorMetodo: pagosPorMetodo
            },
            fechaGeneracion: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al generar reporte del dashboard:', error);
        res.status(500).json({ error: 'Error al generar reporte del dashboard' });
    }
});

// ============================================
// GET /api/reportes/formulas
// Reporte de fórmulas oftalmológicas
// ============================================
router.get('/formulas', async (req, res) => {
    try {
        const { condicion, fechaInicio, fechaFin } = req.query;
        
        let query = `
            SELECT 
                f.id_formula,
                f.condicion,
                f.observaciones,
                f.fecha_creacion,
                f.costo,
                u.nombre_completo as cliente_nombre,
                u.email as cliente_email,
                u.telefono as cliente_telefono,
                u.ciudad as cliente_ciudad,
                COUNT(DISTINCT p.id_pedido) as pedidos_asociados,
                SUM(CASE WHEN p.estado = 'completado' THEN p.total ELSE 0 END) as monto_generado
            FROM FORMULAS f
            JOIN USUARIOS u ON f.id_usuario = u.id_usuario
            LEFT JOIN PEDIDOS p ON f.id_formula = p.id_formula
            WHERE 1=1
        `;
        
        const params = [];
        
        if (condicion && condicion !== 'Todos') {
            query += ' AND f.condicion = ?';
            params.push(condicion);
        }
        
        if (fechaInicio) {
            query += ' AND f.fecha_creacion >= ?';
            params.push(fechaInicio);
        }
        
        if (fechaFin) {
            query += ' AND f.fecha_creacion <= ?';
            params.push(fechaFin);
        }

        query += ' GROUP BY f.id_formula ORDER BY f.fecha_creacion DESC';

        const [formulas] = await pool.query(query, params);
        
        // Resumen de fórmulas
        const [resumen] = await pool.query(`
            SELECT 
                COUNT(*) as totalFormulas,
                COUNT(DISTINCT id_usuario) as totalClientesConFormula,
                AVG(costo) as costoPromedio,
                MIN(costo) as costoMinimo,
                MAX(costo) as costoMaximo,
                SUM(costo) as costoTotal
            FROM FORMULAS
        `);

        // Fórmulas por condición
        const [porCondicion] = await pool.query(`
            SELECT 
                condicion,
                COUNT(*) as cantidad,
                AVG(costo) as costoPromedio,
                SUM(costo) as costoTotal
            FROM FORMULAS
            GROUP BY condicion
            ORDER BY cantidad DESC
        `);

        // Fórmulas creadas por período
        const [porPeriodo] = await pool.query(`
            SELECT 
                DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
                COUNT(*) as cantidad,
                AVG(costo) as costoPromedio
            FROM FORMULAS
            WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
            ORDER BY mes ASC
        `);

        res.json({
            resumen: resumen[0],
            formulas: formulas,
            porCondicion: porCondicion,
            porPeriodo: porPeriodo,
            fechaGeneracion: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al generar reporte de fórmulas:', error);
        res.status(500).json({ error: 'Error al generar reporte de fórmulas' });
    }
});

// ============================================
// GET /api/reportes/exportar/:tipo
// Exportar reporte en formato CSV
// ============================================
router.get('/exportar/:tipo', async (req, res) => {
    try {
        const { tipo } = req.params;
        const { formato = 'csv' } = req.query;
        
        let datos = [];
        let nombreArchivo = '';
        let columnas = [];

        switch(tipo) {
            case 'ventas':
                const [ventas] = await pool.query(`
                    SELECT 
                        p.id_pedido,
                        p.fecha_pedido,
                        p.fecha_entrega,
                        u.nombre_completo as cliente,
                        p.total,
                        p.estado,
                        pg.eleccion_pago as metodo_pago,
                        pg.canal_pago as canal_pago
                    FROM PEDIDOS p
                    JOIN USUARIOS u ON p.id_usuario = u.id_usuario
                    JOIN PAGOS pg ON p.id_pedido = pg.id_pedido
                    WHERE p.estado = 'completado'
                    ORDER BY p.fecha_pedido DESC
                `);
                datos = ventas;
                nombreArchivo = 'reporte_ventas';
                columnas = ['ID Pedido', 'Fecha Pedido', 'Fecha Entrega', 'Cliente', 'Total', 'Estado', 'Método Pago', 'Canal Pago'];
                break;
                
            case 'inventario':
                const [productos] = await pool.query(`
                    SELECT 
                        p.id_producto,
                        p.nombre,
                        p.descripcion,
                        p.marca,
                        p.precio,
                        p.material,
                        p.color,
                        c.tipo_categoria as categoria
                    FROM PRODUCTOS p
                    JOIN CATEGORIAS c ON p.id_categoria = c.id_categoria
                    ORDER BY p.nombre ASC
                `);
                datos = productos;
                nombreArchivo = 'reporte_inventario';
                columnas = ['ID Producto', 'Nombre', 'Descripción', 'Marca', 'Precio', 'Material', 'Color', 'Categoría'];
                break;
                
            case 'clientes':
                const [clientes] = await pool.query(`
                    SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        u.email,
                        u.telefono,
                        u.ciudad,
                        u.direccion,
                        u.estado,
                        u.fecha_registro
                    FROM USUARIOS u
                    WHERE u.id_usuario NOT IN (
                        SELECT ru.id_usuario 
                        FROM ROL_USUARIO ru 
                        JOIN ROLES r ON ru.id_rol = r.id_rol 
                        WHERE r.nombre IN ('admin', 'repartidor')
                    )
                    ORDER BY u.fecha_registro DESC
                `);
                datos = clientes;
                nombreArchivo = 'reporte_clientes';
                columnas = ['ID Usuario', 'Nombre', 'Email', 'Teléfono', 'Ciudad', 'Dirección', 'Estado', 'Fecha Registro'];
                break;
                
            case 'repartidores':
                const [repartidores] = await pool.query(`
                    SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        u.telefono,
                        u.email,
                        u.ciudad,
                        u.estado,
                        u.fecha_registro,
                        v.tipo as tipo_vehiculo,
                        v.modelo,
                        v.placa
                    FROM USUARIOS u
                    LEFT JOIN VEHICULOS v ON u.id_usuario = v.id_usuario
                    WHERE u.id_usuario IN (
                        SELECT ru.id_usuario 
                        FROM ROL_USUARIO ru 
                        JOIN ROLES r ON ru.id_rol = r.id_rol 
                        WHERE r.nombre = 'repartidor'
                    )
                    ORDER BY u.nombre_completo ASC
                `);
                datos = repartidores;
                nombreArchivo = 'reporte_repartidores';
                columnas = ['ID Usuario', 'Nombre', 'Teléfono', 'Email', 'Ciudad', 'Estado', 'Fecha Registro', 'Tipo Vehículo', 'Modelo', 'Placa'];
                break;

            case 'formulas':
                const [formulas] = await pool.query(`
                    SELECT 
                        f.id_formula,
                        u.nombre_completo as cliente,
                        f.condicion,
                        f.observaciones,
                        f.fecha_creacion,
                        f.costo
                    FROM FORMULAS f
                    JOIN USUARIOS u ON f.id_usuario = u.id_usuario
                    ORDER BY f.fecha_creacion DESC
                `);
                datos = formulas;
                nombreArchivo = 'reporte_formulas';
                columnas = ['ID Fórmula', 'Cliente', 'Condición', 'Observaciones', 'Fecha Creación', 'Costo'];
                break;
                
            default:
                return res.status(400).json({ error: 'Tipo de reporte no válido' });
        }

        if (formato === 'csv') {
            // Generar CSV
            let csv = columnas.join(',') + '\n';
            
            datos.forEach(row => {
                const valores = Object.values(row).map(valor => {
                    if (valor === null || valor === undefined) return '';
                    if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"') || valor.includes('\n'))) {
                        return `"${valor.replace(/"/g, '""')}"`;
                    }
                    return valor;
                });
                csv += valores.join(',') + '\n';
            });

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csv);
        } else {
            res.status(400).json({ error: 'Formato no soportado. Use formato=csv' });
        }
    } catch (error) {
        console.error('Error al exportar reporte:', error);
        res.status(500).json({ error: 'Error al exportar reporte' });
    }
});

module.exports = router;