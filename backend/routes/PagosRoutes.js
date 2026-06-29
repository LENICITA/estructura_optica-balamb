import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import * as pagosController from '../controllers/pagosController.js';

const router = express.Router();

// RUTAS PÚBLICAS (requieren token - cliente)

// Obtener pagos de un pedido específico (cliente ve sus pagos)
router.get('/pedido/:pedidoId', authMiddleware, pagosController.obtenerPagosPorPedido);

// Obtener un pago por ID (cliente ve estado de su pago)
router.get('/:id', authMiddleware, pagosController.obtenerPagoPorId);

// Crear un nuevo pago (cliente inicia el pago)
router.post('/', authMiddleware, pagosController.crearPago);

// Verificar saldo pendiente de un pedido
router.get('/pedido/:pedidoId/saldo', authMiddleware, pagosController.verificarSaldoPedido);

// RUTAS ADMIN (requieren token + admin)

// Obtener todos los pagos (admin - reportes)
router.get('/', authMiddleware, adminMiddleware, pagosController.obtenerPagos);

// Obtener estadísticas de pagos (admin)
router.get('/estadisticas', authMiddleware, adminMiddleware, pagosController.obtenerEstadisticas);

// Obtener pagos por rango de fechas (admin)
router.get('/rango-fechas', authMiddleware, adminMiddleware, pagosController.obtenerPagosPorRangoFechas);

// RUTAS PARA BOLD (webhooks) - sin autenticación

// Bold confirma el pago (webhook)
router.put('/:id/confirmar', pagosController.confirmarPago);

// Bold rechaza el pago (webhook)
router.put('/:id/rechazar', pagosController.rechazarPago);

export default router;