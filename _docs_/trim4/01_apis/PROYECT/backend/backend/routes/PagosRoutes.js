import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import * as pagosController from '../controllers/pagosController.js';

const router = express.Router();

// ========================================
// 1. PRIMERO: RUTAS ESPECÍFICAS (SIN PARÁMETROS DINÁMICOS)
// ========================================

// ADMIN - Obtener estadísticas de pagos
router.get('/estadisticas', authMiddleware, adminMiddleware, pagosController.obtenerEstadisticas);

// ADMIN - Obtener pagos por rango de fechas
router.get('/rango-fechas', authMiddleware, adminMiddleware, pagosController.obtenerPagosPorRangoFechas);

// CLIENTE - Verificar saldo pendiente de un pedido
router.get('/pedido/:pedidoId/saldo', authMiddleware, pagosController.verificarSaldoPedido);

// CLIENTE - Obtener pagos de un pedido específico
router.get('/pedido/:pedidoId', authMiddleware, pagosController.obtenerPagosPorPedido);

// ========================================
// 2. DESPUÉS: RUTAS CON PARÁMETROS DINÁMICOS
// ========================================

// ADMIN - Listar todos los pagos (debe ir antes de /:id)
router.get('/', authMiddleware, adminMiddleware, pagosController.obtenerPagos);

// CLIENTE - Obtener un pago por ID
router.get('/:id', authMiddleware, pagosController.obtenerPagoPorId);

// CLIENTE - Crear un nuevo pago
router.post('/', authMiddleware, pagosController.crearPago);

// ========================================
// 3. ÚLTIMO: WEBHOOKS (también con parámetros)
// ========================================

// Bold confirma el pago (webhook)
router.put('/:id/confirmar', pagosController.confirmarPago);

// Bold rechaza el pago (webhook)
router.put('/:id/rechazar', pagosController.rechazarPago);

export default router;