import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';
import * as distribucionController from '../controllers/distribucionController.js';

const router = express.Router();

// RUTAS PARA ADMIN (requieren token + admin)
router.post('/', authMiddleware, adminMiddleware, distribucionController.asignarPedido);
router.get('/admin/todas', authMiddleware, adminMiddleware, distribucionController.obtenerTodas);
router.get('/admin/externas', authMiddleware, adminMiddleware, distribucionController.obtenerDistribucionesExternas);
router.put('/admin/:id/cancelar', authMiddleware, adminMiddleware, distribucionController.cancelarEntrega);

// RUTAS PARA REPARTIDOR (requieren token)

//rutas fijas (sin parámetros)
router.get('/pendientes', authMiddleware, distribucionController.obtenerPendientes);
router.get('/en-entrega', authMiddleware, distribucionController.obtenerEnEntrega);
router.get('/historial', authMiddleware, distribucionController.obtenerHistorial);

//rutas con parámetros (:id)
router.get('/:id', authMiddleware, distribucionController.obtenerDistribucionPorId);
router.patch('/:id/iniciar', authMiddleware, distribucionController.iniciarEntrega);
router.patch('/:id/entregar', authMiddleware, distribucionController.marcarEntregado);

export default router;