// routes/pedidoRoutes.js
import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import * as pedidoController from '../controllers/pedidoController.js';

const router = express.Router();

// ============================================
// RUTAS PARA CLIENTE (requieren token)
// ============================================

// Crear pedido (cliente)
router.post('/', authMiddleware, pedidoController.crearPedido);

// Ver mis pedidos (cliente)
router.get('/mis-pedidos', authMiddleware, pedidoController.obtenerMisPedidos);

// Ver detalle de pedido (cliente dueño o admin)
router.get('/:id', authMiddleware, pedidoController.obtenerPedidoPorId);

// Cancelar pedido (cliente dueño)
router.put('/:id/cancelar', authMiddleware, pedidoController.cancelarPedido);

// ============================================
// RUTAS PARA ADMIN (requieren token + admin)
// ============================================

// Admin marca pedido como LISTO (gafas listas para pago restante)
router.put('/:id/listo', authMiddleware, adminMiddleware, pedidoController.marcarPedidoComoListo);

// Obtener todos los pedidos (admin)
router.get('/admin/todos', authMiddleware, adminMiddleware, pedidoController.obtenerTodosLosPedidos);

// Obtener pedidos por estado (admin)
router.get('/admin/estado/:estado', authMiddleware, adminMiddleware, pedidoController.obtenerPedidosPorEstado);

// Actualizar estado del pedido (admin)
router.put('/:id/estado', authMiddleware, adminMiddleware, pedidoController.actualizarEstadoPedido);

// Actualizar fecha estimada de entrega (admin)
router.put('/:id/fecha-estimada', authMiddleware, adminMiddleware, pedidoController.actualizarFechaEstimada);

// Obtener estadísticas de pedidos (admin)
router.get('/admin/estadisticas', authMiddleware, adminMiddleware, pedidoController.obtenerEstadisticasPedidos);

export default router;