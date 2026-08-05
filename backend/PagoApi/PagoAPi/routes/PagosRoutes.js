const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Rutas públicas (requieren token pero no rol específico)
router.get('/pedido/:pedidoId', verifyToken, pagosController.obtenerPagosPorPedido);
router.get('/:id', verifyToken, pagosController.obtenerPagoPorId);
router.post('/', verifyToken, pagosController.crearPago);

// Rutas solo para admin y vendedor
router.get('/', verifyToken, authorizeRoles(['admin', 'vendedor']), pagosController.obtenerPagos);

// Rutas solo para admin
router.get('/estadisticas', verifyToken, authorizeRoles(['admin']), pagosController.obtenerEstadisticas);
router.get('/rango-fechas', verifyToken, authorizeRoles(['admin']), pagosController.obtenerPagosPorRangoFechas);
router.put('/:id', verifyToken, authorizeRoles(['admin']), pagosController.actualizarPago);
router.put('/:id/confirmar', verifyToken, authorizeRoles(['admin']), pagosController.confirmarPago);
router.put('/:id/rechazar', verifyToken, authorizeRoles(['admin']), pagosController.rechazarPago);
router.put('/:id/reembolsar', verifyToken, authorizeRoles(['admin']), pagosController.reembolsarPago);
router.delete('/:id', verifyToken, authorizeRoles(['admin']), pagosController.eliminarPago);

module.exports = router;