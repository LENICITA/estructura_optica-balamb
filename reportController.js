import sequelize from "../config/database.js";
import { Op } from 'sequelize';
import PDFDocument from 'pdfkit';
import Inventario from '../models/inventario.js';

// REPORTE 1: Ventas por período
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

        const results = await sequelize.query(query, {
            replacements: { fecha_inicio, fecha_fin },
            type: sequelize.QueryTypes.SELECT
        });

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

// REPORTE 2: Productos más vendidos
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

// REPORTE 3: Desempeño de repartidores (CORREGIDO)
export const reporteDesempenoRepartidores = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        let whereClause = '';
        const replacements = {};

        if (fecha_inicio && fecha_fin) {
            whereClause = 'AND d.fecha_entrega BETWEEN :fecha_inicio AND :fecha_fin';
            replacements.fecha_inicio = fecha_inicio;
            replacements.fecha_fin = fecha_fin;
        }

        const query = `
            SELECT 
                u.id_usuario,
                u.nombre_completo as repartidor,
                u.telefono,
                u.ciudad,
                v.tipo as tipo_vehiculo,
                v.placa,
                COUNT(DISTINCT d.id_pedido) as pedidos_asignados,
                SUM(CASE WHEN d.estado = 'ENTREGADO' THEN 1 ELSE 0 END) as pedidos_entregados,
                SUM(CASE WHEN d.estado = 'ENTREGADO' THEN p.total ELSE 0 END) as valor_total_entregas,
                AVG(CASE WHEN d.estado = 'ENTREGADO' THEN p.total ELSE NULL END) as promedio_venta,
                u.estado as usuario_estado
            FROM USUARIOS u
            INNER JOIN VEHICULOS v ON u.id_usuario = v.id_usuario
            INNER JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
            INNER JOIN ROLES r ON ru.id_rol = r.id_rol
            INNER JOIN DISTRIBUCIONES d ON u.id_usuario = d.id_usuario
            LEFT JOIN PEDIDOS p ON d.id_pedido = p.id_pedido
            WHERE r.nombre = 'REPARTIDOR'
            ${whereClause}
            GROUP BY u.id_usuario, u.nombre_completo, u.telefono, u.ciudad, v.tipo, v.placa, u.estado
            ORDER BY pedidos_entregados DESC, pedidos_asignados DESC
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

// REPORTE 4: Estado de pedidos
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
                    WHEN 'Pendiente' THEN 1
                    WHEN 'Abonado' THEN 2
                    WHEN 'Listo' THEN 3
                    WHEN 'Pagado' THEN 4
                    WHEN 'En Proceso' THEN 5
                    WHEN 'Enviado' THEN 6
                    WHEN 'Entregado' THEN 7
                    WHEN 'Cancelado' THEN 8
                    ELSE 9
                END
        `;

        const results = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

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

// REPORTE 5: Clientes frecuentes
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

// REPORTE 6: Resumen general del negocio (CORREGIDO)
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
                WHERE estado != 'Cancelado'
            `,
            pedidos_ultimo_mes: `
                SELECT COUNT(*) as total, SUM(total) as monto_total 
                FROM PEDIDOS 
                WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                AND estado != 'Cancelado'
            `,
            formulas_aprobadas: `
                SELECT COUNT(*) as total 
                FROM FORMULAS 
                WHERE estado = 'Aprobado'
            `,
            formulas_pendientes: `
                SELECT COUNT(*) as total 
                FROM FORMULAS 
                WHERE estado = 'Pendiente'
            `,
            ingresos_por_mes: `
                SELECT 
                    DATE_FORMAT(fecha_pedido, '%Y-%m') as mes,
                    COUNT(*) as pedidos,
                    SUM(total) as ingresos,
                    SUM(costo_envio) as envios
                FROM PEDIDOS 
                WHERE estado != 'Cancelado'
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
                formulas_aprobadas: results.formulas_aprobadas?.total || 0,
                formulas_pendientes: results.formulas_pendientes?.total || 0,
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

