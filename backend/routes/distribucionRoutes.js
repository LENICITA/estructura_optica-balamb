// routes/distribucionRoutes.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import * as distribucionController from '../controllers/distribucionController.js';

const router = express.Router();

// ============================================
// RUTAS PARA ADMIN (requieren token + admin)
// ============================================

// Asignar pedido a repartidor
router.post('/', authMiddleware, adminMiddleware, distribucionController.asignarPedido);

// Obtener todas las distribuciones
router.get('/admin/todas', authMiddleware, adminMiddleware, distribucionController.obtenerTodas);

// Obtener distribuciones externas (fuera de Bogotá)
router.get('/admin/externas', authMiddleware, adminMiddleware, distribucionController.obtenerDistribucionesExternas);

// Cancelar entrega
router.put('/admin/:id/cancelar', authMiddleware, adminMiddleware, distribucionController.cancelarEntrega);

// ============================================
// RUTAS PARA REPARTIDOR (requieren token)
// ============================================

// Ver pedidos pendientes
router.get('/pendientes', authMiddleware, distribucionController.obtenerPendientes);

// Ver pedidos en entrega
router.get('/en-entrega', authMiddleware, distribucionController.obtenerEnEntrega);

// Ver detalle de una distribución (con dirección)
router.get('/:id', authMiddleware, distribucionController.obtenerDistribucionPorId);  // ← NUEVA

// Iniciar entrega
router.patch('/:id/iniciar', authMiddleware, distribucionController.iniciarEntrega);

// Marcar como entregado
router.patch('/:id/entregar', authMiddleware, distribucionController.marcarEntregado);

// Ver historial de entregas
router.get('/historial', authMiddleware, distribucionController.obtenerHistorial);

export default router;