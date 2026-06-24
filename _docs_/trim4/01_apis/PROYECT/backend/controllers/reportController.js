import sequelize from "../config/database.js";
import { Op } from 'sequelize';

// ============================================
// REPORTE 1: Ventas por período
// ============================================
export const reporteVentasPorPeriodo = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        if (!fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren fechas de inicio y fin (YYYY-MM-DD)'
            });
        }

        const query = `
            SELECT 
                DATE(p.fecha_pedido) as fecha,
                COUNT(DISTINCT p.id_pedido) as total_pedidos,
                SUM(p.total) as ventas_totales,
                SUM(p.costo_envio) as total_envios,
                AVG(p.total) as promedio_venta
            FROM PEDIDOS p
            WHERE p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
            AND p.estado != 'CANCELADO'
            GROUP BY DATE(p.fecha_pedido)
            ORDER BY fecha DESC
        `;

        const [results] = await sequelize.query(query, {
            replacements: { fecha_inicio, fecha_fin },
            type: sequelize.QueryTypes.SELECT
        });

        // Resumen general
        const queryResumen = `
            SELECT 
                COUNT(DISTINCT id_pedido) as total_pedidos,
                SUM(total) as ventas_totales,
                SUM(costo_envio) as total_envios,
                AVG(total) as promedio_venta,
                COUNT(DISTINCT id_usuario) as clientes_unicos
            FROM PEDIDOS
            WHERE fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
            AND estado != 'CANCELADO'
        `;

        const [resumen] = await sequelize.query(queryResumen, {
            replacements: { fecha_inicio, fecha_fin },
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                periodo: { fecha_inicio, fecha_fin },
                resumen: resumen,
                detalle_por_dia: results
            }
        });

    } catch (error) {
        console.error('Error en reporte de ventas por período:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ============================================
// REPORTE 2: Productos más vendidos
// ============================================
export const reporteProductosMasVendidos = async (req, res) => {
    try {
        const { limite = 10, fecha_inicio, fecha_fin } = req.query;

        let whereClause = '';
        const replacements = { limite: parseInt(limite) };

        if (fecha_inicio && fecha_fin) {
            whereClause = 'AND p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin';
            replacements.fecha_inicio = fecha_inicio;
            replacements.fecha_fin = fecha_fin;
        }

        const query = `
            SELECT 
                pr.id_producto,
                pr.nombre as producto,
                pr.marca,
                pr.precio,
                c.tipo_categoria as categoria,
                SUM(pp.cant_productos) as total_vendidos,
                SUM(pp.cant_productos * pr.precio) as ingreso_total
            FROM PEDIDOS_PRODUCTOS pp
            INNER JOIN PRODUCTOS pr ON pp.id_producto = pr.id_producto
            INNER JOIN CATEGORIAS c ON pr.id_categoria = c.id_categoria
            INNER JOIN PEDIDOS p ON pp.id_pedido = p.id_pedido
            WHERE p.estado != 'CANCELADO'
            ${whereClause}
            GROUP BY pr.id_producto, pr.nombre, pr.marca, pr.precio, c.tipo_categoria
            ORDER BY total_vendidos DESC
            LIMIT :limite
        `;

        const results = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error en reporte de productos más vendidos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ============================================
// REPORTE 3: Desempeño de repartidores
// ============================================
export const reporteDesempenoRepartidores = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        let whereClause = '';
        const replacements = {};

        if (fecha_inicio && fecha_fin) {
            whereClause = 'AND p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin';
            replacements.fecha_inicio = fecha_inicio;
            replacements.fecha_fin = fecha_fin;
        }

        // Nota: Asumiendo que los repartidores están asociados a pedidos
        // Si no tienes esa relación, ajusta la consulta
        const query = `
            SELECT 
                u.id_usuario,
                u.nombre_completo as repartidor,
                u.telefono,
                u.ciudad,
                v.tipo as tipo_vehiculo,
                v.placa,
                COUNT(DISTINCT p.id_pedido) as pedidos_asignados,
                SUM(p.total) as valor_total_entregas,
                AVG(p.total) as promedio_venta
            FROM USUARIOS u
            INNER JOIN VEHICULOS v ON u.id_usuario = v.id_usuario
            INNER JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
            INNER JOIN ROLES r ON ru.id_rol = r.id_rol
            LEFT JOIN PEDIDOS p ON u.id_usuario = p.id_usuario
                AND p.estado = 'ENTREGADO'
                ${whereClause}
            WHERE r.nombre = 'REPARTIDOR'
            GROUP BY u.id_usuario, u.nombre_completo, u.telefono, u.ciudad, v.tipo, v.placa
            ORDER BY pedidos_asignados DESC
        `;

        const results = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error en reporte de desempeño de repartidores:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ============================================
// REPORTE 4: Estado de pedidos
// ============================================
export const reporteEstadoPedidos = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        let whereClause = '';
        const replacements = {};

        if (fecha_inicio && fecha_fin) {
            whereClause = 'WHERE fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin';
            replacements.fecha_inicio = fecha_inicio;
            replacements.fecha_fin = fecha_fin;
        }

        const query = `
            SELECT 
                estado,
                COUNT(*) as cantidad,
                SUM(total) as monto_total,
                AVG(total) as promedio,
                MIN(total) as minimo,
                MAX(total) as maximo
            FROM PEDIDOS
            ${whereClause}
            GROUP BY estado
            ORDER BY 
                CASE estado
                    WHEN 'PENDIENTE' THEN 1
                    WHEN 'EN_PROCESO' THEN 2
                    WHEN 'ENVIADO' THEN 3
                    WHEN 'ENTREGADO' THEN 4
                    WHEN 'CANCELADO' THEN 5
                    ELSE 6
                END
        `;

        const results = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        // Calcular totales
        const totales = results.reduce((acc, item) => {
            acc.total_pedidos += parseInt(item.cantidad);
            acc.monto_total += parseFloat(item.monto_total);
            return acc;
        }, { total_pedidos: 0, monto_total: 0 });

        res.json({
            success: true,
            data: {
                resumen: totales,
                detalle: results
            }
        });

    } catch (error) {
        console.error('Error en reporte de estado de pedidos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ============================================
// REPORTE 5: Clientes frecuentes
// ============================================
export const reporteClientesFrecuentes = async (req, res) => {
    try {
        const { limite = 10, fecha_inicio, fecha_fin } = req.query;

        let whereClause = '';
        const replacements = { limite: parseInt(limite) };

        if (fecha_inicio && fecha_fin) {
            whereClause = 'AND p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin';
            replacements.fecha_inicio = fecha_inicio;
            replacements.fecha_fin = fecha_fin;
        }

        const query = `
            SELECT 
                u.id_usuario,
                u.nombre_completo as cliente,
                u.email,
                u.telefono,
                u.ciudad,
                COUNT(p.id_pedido) as total_pedidos,
                SUM(p.total) as total_gastado,
                AVG(p.total) as promedio_gasto,
                MAX(p.total) as mayor_compra,
                MIN(p.total) as menor_compra
            FROM USUARIOS u
            INNER JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
            INNER JOIN ROLES r ON ru.id_rol = r.id_rol
            INNER JOIN PEDIDOS p ON u.id_usuario = p.id_usuario
            WHERE r.nombre = 'CLIENTE'
            AND p.estado != 'CANCELADO'
            ${whereClause}
            GROUP BY u.id_usuario, u.nombre_completo, u.email, u.telefono, u.ciudad
            HAVING total_pedidos > 0
            ORDER BY total_gastado DESC
            LIMIT :limite
        `;

        const results = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: results
        });

    } catch (error) {
        console.error('Error en reporte de clientes frecuentes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ============================================
// REPORTE 6: Resumen general del negocio
// ============================================
export const reporteResumenGeneral = async (req, res) => {
    try {
        const queries = {
            total_clientes: `
                SELECT COUNT(*) as total 
                FROM USUARIOS u
                INNER JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
                INNER JOIN ROLES r ON ru.id_rol = r.id_rol
                WHERE r.nombre = 'CLIENTE'
            `,
            total_repartidores: `
                SELECT COUNT(*) as total 
                FROM USUARIOS u
                INNER JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
                INNER JOIN ROLES r ON ru.id_rol = r.id_rol
                WHERE r.nombre = 'REPARTIDOR'
            `,
            total_productos: `
                SELECT COUNT(*) as total FROM PRODUCTOS
            `,
            total_pedidos: `
                SELECT COUNT(*) as total, SUM(total) as monto_total 
                FROM PEDIDOS 
                WHERE estado != 'CANCELADO'
            `,
            pedidos_ultimo_mes: `
                SELECT COUNT(*) as total, SUM(total) as monto_total 
                FROM PEDIDOS 
                WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                AND estado != 'CANCELADO'
            `,
            formulas_activas: `
                SELECT COUNT(*) as total 
                FROM FORMULAS 
                WHERE estado = 'ACTIVO'
            `,
            ingresos_por_mes: `
                SELECT 
                    DATE_FORMAT(fecha_pedido, '%Y-%m') as mes,
                    COUNT(*) as pedidos,
                    SUM(total) as ingresos,
                    SUM(costo_envio) as envios
                FROM PEDIDOS 
                WHERE estado != 'CANCELADO'
                AND fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(fecha_pedido, '%Y-%m')
                ORDER BY mes DESC
                LIMIT 6
            `
        };

        const results = {};

        for (const [key, query] of Object.entries(queries)) {
            const [result] = await sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            });
            results[key] = result;
        }

        res.json({
            success: true,
            data: {
                clientes: results.total_clientes?.total || 0,
                repartidores: results.total_repartidores?.total || 0,
                productos: results.total_productos?.total || 0,
                pedidos_totales: results.total_pedidos?.total || 0,
                ingresos_totales: results.total_pedidos?.monto_total || 0,
                pedidos_ultimo_mes: results.pedidos_ultimo_mes?.total || 0,
                ingresos_ultimo_mes: results.pedidos_ultimo_mes?.monto_total || 0,
                formulas_activas: results.formulas_activas?.total || 0,
                ingresos_por_mes: results.ingresos_por_mes || []
            }
        });

    } catch (error) {
        console.error('Error en reporte resumen general:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ============================================
// REPORTE 7: Ventas por categoría
// ============================================
export const reporteVentasPorCategoria = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        let whereClause = '';
        const replacements = {};

        if (fecha_inicio && fecha_fin) {
            whereClause = 'AND p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin';
            replacements.fecha_inicio = fecha_inicio;
            replacements.fecha_fin = fecha_fin;
        }

        const query = `
            SELECT 
                c.tipo_categoria as categoria,
                COUNT(DISTINCT p.id_pedido) as pedidos,
                SUM(pp.cant_productos) as unidades_vendidas,
                SUM(pp.cant_productos * pr.precio) as ingresos,
                AVG(pr.precio) as precio_promedio
            FROM CATEGORIAS c
            INNER JOIN PRODUCTOS pr ON c.id_categoria = pr.id_categoria
            INNER JOIN PEDIDOS_PRODUCTOS pp ON pr.id_producto = pp.id_producto
            INNER JOIN PEDIDOS p ON pp.id_pedido = p.id_pedido
            WHERE p.estado != 'CANCELADO'
            ${whereClause}
            GROUP BY c.id_categoria, c.tipo_categoria
            ORDER BY ingresos DESC
        `;

        const results = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

        // Calcular totales
        const totales = results.reduce((acc, item) => {
            acc.total_unidades += parseInt(item.unidades_vendidas || 0);
            acc.total_ingresos += parseFloat(item.ingresos || 0);
            return acc;
        }, { total_unidades: 0, total_ingresos: 0 });

        res.json({
            success: true,
            data: {
                resumen: totales,
                detalle: results
            }
        });

    } catch (error) {
        console.error('Error en reporte de ventas por categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// ============================================
// REPORTE 8: Análisis de fórmulas
// ============================================
export const reporteAnalisisFormulas = async (req, res) => {
    try {
        const query = `
            SELECT 
                f.condicion,
                COUNT(*) as cantidad,
                AVG(f.costo) as costo_promedio,
                SUM(f.costo) as costo_total,
                COUNT(DISTINCT f.id_usuario) as clientes_unicos
            FROM FORMULAS f
            WHERE f.estado = 'ACTIVO'
            GROUP BY f.condicion
            ORDER BY cantidad DESC
        `;

        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });

        // Obtener tendencia mensual
        const queryTendencia = `
            SELECT 
                DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
                COUNT(*) as nuevas_formulas,
                AVG(costo) as costo_promedio
            FROM FORMULAS
            WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
            ORDER BY mes DESC
        `;

        const tendencia = await sequelize.query(queryTendencia, {
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                distribucion_condiciones: results,
                tendencia_mensual: tendencia,
                total_formulas: results.reduce((acc, item) => acc + parseInt(item.cantidad), 0)
            }
        });

    } catch (error) {
        console.error('Error en reporte de análisis de fórmulas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};