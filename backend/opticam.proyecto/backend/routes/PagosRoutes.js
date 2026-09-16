import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as pagosController from '../controllers/pagosController.js';

const router = express.Router();

// ========================================
// 1. PRIMERO: RUTAS ESPECÍFICAS (SIN PARÁMETROS DINÁMICOS)
// ========================================

// CLIENTE - Verificar saldo pendiente de un pedido
router.get('/pedido/:pedidoId/saldo', authMiddleware, pagosController.verificarSaldoPedido);

// CLIENTE - Obtener pagos de un pedido específico
router.get('/pedido/:pedidoId', authMiddleware, pagosController.obtenerPagosPorPedido);

// ========================================
// 2. DESPUÉS: RUTAS CON PARÁMETROS DINÁMICOS
// ========================================

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