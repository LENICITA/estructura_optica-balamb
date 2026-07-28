import express from 'express';

import {
    asignarPedido,
    iniciarEntrega,
    marcarEntregado,
    obtenerHistorial
}
from '../controllers/distribucionController.js';

import { authMiddleware }
from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    asignarPedido
);

router.patch(
    '/:id/iniciar',
    authMiddleware,
    iniciarEntrega
);

router.patch(
    '/:id/entregar',
    authMiddleware,
    marcarEntregado
);

router.get(
    '/historial',
    authMiddleware,
    obtenerHistorial
);

export default router;