import express from 'express';
import {
    reporteVentasPorPeriodo,
    reporteProductosMasVendidos,
    reporteDesempenoRepartidores,
    reporteEstadoPedidos,
    reporteClientesFrecuentes,
    reporteResumenGeneral,
    reporteVentasPorCategoria,
    reporteAnalisisFormulas,
    generarReportePDF
} from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Todos los reportes requieren autenticación y permisos de admin
router.use(authMiddleware, adminMiddleware);

// RUTA PARA GENERAR PDF (NUEVA)
router.post('/generar-pdf', generarReportePDF);

// Reportes existentes
router.get('/ventas-periodo', reporteVentasPorPeriodo);
router.get('/productos-mas-vendidos', reporteProductosMasVendidos);
router.get('/desempeno-repartidores', reporteDesempenoRepartidores);
router.get('/estado-pedidos', reporteEstadoPedidos);
router.get('/clientes-frecuentes', reporteClientesFrecuentes);
router.get('/resumen-general', reporteResumenGeneral);
router.get('/ventas-categoria', reporteVentasPorCategoria);
router.get('/analisis-formulas', reporteAnalisisFormulas);

export default router;