// REPORTE 7: Ventas por categoría
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
            WHERE p.estado != 'Cancelado'
            ${whereClause}
            GROUP BY c.id_categoria, c.tipo_categoria
            ORDER BY ingresos DESC
        `;

        const results = await sequelize.query(query, {
            replacements,
            type: sequelize.QueryTypes.SELECT
        });

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

// REPORTE 8: Análisis de fórmulas (CORREGIDO)
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
            WHERE f.estado = 'Aprobado'
            GROUP BY f.condicion
            ORDER BY cantidad DESC
        `;

        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });

        const queryTendencia = `
            SELECT 
                DATE_FORMAT(f.fecha_creacion, '%Y-%m') as mes,
                COUNT(*) as nuevas_formulas,
                AVG(f.costo) as costo_promedio,
                SUM(CASE WHEN f.estado = 'Aprobado' THEN 1 ELSE 0 END) as aprobadas
            FROM FORMULAS f
            WHERE f.fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(f.fecha_creacion, '%Y-%m')
            ORDER BY mes DESC
        `;

        const tendencia = await sequelize.query(queryTendencia, {
            type: sequelize.QueryTypes.SELECT
        });

        // Estadísticas adicionales de fórmulas
        const queryEstadisticas = `
            SELECT 
                estado,
                COUNT(*) as total,
                AVG(costo) as costo_promedio
            FROM FORMULAS
            GROUP BY estado
        `;

        const estadisticas = await sequelize.query(queryEstadisticas, {
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                distribucion_condiciones: results,
                tendencia_mensual: tendencia,
                estadisticas_estado: estadisticas,
                total_formulas_aprobadas: results.reduce((acc, item) => acc + parseInt(item.cantidad), 0)
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

// REPORTE 9: Generar PDF (CORREGIDO)
export const generarReportePDF = async (req, res) => {
    try {
        const { tipo, periodo, fecha_inicio, fecha_fin } = req.body;

        console.log(`📡 Generando PDF: ${tipo} - ${periodo}`);

        let datos = await obtenerDatosParaPDF(tipo, periodo, fecha_inicio, fecha_fin);

        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: `Reporte de ${tipo}`,
                Author: 'Óptica Balamb',
                Subject: `Reporte generado el ${new Date().toLocaleDateString('es-CO')}`
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Reporte_${tipo}_${new Date().toISOString().split('T')[0]}.pdf`);

        doc.pipe(res);
        await dibujarReportePDF(doc, datos, tipo, periodo);
        doc.end();

    } catch (error) {
        console.error('❌ Error al generar PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte',
            error: error.message
        });
    }
};

// ==================== FUNCIONES DE OBTENCIÓN DE DATOS PARA PDF (CORREGIDAS) ====================

const obtenerDatosParaPDF = async (tipo, periodo, fechaInicio, fechaFin) => {
    const hoy = new Date();
    let fechaDesde = new Date();
    let fechaHasta = new Date();

    switch (periodo) {
        case 'diario':
            fechaDesde.setHours(0, 0, 0, 0);
            fechaHasta.setHours(23, 59, 59, 999);
            break;
        case 'semanal':
            fechaDesde.setDate(hoy.getDate() - 7);
            fechaDesde.setHours(0, 0, 0, 0);
            break;
        case 'mensual':
            fechaDesde.setMonth(hoy.getMonth() - 1);
            fechaDesde.setHours(0, 0, 0, 0);
            break;
        case 'anual':
            fechaDesde.setFullYear(hoy.getFullYear() - 1);
            fechaDesde.setHours(0, 0, 0, 0);
            break;
        default:
            fechaDesde.setDate(hoy.getDate() - 30);
            fechaDesde.setHours(0, 0, 0, 0);
    }

    if (fechaInicio && fechaFin) {
        fechaDesde = new Date(fechaInicio);
        fechaHasta = new Date(fechaFin);
    }

    const replacements = {
        fecha_inicio: fechaDesde.toISOString().split('T')[0],
        fecha_fin: fechaHasta.toISOString().split('T')[0]
    };

    let datos = {};

    switch (tipo) {
        case 'ventas':
            datos = await obtenerDatosVentasSQL(replacements);
            break;
        case 'inventario':
            datos = await obtenerDatosInventarioSQL();
            break;
        case 'repartidores':
            datos = await obtenerDatosRepartidoresSQL(replacements);
            break;
        case 'clientes':
            datos = await obtenerDatosClientesSQL(replacements);
            break;
        case 'productos-mas-vendidos':
            datos = await obtenerProductosMasVendidosSQL(replacements);
            break;
        case 'estado-pedidos':
            datos = await obtenerEstadoPedidosSQL(replacements);
            break;
        case 'ventas-categoria':
            datos = await obtenerVentasCategoriaSQL(replacements);
            break;
        default:
            throw new Error('Tipo de reporte no válido');
    }

    return {
        ...datos,
        fechaGeneracion: new Date().toLocaleString('es-CO'),
        periodo: periodo,
        tipo: tipo,
        fechaInicio: fechaDesde.toISOString().split('T')[0],
        fechaFin: fechaHasta.toISOString().split('T')[0]
    };
};

const obtenerDatosVentasSQL = async (replacements) => {
    const query = `
        SELECT 
            DATE(p.fecha_pedido) as fecha,
            COUNT(DISTINCT p.id_pedido) as total_pedidos,
            SUM(p.total) as ventas_totales,
            AVG(p.total) as promedio_venta,
            COUNT(DISTINCT p.id_usuario) as clientes_unicos
        FROM PEDIDOS p
        WHERE p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
        AND p.estado != 'Cancelado'
        GROUP BY DATE(p.fecha_pedido)
        ORDER BY fecha DESC
    `;

    const detalle = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    const resumenQuery = `
        SELECT 
            COUNT(DISTINCT id_pedido) as total_pedidos,
            SUM(total) as ventas_totales,
            AVG(total) as promedio_venta,
            COUNT(DISTINCT id_usuario) as clientes_unicos
        FROM PEDIDOS
        WHERE fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
        AND estado != 'Cancelado'
    `;

    const [resumen] = await sequelize.query(resumenQuery, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return {
        titulo: 'Reporte de Ventas',
        resumen: resumen,
        detalle: detalle
    };
};

const obtenerDatosInventarioSQL = async () => {
    const productos = await Inventario.getAll();
    
    const totalProductos = productos.length;
    const valorTotal = productos.reduce((sum, p) => sum + (parseFloat(p.precio) || 0), 0);

    const porCategoria = {};
    productos.forEach(p => {
        const cat = p.tipo_categoria || 'Sin categoría';
        if (!porCategoria[cat]) {
            porCategoria[cat] = { cantidad: 0, valor: 0 };
        }
        porCategoria[cat].cantidad++;
        porCategoria[cat].valor += parseFloat(p.precio) || 0;
    });

    return {
        titulo: 'Reporte de Inventario',
        totalProductos,
        valorTotal,
        porCategoria,
        productos: productos.slice(0, 20)
    };
};

const obtenerDatosRepartidoresSQL = async (replacements) => {
    const query = `
        SELECT 
            u.id_usuario,
            u.nombre_completo as repartidor,
            u.telefono,
            u.ciudad,
            v.tipo as tipo_vehiculo,
            v.modelo,
            v.placa,
            COUNT(DISTINCT d.id_pedido) as pedidos_asignados,
            SUM(CASE WHEN d.estado = 'ENTREGADO' THEN 1 ELSE 0 END) as pedidos_entregados,
            SUM(CASE WHEN d.estado = 'ENTREGADO' THEN p.total ELSE 0 END) as valor_entregas,
            u.estado as usuario_estado
        FROM USUARIOS u
        INNER JOIN VEHICULOS v ON u.id_usuario = v.id_usuario
        INNER JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
        INNER JOIN ROLES r ON ru.id_rol = r.id_rol
        INNER JOIN DISTRIBUCIONES d ON u.id_usuario = d.id_usuario
        LEFT JOIN PEDIDOS p ON d.id_pedido = p.id_pedido
        WHERE r.nombre = 'REPARTIDOR'
        AND d.fecha_entrega BETWEEN :fecha_inicio AND :fecha_fin
        GROUP BY u.id_usuario, u.nombre_completo, u.telefono, u.ciudad, v.tipo, v.modelo, v.placa, u.estado
        ORDER BY pedidos_entregados DESC, pedidos_asignados DESC
    `;

    const repartidores = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return {
        titulo: 'Reporte de Repartidores',
        totalRepartidores: repartidores.length,
        repartidores
    };
};

const obtenerDatosClientesSQL = async (replacements) => {
    const query = `
        SELECT 
            u.id_usuario,
            u.nombre_completo as cliente,
            u.email,
            u.telefono,
            u.ciudad,
            COUNT(p.id_pedido) as total_pedidos,
            SUM(p.total) as total_gastado,
            AVG(p.total) as promedio_gasto
        FROM USUARIOS u
        INNER JOIN ROL_USUARIO ru ON u.id_usuario = ru.id_usuario
        INNER JOIN ROLES r ON ru.id_rol = r.id_rol
        INNER JOIN PEDIDOS p ON u.id_usuario = p.id_usuario
        WHERE r.nombre = 'CLIENTE'
        AND p.estado != 'Cancelado'
        AND p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
        GROUP BY u.id_usuario, u.nombre_completo, u.email, u.telefono, u.ciudad
        HAVING total_pedidos > 0
        ORDER BY total_gastado DESC
        LIMIT 20
    `;

    const clientes = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    const totalQuery = `
        SELECT COUNT(DISTINCT id_usuario) as total
        FROM PEDIDOS
        WHERE fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
        AND estado != 'Cancelado'
    `;

    const [total] = await sequelize.query(totalQuery, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return {
        titulo: 'Reporte de Clientes',
        totalClientes: total?.total || 0,
        clientes
    };
};

const obtenerProductosMasVendidosSQL = async (replacements) => {
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
        WHERE p.estado != 'Cancelado'
        AND p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
        GROUP BY pr.id_producto, pr.nombre, pr.marca, pr.precio, c.tipo_categoria
        ORDER BY total_vendidos DESC
        LIMIT 10
    `;

    const productos = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    return {
        titulo: 'Productos Más Vendidos',
        productos
    };
};

const obtenerEstadoPedidosSQL = async (replacements) => {
    const query = `
        SELECT 
            estado,
            COUNT(*) as cantidad,
            SUM(total) as monto_total,
            AVG(total) as promedio
        FROM PEDIDOS
        WHERE fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
        GROUP BY estado
        ORDER BY 
            CASE estado
                WHEN 'Pendiente' THEN 1
                WHEN 'Abonado' THEN 2
                WHEN 'Listo' THEN 3
                WHEN 'Pagado' THEN 4
                WHEN 'En Proceso' THEN 5
                WHEN 'Enviado' THEN 6
                WHEN 'Entregado' THEN 7
                WHEN 'Cancelado' THEN 8
                ELSE 9
            END
    `;

    const detalle = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    const totales = detalle.reduce((acc, item) => {
        acc.total_pedidos += parseInt(item.cantidad);
        acc.monto_total += parseFloat(item.monto_total);
        return acc;
    }, { total_pedidos: 0, monto_total: 0 });

    return {
        titulo: 'Estado de Pedidos',
        resumen: totales,
        detalle
    };
};

const obtenerVentasCategoriaSQL = async (replacements) => {
    const query = `
        SELECT 
            c.tipo_categoria as categoria,
            COUNT(DISTINCT p.id_pedido) as pedidos,
            SUM(pp.cant_productos) as unidades_vendidas,
            SUM(pp.cant_productos * pr.precio) as ingresos
        FROM CATEGORIAS c
        INNER JOIN PRODUCTOS pr ON c.id_categoria = pr.id_categoria
        INNER JOIN PEDIDOS_PRODUCTOS pp ON pr.id_producto = pp.id_producto
        INNER JOIN PEDIDOS p ON pp.id_pedido = p.id_pedido
        WHERE p.estado != 'Cancelado'
        AND p.fecha_pedido BETWEEN :fecha_inicio AND :fecha_fin
        GROUP BY c.id_categoria, c.tipo_categoria
        ORDER BY ingresos DESC
    `;

    const detalle = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
    });

    const totales = detalle.reduce((acc, item) => {
        acc.total_unidades += parseInt(item.unidades_vendidas || 0);
        acc.total_ingresos += parseFloat(item.ingresos || 0);
        return acc;
    }, { total_unidades: 0, total_ingresos: 0 });

    return {
        titulo: 'Ventas por Categoría',
        resumen: totales,
        detalle
    };
};
