const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const {
  verifyToken,
  authorizeRoles
} = require('../middlewares/authMiddleware');

// Ver pedidos listos para enviar
router.get(
  '/ready',
  verifyToken,
  authorizeRoles(['admin','repartidor']),
  deliveryController.getReadyOrders
);

// Admin asigna vehículo a pedido
router.put(
  '/assign/:id',
  verifyToken,
  authorizeRoles(['admin']),
  deliveryController.assignVehicle
);

// Generar código de entrega para el cliente
router.post(
  '/generate-code/:id',
  verifyToken,
  authorizeRoles(['admin']),
  deliveryController.generateDeliveryCode
);

// Marcar pedido como entregado con token válido
router.put(
  '/delivered/:id',
  verifyToken,
  authorizeRoles(['admin','repartidor']),
  deliveryController.markDelivered
);

module.exports = router;
