const express = require('express');
const router = express.Router();

const deliveryController = require('../controllers/deliveryController');

const {
    verifyToken,
    authorizeRoles
} = require('../middlewares/authMiddleware');


// Ver pedidos listos
router.get(
    '/ready',
    verifyToken,
    authorizeRoles(['admin','repartidor']),
    deliveryController.getReadyOrders
);


// Asignar vehículo
router.put(
    '/assign/:id',
    verifyToken,
    authorizeRoles(['admin']),
    deliveryController.assignVehicle
);


// Simular ruta
router.get(
    '/route/:id',
    verifyToken,
    authorizeRoles(['admin','repartidor']),
    deliveryController.generateRoute
);


// Marcar entregado
router.put(
    '/delivered/:id',
    verifyToken,
    authorizeRoles(['admin','repartidor']),
    deliveryController.markDelivered
);

module.exports = router;